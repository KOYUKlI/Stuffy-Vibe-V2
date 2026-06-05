import { ChannelType } from 'discord.js';
import type { CategoryChannel, Guild, GuildBasedChannel, Role, TextBasedChannel } from 'discord.js';
import type { ProvisionedChannelType } from '../types/server-config.types.js';

export function findRole(guild: Guild, name: string): Role | undefined {
  return guild.roles.cache.find((role) => role.name === name);
}

export function findCategory(guild: Guild, name: string): CategoryChannel | undefined {
  const channel = guild.channels.cache.find(
    (candidate) => candidate.name === name && candidate.type === ChannelType.GuildCategory,
  );
  return channel?.type === ChannelType.GuildCategory ? channel : undefined;
}

export function findChannelByNameAndType(
  guild: Guild,
  name: string,
  type: ProvisionedChannelType | ChannelType.GuildCategory,
): GuildBasedChannel | undefined {
  return guild.channels.cache.find((channel) => channel.name === name && channel.type === type);
}

export function findChannelInCategory(
  guild: Guild,
  name: string,
  type: ProvisionedChannelType,
  parentId: string,
): GuildBasedChannel | undefined {
  return guild.channels.cache.find(
    (channel) => channel.name === name && channel.type === type && channel.parentId === parentId,
  );
}

export function findTextLikeChannel(guild: Guild, name: string): TextBasedChannel | undefined {
  const channel = guild.channels.cache.find(
    (candidate) =>
      candidate.name === name &&
      (candidate.type === ChannelType.GuildText ||
        candidate.type === ChannelType.GuildAnnouncement ||
        candidate.type === ChannelType.GuildForum),
  );
  return channel?.isTextBased() ? channel : undefined;
}
