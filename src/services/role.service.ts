import type { Guild, Role } from 'discord.js';
import { SERVER_ROLES } from '../config/server.config.js';
import { logger } from '../utils/logger.js';

export class RoleService {
  public configuredRoleMap(guild: Guild): Map<string, Role> {
    const roles = new Map<string, Role>();

    for (const roleConfig of SERVER_ROLES) {
      const role = guild.roles.cache.find((guildRole) => guildRole.name === roleConfig.name);
      if (role) roles.set(roleConfig.name, role);
    }

    return roles;
  }

  public async ensureRoles(guild: Guild): Promise<Map<string, Role>> {
    const roles = new Map<string, Role>();

    for (const roleConfig of SERVER_ROLES) {
      const existingRole = guild.roles.cache.find((role) => role.name === roleConfig.name);

      if (existingRole) {
        roles.set(roleConfig.name, existingRole);
        if (roleConfig.protected) {
          logger.info(`Rôle protégé déjà présent, aucune modification: ${roleConfig.name}`);
          continue;
        }

        await existingRole.edit({
          color: roleConfig.color,
          hoist: roleConfig.hoist ?? false,
          mentionable: roleConfig.mentionable ?? false,
          permissions: roleConfig.permissions ?? [],
          reason: 'Synchronisation idempotente de la configuration serveur',
        });
        logger.info(`Rôle synchronisé: ${roleConfig.name}`);
        continue;
      }

      const createdRole = await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color,
        hoist: roleConfig.hoist ?? false,
        mentionable: roleConfig.mentionable ?? false,
        permissions: roleConfig.permissions ?? [],
        reason: 'Création de la structure 답답한 분위기 V2',
      });
      roles.set(roleConfig.name, createdRole);
      logger.success(`Rôle créé: ${roleConfig.name}`);
    }

    await this.placeFounderBelowBot(guild, roles.get('神 (Fondateur)'));
    return roles;
  }

  private async placeFounderBelowBot(guild: Guild, founderRole?: Role): Promise<void> {
    if (!founderRole || !guild.members.me) return;

    const botHighestPosition = guild.members.me.roles.highest.position;
    const targetPosition = Math.max(botHighestPosition - 1, 1);

    if (founderRole.position !== targetPosition) {
      await founderRole.setPosition(targetPosition, {
        reason: 'Placement du rôle fondateur juste sous le rôle du bot',
      });
      logger.info('Rôle 神 (Fondateur) placé le plus haut possible sous le rôle du bot.');
    }
  }
}
