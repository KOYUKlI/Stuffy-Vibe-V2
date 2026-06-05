import type { Guild } from 'discord.js';
import { BRANDING } from '../config/server.config.js';
import { logger } from '../utils/logger.js';
import { ChannelService } from './channel.service.js';
import { RoleService } from './role.service.js';

export class SetupService {
  private readonly roleService = new RoleService();
  private readonly channelService = new ChannelService();

  public async run(guild: Guild): Promise<void> {
    logger.info(`Démarrage du setup pour ${guild.name} (${guild.id})`);

    if (guild.name !== BRANDING.guildName) {
      await guild.setName(BRANDING.guildName, 'Branding 답답한 분위기 V2');
      logger.success(`Serveur renommé en ${BRANDING.guildName}`);
    }

    const roles = await this.roleService.ensureRoles(guild);
    await this.channelService.ensureChannels(guild, roles);
    logger.success('Setup terminé avec succès.');
  }

  public async syncPermissions(guild: Guild): Promise<void> {
    logger.info(`Synchronisation des permissions pour ${guild.name} (${guild.id})`);
    const roles = this.roleService.configuredRoleMap(guild);
    await this.channelService.syncPermissions(guild, roles);
    logger.success('Permissions synchronisées avec succès.');
  }
}
