import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { ClearSafetyError, ClearService } from '../services/clear.service.js';
import type { ChannelDeletionIssue, ClearResult } from '../services/clear.service.js';
import type { ClearScope } from '../types/server-config.types.js';
import { formatList, truncate } from '../utils/format.js';
import { safeEditReply, safeUserDm } from '../utils/interaction-response.js';
import { hasDeletionAccess } from '../utils/permissions.js';

const CLEAR_CONFIRMATIONS: Record<ClearScope, string> = {
  managed: 'DELETE_SERVER_STRUCTURE',
  'all-channels': 'DELETE_ALL_CHANNELS',
  'all-project': 'DELETE_SERVER_STRUCTURE',
};

export const clearServerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('clear-server')
    .setDescription('Supprime les salons/éléments du serveur avec dry-run par défaut.')
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('Périmètre de suppression. Par défaut: managed.')
        .addChoices(
          { name: 'managed', value: 'managed' },
          { name: 'all-channels', value: 'all-channels' },
          { name: 'all-project', value: 'all-project' },
        ),
    )
    .addBooleanOption((option) =>
      option.setName('dry-run').setDescription('Simuler sans supprimer. Par défaut: true.'),
    )
    .addStringOption((option) =>
      option
        .setName('confirm')
        .setDescription(
          'Obligatoire en mode réel: DELETE_ALL_CHANNELS ou DELETE_SERVER_STRUCTURE.',
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName('include-external-bot-roles')
        .setDescription('Inclure aussi les rôles spécialisés de bots externes.'),
    ),
  async execute(interaction) {
    if (!hasDeletionAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const scope = (interaction.options.getString('scope') ?? 'managed') as ClearScope;
    const dryRun = interaction.options.getBoolean('dry-run') ?? true;
    const confirm = interaction.options.getString('confirm');
    const includeExternalBotRoles =
      interaction.options.getBoolean('include-external-bot-roles') ?? false;
    const expectedConfirmation = CLEAR_CONFIRMATIONS[scope];

    if (!dryRun && confirm !== expectedConfirmation) {
      await interaction.reply({
        content: `Suppression refusée. Pour scope:${scope} en mode réel, confirm doit valoir exactement ${expectedConfirmation}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      if (!dryRun) {
        await safeEditReply(
          interaction,
          'Clear-server lancé. Le salon de commande peut être supprimé pendant l’opération ; le rapport final sera envoyé en DM et écrit dans les logs du bot.',
        );
      }

      const result = await new ClearService().clear(interaction.guild, {
        dryRun,
        scope,
        includeExternalBotRoles,
        backup: true,
      });

      const formattedResult = formatClearResult(result, dryRun);
      if (dryRun) {
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
    } catch (error) {
      if (error instanceof ClearSafetyError) {
        await safeEditReply(
          interaction,
          `Suppression refusée avant modification. Permissions bot manquantes : ${error.missingPermissions.join(', ')}.`,
        );
        return;
      }
      throw error;
    }
  },
};

function formatClearResult(result: ClearResult, dryRun: boolean): string {
  const channelAction = dryRun ? 'Salons ciblés' : 'Salons supprimés';
  const categoryAction = dryRun ? 'Catégories ciblées' : 'Catégories supprimées';
  const roleAction = dryRun ? 'Rôles ciblés' : 'Rôles supprimés';
  const title =
    !dryRun && result.remainingChannels.length > 0
      ? 'Clear-server terminé avec salons restants.'
      : dryRun
        ? 'Dry-run clear-server terminé.'
        : 'Clear-server terminé.';

  return truncate(
    [
      title,
      `Scope : ${result.scope}`,
      result.backupPath ? `Backup : ${result.backupPath}` : undefined,
      `Salons détectés : ${result.totalChannelsDetected}`,
      `Salons supprimables : ${result.deletableChannelCount}`,
      `${channelAction} : ${result.deletedChannels.length}`,
      formatList(
        result.deletedChannels.slice(0, 10),
        `Aucun salon ${dryRun ? 'ciblé' : 'supprimé'}.`,
      ),
      `${categoryAction} : ${result.deletedCategories.length}`,
      formatList(
        result.deletedCategories.slice(0, 8),
        `Aucune catégorie ${dryRun ? 'ciblée' : 'supprimée'}.`,
      ),
      `${roleAction} : ${result.deletedRoles.length}`,
      formatList(result.deletedRoles.slice(0, 12), 'Aucun rôle ciblé.'),
      result.ignoredChannels.length
        ? `Salons ignorés/erreurs : ${result.ignoredChannels.length}\n${formatChannelIssues(result.ignoredChannels.slice(0, 6))}`
        : 'Salons ignorés/erreurs : 0',
      result.remainingChannels.length
        ? `Salons restants après suppression : ${result.remainingChannels.length}\n${formatChannelIssues(result.remainingChannels.slice(0, 8))}`
        : !dryRun
          ? 'Salons restants après suppression : 0'
          : undefined,
      result.skippedRoles.length
        ? `Rôles conservés : ${result.skippedRoles.length}\n${formatList(result.skippedRoles.slice(0, 6))}`
        : undefined,
      result.warnings.length
        ? `Avertissements : ${result.warnings.length}\n${formatList(result.warnings.slice(0, 4))}`
        : undefined,
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n'),
    1900,
  );
}

function formatChannelIssues(issues: ChannelDeletionIssue[]): string {
  return formatList(
    issues.map((issue) =>
      [
        `${issue.name} (${issue.type}, ${issue.id})`,
        `raison: ${issue.reason}`,
        issue.error ? `erreur: ${issue.error}` : undefined,
      ]
        .filter((part): part is string => Boolean(part))
        .join(' - '),
    ),
  );
}
