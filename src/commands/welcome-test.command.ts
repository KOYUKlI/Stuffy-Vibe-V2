import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/server.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextChannel } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const welcomeTestCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('welcome-test')
    .setDescription('Teste le message automatique de bienvenue.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    const channel = findTextChannel(interaction.guild, CHANNEL_NAMES.welcome);
    if (!channel) {
      await interaction.reply({
        content: 'Salon bienvenue introuvable. Lance /setup.',
        ephemeral: true,
      });
      return;
    }
    await channel.send({ embeds: [new EmbedService().welcome(interaction.user)] });
    await interaction.reply({ content: 'Message de bienvenue de test envoyé.', ephemeral: true });
  },
};
