import { SlashCommandBuilder } from 'discord.js';
import type { Role } from 'discord.js';
import type { SlashCommand } from './command.js';
import { hasDeletionAccess } from '../utils/permissions.js';
import { CONFIRMATION_WORD, isConfirmed, isProtectedRole } from '../utils/safety.js';

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
        .setDescription(`Doit valoir exactement ${CONFIRMATION_WORD}.`)
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }

    const role = interaction.options.getRole('role', true) as Role;
    if (isProtectedRole(role)) {
      await interaction.reply({
        content: `Rôle protégé, suppression refusée : ${role.name}`,
        ephemeral: true,
      });
      return;
    }
    if (role.managed) {
      await interaction.reply({
        content: `Rôle géré par une intégration, suppression refusée : ${role.name}`,
        ephemeral: true,
      });
      return;
    }

    const confirm = interaction.options.getString('confirm', true);
    if (!isConfirmed(confirm)) {
      await interaction.reply({
        content: `Suppression annulée. Écris exactement ${CONFIRMATION_WORD}.`,
        ephemeral: true,
      });
      return;
    }

    await role.delete(`Suppression provisioning par ${interaction.user.tag}`);
    await interaction.reply({ content: `Rôle supprimé : ${role.name}`, ephemeral: true });
  },
};
