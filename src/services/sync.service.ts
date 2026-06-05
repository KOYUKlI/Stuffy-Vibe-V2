import type { Guild } from 'discord.js';
import { BRANDING } from '../config/branding.config.js';
import type { SyncOptions } from '../types/server-config.types.js';
import { logger } from '../utils/logger.js';
import { ChannelService } from './channel.service.js';
import { RoleService } from './role.service.js';

export class SyncService {
  private readonly roleService = new RoleService();
  private readonly channelService = new ChannelService();

  public async sync(guild: Guild, options: SyncOptions): Promise<void> {
    logger.info(
      `${options.dryRun ? '[dry-run] ' : ''}Synchronisation structure pour ${guild.name} (${guild.id})`,
    );

    if (guild.name !== BRANDING.guildName) {
      if (options.dryRun) {
        logger.info(`[dry-run] Renommerait le serveur en ${BRANDING.guildName}`);
      } else {
        await guild.setName(BRANDING.guildName, 'Branding provisioning 답답한 분위기 V2');
        logger.success(`Serveur renommé en ${BRANDING.guildName}`);
      }
    }

    const roles = await this.roleService.ensureRoles(guild, options.dryRun);
    await this.channelService.ensureCategoriesAndChannels(guild, roles, options.dryRun);

    if (options.force) {
      logger.info('Option force active: permissions réappliquées explicitement.');
      await this.channelService.syncPermissions(guild, roles, options.dryRun);
    }
  }

  public async syncPermissions(guild: Guild, dryRun: boolean): Promise<void> {
    logger.info(`${dryRun ? '[dry-run] ' : ''}Synchronisation permissions pour ${guild.name}`);
    const roles = this.roleService.configuredRoleMap(guild);
    await this.channelService.syncPermissions(guild, roles, dryRun);
  }
}
