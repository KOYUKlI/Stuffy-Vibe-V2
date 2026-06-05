import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { ColorResolvable } from 'discord.js';

export const BRANDING = {
  guildName: '답답한 분위기 V2',
  primaryColor: '#1B1F3B' as ColorResolvable,
  accentColor: '#F1C40F' as ColorResolvable,
  secondaryColor: '#9B59B6' as ColorResolvable,
};

export type RoleKind = 'hierarchy' | 'interest' | 'notification' | 'color';

export interface RoleConfig {
  name: string;
  color: ColorResolvable;
  hoist?: boolean;
  mentionable?: boolean;
  permissions?: bigint[];
  kind: RoleKind;
  protected?: boolean;
}

export interface ChannelConfig {
  name: string;
  type: ChannelType.GuildText | ChannelType.GuildVoice;
  readonly?: boolean;
  memberOnly?: boolean;
  staffOnly?: boolean;
  botAccess?: boolean;
}

export interface CategoryConfig {
  name: string;
  staffOnly?: boolean;
  memberOnly?: boolean;
  channels: ChannelConfig[];
}

export const ROLE_NAMES = {
  founder: '神 (Fondateur)',
  admin: '🛡️・Admin',
  moderator: '🔧・Modérateur',
  elder: '⭐・Ancien',
  member: '✅・Membre',
  pending: '🕯️・À valider',
  guest: '👁️・Invité',
  bot: '🤖・Bot',
  muted: '🔇・Muted',
};

export const CHANNEL_NAMES = {
  rules: '📜・règlement',
  welcome: '👋・bienvenue',
  announcements: '📢・annonces',
  guide: '🧭・guide',
  roles: '🎭・rôles',
  general: '💬・général',
  commands: '🤖・commandes',
  botLogs: '🧾・bot-logs',
  botValidation: '🛡️・validation-bot',
  botRoles: '🎭・role-bot',
  ticketTool: '🎫・ticket-tool',
  voiceMaster: '🔊・voicemaster',
  sesh: '📅・sesh',
  stats: '📊・stats',
  patchBot: '📰・patchbot',
  freeStuff: '🎁・freestuff',
  starboard: '⭐・starboard',
  admin: '🛠️・admin',
  logs: '🧾・logs',
};

export const SERVER_ROLES: RoleConfig[] = [
  {
    name: ROLE_NAMES.founder,
    color: '#F1C40F',
    hoist: true,
    mentionable: false,
    permissions: [],
    kind: 'hierarchy',
    protected: true,
  },
  {
    name: ROLE_NAMES.admin,
    color: '#E74C3C',
    hoist: true,
    mentionable: false,
    permissions: [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ViewAuditLog,
    ],
    kind: 'hierarchy',
  },
  {
    name: ROLE_NAMES.moderator,
    color: '#3498DB',
    hoist: true,
    mentionable: false,
    permissions: [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ViewAuditLog,
    ],
    kind: 'hierarchy',
  },
  { name: ROLE_NAMES.elder, color: '#9B59B6', hoist: true, mentionable: false, kind: 'hierarchy' },
  {
    name: ROLE_NAMES.member,
    color: '#2ECC71',
    hoist: false,
    mentionable: false,
    kind: 'hierarchy',
  },
  {
    name: ROLE_NAMES.pending,
    color: '#F1C40F',
    hoist: false,
    mentionable: false,
    kind: 'hierarchy',
  },
  { name: ROLE_NAMES.guest, color: '#95A5A6', hoist: false, mentionable: false, kind: 'hierarchy' },
  { name: ROLE_NAMES.bot, color: '#5865F2', hoist: true, mentionable: false, kind: 'hierarchy' },
  { name: ROLE_NAMES.muted, color: '#7F8C8D', hoist: false, mentionable: false, kind: 'hierarchy' },
  { name: '🎯・Valorant', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '⛏️・Minecraft', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '🎮・Gaming', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '🍜・Anime', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '🎬・Films & Séries', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '🎧・Musique', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '🎨・Créatif', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '📺・Stream', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '💻・Dev', color: BRANDING.secondaryColor, kind: 'interest' },
  { name: '📢・Annonces', color: BRANDING.accentColor, kind: 'notification' },
  { name: '🎮・Game Night', color: BRANDING.accentColor, kind: 'notification' },
  { name: '🎬・Watch Party', color: BRANDING.accentColor, kind: 'notification' },
  { name: '🎁・Free Games', color: BRANDING.accentColor, kind: 'notification' },
  { name: '📊・Sondages', color: BRANDING.accentColor, kind: 'notification' },
  { name: '🌑・Bleu Nuit', color: '#1B1F3B', kind: 'color' },
  { name: '💜・Lavande', color: '#9B59B6', kind: 'color' },
  { name: '🤍・Blanc', color: '#FFFFFF', kind: 'color' },
  { name: '🖤・Noir', color: '#111111', kind: 'color' },
  { name: '🌸・Rose', color: '#FF8FB3', kind: 'color' },
  { name: '💎・Cyan', color: '#00D1FF', kind: 'color' },
  { name: '🍃・Menthe', color: '#7DFFB3', kind: 'color' },
  { name: '🔥・Rouge', color: '#E74C3C', kind: 'color' },
  { name: '☀️・Or', color: '#F1C40F', kind: 'color' },
];

export const SERVER_CATEGORIES: CategoryConfig[] = [
  {
    name: '✦・ACCUEIL',
    channels: [
      { name: CHANNEL_NAMES.rules, type: ChannelType.GuildText, readonly: true },
      { name: CHANNEL_NAMES.welcome, type: ChannelType.GuildText, readonly: true, botAccess: true },
      {
        name: CHANNEL_NAMES.announcements,
        type: ChannelType.GuildText,
        readonly: true,
        memberOnly: true,
      },
      { name: CHANNEL_NAMES.guide, type: ChannelType.GuildText, readonly: true },
      {
        name: CHANNEL_NAMES.roles,
        type: ChannelType.GuildText,
        readonly: true,
        memberOnly: true,
        botAccess: true,
      },
    ],
  },
  {
    name: '◈・LOUNGE',
    memberOnly: true,
    channels: [
      { name: CHANNEL_NAMES.general, type: ChannelType.GuildText, memberOnly: true },
      { name: '📸・médias', type: ChannelType.GuildText, memberOnly: true },
      { name: '😂・memes', type: ChannelType.GuildText, memberOnly: true },
      { name: '❓・questions', type: ChannelType.GuildText, memberOnly: true },
    ],
  },
  {
    name: '𖤐・ACTIVITÉ',
    memberOnly: true,
    channels: [
      { name: '📅・events', type: ChannelType.GuildText, memberOnly: true, botAccess: true },
      { name: '🎞️・clips', type: ChannelType.GuildText, memberOnly: true },
      { name: '⭐・best-of', type: ChannelType.GuildText, memberOnly: true, botAccess: true },
      { name: '💡・suggestions', type: ChannelType.GuildText, memberOnly: true },
      { name: '📊・sondages', type: ChannelType.GuildText, memberOnly: true },
      { name: '🎁・free-games', type: ChannelType.GuildText, memberOnly: true, botAccess: true },
      { name: '📰・patch-notes', type: ChannelType.GuildText, memberOnly: true, botAccess: true },
    ],
  },
  {
    name: '◇・GAMING',
    memberOnly: true,
    channels: [
      { name: '🎮・gaming', type: ChannelType.GuildText, memberOnly: true },
      { name: '🎯・valorant', type: ChannelType.GuildText, memberOnly: true },
      { name: '⛏️・minecraft', type: ChannelType.GuildText, memberOnly: true },
      { name: '🧩・autres-jeux', type: ChannelType.GuildText, memberOnly: true },
      { name: '🏆・ranked', type: ChannelType.GuildText, memberOnly: true },
    ],
  },
  {
    name: '❖・CULTURE',
    memberOnly: true,
    channels: [
      { name: '🍜・anime-manga', type: ChannelType.GuildText, memberOnly: true },
      { name: '🎬・films-séries', type: ChannelType.GuildText, memberOnly: true },
      { name: '🎧・musique', type: ChannelType.GuildText, memberOnly: true },
      { name: '🎨・créatif', type: ChannelType.GuildText, memberOnly: true },
      { name: '🔗・partages', type: ChannelType.GuildText, memberOnly: true },
    ],
  },
  {
    name: '⌁・BOTS',
    memberOnly: true,
    channels: [
      {
        name: CHANNEL_NAMES.commands,
        type: ChannelType.GuildText,
        memberOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.botLogs,
        type: ChannelType.GuildText,
        staffOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.botValidation,
        type: ChannelType.GuildText,
        staffOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.botRoles,
        type: ChannelType.GuildText,
        staffOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.ticketTool,
        type: ChannelType.GuildText,
        staffOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.voiceMaster,
        type: ChannelType.GuildText,
        memberOnly: true,
        botAccess: true,
      },
      { name: CHANNEL_NAMES.sesh, type: ChannelType.GuildText, memberOnly: true, botAccess: true },
      { name: CHANNEL_NAMES.stats, type: ChannelType.GuildText, memberOnly: true, botAccess: true },
      {
        name: CHANNEL_NAMES.patchBot,
        type: ChannelType.GuildText,
        memberOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.freeStuff,
        type: ChannelType.GuildText,
        memberOnly: true,
        botAccess: true,
      },
      {
        name: CHANNEL_NAMES.starboard,
        type: ChannelType.GuildText,
        memberOnly: true,
        botAccess: true,
      },
    ],
  },
  {
    name: '🔒・STAFF',
    staffOnly: true,
    channels: [
      { name: CHANNEL_NAMES.admin, type: ChannelType.GuildText, staffOnly: true },
      { name: CHANNEL_NAMES.logs, type: ChannelType.GuildText, staffOnly: true, botAccess: true },
      { name: '🚨・signalements', type: ChannelType.GuildText, staffOnly: true },
      { name: '🎫・tickets', type: ChannelType.GuildText, staffOnly: true },
      { name: '🗃️・archives', type: ChannelType.GuildText, staffOnly: true },
    ],
  },
  {
    name: '🔊・VOCAUX',
    memberOnly: true,
    channels: [
      { name: '🔊・chill', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '🎮・gaming', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '🎯・tryhard', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '📺・stream', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '🎧・music', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '➕・créer-un-vocal', type: ChannelType.GuildVoice, memberOnly: true },
      { name: '💤・afk', type: ChannelType.GuildVoice, memberOnly: true },
    ],
  },
];

export const INTEREST_ROLE_NAMES = SERVER_ROLES.filter((role) => role.kind === 'interest').map(
  (role) => role.name,
);
export const NOTIFICATION_ROLE_NAMES = SERVER_ROLES.filter(
  (role) => role.kind === 'notification',
).map((role) => role.name);
export const COLOR_ROLE_NAMES = SERVER_ROLES.filter((role) => role.kind === 'color').map(
  (role) => role.name,
);
