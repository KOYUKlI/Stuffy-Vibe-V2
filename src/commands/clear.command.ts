import { ChannelType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { hasStaffAccess } from '../utils/permissions.js';

export const clearCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime un nombre donné de messages.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Nombre de messages à supprimer (1 à 100).')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    if (!hasStaffAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText)
      throw new Error('Commande utilisable dans un salon texte serveur.');
    const amount = interaction.options.getInteger('amount', true);
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({
      content: `${deleted.size} message(s) supprimé(s).`,
      ephemeral: true,
    });
  },
};
