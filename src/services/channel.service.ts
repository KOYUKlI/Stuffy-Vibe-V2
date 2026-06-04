import { ChannelType } from 'discord.js';
import type { Guild, GuildBasedChannel, Role } from 'discord.js';
import { SERVER_CATEGORIES } from '../config/server.config.js';
import { findCategory, findChannel } from '../utils/finders.js';
import { logger } from '../utils/logger.js';
import { PermissionService } from './permission.service.js';

export class ChannelService {
  private readonly permissionService = new PermissionService();

  public async ensureChannels(guild: Guild, roles: Map<string, Role>): Promise<void> {
    for (const categoryConfig of SERVER_CATEGORIES) {
      let category = findCategory(guild, categoryConfig.name);
      const permissionOverwrites = this.permissionService.categoryOverwrites(categoryConfig, {
        guild,
        roles,
      });

      if (!category) {
        category = await guild.channels.create({
          name: categoryConfig.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites,
          reason: 'Création de la structure 답답한 분위기 V2',
        });
        logger.success(`Catégorie créée: ${categoryConfig.name}`);
      } else {
        await category.permissionOverwrites.set(
          permissionOverwrites,
          'Synchronisation permissions catégorie',
        );
        logger.info(`Catégorie synchronisée: ${categoryConfig.name}`);
      }

      for (const channelConfig of categoryConfig.channels) {
        const existing = this.findChannelInCategory(guild, channelConfig.name, category.id);
        const channelOverwrites = this.permissionService.channelOverwrites(channelConfig, {
          guild,
          roles,
        });

        if (existing) {
          if ('setParent' in existing) {
            await existing.setParent(category.id, {
              lockPermissions: false,
              reason: 'Synchronisation catégorie',
            });
          }
          if ('permissionOverwrites' in existing) {
            await existing.permissionOverwrites.set(
              channelOverwrites,
              'Synchronisation permissions salon',
            );
          }
          logger.info(`Salon synchronisé: ${channelConfig.name}`);
          continue;
        }

        await guild.channels.create({
          name: channelConfig.name,
          type: channelConfig.type,
          parent: category.id,
          permissionOverwrites: channelOverwrites,
          reason: 'Création de la structure 답답한 분위기 V2',
        });
        logger.success(`Salon créé: ${channelConfig.name}`);
      }
    }
  }

  private findChannelInCategory(
    guild: Guild,
    name: string,
    parentId: string,
  ): GuildBasedChannel | undefined {
    return (
      guild.channels.cache.find(
        (channel) => channel.name === name && channel.parentId === parentId,
      ) ?? findChannel(guild, name)
    );
  }
}
