import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/server.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextChannel } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const embedRolesCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('embed-roles')
    .setDescription('Envoie le panneau de sélection de rôles.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    const channel = findTextChannel(interaction.guild, CHANNEL_NAMES.roles);
    if (!channel) {
      await interaction.reply({
        content: 'Salon rôles introuvable. Lance /setup.',
        ephemeral: true,
      });
      return;
    }
    const embedService = new EmbedService();
    await channel.send({
      embeds: [embedService.roles()],
      components: embedService.roleComponents(),
    });
    await interaction.reply({ content: 'Panneau de rôles envoyé.', ephemeral: true });
  },
};
