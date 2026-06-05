import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export function registerReadyEvent(client: Client): void {
  client.once('ready', (readyClient) => {
    logger.success(`Provisioning bot connecté: ${readyClient.user.tag}`);
  });
}
