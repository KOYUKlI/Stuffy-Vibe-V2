import { ChannelType, PermissionFlagsBits, PermissionsBitField, resolveColor } from 'discord.js';
import type {
  Guild,
  GuildBasedChannel,
  NonThreadGuildBasedChannel,
  OverwriteResolvable,
  PermissionResolvable,
  Role,
} from 'discord.js';
import {
  CHANNEL_NAMES,
  REMOVED_CATEGORY_NAMES,
  resolveChannelConfig,
  SERVER_CATEGORIES,
} from '../config/channels.config.js';
import { MUTED_DENY } from '../config/permissions.config.js';
import {
  COLOR_ROLE_NAMES,
  GAME_ROLE_NAMES,
  NOTIFICATION_ROLE_NAMES,
  ROLE_NAMES,
  SERVER_ROLES,
  UNIVERSE_ROLE_NAMES,
} from '../config/roles.config.js';
import type { ChannelConfig } from '../types/server-config.types.js';
import {
  findCategory,
  findChannelByNameAndType,
  findChannelInCategory,
  findRole,
} from '../utils/finders.js';
import { channelLabel, channelTypeLabel } from '../utils/format.js';
import { PermissionService } from './permission.service.js';

export interface AuditReport {
  missingRoles: string[];
  missingCategories: string[];
  missingChannels: string[];
  unexpectedCategories: string[];
  unexpectedChannels: string[];
  roleIssues: string[];
  structureIssues: string[];
  permissionIssues: string[];
  duplicateIssues: string[];
}

const STAFF_ROLE_NAMES = [ROLE_NAMES.founder, ROLE_NAMES.admin, ROLE_NAMES.moderator];
const SPECIALIZED_BOT_ROLE_NAMES = [
  ROLE_NAMES.botModeration,
  ROLE_NAMES.botAutomod,
  ROLE_NAMES.botTickets,
  ROLE_NAMES.botVoice,
  ROLE_NAMES.botEvents,
  ROLE_NAMES.botStats,
  ROLE_NAMES.botNews,
  ROLE_NAMES.botStarboard,
  ROLE_NAMES.botMusic,
];
const MEMBER_ACCESS_ROLE_NAMES = [
  ROLE_NAMES.member,
  ROLE_NAMES.elder,
  ROLE_NAMES.privateCircle,
  ...UNIVERSE_ROLE_NAMES,
  ...GAME_ROLE_NAMES,
];
const FORBIDDEN_DUPLICATE_BASENAMES = new Set(['vocal-anciens', 'vocal-privé']);

export class AuditService {
  private readonly permissionService = new PermissionService();

  public async run(guild: Guild): Promise<AuditReport> {
    await Promise.all([guild.roles.fetch(), guild.channels.fetch()]);

    return {
      missingRoles: this.missingRoles(guild),
      missingCategories: this.missingCategories(guild),
      missingChannels: this.missingChannels(guild),
      unexpectedCategories: this.unexpectedCategories(guild),
      unexpectedChannels: this.unexpectedChannels(guild),
      roleIssues: this.roleIssues(guild),
      structureIssues: this.structureIssues(guild),
      permissionIssues: this.permissionIssues(guild),
      duplicateIssues: this.duplicateIssues(guild),
    };
  }

  private missingRoles(guild: Guild): string[] {
    return SERVER_ROLES.filter((role) => !findRole(guild, role.name)).map((role) => role.name);
  }

  private missingCategories(guild: Guild): string[] {
    return SERVER_CATEGORIES.filter((category) => !findCategory(guild, category.name)).map(
      (category) => category.name,
    );
  }

  private missingChannels(guild: Guild): string[] {
    return SERVER_CATEGORIES.flatMap((category) => {
      const guildCategory = findCategory(guild, category.name);
      return category.channels
        .filter((channel) => !this.findExpectedChannel(guild, guildCategory?.id, channel))
        .map((channel) => `${category.name} / ${channel.name} (${channelTypeLabel(channel.type)})`);
    });
  }

  private unexpectedCategories(guild: Guild): string[] {
    const expected = new Set(SERVER_CATEGORIES.map((category) => category.name));
    return guild.channels.cache
      .filter(
        (channel) => channel.type === ChannelType.GuildCategory && !expected.has(channel.name),
      )
      .map((channel) => channel.name);
  }

  private unexpectedChannels(guild: Guild): string[] {
    return guild.channels.cache
      .filter((channel) => channel.type !== ChannelType.GuildCategory)
      .filter((channel) => !this.isExpectedChannel(guild, channel))
      .map((channel) => channelLabel(channel));
  }

  private roleIssues(guild: Guild): string[] {
    const issues: string[] = [];

    for (const config of SERVER_ROLES) {
      const actual = findRole(guild, config.name);
      if (!actual) continue;

      if (actual.color !== resolveColor(config.color)) {
        issues.push(`${config.name}: couleur ${actual.hexColor}, attendu ${config.color}.`);
      }
      if (actual.hoist !== config.hoist) {
        issues.push(`${config.name}: hoist=${actual.hoist}, attendu ${config.hoist}.`);
      }
      if (actual.mentionable !== config.mentionable) {
        issues.push(
          `${config.name}: mentionable=${actual.mentionable}, attendu ${config.mentionable}.`,
        );
      }

      const expectedPermissions = new PermissionsBitField(config.permissions).bitfield;
      if (actual.permissions.bitfield !== expectedPermissions) {
        issues.push(
          `${config.name}: permissions ${actual.permissions.toArray().join(', ') || 'aucune'}, ` +
            `attendu ${new PermissionsBitField(config.permissions).toArray().join(', ') || 'aucune'}.`,
        );
      }
    }

    for (const role of guild.roles.cache.values()) {
      if (role.tags?.botId && role.permissions.has(PermissionFlagsBits.Administrator)) {
        issues.push(`${role.name}: un rôle bot réel possède Administrator.`);
      }
    }

    issues.push(...this.hierarchyIssues(guild));
    return issues;
  }

  private hierarchyIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const expectedConfiguredOrder = [
      ...STAFF_ROLE_NAMES,
      ...SPECIALIZED_BOT_ROLE_NAMES,
      ...COLOR_ROLE_NAMES,
      ROLE_NAMES.privateCircle,
      ROLE_NAMES.elder,
      ROLE_NAMES.member,
      ...UNIVERSE_ROLE_NAMES,
      ...GAME_ROLE_NAMES,
      ...NOTIFICATION_ROLE_NAMES,
      ROLE_NAMES.muted,
      ROLE_NAMES.pending,
      ROLE_NAMES.bot,
    ];

    issues.push(...this.relativeOrderIssues(guild, expectedConfiguredOrder));

    const externalBots = this.externalBotRoles(guild);
    const staff = STAFF_ROLE_NAMES.map((name) => findRole(guild, name)).filter(
      (role): role is Role => Boolean(role),
    );
    const specialized = SPECIALIZED_BOT_ROLE_NAMES.map((name) => findRole(guild, name)).filter(
      (role): role is Role => Boolean(role),
    );

    if (externalBots.length > 0 && staff.length > 0) {
      const lowestStaff = Math.min(...staff.map((role) => role.position));
      for (const role of externalBots.filter((candidate) => candidate.position >= lowestStaff)) {
        issues.push(`${role.name}: le vrai rôle bot doit rester sous les rôles staff.`);
      }
    }

    if (externalBots.length > 0 && specialized.length > 0) {
      const highestSpecialized = Math.max(...specialized.map((role) => role.position));
      for (const role of externalBots.filter(
        (candidate) => candidate.position <= highestSpecialized,
      )) {
        issues.push(
          `${role.name}: le vrai rôle bot doit être au-dessus des rôles bots spécialisés.`,
        );
      }
    }

    const sapphire = guild.roles.cache.find((role) => role.name.toLowerCase() === 'sapphire');
    if (sapphire) {
      const assignable = [
        ROLE_NAMES.member,
        ROLE_NAMES.pending,
        ...COLOR_ROLE_NAMES,
        ...UNIVERSE_ROLE_NAMES,
        ...GAME_ROLE_NAMES,
        ...NOTIFICATION_ROLE_NAMES,
      ]
        .map((name) => findRole(guild, name))
        .filter((role): role is Role => Boolean(role));
      const highestAssignable = assignable.length
        ? Math.max(...assignable.map((role) => role.position))
        : 0;

      if (sapphire.position <= highestAssignable) {
        issues.push(
          `Sapphire (${sapphire.position}) est sous un rôle attribuable (${highestAssignable}).`,
        );
      }
    }

    return issues;
  }

  private relativeOrderIssues(guild: Guild, roleNames: string[]): string[] {
    const roles = roleNames
      .map((name) => findRole(guild, name))
      .filter((role): role is Role => Boolean(role));
    const issues: string[] = [];

    for (let index = 0; index < roles.length - 1; index += 1) {
      const higher = roles[index];
      const lower = roles[index + 1];
      if (higher.position <= lower.position) {
        issues.push(`${higher.name} doit être au-dessus de ${lower.name}.`);
      }
    }

    return issues;
  }

  private structureIssues(guild: Guild): string[] {
    const issues: string[] = [];

    for (const categoryName of REMOVED_CATEGORY_NAMES) {
      if (findCategory(guild, categoryName)) {
        issues.push(
          `${categoryName}: catégorie obsolète détectée; aucune suppression automatique.`,
        );
      }
    }

    const orderedCategories = SERVER_CATEGORIES.map((config) =>
      findCategory(guild, config.name),
    ).filter((category): category is NonNullable<typeof category> => Boolean(category));
    for (let index = 0; index < orderedCategories.length - 1; index += 1) {
      if (orderedCategories[index].rawPosition > orderedCategories[index + 1].rawPosition) {
        issues.push(
          `${orderedCategories[index].name} devrait précéder ${orderedCategories[index + 1].name}.`,
        );
      }
    }

    for (const categoryConfig of SERVER_CATEGORIES) {
      const category = findCategory(guild, categoryConfig.name);
      if (!category) continue;

      const orderedChannels = categoryConfig.channels
        .map((channelConfig) => this.findExpectedChannel(guild, category.id, channelConfig))
        .filter((channel): channel is NonThreadGuildBasedChannel => Boolean(channel));
      for (let index = 0; index < orderedChannels.length - 1; index += 1) {
        if (orderedChannels[index].rawPosition > orderedChannels[index + 1].rawPosition) {
          issues.push(
            `${category.name}: ${orderedChannels[index].name} devrait précéder ${orderedChannels[index + 1].name}.`,
          );
        }
      }
    }

    return issues;
  }

  private permissionIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const roles = new Map<string, Role>();
    for (const config of SERVER_ROLES) {
      const role = findRole(guild, config.name);
      if (role) roles.set(config.name, role);
    }

    for (const categoryConfig of SERVER_CATEGORIES) {
      const category = findCategory(guild, categoryConfig.name);
      if (!category) continue;

      issues.push(
        ...this.compareOverwrites(
          category,
          this.permissionService.categoryOverwrites(categoryConfig, { guild, roles }),
        ),
      );

      for (const channelConfig of categoryConfig.channels) {
        const resolved = resolveChannelConfig(categoryConfig, channelConfig);
        const channel = this.findExpectedChannel(guild, category.id, channelConfig);
        if (!channel || !('permissionOverwrites' in channel)) continue;

        issues.push(
          ...this.compareOverwrites(
            channel,
            this.permissionService.channelOverwrites(resolved, { guild, roles }),
          ),
        );
      }
    }

    issues.push(...this.visibilityIssues(guild));
    issues.push(...this.mutedModelIssues(guild));
    return issues;
  }

  private compareOverwrites(
    channel: NonThreadGuildBasedChannel,
    expectedOverwrites: OverwriteResolvable[],
  ): string[] {
    if (!('permissionOverwrites' in channel)) return [];

    const expected = new Map(
      expectedOverwrites.map((overwrite) => {
        const data = overwrite as {
          id: string;
          allow?: PermissionResolvable;
          deny?: PermissionResolvable;
        };
        return [
          data.id,
          {
            allow: new PermissionsBitField(data.allow ?? []).bitfield,
            deny: new PermissionsBitField(data.deny ?? []).bitfield,
          },
        ] as const;
      }),
    );
    const actual = channel.permissionOverwrites.cache;
    const issues: string[] = [];

    for (const [id, expectedBits] of expected) {
      const overwrite = actual.get(id);
      if (!overwrite) {
        issues.push(`${channelLabel(channel)}: overwrite attendu absent pour ${id}.`);
        continue;
      }
      if (
        overwrite.allow.bitfield !== expectedBits.allow ||
        overwrite.deny.bitfield !== expectedBits.deny
      ) {
        issues.push(`${channelLabel(channel)}: overwrite différent pour ${id}.`);
      }
    }

    for (const overwrite of actual.values()) {
      if (!expected.has(overwrite.id)) {
        issues.push(`${channelLabel(channel)}: overwrite inattendu pour ${overwrite.id}.`);
      }
    }

    return issues;
  }

  private visibilityIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const everyone = guild.roles.everyone;
    const pending = findRole(guild, ROLE_NAMES.pending);
    const member = findRole(guild, ROLE_NAMES.member);
    const entryNames = new Set<string>([
      CHANNEL_NAMES.welcome,
      CHANNEL_NAMES.rules,
      CHANNEL_NAMES.guide,
    ]);
    const staffNames = new Set([
      CHANNEL_NAMES.logs,
      CHANNEL_NAMES.botConfig,
      CHANNEL_NAMES.tickets,
      CHANNEL_NAMES.reports,
      '🛡️・staff-chat',
      '📦・archives-staff',
    ]);

    for (const channel of guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildCategory || !('permissionsFor' in channel)) continue;
      const isEntry = entryNames.has(channel.name);

      if (!isEntry && channel.permissionsFor(everyone)?.has(PermissionFlagsBits.ViewChannel)) {
        issues.push(`@everyone voit ${channelLabel(channel)} hors entrée.`);
      }
      if (isEntry && channel.permissionsFor(everyone)?.has(PermissionFlagsBits.SendMessages)) {
        issues.push(`@everyone peut écrire dans ${channelLabel(channel)}.`);
      }
      if (
        pending &&
        !isEntry &&
        channel.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)
      ) {
        issues.push(`${ROLE_NAMES.pending} voit ${channelLabel(channel)} hors entrée.`);
      }
      if (
        member &&
        staffNames.has(channel.name) &&
        channel.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)
      ) {
        issues.push(`${ROLE_NAMES.member} voit le salon staff ${channel.name}.`);
      }
    }

    return issues;
  }

  private mutedModelIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const actionBits = new PermissionsBitField(MUTED_DENY).bitfield;
    const roleIds = MEMBER_ACCESS_ROLE_NAMES.map((name) => findRole(guild, name)?.id).filter(
      (id): id is string => Boolean(id),
    );

    for (const channel of guild.channels.cache.values()) {
      if (!('permissionOverwrites' in channel)) continue;
      for (const roleId of roleIds) {
        const overwrite = channel.permissionOverwrites.cache.get(roleId);
        if (overwrite && (overwrite.allow.bitfield & actionBits) !== 0n) {
          issues.push(
            `${channelLabel(channel)}: un rôle membre autorise des actions que Muted doit bloquer (${roleId}).`,
          );
        }
      }
    }

    return issues;
  }

  private duplicateIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const exact = new Map<string, GuildBasedChannel[]>();
    const semantic = new Map<string, GuildBasedChannel[]>();

    for (const channel of guild.channels.cache.values()) {
      const exactKey = `${channel.name}:${channel.type}`;
      exact.set(exactKey, [...(exact.get(exactKey) ?? []), channel]);

      const basename = this.channelBasename(channel.name);
      if (FORBIDDEN_DUPLICATE_BASENAMES.has(basename)) {
        semantic.set(basename, [...(semantic.get(basename) ?? []), channel]);
      }
    }

    for (const channels of exact.values()) {
      if (channels.length > 1) {
        issues.push(
          `${channels[0].name} (${channelTypeLabel(channels[0].type)}) apparaît ${channels.length} fois.`,
        );
      }
    }
    for (const [basename, channels] of semantic) {
      if (channels.length > 1) {
        issues.push(
          `${basename}: doublon sémantique dans ${channels.map((channel) => channel.name).join(', ')}.`,
        );
      }
    }

    return [...new Set(issues)];
  }

  private isExpectedChannel(guild: Guild, channel: GuildBasedChannel): boolean {
    const parent = channel.parentId ? guild.channels.cache.get(channel.parentId) : undefined;
    if (!parent || parent.type !== ChannelType.GuildCategory) return false;
    const categoryConfig = SERVER_CATEGORIES.find((category) => category.name === parent.name);
    if (!categoryConfig) return false;

    return categoryConfig.channels.some(
      (config) =>
        config.name === channel.name &&
        (config.type === channel.type || config.fallbackType === channel.type),
    );
  }

  private findExpectedChannel(
    guild: Guild,
    parentId: string | undefined,
    channel: ChannelConfig,
  ): NonThreadGuildBasedChannel | undefined {
    const found = parentId
      ? (findChannelInCategory(guild, channel.name, channel.type, parentId) ??
        (channel.fallbackType
          ? findChannelInCategory(guild, channel.name, channel.fallbackType, parentId)
          : undefined))
      : (findChannelByNameAndType(guild, channel.name, channel.type) ??
        (channel.fallbackType
          ? findChannelByNameAndType(guild, channel.name, channel.fallbackType)
          : undefined));

    return found && !found.isThread() ? (found as NonThreadGuildBasedChannel) : undefined;
  }

  private externalBotRoles(guild: Guild): Role[] {
    const customBotId = guild.members.me?.id;
    return guild.roles.cache
      .filter(
        (role) => role.managed && Boolean(role.tags?.botId) && role.tags?.botId !== customBotId,
      )
      .map((role) => role);
  }

  private channelBasename(name: string): string {
    const separator = name.indexOf('・');
    return (separator >= 0 ? name.slice(separator + 1) : name).toLowerCase();
  }
}
