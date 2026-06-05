import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, GuildBasedChannel } from 'discord.js';
import { CHANNEL_NAMES, SERVER_CATEGORIES } from '../config/channels.config.js';
import { ROLE_NAMES, SERVER_ROLES } from '../config/roles.config.js';
import type { ChannelConfig } from '../types/server-config.types.js';
import {
  findCategory,
  findChannelByNameAndType,
  findChannelInCategory,
  findRole,
} from '../utils/finders.js';
import { channelLabel, channelTypeLabel } from '../utils/format.js';

export interface AuditReport {
  missingRoles: string[];
  missingCategories: string[];
  missingChannels: string[];
  permissionIssues: string[];
  duplicateIssues: string[];
}

export class AuditService {
  public run(guild: Guild): AuditReport {
    return {
      missingRoles: this.missingRoles(guild),
      missingCategories: this.missingCategories(guild),
      missingChannels: this.missingChannels(guild),
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

  private permissionIssues(guild: Guild): string[] {
    const issues: string[] = [];
    const everyone = guild.roles.everyone;
    const pending = findRole(guild, ROLE_NAMES.pending);
    const member = findRole(guild, ROLE_NAMES.member);
    const staffOnlyNames: string[] = [CHANNEL_NAMES.logs, CHANNEL_NAMES.tickets, '🛠️・admin'];
    const entryNames: string[] = [CHANNEL_NAMES.welcome, CHANNEL_NAMES.rules, CHANNEL_NAMES.guide];

    for (const channel of guild.channels.cache.values()) {
      if (!('permissionsFor' in channel)) continue;

      const isEntry = entryNames.includes(channel.name);
      if (!isEntry && channel.permissionsFor(everyone)?.has(PermissionFlagsBits.ViewChannel)) {
        issues.push(
          `@everyone voit ${channelLabel(channel)} alors que seule l'entrée doit être visible.`,
        );
      }

      if (
        pending &&
        !isEntry &&
        channel.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)
      ) {
        issues.push(`${ROLE_NAMES.pending} voit ${channelLabel(channel)} hors zone d'entrée.`);
      }

      if (isEntry && channel.permissionsFor(everyone)?.has(PermissionFlagsBits.SendMessages)) {
        issues.push(`@everyone peut écrire dans ${channelLabel(channel)}.`);
      }
    }

    for (const name of entryNames) {
      const channel = this.findTextOrForum(guild, name);
      if (!channel) continue;
      if (!channel.permissionsFor(everyone)?.has(PermissionFlagsBits.ViewChannel)) {
        issues.push(`@everyone ne voit pas ${name}.`);
      }
      if (pending && !channel.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)) {
        issues.push(`${ROLE_NAMES.pending} ne voit pas ${name}.`);
      }
    }

    const rolesChannel = this.findTextOrForum(guild, CHANNEL_NAMES.roles);
    if (
      rolesChannel &&
      pending &&
      rolesChannel.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)
    ) {
      issues.push(`${ROLE_NAMES.pending} ne doit pas voir ${CHANNEL_NAMES.roles}.`);
    }
    if (
      rolesChannel &&
      member &&
      !rolesChannel.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)
    ) {
      issues.push(`${ROLE_NAMES.member} doit voir ${CHANNEL_NAMES.roles}.`);
    }

    for (const name of staffOnlyNames) {
      const channel = this.findTextOrForum(guild, name);
      if (
        channel &&
        member &&
        channel.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)
      ) {
        issues.push(`${ROLE_NAMES.member} voit le salon staff ${name}.`);
      }
    }

    return issues;
  }

  private duplicateIssues(guild: Guild): string[] {
    const grouped = new Map<string, GuildBasedChannel[]>();
    for (const channel of guild.channels.cache.values()) {
      const key = `${channel.name}:${channel.type}`;
      const channels = grouped.get(key) ?? [];
      channels.push(channel);
      grouped.set(key, channels);
    }

    return [...grouped.values()]
      .filter((channels) => channels.length > 1)
      .map((channels) => {
        const first = channels[0];
        return `${first.name} (${channelTypeLabel(first.type)}) apparaît ${channels.length} fois.`;
      });
  }

  private findExpectedChannel(
    guild: Guild,
    parentId: string | undefined,
    channel: ChannelConfig,
  ): GuildBasedChannel | undefined {
    if (parentId) {
      return (
        findChannelInCategory(guild, channel.name, channel.type, parentId) ??
        (channel.fallbackType
          ? findChannelInCategory(guild, channel.name, channel.fallbackType, parentId)
          : undefined)
      );
    }

    return (
      findChannelByNameAndType(guild, channel.name, channel.type) ??
      (channel.fallbackType
        ? findChannelByNameAndType(guild, channel.name, channel.fallbackType)
        : undefined)
    );
  }

  private findTextOrForum(guild: Guild, name: string): GuildBasedChannel | undefined {
    return (
      findChannelByNameAndType(guild, name, ChannelType.GuildText) ??
      findChannelByNameAndType(guild, name, ChannelType.GuildForum)
    );
  }
}
