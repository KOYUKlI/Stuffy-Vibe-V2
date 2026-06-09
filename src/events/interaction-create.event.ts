import type { Client } from 'discord.js';
import { commandMap } from '../commands/index.js';
import { safeErrorReply } from '../utils/interaction-response.js';
import { logger } from '../utils/logger.js';

export function registerInteractionCreateEvent(client: Client): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: 'Commande inconnue.', ephemeral: true });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Erreur commande /${interaction.commandName}.`, error);
      await safeErrorReply(interaction, 'Erreur pendant la commande. Consulte les logs du bot.');
    }
  });
}
