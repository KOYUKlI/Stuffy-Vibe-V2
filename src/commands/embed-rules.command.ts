import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/server.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextChannel } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const embedRulesCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('embed-rules')
    .setDescription('Envoie l’embed de règlement.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    const channel = findTextChannel(interaction.guild, CHANNEL_NAMES.rules);
    if (!channel) {
      await interaction.reply({
        content: 'Salon règlement introuvable. Lance /setup.',
        ephemeral: true,
      });
      return;
    }
    await channel.send({ embeds: [new EmbedService().rules()] });
    await interaction.reply({ content: 'Règlement envoyé.', ephemeral: true });
  },
};
