import { SlashCommandBuilder } from 'discord.js';
import type { GuildBasedChannel } from 'discord.js';
import type { SlashCommand } from './command.js';
import { CONFIRMATION_WORD, isConfirmed } from '../utils/safety.js';
import { hasDeletionAccess } from '../utils/permissions.js';

export const deleteChannelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('delete-channel')
    .setDescription('Supprime un salon avec confirmation explicite.')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Salon à supprimer.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('confirm')
        .setDescription(`Doit valoir exactement ${CONFIRMATION_WORD}.`)
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }

    const confirm = interaction.options.getString('confirm', true);
    if (!isConfirmed(confirm)) {
      await interaction.reply({
        content: `Suppression annulée. Écris exactement ${CONFIRMATION_WORD}.`,
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
    await channel.delete(`Suppression provisioning par ${interaction.user.tag}`);
    await interaction.reply({ content: `Salon supprimé : ${channel.name}`, ephemeral: true });
  },
};
