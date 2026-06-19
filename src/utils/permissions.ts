import { PermissionFlagsBits } from 'discord.js';
import type { ChatInputCommandInteraction, GuildMember, Role } from 'discord.js';
import { ROLE_NAMES } from '../config/roles.config.js';

export function hasProvisioningAccess(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  if (interaction.guild.ownerId === interaction.user.id) return true;

  const member = interaction.member as GuildMember;
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.some((role: Role) =>
      ([ROLE_NAMES.founder, ROLE_NAMES.admin] as string[]).includes(role.name),
    )
  );
}

export function hasDeletionAccess(interaction: ChatInputCommandInteraction): boolean {
  if (!interaction.guild || !interaction.member) return false;
  if (interaction.guild.ownerId === interaction.user.id) return true;

  const member = interaction.member as GuildMember;
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.some((role: Role) =>
      ([ROLE_NAMES.founder, ROLE_NAMES.admin] as string[]).includes(role.name),
    )
  );
}
