import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SyncService } from '../services/sync.service.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const syncCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Synchronise la structure, en dry-run par défaut.')
    .addBooleanOption((option) =>
      option.setName('dry-run').setDescription('Afficher ce qui serait fait sans modifier.'),
    )
    .addBooleanOption((option) =>
      option.setName('force').setDescription('Réappliquer explicitement les permissions.'),
    ),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const dryRun = interaction.options.getBoolean('dry-run') ?? true;
    const force = interaction.options.getBoolean('force') ?? false;

    await interaction.deferReply({ ephemeral: true });
    const result = await new SyncService().sync(interaction.guild, { dryRun, force });
    await interaction.editReply(
      dryRun
        ? 'Dry-run terminé. Aucun changement appliqué.'
        : `Sync terminé.\nBackup : ${result.backupPath}`,
    );
  },
};
