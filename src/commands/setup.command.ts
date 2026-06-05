import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SetupService } from '../services/setup.service.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const setupCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Crée la structure complète du serveur sans supprimer l’existant.'),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    await interaction.deferReply({ ephemeral: true });
    await new SetupService().run(interaction.guild);
    await interaction.editReply('Setup terminé : structure et permissions synchronisées.');
  },
};
