import { PermissionFlagsBits } from 'discord.js';
import type { Guild } from 'discord.js';
import {
  CHANNEL_NAMES,
  ROLE_NAMES,
  SERVER_CATEGORIES,
  SERVER_ROLES,
} from '../config/server.config.js';
import { findCategory, findChannel, findRole, findTextChannel } from '../utils/finders.js';

export interface AuditReport {
  missingRoles: string[];
  missingCategories: string[];
  missingChannels: string[];
  criticalPermissions: string[];
}

export class AuditService {
  public run(guild: Guild): AuditReport {
    const missingRoles = SERVER_ROLES.filter((role) => !findRole(guild, role.name)).map(
      (role) => role.name,
    );
    const missingCategories = SERVER_CATEGORIES.filter(
      (category) => !findCategory(guild, category.name),
    ).map((category) => category.name);
    const missingChannels = SERVER_CATEGORIES.flatMap((category) =>
      category.channels
        .filter((channel) => !findChannel(guild, channel.name))
        .map((channel) => channel.name),
    );

    return {
      missingRoles,
      missingCategories,
      missingChannels,
      criticalPermissions: this.checkCriticalPermissions(guild),
    };
  }

  private checkCriticalPermissions(guild: Guild): string[] {
    const issues: string[] = [];
    const everyone = guild.roles.everyone;
    const general = findTextChannel(guild, CHANNEL_NAMES.general);
    const staffAdmin = findTextChannel(guild, CHANNEL_NAMES.admin);
    const welcome = findTextChannel(guild, CHANNEL_NAMES.welcome);
    const member = findRole(guild, ROLE_NAMES.member);
    const guest = findRole(guild, ROLE_NAMES.guest);

    if (general && guest && general.permissionsFor(guest)?.has(PermissionFlagsBits.ViewChannel)) {
      issues.push(`${ROLE_NAMES.guest} ne doit pas voir ${CHANNEL_NAMES.general}.`);
    }

    if (
      staffAdmin &&
      member &&
      staffAdmin.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)
    ) {
      issues.push(`${ROLE_NAMES.member} ne doit pas voir ${CHANNEL_NAMES.admin}.`);
    }

    if (welcome && welcome.permissionsFor(everyone)?.has(PermissionFlagsBits.SendMessages)) {
      issues.push(`@everyone ne doit pas écrire dans ${CHANNEL_NAMES.welcome}.`);
    }

    return issues;
  }
}
