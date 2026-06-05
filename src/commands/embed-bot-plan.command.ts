import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/channels.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextLikeChannel } from '../utils/finders.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const embedBotPlanCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('embed-bot-plan')
    .setDescription('Envoie le plan des bots externes dans ⚙️・bot-config.'),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const channel = findTextLikeChannel(interaction.guild, CHANNEL_NAMES.botConfig);
    if (!channel || !('send' in channel)) {
      await interaction.reply({
        content: `Salon introuvable : ${CHANNEL_NAMES.botConfig}`,
        ephemeral: true,
      });
      return;
    }

    await channel.send({ embeds: [new EmbedService().botPlan()] });
    await interaction.reply({ content: 'Plan des bots externes envoyé.', ephemeral: true });
  },
};
