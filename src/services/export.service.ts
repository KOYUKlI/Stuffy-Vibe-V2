import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Guild, NonThreadGuildBasedChannel } from 'discord.js';
import { channelTypeLabel } from '../utils/format.js';

interface ExportResult {
  filePath: string;
  roleCount: number;
  channelCount: number;
}

export class ExportService {
  public async exportGuild(guild: Guild, prefix = 'server-config'): Promise<ExportResult> {
    const fetchedChannels = await guild.channels.fetch();
    const channels = [...fetchedChannels.values()].filter(
      (channel): channel is NonThreadGuildBasedChannel => Boolean(channel),
    );

    const payload = {
      exportedAt: new Date().toISOString(),
      guild: {
        id: guild.id,
        name: guild.name,
      },
      roles: guild.roles.cache
        .filter((role) => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map((role) => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          hoist: role.hoist,
          mentionable: role.mentionable,
          managed: role.managed,
          position: role.position,
          permissions: role.permissions.toArray(),
        })),
      channels: channels
        .sort((a, b) => this.channelPosition(a) - this.channelPosition(b))
        .map((channel) => this.serializeChannel(channel)),
    };

    const exportsDir = resolve(process.cwd(), 'exports');
    await mkdir(exportsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = resolve(exportsDir, `${prefix}-${timestamp}.json`);
    await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

    return {
      filePath,
      roleCount: payload.roles.length,
      channelCount: payload.channels.length,
    };
  }

  private serializeChannel(channel: NonThreadGuildBasedChannel) {
    return {
      id: channel.id,
      name: channel.name,
      type: channelTypeLabel(channel.type),
      parentId: channel.parentId,
      position: this.channelPosition(channel),
      permissionOverwrites:
        'permissionOverwrites' in channel
          ? channel.permissionOverwrites.cache.map((overwrite) => ({
              id: overwrite.id,
              type: overwrite.type,
              allow: overwrite.allow.toArray(),
              deny: overwrite.deny.toArray(),
            }))
          : [],
    };
  }

  private channelPosition(channel: NonThreadGuildBasedChannel): number {
    return 'rawPosition' in channel ? channel.rawPosition : 0;
  }
}
