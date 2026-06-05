import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './config/env.js';
import { registerInteractionCreateEvent } from './events/interaction-create.event.js';
import { registerReadyEvent } from './events/ready.event.js';
import { logger } from './utils/logger.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerReadyEvent(client);
registerInteractionCreateEvent(client);

client.login(env.discordToken).catch((error: unknown) => {
  logger.error('Connexion Discord impossible.', error);
  process.exit(1);
});
