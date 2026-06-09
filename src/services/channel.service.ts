import { ChannelType } from 'discord.js';
import type { CategoryChannel, Guild, GuildBasedChannel, Role } from 'discord.js';
import { REMOVED_CATEGORY_NAMES, SERVER_CATEGORIES } from '../config/channels.config.js';
import type {
  CategoryConfig,
  ChannelConfig,
  ManualChannelOptions,
} from '../types/server-config.types.js';
import { findCategory, findChannelInCategory } from '../utils/finders.js';
import { logger } from '../utils/logger.js';
import { PermissionService } from './permission.service.js';

export class ChannelService {
  private readonly permissionService = new PermissionService();

  public async ensureCategoriesAndChannels(
    guild: Guild,
    roles: Map<string, Role>,
    dryRun = false,
  ): Promise<void> {
    await this.removeConfiguredLegacyCategories(guild, dryRun);

    for (const categoryConfig of SERVER_CATEGORIES) {
      let category = findCategory(guild, categoryConfig.name);
      const categoryOverwrites = this.permissionService.categoryOverwrites(categoryConfig, {
        guild,
        roles,
      });

      if (!category) {
        if (dryRun) {
          logger.info(`[dry-run] Créerait la catégorie: ${categoryConfig.name}`);
          continue;
        }

        category = await guild.channels.create({
          name: categoryConfig.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: categoryOverwrites,
          reason: 'Création catégorie provisioning 답답한 분위기 V2',
        });
        logger.success(`Catégorie créée: ${categoryConfig.name}`);
      } else if (!dryRun) {
        await category.permissionOverwrites.set(
          categoryOverwrites,
          'Synchronisation permissions catégorie',
        );
        logger.info(`Catégorie synchronisée: ${categoryConfig.name}`);
      }

      if (!category) continue;

      for (const channelConfig of categoryConfig.channels) {
        await this.ensureChannel(
          guild,
          category,
          this.withInheritedCategoryConfig(channelConfig, categoryConfig),
          roles,
          dryRun,
        );
      }
    }
  }

  public async syncPermissions(
    guild: Guild,
    roles: Map<string, Role>,
    dryRun = false,
  ): Promise<void> {
    for (const categoryConfig of SERVER_CATEGORIES) {
      const category = findCategory(guild, categoryConfig.name);
      if (!category) {
        logger.warn(`Catégorie absente, permissions ignorées: ${categoryConfig.name}`);
        continue;
      }

      if (dryRun) {
        logger.info(`[dry-run] Réappliquerait les permissions catégorie: ${categoryConfig.name}`);
      } else {
        await category.permissionOverwrites.set(
          this.permissionService.categoryOverwrites(categoryConfig, { guild, roles }),
          'Synchronisation permissions catégorie',
        );
      }

      for (const channelConfig of categoryConfig.channels) {
        const channelWithBotRoles = this.withInheritedCategoryConfig(channelConfig, categoryConfig);
        const channel = this.findExpectedChannel(guild, category.id, channelWithBotRoles);
        if (!channel || !('permissionOverwrites' in channel)) {
          logger.warn(`Salon absent, permissions ignorées: ${channelConfig.name}`);
          continue;
        }

        if (dryRun) {
          logger.info(`[dry-run] Réappliquerait les permissions salon: ${channelConfig.name}`);
          continue;
        }

        await channel.permissionOverwrites.set(
          this.permissionService.channelOverwrites(channelWithBotRoles, { guild, roles }),
          'Synchronisation permissions salon',
        );
        logger.info(`Permissions salon synchronisées: ${channelConfig.name}`);
      }
    }
  }

  public async createManualChannel(
    guild: Guild,
    roles: Map<string, Role>,
    options: ManualChannelOptions,
  ): Promise<GuildBasedChannel> {
    const category = options.categoryName ? findCategory(guild, options.categoryName) : undefined;
    const overwrites = this.permissionService.manualChannelOverwrites(options, { guild, roles });
    const created = await this.createChannelWithFallback(guild, options, category, overwrites);
    logger.success(`Salon manuel créé: ${created.name}`);
    return created;
  }

  private async ensureChannel(
    guild: Guild,
    category: CategoryChannel,
    channelConfig: ChannelConfig,
    roles: Map<string, Role>,
    dryRun: boolean,
  ): Promise<void> {
    const existing = this.findExpectedChannel(guild, category.id, channelConfig);
    const overwrites = this.permissionService.channelOverwrites(channelConfig, { guild, roles });

    if (existing) {
      if (dryRun) {
        logger.info(`[dry-run] Synchroniserait le salon: ${channelConfig.name}`);
        return;
      }

      if ('setParent' in existing && existing.parentId !== category.id) {
        await existing.setParent(category.id, {
          lockPermissions: false,
          reason: 'Synchronisation catégorie salon',
        });
      }
      if ('permissionOverwrites' in existing) {
        await existing.permissionOverwrites.set(overwrites, 'Synchronisation permissions salon');
      }
      logger.info(`Salon synchronisé: ${channelConfig.name}`);
      return;
    }

    if (dryRun) {
      logger.info(`[dry-run] Créerait le salon: ${channelConfig.name}`);
      return;
    }

    const created = await this.createChannelWithFallback(
      guild,
      channelConfig,
      category,
      overwrites,
    );
    logger.success(`Salon créé: ${created.name}`);
  }

  private findExpectedChannel(
    guild: Guild,
    parentId: string,
    channelConfig: ChannelConfig,
  ): GuildBasedChannel | undefined {
    return (
      findChannelInCategory(guild, channelConfig.name, channelConfig.type, parentId) ??
      (channelConfig.fallbackType
        ? findChannelInCategory(guild, channelConfig.name, channelConfig.fallbackType, parentId)
        : undefined)
    );
  }

  private withInheritedCategoryConfig(
    channelConfig: ChannelConfig,
    categoryConfig: CategoryConfig,
  ): ChannelConfig {
    return {
      ...channelConfig,
      accessRoles: channelConfig.accessRoles ?? categoryConfig.accessRoles,
      staffAccess: channelConfig.staffAccess ?? categoryConfig.staffAccess,
      botRoles: [
        ...new Set([...(categoryConfig.botRoles ?? []), ...(channelConfig.botRoles ?? [])]),
      ],
    };
  }

  private async removeConfiguredLegacyCategories(guild: Guild, dryRun: boolean): Promise<void> {
    for (const categoryName of REMOVED_CATEGORY_NAMES) {
      const category = findCategory(guild, categoryName);
      if (!category) continue;

      const children = guild.channels.cache
        .filter((channel) => channel.parentId === category.id)
        .map((channel) => channel);

      if (dryRun) {
        logger.info(
          `[dry-run] Supprimerait l’ancienne catégorie ${categoryName} et ${children.length} salon(s) enfant(s).`,
        );
        continue;
      }

      for (const child of children) {
        if (!this.canDelete(child)) {
          logger.warn(`Ancien salon non supprimable ignoré: ${child.name}`);
          continue;
        }

        await child.delete('Suppression ancienne catégorie ❖・JEUX');
        logger.info(`Ancien salon supprimé: ${child.name}`);
      }

      if (!this.canDelete(category)) {
        logger.warn(`Ancienne catégorie non supprimable ignorée: ${category.name}`);
        continue;
      }

      await category.delete('Suppression ancienne catégorie remplacée par ◇・GAMING');
      logger.info(`Ancienne catégorie supprimée: ${category.name}`);
    }
  }

  private canDelete(channel: GuildBasedChannel): boolean {
    return 'deletable' in channel ? channel.deletable : false;
  }

  private async createChannelWithFallback(
    guild: Guild,
    channel: ChannelConfig | ManualChannelOptions,
    category: CategoryChannel | undefined,
    permissionOverwrites: ReturnType<PermissionService['channelOverwrites']>,
  ): Promise<GuildBasedChannel> {
    const fallbackType =
      'fallbackType' in channel && channel.fallbackType
        ? channel.fallbackType
        : channel.type === ChannelType.GuildForum
          ? ChannelType.GuildText
          : undefined;

    try {
      return await guild.channels.create({
        name: channel.name,
        type: channel.type,
        parent: category?.id,
        permissionOverwrites,
        reason: 'Création salon provisioning 답답한 분위기 V2',
      });
    } catch (error) {
      if (channel.type !== ChannelType.GuildForum || !fallbackType) {
        throw error;
      }

      logger.warn(
        `Création forum impossible pour ${channel.name}; fallback en salon texte. Active Community si tu veux des forums.`,
      );
      return guild.channels.create({
        name: channel.name,
        type: fallbackType,
        parent: category?.id,
        permissionOverwrites,
        reason: 'Fallback salon texte après échec forum',
      });
    }
  }
}
