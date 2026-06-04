import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SetupService } from '../services/setup.service.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const setupCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Crée ou synchronise la structure complète du serveur.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({
        content:
          'Accès refusé : commande réservée au propriétaire, aux admins et à 神 (Fondateur).',
        ephemeral: true,
      });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    await interaction.deferReply({ ephemeral: true });
    await new SetupService().run(interaction.guild);
    await interaction.editReply(
      'Setup terminé : rôles, catégories, salons et permissions synchronisés.',
    );
  },
};
