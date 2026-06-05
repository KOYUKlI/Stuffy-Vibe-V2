import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { ExportService } from '../services/export.service.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const exportConfigCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('export-config')
    .setDescription('Exporte la structure actuelle du serveur dans exports/.'),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    await interaction.deferReply({ ephemeral: true });
    const result = await new ExportService().exportGuild(interaction.guild);
    await interaction.editReply(
      [
        'Export terminé.',
        `Fichier : ${result.filePath}`,
        `Rôles exportés : ${result.roleCount}`,
        `Salons exportés : ${result.channelCount}`,
      ].join('\n'),
    );
  },
};
