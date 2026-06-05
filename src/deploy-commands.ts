import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const rest = new REST({ version: '10' }).setToken(env.discordToken);

try {
  logger.info('Déploiement des commandes slash de provisioning...');
  await rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), {
    body: commands.map((command) => command.data.toJSON()),
  });
  logger.success('Commandes slash déployées.');
} catch (error) {
  logger.error('Échec du déploiement des commandes slash.', error);
  process.exit(1);
}
