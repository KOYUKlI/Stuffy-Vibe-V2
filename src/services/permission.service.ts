import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, OverwriteResolvable, Role } from 'discord.js';
import type { ChannelConfig, CategoryConfig } from '../config/server.config.js';
import { ROLE_NAMES } from '../config/server.config.js';

interface PermissionContext {
  guild: Guild;
  roles: Map<string, Role>;
}

const textReadOnlyDeny = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.CreatePublicThreads,
];
const textWriteAllow = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.AddReactions,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.ReadMessageHistory,
];
const voiceAllow = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak,
];
const moderationAllow = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ReadMessageHistory,
];

export class PermissionService {
  public categoryOverwrites(
    category: CategoryConfig,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    if (category.staffOnly) return this.staffOnlyOverwrites(context);
    if (category.memberOnly) return this.memberOnlyOverwrites(context);

    return [
      { id: context.guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: textReadOnlyDeny },
      ...this.staffAllowOverwrites(context),
    ];
  }

  public channelOverwrites(
    channel: ChannelConfig,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    if (channel.staffOnly) return this.staffOnlyOverwrites(context);

    if (channel.name === '💬・général') {
      return [
        { id: context.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
        this.roleAllow(context, ROLE_NAMES.member, textWriteAllow),
        this.roleAllow(context, ROLE_NAMES.elder, textWriteAllow),
        this.roleAllow(
          context,
          ROLE_NAMES.muted,
          [PermissionFlagsBits.ViewChannel],
          [PermissionFlagsBits.SendMessages],
        ),
        ...this.staffAllowOverwrites(context),
      ].filter(Boolean) as OverwriteResolvable[];
    }

    if (channel.memberOnly)
      return this.memberOnlyOverwrites(context, channel.type === ChannelType.GuildVoice);

    const overwrites: OverwriteResolvable[] = [
      {
        id: context.guild.id,
        allow: [PermissionFlagsBits.ViewChannel],
        deny: channel.readonly ? textReadOnlyDeny : [],
      },
      this.roleAllow(
        context,
        ROLE_NAMES.guest,
        [PermissionFlagsBits.ViewChannel],
        textReadOnlyDeny,
      ),
      this.roleAllow(
        context,
        ROLE_NAMES.member,
        [PermissionFlagsBits.ViewChannel],
        channel.readonly ? textReadOnlyDeny : [],
      ),
      this.roleAllow(
        context,
        ROLE_NAMES.muted,
        [PermissionFlagsBits.ViewChannel],
        [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Speak],
      ),
      ...this.staffAllowOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];

    if (channel.botAccess) {
      const botRole = this.roleAllow(context, ROLE_NAMES.bot, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ]);
      if (botRole) overwrites.push(botRole);
    }

    return overwrites;
  }

  private memberOnlyOverwrites(context: PermissionContext, voice = false): OverwriteResolvable[] {
    const allow = voice ? voiceAllow : textWriteAllow;
    return [
      { id: context.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.member, allow),
      this.roleAllow(context, ROLE_NAMES.elder, allow),
      this.roleAllow(
        context,
        ROLE_NAMES.muted,
        [PermissionFlagsBits.ViewChannel],
        [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Speak],
      ),
      ...this.staffAllowOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffOnlyOverwrites(context: PermissionContext): OverwriteResolvable[] {
    return [
      { id: context.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      this.roleDeny(context, ROLE_NAMES.member, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.elder, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.muted, [], [PermissionFlagsBits.ViewChannel]),
      ...this.staffAllowOverwrites(context),
      this.roleAllow(context, ROLE_NAMES.bot, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
      ]),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffAllowOverwrites(context: PermissionContext): OverwriteResolvable[] {
    return [
      this.roleAllow(context, ROLE_NAMES.founder, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
      ]),
      this.roleAllow(context, ROLE_NAMES.admin, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
      ]),
      this.roleAllow(context, ROLE_NAMES.moderator, moderationAllow),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private roleAllow(
    context: PermissionContext,
    roleName: string,
    allow: bigint[],
    deny: bigint[] = [],
  ): OverwriteResolvable | undefined {
    const role = context.roles.get(roleName);
    return role ? { id: role.id, allow, deny } : undefined;
  }

  private roleDeny(
    context: PermissionContext,
    roleName: string,
    deny: bigint[],
  ): OverwriteResolvable | undefined {
    const role = context.roles.get(roleName);
    return role ? { id: role.id, deny } : undefined;
  }
}
