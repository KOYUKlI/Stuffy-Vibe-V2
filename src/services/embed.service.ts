import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import type { GuildMember, User } from 'discord.js';
import {
  BRANDING,
  CHANNEL_NAMES,
  COLOR_ROLE_NAMES,
  INTEREST_ROLE_NAMES,
  NOTIFICATION_ROLE_NAMES,
} from '../config/server.config.js';

export const ROLE_SELECT_IDS = {
  interests: 'roles:interests',
  notifications: 'roles:notifications',
  colors: 'roles:colors',
};

export class EmbedService {
  public welcome(member: GuildMember | User): EmbedBuilder {
    const mention = 'user' in member ? `<@${member.user.id}>` : `<@${member.id}>`;

    return new EmbedBuilder()
      .setColor(BRANDING.accentColor)
      .setTitle(`Bienvenue dans ${BRANDING.guildName}`)
      .setDescription(
        [
          `Bienvenue ${mention} dans ${BRANDING.guildName}.`,
          'Lis le règlement, choisis tes rôles, puis installe-toi tranquillement.',
          'Ambiance privée · gaming · anime · chill · entre potes.',
          '',
          `• Lis ${CHANNEL_NAMES.rules}`,
          `• Choisis tes rôles dans ${CHANNEL_NAMES.roles}`,
          `• Le salon principal est ${CHANNEL_NAMES.general}`,
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
          `• Choisis tes rôles dans ${CHANNEL_NAMES.roles}`,
          `• Rejoins ${CHANNEL_NAMES.general} quand tu es prêt.`,
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
          '• ACCUEIL : infos importantes et rôles.',
          '• LOUNGE : discussion, médias, memes et suggestions.',
          '• GAMING : jeux, ranked et sessions entre potes.',
          '• CULTURE : anime, films, musique et créations.',
          '• BOTS : commandes et outils.',
          '• STAFF : modération et logs privés.',
        ].join('\n'),
      );
  }

  public roles(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(BRANDING.primaryColor)
      .setTitle('🎭 Choisis tes rôles')
      .setDescription(
        [
          'Sélectionne tes centres d’intérêt, notifications et une couleur.',
          '',
          '• Les rôles centres d’intérêt et notifications sont cumulables.',
          '• Un seul rôle couleur peut être actif à la fois.',
        ].join('\n'),
      );
  }

  public roleComponents() {
    const interestSelect = new StringSelectMenuBuilder()
      .setCustomId(ROLE_SELECT_IDS.interests)
      .setPlaceholder('Centres d’intérêt')
      .setMinValues(0)
      .setMaxValues(INTEREST_ROLE_NAMES.length)
      .addOptions(INTEREST_ROLE_NAMES.map((name) => this.option(name)));

    const notificationSelect = new StringSelectMenuBuilder()
      .setCustomId(ROLE_SELECT_IDS.notifications)
      .setPlaceholder('Notifications')
      .setMinValues(0)
      .setMaxValues(NOTIFICATION_ROLE_NAMES.length)
      .addOptions(NOTIFICATION_ROLE_NAMES.map((name) => this.option(name)));

    const colorSelect = new StringSelectMenuBuilder()
      .setCustomId(ROLE_SELECT_IDS.colors)
      .setPlaceholder('Couleur unique')
      .setMinValues(0)
      .setMaxValues(1)
      .addOptions(COLOR_ROLE_NAMES.map((name) => this.option(name)));

    return [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(interestSelect),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(notificationSelect),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(colorSelect),
    ];
  }

  private option(roleName: string): StringSelectMenuOptionBuilder {
    return new StringSelectMenuOptionBuilder().setLabel(roleName).setValue(roleName);
  }
}
