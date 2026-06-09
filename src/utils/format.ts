import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { GuildBasedChannel } from 'discord.js';

export function formatList(items: string[], empty = 'Aucun élément.'): string {
  if (items.length === 0) return empty;
  return items.map((item) => `• ${item}`).join('\n');
}

export function truncate(value: string, max = 1024): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function channelTypeLabel(type: ChannelType): string {
  switch (type) {
    case ChannelType.GuildText:
      return 'texte';
    case ChannelType.GuildVoice:
      return 'vocal';
    case ChannelType.GuildAnnouncement:
      return 'annonce';
    case ChannelType.GuildForum:
      return 'forum';
    case ChannelType.GuildCategory:
      return 'catégorie';
    case ChannelType.GuildStageVoice:
      return 'stage';
    case ChannelType.GuildMedia:
      return 'média';
    default:
      return `type-${type}`;
  }
}

export function channelLabel(channel: GuildBasedChannel): string {
  return `${channel.name} (${channelTypeLabel(channel.type)})`;
}

export function permissionName(permission: bigint): string {
  const known = Object.entries(PermissionFlagsBits).find(([, value]) => value === permission);
  return known?.[0] ?? permission.toString();
}
