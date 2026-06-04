import 'dotenv/config';

type EnvKey = 'DISCORD_TOKEN' | 'CLIENT_ID' | 'GUILD_ID';

function getRequiredEnv(key: EnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }

  return value;
}

export const env = {
  discordToken: getRequiredEnv('DISCORD_TOKEN'),
  clientId: getRequiredEnv('CLIENT_ID'),
  guildId: getRequiredEnv('GUILD_ID'),
};
