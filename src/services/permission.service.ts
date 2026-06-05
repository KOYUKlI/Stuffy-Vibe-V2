import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, OverwriteResolvable, Role } from 'discord.js';
import {
  ADMIN_ALLOW,
  BOT_ALLOW,
  MEMBER_TEXT_ALLOW,
  MEMBER_VOICE_ALLOW,
  MUTED_DENY,
  READ_ONLY_DENY,
  STAFF_ALLOW,
} from '../config/permissions.config.js';
import { ROLE_NAMES } from '../config/roles.config.js';
import type {
  CategoryConfig,
  ChannelConfig,
  ManualChannelOptions,
  PermissionProfile,
} from '../types/server-config.types.js';

interface PermissionContext {
  guild: Guild;
  roles: Map<string, Role>;
}

export class PermissionService {
  public categoryOverwrites(
    category: CategoryConfig,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    if (category.profile === 'entry') {
      return [
        this.everyoneAllow(context, [PermissionFlagsBits.ViewChannel], READ_ONLY_DENY),
        ...this.staffOverwrites(context),
        ...this.botOverwrites(context),
      ].filter(Boolean) as OverwriteResolvable[];
    }

    if (category.profile === 'staff') return this.staffOnlyOverwrites(context, true);

    return this.memberOnlyOverwrites(context, false, category.profile === 'bots');
  }

  public channelOverwrites(
    channel: ChannelConfig,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    return this.profileOverwrites(
      channel.profile,
      context,
      channel.type === ChannelType.GuildVoice,
    );
  }

  public manualChannelOverwrites(
    options: ManualChannelOptions,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    const profile = this.manualProfile(options);
    return this.profileOverwrites(profile, context, options.type === ChannelType.GuildVoice);
  }

  private profileOverwrites(
    profile: PermissionProfile,
    context: PermissionContext,
    voice: boolean,
  ): OverwriteResolvable[] {
    switch (profile) {
      case 'entry-readonly':
        return [
          this.everyoneAllow(context, [PermissionFlagsBits.ViewChannel], READ_ONLY_DENY),
          this.roleAllow(
            context,
            ROLE_NAMES.pending,
            [PermissionFlagsBits.ViewChannel],
            READ_ONLY_DENY,
          ),
          this.roleAllow(
            context,
            ROLE_NAMES.guest,
            [PermissionFlagsBits.ViewChannel],
            READ_ONLY_DENY,
          ),
          ...this.staffOverwrites(context),
          ...this.botOverwrites(context),
        ].filter(Boolean) as OverwriteResolvable[];
      case 'member-readonly':
        return this.memberOnlyOverwrites(context, true, true);
      case 'member-chat':
        return this.memberOnlyOverwrites(context, voice, false);
      case 'staff':
        return this.staffOnlyOverwrites(context, false);
      case 'bot-staff':
        return this.staffOnlyOverwrites(context, true);
      case 'bot-publication':
        return this.botPublicationOverwrites(context, voice);
    }
  }

  private memberOnlyOverwrites(
    context: PermissionContext,
    voice: boolean,
    readonly: boolean,
  ): OverwriteResolvable[] {
    const memberAllow = voice
      ? MEMBER_VOICE_ALLOW
      : readonly
        ? [PermissionFlagsBits.ViewChannel]
        : MEMBER_TEXT_ALLOW;
    const memberDeny = readonly ? READ_ONLY_DENY : [];

    return [
      this.everyoneDeny(context, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.MentionEveryone,
      ]),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.member, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.elder, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel], MUTED_DENY),
      ...this.staffOverwrites(context),
      ...this.botOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private botPublicationOverwrites(
    context: PermissionContext,
    voice: boolean,
  ): OverwriteResolvable[] {
    const memberAllow = voice
      ? MEMBER_VOICE_ALLOW
      : [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory];
    const memberDeny = voice ? [] : READ_ONLY_DENY;

    return [
      this.everyoneDeny(context, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.MentionEveryone,
      ]),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.member, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.elder, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel], MUTED_DENY),
      ...this.staffOverwrites(context),
      ...this.botOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffOnlyOverwrites(
    context: PermissionContext,
    botAccess: boolean,
  ): OverwriteResolvable[] {
    return [
      this.everyoneDeny(context, [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.MentionEveryone,
      ]),
      this.roleDeny(context, ROLE_NAMES.member, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.elder, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel]),
      ...this.staffOverwrites(context),
      ...(botAccess ? this.botOverwrites(context) : []),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffOverwrites(context: PermissionContext): OverwriteResolvable[] {
    return [
      this.roleAllow(context, ROLE_NAMES.founder, ADMIN_ALLOW),
      this.roleAllow(context, ROLE_NAMES.admin, ADMIN_ALLOW),
      this.roleAllow(context, ROLE_NAMES.moderator, STAFF_ALLOW),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private botOverwrites(context: PermissionContext): OverwriteResolvable[] {
    const botMember = context.guild.members.me;
    return [
      this.roleAllow(context, ROLE_NAMES.bot, BOT_ALLOW),
      botMember ? { id: botMember.id, allow: BOT_ALLOW } : undefined,
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private manualProfile(options: ManualChannelOptions): PermissionProfile {
    if (options.staffOnly) return 'staff';
    if (options.readonly && options.memberOnly) return 'member-readonly';
    if (options.readonly) return 'entry-readonly';
    return 'member-chat';
  }

  private everyoneAllow(
    context: PermissionContext,
    allow: bigint[],
    deny: bigint[] = [],
  ): OverwriteResolvable {
    return { id: context.guild.id, allow, deny };
  }

  private everyoneDeny(context: PermissionContext, deny: bigint[]): OverwriteResolvable {
    return { id: context.guild.id, deny };
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
