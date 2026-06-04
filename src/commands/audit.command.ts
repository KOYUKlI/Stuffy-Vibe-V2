import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { BRANDING } from '../config/server.config.js';
import { AuditService } from '../services/audit.service.js';
import { hasSetupAccess } from '../utils/permissions.js';

const formatList = (items: string[]) =>
  items.length ? items.map((item) => `• ${item}`).join('\n') : 'Aucun élément manquant.';

export const auditCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('audit')
    .setDescription('Compare le serveur avec la configuration attendue.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');
    const report = new AuditService().run(interaction.guild);
    const embed = new EmbedBuilder()
      .setColor(BRANDING.primaryColor)
      .setTitle('Audit de structure')
      .addFields(
        { name: 'Rôles manquants', value: formatList(report.missingRoles).slice(0, 1024) },
        {
          name: 'Catégories manquantes',
          value: formatList(report.missingCategories).slice(0, 1024),
        },
        { name: 'Salons manquants', value: formatList(report.missingChannels).slice(0, 1024) },
        {
          name: 'Permissions critiques',
          value: formatList(report.criticalPermissions).slice(0, 1024),
        },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
