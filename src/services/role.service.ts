import type { Guild, Role } from 'discord.js';
import { ROLE_NAMES, SERVER_ROLES } from '../config/roles.config.js';
import { logger } from '../utils/logger.js';

export class RoleService {
  public configuredRoleMap(guild: Guild): Map<string, Role> {
    const roles = new Map<string, Role>();
    for (const roleConfig of SERVER_ROLES) {
      const role = guild.roles.cache.find((candidate) => candidate.name === roleConfig.name);
      if (role) roles.set(roleConfig.name, role);
    }
    return roles;
  }

  public async ensureRoles(guild: Guild, dryRun = false): Promise<Map<string, Role>> {
    const roles = new Map<string, Role>();

    for (const roleConfig of SERVER_ROLES) {
      const existing = guild.roles.cache.find((role) => role.name === roleConfig.name);
      if (existing) {
        roles.set(roleConfig.name, existing);
        if (roleConfig.protected) {
          logger.info(`Rôle protégé conservé sans modification brutale: ${roleConfig.name}`);
          continue;
        }

        if (dryRun) {
          logger.info(`[dry-run] Synchroniserait le rôle: ${roleConfig.name}`);
          continue;
        }

        await existing.edit({
          color: roleConfig.color,
          hoist: roleConfig.hoist,
          mentionable: roleConfig.mentionable,
          permissions: roleConfig.permissions,
          reason: 'Synchronisation provisioning 답답한 분위기 V2',
        });
        logger.info(`Rôle synchronisé: ${roleConfig.name}`);
        continue;
      }

      if (dryRun) {
        logger.info(`[dry-run] Créerait le rôle: ${roleConfig.name}`);
        continue;
      }

      const created = await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color,
        hoist: roleConfig.hoist,
        mentionable: roleConfig.mentionable,
        permissions: roleConfig.permissions,
        reason: 'Création provisioning 답답한 분위기 V2',
      });
      roles.set(roleConfig.name, created);
      logger.success(`Rôle créé: ${roleConfig.name}`);
    }

    if (!dryRun) await this.placeConfiguredRoles(guild, roles);
    return dryRun ? this.configuredRoleMap(guild) : roles;
  }

  private async placeConfiguredRoles(guild: Guild, roles: Map<string, Role>): Promise<void> {
    const botHighest = guild.members.me?.roles.highest.position;
    if (!botHighest) return;

    const hierarchy = [
      ROLE_NAMES.founder,
      ROLE_NAMES.admin,
      ROLE_NAMES.moderator,
      ROLE_NAMES.elder,
      ROLE_NAMES.member,
      ROLE_NAMES.pending,
      ROLE_NAMES.guest,
      ROLE_NAMES.bot,
      ROLE_NAMES.muted,
    ];

    let position = Math.max(botHighest - 1, 1);
    for (const roleName of hierarchy) {
      const role = roles.get(roleName);
      if (!role || role.managed || role.position === position) {
        position = Math.max(position - 1, 1);
        continue;
      }

      await role.setPosition(position, {
        reason: 'Placement des rôles de provisioning sous le rôle du bot',
      });
      position = Math.max(position - 1, 1);
    }
    logger.info('Hiérarchie des rôles placée sous le rôle du bot quand possible.');
  }
}
