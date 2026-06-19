import { PermissionFlagsBits } from 'discord.js';
import type { ColorResolvable } from 'discord.js';
import type { RoleConfig, RoleKind } from '../types/server-config.types.js';
import { BRANDING } from './branding.config.js';

export const ROLE_NAMES = {
  founder: '神 (Fondateur)',
  admin: '🛡️・Admin',
  moderator: '🔧・Modérateur',
  privateCircle: '💎・Cercle privé',
  elder: '⭐・Ancien',
  member: '✅・Membre',
  muted: '🔇・Muted',
  pending: '🕯️・À valider',
  guest: '👁️・Invité',

  gaming: '🎮・Gaming',
  animeManga: '🎌・Anime & Manga',
  filmsSeries: '🍿・Films & Séries',
  music: '🎵・Musique',
  creative: '🎨・Créatif',
  tech: '💻・Tech',

  valorant: '🎯・Valorant',
  minecraft: '⛏️・Minecraft',
  gta: '🚗・GTA',
  callOfDuty: '💀・Call of Duty',
  leagueOfLegends: '🧙・League of Legends',
  fortnite: '🏗️・Fortnite',
  roblox: '🧱・Roblox',
  rocketLeague: '🚀・Rocket League',
  fpsMisc: '🔫・FPS divers',
  gamesMisc: '🎲・Jeux divers',

  announcements: '📢・Annonces',
  gameNight: '🎮・Game Night',
  watchParty: '🎬・Watch Party',
  patchNotes: '📰・Patch Notes',
  freeGames: '🎁・Free Games',
  polls: '📊・Sondages',

  colorGold: '🟨・Or',
  colorNightPurple: '🟪・Violet nuit',
  colorNeonBlue: '🟦・Bleu néon',
  colorBloodRed: '🟥・Rouge sang',
  colorJadeGreen: '🟩・Vert jade',
  colorBlack: '⬛・Noir',
  colorMoonWhite: '⬜・Blanc lune',
  colorSakura: '🌸・Sakura',

  bot: '🤖・Bot',
  botModeration: '🛠️・Bot Modération',
  botAutomod: '🛡️・Bot Automod',
  botTickets: '🎫・Bot Tickets',
  botVoice: '🔊・Bot Vocal',
  botEvents: '📅・Bot Events',
  botStats: '📊・Bot Stats',
  botNews: '📰・Bot News',
  botStarboard: '⭐・Bot Starboard',
  botMusic: '🎵・Bot Music',
} as const;

function role(
  name: string,
  color: ColorResolvable,
  kind: RoleKind,
  permissions: bigint[] = [],
  options: Pick<RoleConfig, 'hoist' | 'mentionable' | 'protected'> = {
    hoist: false,
    mentionable: false,
  },
): RoleConfig {
  return {
    name,
    color,
    hoist: options.hoist ?? false,
    mentionable: options.mentionable ?? false,
    permissions,
    kind,
    protected: options.protected,
  };
}

export const STAFF_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.founder, BRANDING.colors.founderGold, 'hierarchy', [], {
    hoist: true,
    mentionable: false,
    protected: true,
  }),
  role(
    ROLE_NAMES.admin,
    '#E74C3C',
    'hierarchy',
    [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ViewAuditLog,
    ],
    { hoist: true, mentionable: false },
  ),
  role(
    ROLE_NAMES.moderator,
    '#3498DB',
    'hierarchy',
    [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ViewAuditLog,
    ],
    { hoist: true, mentionable: false },
  ),
];

export const PRIVATE_ACCESS_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.privateCircle, '#ECF0F1', 'hierarchy', [], {
    hoist: true,
    mentionable: false,
  }),
  role(ROLE_NAMES.elder, BRANDING.colors.lavender, 'hierarchy', [], {
    hoist: true,
    mentionable: false,
  }),
];

export const MEMBER_ROLE: RoleConfig = role(ROLE_NAMES.member, '#2ECC71', 'hierarchy', [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.AddReactions,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.SendMessagesInThreads,
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
]);

export const STATE_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.muted, '#555555', 'hierarchy'),
  role(ROLE_NAMES.pending, BRANDING.colors.coldGrey, 'hierarchy'),
];

export const HIERARCHY_ROLES: RoleConfig[] = [
  ...STAFF_ROLES,
  ...PRIVATE_ACCESS_ROLES,
  MEMBER_ROLE,
  ...STATE_ROLES,
];

export const UNIVERSE_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.gaming, BRANDING.colors.lavender, 'universe'),
  role(ROLE_NAMES.animeManga, '#E91E63', 'universe'),
  role(ROLE_NAMES.filmsSeries, '#FFB347', 'universe'),
  role(ROLE_NAMES.music, '#9B59B6', 'universe'),
  role(ROLE_NAMES.creative, '#00D1FF', 'universe'),
  role(ROLE_NAMES.tech, '#1ABC9C', 'universe'),
];

export const GAME_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.valorant, '#FF4655', 'game'),
  role(ROLE_NAMES.minecraft, '#2ECC71', 'game'),
  role(ROLE_NAMES.gta, '#1ABC9C', 'game'),
  role(ROLE_NAMES.callOfDuty, '#7F8C8D', 'game'),
  role(ROLE_NAMES.leagueOfLegends, '#C89B3C', 'game'),
  role(ROLE_NAMES.fortnite, '#5865F2', 'game'),
  role(ROLE_NAMES.roblox, '#ECF0F1', 'game'),
  role(ROLE_NAMES.rocketLeague, '#3498DB', 'game'),
  role(ROLE_NAMES.fpsMisc, '#E74C3C', 'game'),
  role(ROLE_NAMES.gamesMisc, '#F1C40F', 'game'),
];

export const NOTIFICATION_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.announcements, BRANDING.colors.founderGold, 'notification'),
  role(ROLE_NAMES.gameNight, BRANDING.colors.founderGold, 'notification'),
  role(ROLE_NAMES.watchParty, BRANDING.colors.founderGold, 'notification'),
  role(ROLE_NAMES.patchNotes, BRANDING.colors.founderGold, 'notification'),
  role(ROLE_NAMES.freeGames, BRANDING.colors.founderGold, 'notification'),
  role(ROLE_NAMES.polls, BRANDING.colors.founderGold, 'notification'),
];

export const COLOR_ROLES: RoleConfig[] = [
  role(ROLE_NAMES.colorGold, BRANDING.colors.founderGold, 'color'),
  role(ROLE_NAMES.colorNightPurple, '#3B1B5A', 'color'),
  role(ROLE_NAMES.colorNeonBlue, '#00D1FF', 'color'),
  role(ROLE_NAMES.colorBloodRed, '#8B0000', 'color'),
  role(ROLE_NAMES.colorJadeGreen, '#00A86B', 'color'),
  role(ROLE_NAMES.colorBlack, '#111111', 'color'),
  role(ROLE_NAMES.colorMoonWhite, '#ECF0F1', 'color'),
  role(ROLE_NAMES.colorSakura, '#FF8FB3', 'color'),
];

export const SPECIALIZED_BOT_ROLES: RoleConfig[] = [
  role(
    ROLE_NAMES.botModeration,
    '#3498DB',
    'bot',
    [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages],
    { hoist: true, mentionable: false },
  ),
  role(
    ROLE_NAMES.botAutomod,
    '#E74C3C',
    'bot',
    [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers],
    { hoist: true, mentionable: false },
  ),
  role(
    ROLE_NAMES.botTickets,
    '#9B59B6',
    'bot',
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages],
    { hoist: true, mentionable: false },
  ),
  role(
    ROLE_NAMES.botVoice,
    '#1ABC9C',
    'bot',
    [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
    { hoist: true, mentionable: false },
  ),
  role(ROLE_NAMES.botEvents, '#E67E22', 'bot', [], { hoist: true, mentionable: false }),
  role(ROLE_NAMES.botStats, '#95A5A6', 'bot', [], { hoist: true, mentionable: false }),
  role(ROLE_NAMES.botNews, '#F1C40F', 'bot', [], { hoist: true, mentionable: false }),
  role(ROLE_NAMES.botStarboard, '#F39C12', 'bot', [], { hoist: true, mentionable: false }),
  role(ROLE_NAMES.botMusic, '#2ECC71', 'bot', [], { hoist: true, mentionable: false }),
];

export const COMMON_BOT_ROLE: RoleConfig = role(ROLE_NAMES.bot, '#5865F2', 'bot', [], {
  hoist: true,
  mentionable: false,
});

export const BOT_ROLES: RoleConfig[] = [...SPECIALIZED_BOT_ROLES, COMMON_BOT_ROLE];

export const SERVER_ROLES: RoleConfig[] = [
  ...STAFF_ROLES,
  // Les vrais rôles managed des bots externes servent d'ancres et ne sont pas créés ici.
  ...SPECIALIZED_BOT_ROLES,
  ...COLOR_ROLES,
  ...PRIVATE_ACCESS_ROLES,
  MEMBER_ROLE,
  ...UNIVERSE_ROLES,
  ...GAME_ROLES,
  ...NOTIFICATION_ROLES,
  ...STATE_ROLES,
  COMMON_BOT_ROLE,
];

export const GAMING_ROLE_TREE = {
  parent: ROLE_NAMES.gaming,
  children: GAME_ROLES.map((roleConfig) => roleConfig.name),
  note: 'Futur panel de rôles externe: ajouter 🎮・Gaming quand un jeu est choisi; retirer les rôles jeux quand 🎮・Gaming est retiré.',
} as const;

export const UNIVERSE_ROLE_NAMES = UNIVERSE_ROLES.map((roleConfig) => roleConfig.name);
export const GAME_ROLE_NAMES = GAME_ROLES.map((roleConfig) => roleConfig.name);
export const INTEREST_ROLE_NAMES = [...UNIVERSE_ROLE_NAMES, ...GAME_ROLE_NAMES];
export const NOTIFICATION_ROLE_NAMES = NOTIFICATION_ROLES.map((roleConfig) => roleConfig.name);
export const COLOR_ROLE_NAMES = COLOR_ROLES.map((roleConfig) => roleConfig.name);
