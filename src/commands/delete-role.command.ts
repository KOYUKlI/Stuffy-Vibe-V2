import { SlashCommandBuilder } from 'discord.js';
import type { Role } from 'discord.js';
import type { SlashCommand } from './command.js';
import { ExportService } from '../services/export.service.js';
import { hasDeletionAccess } from '../utils/permissions.js';
import {
  deletionConfirmation,
  isDeletionConfirmed,
  roleDeletionBlockReason,
} from '../utils/safety.js';

export const deleteRoleCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('delete-role')
    .setDescription('Supprime un rôle non protégé avec confirmation explicite.')
    .addRoleOption((option) =>
      option.setName('role').setDescription('Rôle à supprimer.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('confirm')
        .setDescription('Doit valoir exactement DELETE_ROLE:<ID_DU_ROLE>.')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const role = interaction.options.getRole('role', true) as Role;
    if (role.guild.id !== interaction.guild.id) {
      await interaction.reply({
        content: 'Suppression refusée : le rôle ne vient pas de ce serveur.',
        ephemeral: true,
      });
      return;
    }
    const blockReason = roleDeletionBlockReason(role);
    if (blockReason) {
      await interaction.reply({
        content: `Suppression refusée pour ${role.name} : ${blockReason}`,
        ephemeral: true,
      });
      return;
    }

    const confirm = interaction.options.getString('confirm', true);
    const expectedConfirmation = deletionConfirmation('ROLE', role.id);
    if (!isDeletionConfirmed(confirm, 'ROLE', role.id)) {
      await interaction.reply({
        content: `Suppression annulée. Écris exactement ${expectedConfirmation}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    const backup = await new ExportService().exportGuild(
      interaction.guild,
      'backup-before-delete-role',
    );
    const roleName = role.name;
    await role.delete(`Suppression provisioning par ${interaction.user.tag}`);
    await interaction.editReply(`Rôle supprimé : ${roleName}\nBackup : ${backup.filePath}`);
  },
};
