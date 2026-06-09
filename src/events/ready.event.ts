import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export function registerReadyEvent(client: Client): void {
  client.once('clientReady', (readyClient) => {
    logger.success(`Provisioning bot connecté: ${readyClient.user.tag}`);
  });
}
