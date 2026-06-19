import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SyncService } from '../services/sync.service.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const syncPermissionsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('sync-permissions')
    .setDescription('Vérifie/synchronise les permissions, en dry-run par défaut.')
    .addBooleanOption((option) =>
      option.setName('dry-run').setDescription('Afficher ce qui serait fait sans modifier.'),
    ),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const dryRun = interaction.options.getBoolean('dry-run') ?? true;
    await interaction.deferReply({ ephemeral: true });
    const result = await new SyncService().syncPermissions(interaction.guild, dryRun);
    await interaction.editReply(
      dryRun
        ? 'Dry-run permissions terminé. Aucun changement appliqué.'
        : `Permissions synchronisées.\nBackup : ${result.backupPath}`,
    );
  },
};
