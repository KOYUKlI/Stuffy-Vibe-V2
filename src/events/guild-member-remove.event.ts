import { EmbedBuilder } from 'discord.js';
import type { Client } from 'discord.js';
import { BRANDING, CHANNEL_NAMES } from '../config/server.config.js';
import { findTextChannel } from '../utils/finders.js';
import { logger } from '../utils/logger.js';

export function registerGuildMemberRemoveEvent(client: Client): void {
  client.on('guildMemberRemove', async (member) => {
    try {
      const channel = findTextChannel(member.guild, CHANNEL_NAMES.logs);
      if (!channel) {
        logger.warn(`Salon logs introuvable dans ${member.guild.name}.`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(BRANDING.primaryColor)
        .setTitle('Départ membre')
        .setDescription(`${member.user.tag} a quitté le serveur.`)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      logger.info(`Départ loggé: ${member.user.tag}.`);
    } catch (error) {
      logger.error('Impossible de logger le départ.', error);
    }
  });
}
