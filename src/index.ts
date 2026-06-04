import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './config/env.js';
import { registerGuildMemberAddEvent } from './events/guild-member-add.event.js';
import { registerGuildMemberRemoveEvent } from './events/guild-member-remove.event.js';
import { registerInteractionCreateEvent } from './events/interaction-create.event.js';
import { registerReadyEvent } from './events/ready.event.js';
import { logger } from './utils/logger.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

registerReadyEvent(client);
registerGuildMemberAddEvent(client);
registerGuildMemberRemoveEvent(client);
registerInteractionCreateEvent(client);

client.login(env.discordToken).catch((error: unknown) => {
  logger.error('Connexion Discord impossible.', error);
  process.exit(1);
});
