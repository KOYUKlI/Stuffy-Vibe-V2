import { ChannelType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { ROLE_NAMES } from '../config/server.config.js';
import { findRole } from '../utils/finders.js';
import { hasStaffAccess } from '../utils/permissions.js';

export const lockCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Verrouille le salon actuel pour les membres.'),
  async execute(interaction) {
    if (!hasStaffAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild || interaction.channel?.type !== ChannelType.GuildText)
      throw new Error('Commande utilisable dans un salon texte serveur.');
    const memberRole = findRole(interaction.guild, ROLE_NAMES.member);
    if (!memberRole) {
      await interaction.reply({ content: 'Rôle Membre introuvable.', ephemeral: true });
      return;
    }
    await interaction.channel.permissionOverwrites.edit(
      memberRole,
      { SendMessages: false },
      { reason: `Verrouillé par ${interaction.user.tag}` },
    );
    await interaction.reply({ content: 'Salon verrouillé pour les membres.', ephemeral: true });
  },
};
