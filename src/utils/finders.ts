import { ChannelType } from 'discord.js';
import type { Guild, GuildBasedChannel, Role } from 'discord.js';

export function findRole(guild: Guild, name: string): Role | undefined {
  return guild.roles.cache.find((role) => role.name === name);
}

export function findChannel(guild: Guild, name: string): GuildBasedChannel | undefined {
  return guild.channels.cache.find((channel) => channel.name === name);
}

export function findChannelByNameAndType(
  guild: Guild,
  name: string,
  type: ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.GuildCategory,
): GuildBasedChannel | undefined {
  return guild.channels.cache.find((channel) => channel.name === name && channel.type === type);
}

export function findTextChannel(guild: Guild, name: string) {
  const channel = findChannelByNameAndType(guild, name, ChannelType.GuildText);
  return channel?.type === ChannelType.GuildText ? channel : undefined;
}

export function findCategory(guild: Guild, name: string) {
  const channel = findChannelByNameAndType(guild, name, ChannelType.GuildCategory);
  return channel?.type === ChannelType.GuildCategory ? channel : undefined;
}
