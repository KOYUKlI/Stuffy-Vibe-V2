import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export function registerReadyEvent(client: Client): void {
  client.once('ready', (readyClient) => {
    logger.success(`Connecté en tant que ${readyClient.user.tag}.`);
    logger.info(`Serveurs chargés: ${readyClient.guilds.cache.size}.`);
  });
}
