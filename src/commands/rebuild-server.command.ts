import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { RebuildService } from '../services/rebuild.service.js';
import type { RebuildResult } from '../services/rebuild.service.js';
import { formatList, truncate } from '../utils/format.js';
import { safeEditReply, safeUserDm } from '../utils/interaction-response.js';
import { hasDeletionAccess } from '../utils/permissions.js';

const REBUILD_CONFIRMATION = 'REBUILD_SERVER';

export const rebuildServerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('rebuild-server')
    .setDescription('Backup, clear, rebuild et audit de la structure gérée.')
    .addBooleanOption((option) =>
      option.setName('dry-run').setDescription('Simuler sans modifier. Par défaut: true.'),
    )
    .addStringOption((option) =>
      option
        .setName('confirm')
        .setDescription(`Obligatoire en mode réel: ${REBUILD_CONFIRMATION}.`),
    )
    .addBooleanOption((option) =>
      option
        .setName('force-permissions')
        .setDescription('Réappliquer explicitement les permissions.'),
    )
    .addBooleanOption((option) =>
      option
        .setName('clear-project-roles')
        .setDescription('Supprimer aussi les rôles projet recréables avant sync.'),
    )
    .addBooleanOption((option) =>
      option
        .setName('include-external-bot-roles')
        .setDescription('Inclure les rôles spécialisés de bots externes dans le clear.'),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const dryRun = interaction.options.getBoolean('dry-run') ?? true;
    const confirm = interaction.options.getString('confirm');
    const forcePermissions = interaction.options.getBoolean('force-permissions') ?? false;
    const clearProjectRoles = interaction.options.getBoolean('clear-project-roles') ?? false;
    const includeExternalBotRoles =
      interaction.options.getBoolean('include-external-bot-roles') ?? false;

    if (!dryRun && confirm !== REBUILD_CONFIRMATION) {
      await interaction.reply({
        content: `Rebuild refusé. En mode réel, confirm doit valoir exactement ${REBUILD_CONFIRMATION}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    if (!dryRun) {
      await safeEditReply(
        interaction,
        'Rebuild-server lancé. Tous les salons peuvent être supprimés pendant l’opération ; le rapport final sera envoyé en DM et écrit dans les logs du bot.',
      );
    }

    const result = await new RebuildService().rebuild(interaction.guild, {
      dryRun,
      forcePermissions,
      clearProjectRoles,
      includeExternalBotRoles,
    });

    const formattedResult = formatRebuildResult(result, dryRun);
    if (dryRun || result.blocked) {
      await safeEditReply(interaction, formattedResult);
      return;
    }

    const dmSent = await safeUserDm(interaction, formattedResult);
    if (!dmSent) {
      await safeEditReply(
        interaction,
        `${formattedResult}\n\nNote : impossible d’envoyer le rapport en DM. Si ce message a disparu, consulte aussi les logs du bot.`,
      );
    }
  },
};

function formatRebuildResult(result: RebuildResult, dryRun: boolean): string {
  const remainingChannels = result.clearResult.remainingChannels.length;
  return truncate(
    [
      result.blocked
        ? 'Rebuild-server bloqué avant modification.'
        : !dryRun && remainingChannels > 0
          ? 'Rebuild-server terminé avec anciens salons restants avant reconstruction.'
          : dryRun
            ? 'Dry-run rebuild-server terminé.'
            : 'Rebuild-server terminé.',
      result.backupPath ? `Backup : ${result.backupPath}` : undefined,
      `Scope clear : ${result.clearResult.scope}`,
      `Salons détectés avant clear : ${result.clearResult.totalChannelsDetected}`,
      `Salons supprimables avant clear : ${result.clearResult.deletableChannelCount}`,
      `Salons supprimés : ${result.channelsDeleted}`,
      `Salons créés/prévus : ${result.channelsCreated}`,
      `Rôles créés/prévus : ${result.rolesCreated}`,
      `Rôles modifiés/prévus : ${result.rolesModified}`,
      `Permissions appliquées/prévues : ${result.permissionsApplied}`,
      result.clearResult.ignoredChannels.length
        ? `Salons ignorés/erreurs pendant clear : ${result.clearResult.ignoredChannels.length}`
        : 'Salons ignorés/erreurs pendant clear : 0',
      remainingChannels
        ? `Anciens salons restants après clear : ${remainingChannels}\n${formatList(
            result.clearResult.remainingChannels
              .slice(0, 6)
              .map(
                (issue) =>
                  `${issue.name} (${issue.type}, ${issue.id}) - raison: ${issue.reason}${
                    issue.error ? ` - erreur: ${issue.error}` : ''
                  }`,
              ),
          )}`
        : !dryRun
          ? 'Anciens salons restants après clear : 0'
          : undefined,
      result.clearResult.skippedRoles.length
        ? `Rôles conservés : ${result.clearResult.skippedRoles.length}`
        : undefined,
      result.auditIssues.length
        ? `Points audit/avertissements :\n${formatList(result.auditIssues.slice(0, 8))}`
        : 'Audit final : aucun point critique listé.',
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n'),
    1900,
  );
}
