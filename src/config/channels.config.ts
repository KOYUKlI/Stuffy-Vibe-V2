import { ChannelType } from 'discord.js';
import type { CategoryConfig } from '../types/server-config.types.js';
import { ROLE_NAMES } from './roles.config.js';

export const CHANNEL_NAMES = {
  welcome: '👋・bienvenue',
  rules: '📜・règlement',
  guide: '🧭・guide',
  roles: '🎭・rôles',
  general: '💬・général',
  botCommands: '🤖・commandes',
  botConfig: '⚙️・bot-config',
  logs: '🧾・logs',
  tickets: '🎫・tickets',
  stats: '📊・stats',
  patchNotes: '📰・patch-notes',
  freeGames: '🎁・free-games',
  bestOf: '⭐・best-of',
  tempVoice: '➕・créer-un-vocal',
} as const;

export const SERVER_CATEGORIES: CategoryConfig[] = [
  {
    name: '✦・ENTRÉE',
    profile: 'entry',
    channels: [
      { name: CHANNEL_NAMES.welcome, type: ChannelType.GuildText, profile: 'entry-readonly' },
      {
        name: CHANNEL_NAMES.rules,
        type: ChannelType.GuildText,
        profile: 'entry-readonly',
        botRoles: [ROLE_NAMES.botModeration],
      },
      { name: CHANNEL_NAMES.guide, type: ChannelType.GuildText, profile: 'entry-readonly' },
      {
        name: CHANNEL_NAMES.roles,
        type: ChannelType.GuildText,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botModeration],
      },
    ],
  },
  {
    name: '◈・LOUNGE',
    profile: 'member',
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      { name: CHANNEL_NAMES.general, type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🌙・discussion-nuit', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '📸・médias', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '😂・memes', type: ChannelType.GuildText, profile: 'member-chat' },
      {
        name: '📌・annonces-potes',
        type: ChannelType.GuildText,
        profile: 'member-readonly',
        botRoles: [ROLE_NAMES.botEvents],
      },
    ],
  },
  {
    name: '◇・GAMING',
    profile: 'member',
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      { name: '🎮・gaming', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🎯・valorant', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '⛏️・minecraft', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🧩・autres-jeux', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🔎・lfg', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🏆・ranked', type: ChannelType.GuildText, profile: 'member-chat' },
    ],
  },
  {
    name: '❖・CULTURE',
    profile: 'member',
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      { name: '🍜・anime-manga', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🎬・films-séries', type: ChannelType.GuildText, profile: 'member-chat' },
      { name: '🎧・musique', type: ChannelType.GuildText, profile: 'member-chat' },
      {
        name: '🎨・créatif',
        type: ChannelType.GuildForum,
        fallbackType: ChannelType.GuildText,
        profile: 'member-chat',
      },
      { name: '🔗・partages', type: ChannelType.GuildText, profile: 'member-chat' },
    ],
  },
  {
    name: '𖤐・ACTIVITÉ',
    profile: 'member',
    botRoles: [ROLE_NAMES.botStarboard],
    channels: [
      {
        name: '📅・events',
        type: ChannelType.GuildText,
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botEvents],
      },
      {
        name: '🎞️・clips',
        type: ChannelType.GuildForum,
        fallbackType: ChannelType.GuildText,
        profile: 'member-chat',
      },
      {
        name: CHANNEL_NAMES.bestOf,
        type: ChannelType.GuildText,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botStarboard],
      },
      {
        name: '💡・suggestions',
        type: ChannelType.GuildForum,
        fallbackType: ChannelType.GuildText,
        profile: 'member-chat',
      },
      { name: '📊・sondages', type: ChannelType.GuildText, profile: 'member-chat' },
      {
        name: CHANNEL_NAMES.freeGames,
        type: ChannelType.GuildText,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botNews],
      },
      {
        name: CHANNEL_NAMES.patchNotes,
        type: ChannelType.GuildText,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botNews],
      },
    ],
  },
  {
    name: '⌁・BOTS',
    profile: 'bots',
    channels: [
      { name: CHANNEL_NAMES.botCommands, type: ChannelType.GuildText, profile: 'member-chat' },
      {
        name: '🎵・musique-bot',
        type: ChannelType.GuildText,
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botMusic],
      },
      { name: '🎲・fun-bot', type: ChannelType.GuildText, profile: 'member-chat' },
      {
        name: CHANNEL_NAMES.stats,
        type: ChannelType.GuildText,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botStats],
      },
      {
        name: CHANNEL_NAMES.botConfig,
        type: ChannelType.GuildText,
        profile: 'bot-staff',
        botRoles: [ROLE_NAMES.botModeration],
      },
    ],
  },
  {
    name: '🔒・STAFF',
    profile: 'staff',
    channels: [
      { name: '🛠️・admin', type: ChannelType.GuildText, profile: 'staff' },
      {
        name: CHANNEL_NAMES.logs,
        type: ChannelType.GuildText,
        profile: 'bot-staff',
        botRoles: [ROLE_NAMES.botModeration, ROLE_NAMES.botTickets, ROLE_NAMES.botStats],
      },
      {
        name: '🚨・signalements',
        type: ChannelType.GuildText,
        profile: 'staff',
        botRoles: [ROLE_NAMES.botTickets],
      },
      {
        name: CHANNEL_NAMES.tickets,
        type: ChannelType.GuildText,
        profile: 'bot-staff',
        botRoles: [ROLE_NAMES.botTickets],
      },
      { name: '🗃️・archives', type: ChannelType.GuildText, profile: 'staff' },
    ],
  },
  {
    name: '🔊・VOCAUX',
    profile: 'member',
    botRoles: [ROLE_NAMES.botVoice],
    channels: [
      { name: '🔊・chill', type: ChannelType.GuildVoice, profile: 'member-chat' },
      { name: '🎮・gaming', type: ChannelType.GuildVoice, profile: 'member-chat' },
      { name: '🎯・tryhard', type: ChannelType.GuildVoice, profile: 'member-chat' },
      { name: '📺・stream', type: ChannelType.GuildVoice, profile: 'member-chat' },
      {
        name: '🎧・music',
        type: ChannelType.GuildVoice,
        profile: 'member-chat',
        botRoles: [ROLE_NAMES.botMusic],
      },
      {
        name: CHANNEL_NAMES.tempVoice,
        type: ChannelType.GuildVoice,
        profile: 'bot-publication',
        botRoles: [ROLE_NAMES.botVoice],
      },
      { name: '💤・afk', type: ChannelType.GuildVoice, profile: 'member-chat' },
    ],
  },
];
