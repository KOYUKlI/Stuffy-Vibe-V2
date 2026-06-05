import { EmbedBuilder } from 'discord.js';
import type { GuildMember, User } from 'discord.js';
import {
  BRANDING,
  CHANNEL_NAMES,
  COLOR_ROLE_NAMES,
  INTEREST_ROLE_NAMES,
  NOTIFICATION_ROLE_NAMES,
} from '../config/server.config.js';

export class EmbedService {
  public welcome(member: GuildMember | User): EmbedBuilder {
    const mention = 'user' in member ? `<@${member.user.id}>` : `<@${member.id}>`;

    return new EmbedBuilder()
      .setColor(BRANDING.accentColor)
      .setTitle(`Bienvenue dans ${BRANDING.guildName}`)
      .setDescription(
        [
          `Bienvenue ${mention} dans ${BRANDING.guildName}.`,
          'Lis le règlement, valide ton accès, puis installe-toi tranquillement.',
          'Ambiance privée · gaming · anime · chill · entre potes.',
          '',
          `• Lis ${CHANNEL_NAMES.rules}`,
          `• Consulte ${CHANNEL_NAMES.guide}`,
          `• ${CHANNEL_NAMES.roles} sera disponible après validation`,
        ].join('\n'),
      )
      .setFooter({ text: '답답한 분위기 V2 · privé · premium · dark' })
      .setTimestamp();
  }

  public rules(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.primaryColor)
      .setTitle('📜 Règlement')
      .setDescription(
        [
          '1. Respect obligatoire.',
          '2. Pas de spam, flood ou drama inutile.',
          '3. Pas d’insultes graves, harcèlement ou provocations ciblées.',
          '4. Pas de contenu illégal, dangereux ou NSFW.',
          '5. Les salons doivent être utilisés correctement.',
          '6. Le staff peut modérer si nécessaire.',
          '7. Le serveur est privé : les invitations doivent rester contrôlées.',
          '',
          'Validation : accepte le règlement ici via Sapphire ou Carl-bot.',
          'Après validation, le rôle ✅・Membre débloque le reste du serveur.',
        ].join('\n'),
      )
      .setFooter({ text: 'Simple, propre, privé.' });
  }

  public fixedWelcome(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.accentColor)
      .setTitle(`✦ ${BRANDING.guildName}`)
      .setDescription(
        [
          'Bienvenue dans notre serveur privé.',
          '',
          `• Lis ${CHANNEL_NAMES.rules}`,
          `• Consulte ${CHANNEL_NAMES.guide}`,
          `• La validation est gérée dans ${CHANNEL_NAMES.rules}`,
          `• ${CHANNEL_NAMES.roles} sera visible après validation.`,
        ].join('\n'),
      );
  }

  public guide(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.secondaryColor)
      .setTitle('🧭 Guide du serveur')
      .setDescription(
        [
          'Le serveur est organisé pour rester lisible et chill.',
          '',
          '• ACCUEIL : bienvenue, règlement, guide et infos.',
          '• LOUNGE : discussion, médias, memes et questions.',
          '• ACTIVITÉ : events, clips, best-of, sondages et annonces automatisées.',
          '• GAMING : jeux, ranked et sessions entre potes.',
          '• CULTURE : anime, films, musique et créations.',
          '• BOTS : espaces réservés aux bots externes.',
          '• STAFF : modération et logs privés.',
        ].join('\n'),
      );
  }

  public roles(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.primaryColor)
      .setTitle('🎭 Rôles')
      .setDescription(
        [
          'Ce panneau est statique.',
          '',
          'Les rôles sont attribués par Sapphire, Carl-bot ou un autre bot externe configuré dans Discord.',
          '',
          `Centres d’intérêt : ${INTEREST_ROLE_NAMES.join(', ')}`,
          `Notifications : ${NOTIFICATION_ROLE_NAMES.join(', ')}`,
          `Couleurs : ${COLOR_ROLE_NAMES.join(', ')}`,
        ].join('\n'),
      );
  }
}
