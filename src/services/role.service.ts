import type { Guild, Role } from 'discord.js';
import {
  COLOR_ROLE_NAMES,
  GAME_ROLE_NAMES,
  NOTIFICATION_ROLE_NAMES,
  ROLE_NAMES,
  SERVER_ROLES,
  UNIVERSE_ROLE_NAMES,
} from '../config/roles.config.js';
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

    const staffHierarchy = [ROLE_NAMES.founder, ROLE_NAMES.admin, ROLE_NAMES.moderator];
    const managedHierarchy = [
      ROLE_NAMES.botModeration,
      ROLE_NAMES.botAutomod,
      ROLE_NAMES.botTickets,
      ROLE_NAMES.botVoice,
      ROLE_NAMES.botEvents,
      ROLE_NAMES.botStats,
      ROLE_NAMES.botNews,
      ROLE_NAMES.botStarboard,
      ROLE_NAMES.botMusic,
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

    const externalBotRoles = this.externalBotRoles(guild);
    const configuredStaffRoles = staffHierarchy
      .map((roleName) => roles.get(roleName))
      .filter((role): role is Role => Boolean(role));
    const lowestStaffPosition = configuredStaffRoles.length
      ? Math.min(...configuredStaffRoles.map((role) => role.position))
      : botHighest;
    const highestExternalBotPosition = externalBotRoles.length
      ? Math.max(...externalBotRoles.map((role) => role.position))
      : 0;
    const startPosition = externalBotRoles.length
      ? Math.min(...externalBotRoles.map((role) => role.position)) - 1
      : Math.max(botHighest - staffHierarchy.length - 1, 1);
    const requiredSlots = managedHierarchy.filter((roleName) => roles.has(roleName)).length;

    if (highestExternalBotPosition >= lowestStaffPosition || startPosition < requiredSlots) {
      const anchors = externalBotRoles.map((role) => `${role.name} (${role.position})`).join(', ');
      throw new Error(
        `Hiérarchie non sûre: place manuellement les vrais rôles bots sous le staff et assez haut. ` +
          `Ancres détectées: ${anchors || 'aucune'}; ${requiredSlots} positions sont nécessaires dessous.`,
      );
    }

    await this.placeRoleNames(roles, staffHierarchy, Math.max(botHighest - 1, 1));
    await this.placeRoleNames(roles, managedHierarchy, startPosition);
    logger.info(
      `Hiérarchie placée: staff, ${externalBotRoles.length} ancre(s) bot externe(s), rôles spécialisés, couleurs et rôles membres.`,
    );
  }

  private async placeRoleNames(
    roles: Map<string, Role>,
    roleNames: string[],
    startPosition: number,
  ): Promise<number> {
    let position = startPosition;

    for (const roleName of roleNames) {
      const role = roles.get(roleName);
      if (!role || role.managed) continue;

      if (role.position !== position) {
        await role.setPosition(position, {
          reason: 'Placement hiérarchique des rôles de provisioning',
        });
      }
      position = Math.max(position - 1, 1);
    }

    return position;
  }

  private externalBotRoles(guild: Guild): Role[] {
    const customBotId = guild.members.me?.id;
    return guild.roles.cache
      .filter(
        (role) => role.managed && Boolean(role.tags?.botId) && role.tags?.botId !== customBotId,
      )
      .sort((first, second) => second.position - first.position)
      .map((role) => role);
  }
}
