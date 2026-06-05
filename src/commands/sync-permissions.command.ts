import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SetupService } from '../services/setup.service.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const syncPermissionsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('sync-permissions')
    .setDescription('Synchronise uniquement les permissions des catégories et salons existants.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    await interaction.deferReply({ ephemeral: true });
    await new SetupService().syncPermissions(interaction.guild);
    await interaction.editReply('Permissions synchronisées.');
  },
};
