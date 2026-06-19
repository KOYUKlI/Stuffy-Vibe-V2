import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SetupService } from '../services/setup.service.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const setupCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Prépare la structure complète, en dry-run par défaut.')
    .addBooleanOption((option) =>
      option.setName('dry-run').setDescription('Afficher ce qui serait fait sans modifier.'),
    ),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    await interaction.deferReply({ ephemeral: true });
    const dryRun = interaction.options.getBoolean('dry-run') ?? true;
    const result = await new SetupService().run(interaction.guild, dryRun);
    await interaction.editReply(
      dryRun
        ? 'Dry-run setup terminé. Aucun changement appliqué.'
        : `Setup terminé : structure et permissions synchronisées.\nBackup : ${result.backupPath}`,
    );
  },
};
