import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { SERVER_ROLES } from '../config/server.config.js';
import { findRole } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const deleteRoleCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('delete-role')
    .setDescription('Supprime un rôle non protégé.')
    .addStringOption((option) =>
      option.setName('name').setDescription('Nom exact du rôle.').setRequired(true),
    ),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const name = interaction.options.getString('name', true);
    const configuredRole = SERVER_ROLES.find((role) => role.name === name);
    if (configuredRole?.protected) {
      await interaction.reply({
        content: `Rôle protégé, suppression refusée : ${name}`,
        ephemeral: true,
      });
      return;
    }

    const role = findRole(interaction.guild, name);
    if (!role) {
      await interaction.reply({ content: `Rôle introuvable : ${name}`, ephemeral: true });
      return;
    }

    if (role.managed) {
      await interaction.reply({
        content: `Rôle géré par une intégration, suppression refusée : ${name}`,
        ephemeral: true,
      });
      return;
    }

    await role.delete(`Suppression par ${interaction.user.tag}`);
    await interaction.reply({ content: `Rôle supprimé : ${name}`, ephemeral: true });
  },
};
