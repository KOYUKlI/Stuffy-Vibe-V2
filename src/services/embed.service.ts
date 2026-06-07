import { EmbedBuilder } from 'discord.js';
import { BRANDING } from '../config/branding.config.js';
import { CHANNEL_NAMES } from '../config/channels.config.js';

export class EmbedService {
  public welcome(): EmbedBuilder {
    return this.base()
      .setTitle(`Bienvenue dans ${BRANDING.guildName}`)
      .setDescription(
        [
          'Serveur privé entre amis, ambiance gaming, anime et chill.',
          '',
          `• Lis ${CHANNEL_NAMES.rules}.`,
          '• La validation se fait directement dans le règlement.',
          '• Une fois validé, tu débloques le serveur principal avec le rôle ✅・Membre.',
        ].join('\n'),
      );
  }

  public rules(): EmbedBuilder {
    return this.base()
      .setTitle('📜 Règlement & Validation')
      .setDescription(
        [
          '1. Respect obligatoire.',
          '2. Pas de spam ou flood.',
          '3. Pas de drama inutile.',
          '4. Pas de harcèlement.',
          '5. Pas de contenu illégal, dangereux ou NSFW.',
          '6. Utilise les salons correctement.',
          '7. Le serveur est privé : invitations contrôlées.',
          '',
          '**Validation**',
          'Après lecture, utilise le bouton ou la réaction de validation configuré par le staff. Cela te donnera le rôle ✅・Membre.',
        ].join('\n'),
      );
  }

  public guide(): EmbedBuilder {
    return this.base()
      .setTitle('🧭 Guide du serveur')
      .setDescription(
        [
          `• Parler au quotidien : ${CHANNEL_NAMES.general}.`,
          '• Poster médias, memes et clips : LOUNGE et ACTIVITÉ.',
          '• Chercher des joueurs : 🔎・lfg.',
          '• Voir les events : 📅・events.',
          `• Choisir ses rôles : ${CHANNEL_NAMES.roles}.`,
          '• Contacter le staff : tickets ou signalements via les bots externes.',
        ].join('\n'),
      );
  }

  public botPlan(): EmbedBuilder {
    return this.base()
      .setTitle('⚙️ Plan des bots externes')
      .setDescription(
        [
          'Ce bot custom provisionne seulement la structure. Les usages quotidiens restent aux bots dédiés.',
          '',
          'Chaque bot reçoit `🤖・Bot` + son rôle spécialisé.',
          '',
          '• Sapphire ou Carl-bot : `🛠️・Bot Modération`.',
          '• Ticket Tool : `🎫・Bot Tickets`.',
          '• VoiceMaster ou TempVoice : `🔊・Bot Vocal`.',
          '• Sesh ou Apollo : `📅・Bot Events`.',
          '• Statbot : `📊・Bot Stats`.',
          '• PatchBot / FreeStuff : `📰・Bot News`.',
          '• Starboard : `⭐・Bot Starboard`.',
          '• EasyPoll ou Pollmaster : permissions ciblées sur `📊・sondages`.',
          '• Jockie Music ou Kenku FM : `🎵・Bot Music`.',
          '• Beemo ou Double Counter : sécurité anti-raid si invitations plus ouvertes.',
        ].join('\n'),
      );
  }

  private base(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.colors.midnightBlue)
      .setFooter({ text: BRANDING.footer })
      .setTimestamp();
  }
}
