import type { Client, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import {
  COLOR_ROLE_NAMES,
  INTEREST_ROLE_NAMES,
  NOTIFICATION_ROLE_NAMES,
} from '../config/server.config.js';
import { commandMap } from '../commands/index.js';
import { ROLE_SELECT_IDS } from '../services/embed.service.js';
import { logger } from '../utils/logger.js';

const roleSelectGroups = {
  [ROLE_SELECT_IDS.interests]: INTEREST_ROLE_NAMES,
  [ROLE_SELECT_IDS.notifications]: NOTIFICATION_ROLE_NAMES,
  [ROLE_SELECT_IDS.colors]: COLOR_ROLE_NAMES,
};

export function registerInteractionCreateEvent(client: Client): void {
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commandMap.get(interaction.commandName);
        if (!command) {
          await interaction.reply({ content: 'Commande inconnue.', ephemeral: true });
          return;
        }

        await command.execute(interaction);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        await handleRoleSelect(interaction);
      }
    } catch (error) {
      logger.error('Erreur pendant une interaction.', error);
      if (interaction.isRepliable()) {
        const payload = {
          content: 'Une erreur est survenue. Consulte les logs du bot.',
          ephemeral: true,
        };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      }
    }
  });
}

async function handleRoleSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  if (!interaction.guild || !interaction.member) {
    await interaction.reply({
      content: 'Cette interaction doit être utilisée dans le serveur.',
      ephemeral: true,
    });
    return;
  }

  const allowedRoleNames = roleSelectGroups[interaction.customId as keyof typeof roleSelectGroups];
  if (!allowedRoleNames) return;

  const member = interaction.member as GuildMember;
  const selectedRoleIds = interaction.values
    .map((roleName) => interaction.guild?.roles.cache.find((role) => role.name === roleName)?.id)
    .filter((roleId): roleId is string => Boolean(roleId));

  const managedRoleIds = allowedRoleNames
    .map((roleName) => interaction.guild?.roles.cache.find((role) => role.name === roleName)?.id)
    .filter((roleId): roleId is string => Boolean(roleId));

  await member.roles.remove(managedRoleIds, 'Mise à jour sélection de rôles');
  if (selectedRoleIds.length > 0) {
    await member.roles.add(selectedRoleIds, 'Mise à jour sélection de rôles');
  }

  await interaction.reply({ content: 'Rôles mis à jour.', ephemeral: true });
}
