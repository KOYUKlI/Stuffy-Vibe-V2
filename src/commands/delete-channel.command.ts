import { SlashCommandBuilder } from 'discord.js';
import type { GuildBasedChannel } from 'discord.js';
import type { SlashCommand } from './command.js';
import { ExportService } from '../services/export.service.js';
import { safeEditReply, safeUserDm } from '../utils/interaction-response.js';
import { hasDeletionAccess } from '../utils/permissions.js';
import { deletionConfirmation, isDeletionConfirmed } from '../utils/safety.js';

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
        .setDescription('Doit valoir exactement DELETE_CHANNEL:<ID_DU_SALON>.')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
    if (channel.guildId !== interaction.guild.id) {
      await interaction.reply({
        content: 'Suppression refusée : le salon ne vient pas de ce serveur.',
        ephemeral: true,
      });
      return;
    }
    if (!('deletable' in channel) || !channel.deletable) {
      await interaction.reply({
        content: `Suppression refusée : ${channel.name} n'est pas supprimable par le bot.`,
        ephemeral: true,
      });
      return;
    }

    const confirm = interaction.options.getString('confirm', true);
    const expectedConfirmation = deletionConfirmation('CHANNEL', channel.id);
    if (!isDeletionConfirmed(confirm, 'CHANNEL', channel.id)) {
      await interaction.reply({
        content: `Suppression annulée. Écris exactement ${expectedConfirmation}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    const backup = await new ExportService().exportGuild(
      interaction.guild,
      'backup-before-delete-channel',
    );
    const channelName = channel.name;
    const deletesInteractionChannel = channel.id === interaction.channelId;
    if (deletesInteractionChannel) {
      await safeEditReply(
        interaction,
        `Backup créé : ${backup.filePath}\nLe salon ${channelName} va être supprimé. Le résultat sera envoyé en DM.`,
      );
    }

    await channel.delete(`Suppression provisioning par ${interaction.user.tag}`);
    const result = `Salon supprimé : ${channelName}\nBackup : ${backup.filePath}`;
    if (deletesInteractionChannel) {
      await safeUserDm(interaction, result);
      return;
    }
    await safeEditReply(interaction, result);
  },
};
