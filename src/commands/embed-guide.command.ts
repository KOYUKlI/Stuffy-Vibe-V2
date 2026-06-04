import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/server.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextChannel } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const embedGuideCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('embed-guide')
    .setDescription('Envoie l’embed de guide du serveur.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    const channel = findTextChannel(interaction.guild, CHANNEL_NAMES.guide);
    if (!channel) {
      await interaction.reply({
        content: 'Salon guide introuvable. Lance /setup.',
        ephemeral: true,
      });
      return;
    }
    await channel.send({ embeds: [new EmbedService().guide()] });
    await interaction.reply({ content: 'Guide envoyé.', ephemeral: true });
  },
};
