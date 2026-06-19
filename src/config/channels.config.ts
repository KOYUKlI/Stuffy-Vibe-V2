import { ChannelType } from 'discord.js';
import type { CategoryConfig, ChannelConfig } from '../types/server-config.types.js';
import { ROLE_NAMES } from './roles.config.js';

export const CHANNEL_NAMES = {
  welcome: '👋・bienvenue',
  departures: '🚪・départs',
  rules: '📜・règlement',
  guide: '🧭・guide',
  roles: '🎭・rôles',

  announcements: '📌・annonces',
  general: '💬・général',
  share: '📸・partage',
  support: '🎫・support',
  polls: '📊・sondages',

  lfg: '🔎・lfg',
  gaming: '💬・gaming',
  gamingClips: '🎞️・clips-gaming',
  patchNotes: '📰・patch-notes',
  freeGames: '🎁・free-games',
  valorant: '🎯・valorant',
  minecraft: '⛏️・minecraft',
  gta: '🚗・gta',
  callOfDuty: '💀・call-of-duty',
  leagueOfLegends: '🧙・league-of-legends',
  fortnite: '🏗️・fortnite',
  roblox: '🧱・roblox',
  rocketLeague: '🚀・rocket-league',
  fpsMisc: '🔫・fps-divers',
  gamesMisc: '🎲・jeux-divers',

  botConfig: '⚙️・bot-config',
  logs: '🧾・logs',
  tickets: '🎫・tickets-logs',
  reports: '🚨・signalements',
  tempVoice: '➕・créer-un-vocal',
  musicBot: '🎵・musique-bot',
} as const;

export const REMOVED_CATEGORY_NAMES = ['❖・JEUX'] as const;

function text(config: Omit<ChannelConfig, 'type'>): ChannelConfig {
  return { ...config, type: ChannelType.GuildText };
}

function voice(config: Omit<ChannelConfig, 'type'>): ChannelConfig {
  return { ...config, type: ChannelType.GuildVoice };
}

function forum(config: Omit<ChannelConfig, 'type' | 'fallbackType'>): ChannelConfig {
  return { ...config, type: ChannelType.GuildForum, fallbackType: ChannelType.GuildText };
}

const gamingGeneralAccess = [ROLE_NAMES.gaming];
const watchPartyAccess = [ROLE_NAMES.filmsSeries, ROLE_NAMES.animeManga];
const elderAccess = [ROLE_NAMES.elder];
const privateAccess = [ROLE_NAMES.privateCircle];

export const SERVER_CATEGORIES: CategoryConfig[] = [
  {
    name: '✦・ENTRÉE',
    profile: 'entry',
    channels: [
      text({ name: CHANNEL_NAMES.welcome, profile: 'entry-readonly' }),
      text({
        name: CHANNEL_NAMES.departures,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botModeration],
      }),
      text({
        name: CHANNEL_NAMES.rules,
        profile: 'entry-readonly',
        botRoles: [ROLE_NAMES.botModeration],
      }),
      text({ name: CHANNEL_NAMES.guide, profile: 'entry-readonly' }),
      text({
        name: CHANNEL_NAMES.roles,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botModeration],
      }),
    ],
  },
  {
    name: '◆・HUB',
    profile: 'member',
    channels: [
      text({
        name: CHANNEL_NAMES.announcements,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botEvents],
      }),
      text({ name: CHANNEL_NAMES.general, profile: 'member-chat' }),
      text({ name: CHANNEL_NAMES.share, profile: 'member-chat' }),
      text({
        name: CHANNEL_NAMES.support,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botTickets],
      }),
      text({ name: CHANNEL_NAMES.polls, profile: 'member-chat' }),
    ],
  },
  {
    name: '◇・GAMING',
    profile: 'member',
    accessRoles: gamingGeneralAccess,
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      text({ name: CHANNEL_NAMES.lfg, profile: 'member-chat' }),
      text({ name: CHANNEL_NAMES.gaming, profile: 'member-chat' }),
      forum({ name: CHANNEL_NAMES.gamingClips, profile: 'member-chat' }),
      text({
        name: CHANNEL_NAMES.patchNotes,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botNews],
      }),
      text({
        name: CHANNEL_NAMES.freeGames,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botNews],
      }),
      text({
        name: CHANNEL_NAMES.valorant,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.valorant],
      }),
      text({
        name: CHANNEL_NAMES.minecraft,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.minecraft],
      }),
      text({ name: CHANNEL_NAMES.gta, profile: 'member-chat', accessRoles: [ROLE_NAMES.gta] }),
      text({
        name: CHANNEL_NAMES.callOfDuty,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.callOfDuty],
      }),
      text({
        name: CHANNEL_NAMES.leagueOfLegends,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.leagueOfLegends],
      }),
      text({
        name: CHANNEL_NAMES.fortnite,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.fortnite],
      }),
      text({
        name: CHANNEL_NAMES.roblox,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.roblox],
      }),
      text({
        name: CHANNEL_NAMES.rocketLeague,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.rocketLeague],
      }),
      text({
        name: CHANNEL_NAMES.fpsMisc,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.fpsMisc],
      }),
      text({
        name: CHANNEL_NAMES.gamesMisc,
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.gamesMisc],
      }),
    ],
  },
  {
    name: '𖤐・ANIME & MANGA',
    profile: 'member',
    accessRoles: [ROLE_NAMES.animeManga],
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      text({ name: '💬・anime', profile: 'member-chat' }),
      text({ name: '📖・manga', profile: 'member-chat' }),
      text({ name: '🖼️・recommandations', profile: 'member-chat' }),
      text({
        name: '🎬・watch-party-anime',
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botEvents],
      }),
    ],
  },
  {
    name: '✧・FILMS & SÉRIES',
    profile: 'member',
    accessRoles: [ROLE_NAMES.filmsSeries],
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      text({ name: '💬・films-séries', profile: 'member-chat' }),
      text({ name: '🧾・recommandations', profile: 'member-chat' }),
      text({
        name: '🎬・watch-party',
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botEvents],
      }),
    ],
  },
  {
    name: '♬・MUSIQUE',
    profile: 'member',
    accessRoles: [ROLE_NAMES.music],
    channels: [
      text({ name: '💬・musique', profile: 'member-chat' }),
      text({ name: '🎧・playlists', profile: 'member-chat' }),
      text({
        name: CHANNEL_NAMES.musicBot,
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botMusic],
      }),
    ],
  },
  {
    name: '✎・CRÉATIF',
    profile: 'member',
    accessRoles: [ROLE_NAMES.creative],
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      forum({ name: '🎨・créations', profile: 'member-chat' }),
      text({ name: '🎬・montage', profile: 'member-chat' }),
      text({ name: '🖼️・images', profile: 'member-chat' }),
      text({ name: '💡・idées', profile: 'member-chat' }),
    ],
  },
  {
    name: '⌘・TECH',
    profile: 'member',
    accessRoles: [ROLE_NAMES.tech],
    channels: [
      text({ name: '💻・dev', profile: 'member-chat' }),
      text({ name: '🧰・hardware', profile: 'member-chat' }),
      text({ name: '🤖・ia', profile: 'member-chat' }),
      text({ name: '🧪・projets', profile: 'member-chat' }),
    ],
  },
  {
    name: '✹・VOCAUX',
    profile: 'member',
    botRoles: [ROLE_NAMES.botVoice],
    channels: [
      voice({
        name: CHANNEL_NAMES.tempVoice,
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botVoice],
      }),
      voice({ name: '🔊・vocal-général', profile: 'member-chat' }),
      voice({ name: '🎮・gaming', profile: 'member-chat', accessRoles: [ROLE_NAMES.gaming] }),
      voice({
        name: '🎬・watch-party',
        profile: 'member-chat',
        accessRoles: watchPartyAccess,
        botRoles: [ROLE_NAMES.botEvents],
      }),
      voice({
        name: '🎧・music',
        profile: 'member-chat',
        accessRoles: [ROLE_NAMES.music],
        botRoles: [ROLE_NAMES.botMusic],
      }),
    ],
  },
  {
    name: '☾・ANCIENS',
    profile: 'member',
    accessRoles: elderAccess,
    channels: [
      text({ name: '🌙・salon-ancien', profile: 'member-chat' }),
      text({ name: '📦・archives', profile: 'member-readonly' }),
      voice({ name: '🔊・vocal-anciens', profile: 'member-chat' }),
    ],
  },
  {
    name: '✦・CERCLE PRIVÉ',
    profile: 'member',
    accessRoles: privateAccess,
    staffAccess: 'founder-only',
    channels: [
      text({ name: '🖤・salon-privé', profile: 'member-chat' }),
      text({ name: '🧠・discussions', profile: 'member-chat' }),
      voice({ name: '🔊・vocal-privé', profile: 'member-chat' }),
    ],
  },
  {
    name: '▣・STAFF',
    profile: 'staff',
    channels: [
      text({ name: '🛡️・staff-chat', profile: 'staff' }),
      text({
        name: CHANNEL_NAMES.logs,
        profile: 'bot-staff',
        botRoles: [
          ROLE_NAMES.botModeration,
          ROLE_NAMES.botAutomod,
          ROLE_NAMES.botTickets,
          ROLE_NAMES.botStats,
        ],
      }),
      text({
        name: CHANNEL_NAMES.botConfig,
        profile: 'bot-staff',
        botRoles: [
          ROLE_NAMES.botModeration,
          ROLE_NAMES.botAutomod,
          ROLE_NAMES.botTickets,
          ROLE_NAMES.botVoice,
          ROLE_NAMES.botEvents,
          ROLE_NAMES.botStats,
          ROLE_NAMES.botNews,
          ROLE_NAMES.botStarboard,
          ROLE_NAMES.botMusic,
        ],
      }),
      text({
        name: CHANNEL_NAMES.tickets,
        profile: 'bot-staff',
        botRoles: [ROLE_NAMES.botTickets],
      }),
      text({
        name: CHANNEL_NAMES.reports,
        profile: 'staff',
        botRoles: [ROLE_NAMES.botTickets, ROLE_NAMES.botAutomod],
      }),
      text({ name: '📦・archives-staff', profile: 'staff' }),
    ],
  },
];

export function resolveChannelConfig(
  categoryConfig: CategoryConfig,
  channelConfig: ChannelConfig,
): ChannelConfig {
  return {
    ...channelConfig,
    accessRoles: channelConfig.accessRoles ?? categoryConfig.accessRoles,
    staffAccess: channelConfig.staffAccess ?? categoryConfig.staffAccess,
    botRoles: [...new Set([...(categoryConfig.botRoles ?? []), ...(channelConfig.botRoles ?? [])])],
  };
}
