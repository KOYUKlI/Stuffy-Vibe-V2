import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, GuildMember, NonThreadGuildBasedChannel, Role } from 'discord.js';
import { SERVER_CATEGORIES } from '../config/channels.config.js';
import { ROLE_NAMES, SERVER_ROLES } from '../config/roles.config.js';
import type { ClearScope, ProvisionedChannelType } from '../types/server-config.types.js';
import { channelLabel, channelTypeLabel } from '../utils/format.js';
import { logger } from '../utils/logger.js';
import { ExportService } from './export.service.js';

export interface ClearOptions {
  dryRun: boolean;
  scope: ClearScope;
  includeExternalBotRoles: boolean;
  backup: boolean;
}

export type ChannelSkipReason =
  | 'not deletable'
  | 'missing permissions'
  | 'unknown channel'
  | 'discord api error'
  | 'protected by option';

export interface ChannelDeletionIssue {
  id: string;
  name: string;
  type: string;
  reason: ChannelSkipReason;
  error?: string;
}

export interface ClearPlan {
  scope: ClearScope;
  totalChannelsDetected: number;
  deletableChannelCount: number;
  channels: NonThreadGuildBasedChannel[];
  categories: NonThreadGuildBasedChannel[];
  ignoredChannels: ChannelDeletionIssue[];
  roles: Role[];
  skippedRoles: string[];
  warnings: string[];
}

export interface ClearResult {
  scope: ClearScope;
  backupPath?: string;
  totalChannelsDetected: number;
  deletableChannelCount: number;
  deletedChannels: string[];
  deletedCategories: string[];
  ignoredChannels: ChannelDeletionIssue[];
  remainingChannels: ChannelDeletionIssue[];
  deletedRoles: string[];
  skippedRoles: string[];
  warnings: string[];
}

export class ClearSafetyError extends Error {
  public constructor(public readonly missingPermissions: string[]) {
    super(`Permissions manquantes: ${missingPermissions.join(', ')}`);
  }
}

const EXTERNAL_BOT_ROLE_NAMES = new Set<string>([
  ROLE_NAMES.bot,
  ROLE_NAMES.botModeration,
  ROLE_NAMES.botTickets,
  ROLE_NAMES.botVoice,
  ROLE_NAMES.botEvents,
  ROLE_NAMES.botStats,
  ROLE_NAMES.botNews,
  ROLE_NAMES.botStarboard,
  ROLE_NAMES.botMusic,
]);

export class ClearService {
  private readonly exportService = new ExportService();

  public async plan(
    guild: Guild,
    scope: ClearScope,
    includeExternalBotRoles: boolean,
  ): Promise<ClearPlan> {
    const channelPlan = await this.channelPlan(guild, scope);
    const rolePlan =
      scope === 'all-project'
        ? this.managedRoles(guild, includeExternalBotRoles)
        : { roles: [], skippedRoles: [] };
    const warnings = this.planWarnings(guild, rolePlan.roles);

    return {
      scope,
      totalChannelsDetected: channelPlan.totalChannelsDetected,
      deletableChannelCount: channelPlan.deletableChannelCount,
      channels: channelPlan.channels,
      categories: channelPlan.categories,
      ignoredChannels: channelPlan.ignoredChannels,
      roles: rolePlan.roles,
      skippedRoles: rolePlan.skippedRoles,
      warnings,
    };
  }

  public async missingRequiredPermissions(guild: Guild, scope: ClearScope): Promise<string[]> {
    const botMember = await this.fetchBotMember(guild);
    if (!botMember) return ['Impossible de résoudre le membre bot dans ce serveur.'];

    const missing: string[] = [];
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      missing.push('ManageChannels');
    }

    if (scope === 'all-project' && !botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      missing.push('ManageRoles');
    }

    return missing;
  }

  public async clear(guild: Guild, options: ClearOptions): Promise<ClearResult> {
    const plan = await this.plan(guild, options.scope, options.includeExternalBotRoles);

    if (options.dryRun) {
      logger.info(`[dry-run] Clear serveur simulé avec scope ${options.scope}.`);
      return {
        scope: options.scope,
        totalChannelsDetected: plan.totalChannelsDetected,
        deletableChannelCount: plan.deletableChannelCount,
        deletedChannels: plan.channels.map(channelLabel),
        deletedCategories: plan.categories.map(channelLabel),
        ignoredChannels: plan.ignoredChannels,
        remainingChannels: [],
        deletedRoles: plan.roles.map((role) => role.name),
        skippedRoles: plan.skippedRoles,
        warnings: plan.warnings,
      };
    }

    const missingPermissions = await this.missingRequiredPermissions(guild, options.scope);
    if (missingPermissions.length > 0) {
      throw new ClearSafetyError(missingPermissions);
    }

    const backupPath = options.backup
      ? (await this.exportService.exportGuild(guild, 'backup-before-clear-server')).filePath
      : undefined;
    if (backupPath) logger.success(`Backup créé avant suppression: ${backupPath}`);

    const ignoredChannels = [...plan.ignoredChannels];
    const deleteErrors = new Map<string, ChannelDeletionIssue>();
    const deletedChannels: string[] = [];
    for (const channel of plan.channels) {
      try {
        await channel.delete('Clear serveur: suppression salon non-catégorie');
        deletedChannels.push(channelLabel(channel));
        logger.info(`Salon supprimé: ${channelLabel(channel)}`);
      } catch (error) {
        const issue = this.channelIssue(channel, this.errorReason(error), error);
        ignoredChannels.push(issue);
        deleteErrors.set(channel.id, issue);
        logger.error(
          `Échec suppression salon ${channelLabel(channel)}: ${this.errorMessage(error)}`,
        );
      }
    }

    const deletedCategories: string[] = [];
    for (const category of plan.categories) {
      try {
        await category.delete('Clear serveur: suppression catégorie après salons enfants');
        deletedCategories.push(channelLabel(category));
        logger.info(`Catégorie supprimée: ${channelLabel(category)}`);
      } catch (error) {
        const issue = this.channelIssue(category, this.errorReason(error), error);
        ignoredChannels.push(issue);
        deleteErrors.set(category.id, issue);
        logger.error(
          `Échec suppression catégorie ${channelLabel(category)}: ${this.errorMessage(error)}`,
        );
      }
    }

    const deletedRoles: string[] = [];
    for (const role of plan.roles) {
      try {
        await role.delete('Clear serveur: suppression rôle projet géré par la configuration');
        deletedRoles.push(role.name);
        logger.info(`Rôle supprimé: ${role.name}`);
      } catch (error) {
        const reason =
          this.errorReason(error) === 'missing permissions'
            ? 'permissions manquantes'
            : 'erreur API Discord';
        const message = `${role.name}: ${reason} pendant la suppression (${this.errorMessage(
          error,
        )}).`;
        plan.skippedRoles.push(message);
        logger.error(`Échec suppression rôle ${role.name}: ${this.errorMessage(error)}`);
      }
    }

    const remainingChannels = await this.remainingChannelReport(guild, options.scope, deleteErrors);

    return {
      scope: options.scope,
      backupPath,
      totalChannelsDetected: plan.totalChannelsDetected,
      deletableChannelCount: plan.deletableChannelCount,
      deletedChannels,
      deletedCategories,
      ignoredChannels,
      remainingChannels,
      deletedRoles,
      skippedRoles: plan.skippedRoles,
      warnings: plan.warnings,
    };
  }

  private async channelPlan(
    guild: Guild,
    scope: ClearScope,
  ): Promise<{
    totalChannelsDetected: number;
    deletableChannelCount: number;
    channels: NonThreadGuildBasedChannel[];
    categories: NonThreadGuildBasedChannel[];
    ignoredChannels: ChannelDeletionIssue[];
  }> {
    const fetchedChannels = await guild.channels.fetch();
    const unknownChannels: ChannelDeletionIssue[] = [];
    const allChannels: NonThreadGuildBasedChannel[] = [];

    for (const [id, channel] of fetchedChannels) {
      if (!channel) {
        unknownChannels.push({
          id,
          name: 'unknown',
          type: 'unknown',
          reason: 'unknown channel',
        });
        continue;
      }
      allChannels.push(channel);
    }

    const targetChannels =
      scope === 'managed' ? this.managedChannelsFrom(allChannels) : this.sortChannels(allChannels);
    const ignoredChannels = [
      ...unknownChannels,
      ...targetChannels
        .filter((channel) => !channel.deletable)
        .map((channel) => this.channelIssue(channel, 'not deletable')),
    ];
    const deletableTargets = targetChannels.filter((channel) => channel.deletable);

    return {
      totalChannelsDetected: allChannels.length + unknownChannels.length,
      deletableChannelCount: allChannels.filter((channel) => channel.deletable).length,
      channels: deletableTargets.filter((channel) => channel.type !== ChannelType.GuildCategory),
      categories: deletableTargets.filter((channel) => channel.type === ChannelType.GuildCategory),
      ignoredChannels,
    };
  }

  private managedChannelsFrom(
    allChannels: NonThreadGuildBasedChannel[],
  ): NonThreadGuildBasedChannel[] {
    const seen = new Set<string>();
    const channels: NonThreadGuildBasedChannel[] = [];

    for (const categoryConfig of SERVER_CATEGORIES) {
      const category = allChannels.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory && channel.name === categoryConfig.name,
      );

      if (category && !seen.has(category.id)) {
        seen.add(category.id);
        channels.push(category);
      }

      for (const channelConfig of categoryConfig.channels) {
        const types = [channelConfig.type, channelConfig.fallbackType].filter(
          (type): type is ProvisionedChannelType => Boolean(type),
        );

        for (const type of types) {
          const matches = allChannels.filter(
            (channel) =>
              channel.name === channelConfig.name &&
              channel.type === type &&
              (!category || channel.parentId === category.id),
          );

          for (const channel of matches) {
            if (seen.has(channel.id)) continue;
            seen.add(channel.id);
            channels.push(channel);
          }
        }
      }
    }

    return this.sortChannels(channels);
  }

  private managedRoles(
    guild: Guild,
    includeExternalBotRoles: boolean,
  ): { roles: Role[]; skippedRoles: string[] } {
    const botMember = guild.members.me;
    const botHighestPosition = botMember?.roles.highest.position ?? 0;
    const roles: Role[] = [];
    const skippedRoles: string[] = [];

    for (const roleConfig of SERVER_ROLES) {
      const role = guild.roles.cache.find((candidate) => candidate.name === roleConfig.name);
      if (!role) continue;

      if (role.name === ROLE_NAMES.founder) {
        skippedRoles.push(`${role.name}: rôle fondateur conservé.`);
        continue;
      }

      if (role.id === guild.roles.everyone.id) {
        skippedRoles.push(`${role.name}: @everyone n’est jamais supprimé.`);
        continue;
      }

      if (role.managed) {
        skippedRoles.push(`${role.name}: rôle Discord intégré ou géré par une intégration.`);
        continue;
      }

      if (botMember?.roles.cache.has(role.id)) {
        skippedRoles.push(`${role.name}: rôle porté par le bot custom.`);
        continue;
      }

      if (role.position >= botHighestPosition) {
        skippedRoles.push(`${role.name}: rôle plus haut ou égal au rôle du bot.`);
        continue;
      }

      if (EXTERNAL_BOT_ROLE_NAMES.has(role.name) && !includeExternalBotRoles) {
        skippedRoles.push(
          `${role.name}: rôle bot externe conservé sans option include-external-bot-roles.`,
        );
        continue;
      }

      roles.push(role);
    }

    return { roles: roles.sort((a, b) => b.position - a.position), skippedRoles };
  }

  private async remainingChannelReport(
    guild: Guild,
    scope: ClearScope,
    deleteErrors: Map<string, ChannelDeletionIssue>,
  ): Promise<ChannelDeletionIssue[]> {
    const fetchedChannels = await guild.channels.fetch();
    const remaining: ChannelDeletionIssue[] = [];

    for (const [id, channel] of fetchedChannels) {
      if (!channel) {
        remaining.push({
          id,
          name: 'unknown',
          type: 'unknown',
          reason: 'unknown channel',
        });
        continue;
      }

      const deleteError = deleteErrors.get(channel.id);
      if (deleteError) {
        remaining.push(deleteError);
        continue;
      }

      remaining.push(
        this.channelIssue(
          channel,
          channel.deletable
            ? scope === 'managed'
              ? 'protected by option'
              : 'discord api error'
            : 'not deletable',
        ),
      );
    }

    return remaining;
  }

  private async fetchBotMember(guild: Guild): Promise<GuildMember | null> {
    if (guild.members.me) return guild.members.me;

    try {
      return await guild.members.fetchMe();
    } catch {
      return null;
    }
  }

  private planWarnings(guild: Guild, roles: Role[]): string[] {
    const warnings: string[] = [];
    const botHighestPosition = guild.members.me?.roles.highest.position;

    if (!botHighestPosition) {
      warnings.push('Impossible de déterminer le rôle le plus haut du bot custom.');
    }

    for (const role of roles) {
      if (role.permissions.has('Administrator')) {
        warnings.push(`${role.name}: rôle supprimable avec permission Administrator.`);
      }
    }

    return warnings;
  }

  private sortChannels(channels: NonThreadGuildBasedChannel[]): NonThreadGuildBasedChannel[] {
    return [...channels].sort((a, b) => this.channelPosition(b) - this.channelPosition(a));
  }

  private channelIssue(
    channel: NonThreadGuildBasedChannel,
    reason: ChannelSkipReason,
    error?: unknown,
  ): ChannelDeletionIssue {
    return {
      id: channel.id,
      name: channel.name,
      type: channelTypeLabel(channel.type),
      reason,
      error: error ? this.errorMessage(error) : undefined,
    };
  }

  private errorReason(error: unknown): ChannelSkipReason {
    const code = this.errorCode(error);
    if (code === 50013) return 'missing permissions';
    return 'discord api error';
  }

  private errorCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
    const code = (error as { code?: unknown }).code;
    return typeof code === 'number' ? code : undefined;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  private channelPosition(channel: NonThreadGuildBasedChannel): number {
    return 'rawPosition' in channel ? channel.rawPosition : 0;
  }
}
