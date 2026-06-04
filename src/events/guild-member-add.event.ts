import type { Client } from 'discord.js';
import { CHANNEL_NAMES } from '../config/server.config.js';
import { EmbedService } from '../services/embed.service.js';
import { findTextChannel } from '../utils/finders.js';
import { logger } from '../utils/logger.js';

export function registerGuildMemberAddEvent(client: Client): void {
  client.on('guildMemberAdd', async (member) => {
    try {
      const channel = findTextChannel(member.guild, CHANNEL_NAMES.welcome);
      if (!channel) {
        logger.warn(`Salon de bienvenue introuvable dans ${member.guild.name}.`);
        return;
      }

      await channel.send({ embeds: [new EmbedService().welcome(member)] });
      logger.info(`Bienvenue envoyé pour ${member.user.tag}.`);
    } catch (error) {
      logger.error('Impossible d’envoyer le message de bienvenue.', error);
    }
  });
}
