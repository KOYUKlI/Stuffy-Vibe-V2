import { PermissionFlagsBits } from 'discord.js';
import type { Guild } from 'discord.js';
import {
  CHANNEL_NAMES,
  ROLE_NAMES,
  SERVER_CATEGORIES,
  SERVER_ROLES,
} from '../config/server.config.js';
import {
  findCategory,
  findChannelByNameAndType,
  findRole,
  findTextChannel,
} from '../utils/finders.js';

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
        .filter((channel) => !findChannelByNameAndType(guild, channel.name, channel.type))
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
    const rules = findTextChannel(guild, CHANNEL_NAMES.rules);
    const guide = findTextChannel(guild, CHANNEL_NAMES.guide);
    const roles = findTextChannel(guild, CHANNEL_NAMES.roles);
    const member = findRole(guild, ROLE_NAMES.member);
    const guest = findRole(guild, ROLE_NAMES.guest);
    const pending = findRole(guild, ROLE_NAMES.pending);

    if (general && guest && general.permissionsFor(guest)?.has(PermissionFlagsBits.ViewChannel)) {
      issues.push(`${ROLE_NAMES.guest} ne doit pas voir ${CHANNEL_NAMES.general}.`);
    }

    if (
      general &&
      pending &&
      general.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)
    ) {
      issues.push(`${ROLE_NAMES.pending} ne doit pas voir ${CHANNEL_NAMES.general}.`);
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

    for (const channel of [welcome, rules, guide]) {
      if (channel && !channel.permissionsFor(everyone)?.has(PermissionFlagsBits.ViewChannel)) {
        issues.push(`@everyone doit voir ${channel.name}.`);
      }
      if (
        channel &&
        pending &&
        !channel.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)
      ) {
        issues.push(`${ROLE_NAMES.pending} doit voir ${channel.name}.`);
      }
    }

    if (roles && pending && roles.permissionsFor(pending)?.has(PermissionFlagsBits.ViewChannel)) {
      issues.push(`${ROLE_NAMES.pending} ne doit pas voir ${CHANNEL_NAMES.roles}.`);
    }

    return issues;
  }
}
