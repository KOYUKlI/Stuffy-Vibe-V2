import { PermissionFlagsBits } from 'discord.js';
import type { ChatInputCommandInteraction, GuildMember, Role } from 'discord.js';
import { ROLE_NAMES } from '../config/server.config.js';

export function hasSetupAccess(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  if (interaction.guild.ownerId === interaction.user.id) return true;

  const member = interaction.member as GuildMember;
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.some((role) => role.name === ROLE_NAMES.founder)
  );
}

export function hasStaffAccess(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  if (interaction.guild.ownerId === interaction.user.id) return true;

  const member = interaction.member as GuildMember;
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageMessages) ||
    member.roles.cache.some((role: Role) =>
      [ROLE_NAMES.founder, ROLE_NAMES.admin, ROLE_NAMES.moderator].includes(role.name),
    )
  );
}
