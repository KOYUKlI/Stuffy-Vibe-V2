import type { Client } from 'discord.js';
import { commandMap } from '../commands/index.js';
import { logger } from '../utils/logger.js';

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
