import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CHANNEL_NAMES } from '../config/channels.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextLikeChannel } from '../utils/finders.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const embedEntryCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('embed-entry')
    .setDescription('Envoie les embeds statiques bienvenue, règlement et guide.'),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const embeds = new EmbedService();
    const targets = [
      { name: CHANNEL_NAMES.welcome, embed: embeds.welcome() },
      { name: CHANNEL_NAMES.rules, embed: embeds.rules() },
      { name: CHANNEL_NAMES.guide, embed: embeds.guide() },
    ];

    for (const target of targets) {
      const channel = findTextLikeChannel(interaction.guild, target.name);
      if (!channel || !('send' in channel)) {
        await interaction.reply({ content: `Salon introuvable : ${target.name}`, ephemeral: true });
        return;
      }
      await channel.send({ embeds: [target.embed] });
    }

    await interaction.reply({ content: 'Embeds d’entrée envoyés.', ephemeral: true });
  },
};
