import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { BRANDING } from '../config/branding.config.js';
import { AuditService } from '../services/audit.service.js';
import { formatList, truncate } from '../utils/format.js';
import { hasProvisioningAccess } from '../utils/permissions.js';

export const auditCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('audit')
    .setDescription('Compare le serveur réel avec la configuration attendue sans modifier.'),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const report = new AuditService().run(interaction.guild);
    const embed = new EmbedBuilder()
      .setColor(BRANDING.colors.midnightBlue)
      .setTitle('Audit provisioning')
      .addFields(
        { name: 'Rôles manquants', value: truncate(formatList(report.missingRoles, 'Aucun.')) },
        {
          name: 'Catégories manquantes',
          value: truncate(formatList(report.missingCategories, 'Aucune.')),
        },
        {
          name: 'Salons manquants',
          value: truncate(formatList(report.missingChannels, 'Aucun.')),
        },
        {
          name: 'Permissions critiques',
          value: truncate(formatList(report.permissionIssues, 'Aucun problème détecté.')),
        },
        {
          name: 'Doublons problématiques',
          value: truncate(formatList(report.duplicateIssues, 'Aucun doublon problématique.')),
        },
      )
      .setFooter({ text: BRANDING.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
