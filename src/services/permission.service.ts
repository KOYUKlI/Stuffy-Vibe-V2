import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Guild, OverwriteResolvable, Role } from 'discord.js';
import {
  ADMIN_ALLOW,
  BOT_AUTOMOD_ALLOW,
  BOT_MODERATION_ALLOW,
  BOT_MUSIC_ALLOW,
  BOT_READ_ALLOW,
  BOT_TEXT_ALLOW,
  BOT_TICKETS_ALLOW,
  BOT_VOICE_ALLOW,
  EVERYONE_DENY,
  MEMBER_TEXT_ALLOW,
  MEMBER_VOICE_ALLOW,
  MUTED_DENY,
  PROVISIONING_BOT_ALLOW,
  READ_ONLY_DENY,
  STAFF_ALLOW,
} from '../config/permissions.config.js';
import { ROLE_NAMES } from '../config/roles.config.js';
import type {
  CategoryConfig,
  ChannelConfig,
  ManualChannelOptions,
  PermissionProfile,
  StaffAccess,
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
    if (category.accessRoles?.length) {
      return this.roleGatedOverwrites(
        context,
        category.accessRoles,
        false,
        'member-readonly',
        category.botRoles ?? [],
        category.staffAccess,
      );
    }

    if (category.profile === 'entry') {
      return [
        this.everyoneAllow(context, [PermissionFlagsBits.ViewChannel], READ_ONLY_DENY),
        ...this.staffOverwrites(context, category.staffAccess),
        ...this.specializedBotOverwrites(context, category.botRoles ?? [], 'entry-readonly', false),
        ...this.provisioningBotOverwrites(context),
      ].filter(Boolean) as OverwriteResolvable[];
    }

    if (category.profile === 'staff') return this.staffOnlyOverwrites(context, true);

    return this.memberOnlyOverwrites(
      context,
      false,
      category.profile === 'bots',
      category.botRoles ?? [],
    );
  }

  public channelOverwrites(
    channel: ChannelConfig,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    if (channel.accessRoles?.length) {
      return this.roleGatedOverwrites(
        context,
        channel.accessRoles,
        channel.type === ChannelType.GuildVoice,
        channel.profile,
        channel.botRoles ?? [],
        channel.staffAccess,
      );
    }

    return this.profileOverwrites(
      channel.profile,
      context,
      channel.type === ChannelType.GuildVoice,
      channel.botRoles ?? [],
      channel.staffAccess,
    );
  }

  public manualChannelOverwrites(
    options: ManualChannelOptions,
    context: PermissionContext,
  ): OverwriteResolvable[] {
    const profile = this.manualProfile(options);
    return this.profileOverwrites(profile, context, options.type === ChannelType.GuildVoice, []);
  }

  private profileOverwrites(
    profile: PermissionProfile,
    context: PermissionContext,
    voice: boolean,
    botRoles: string[],
    staffAccess: StaffAccess = 'all',
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
          ...this.specializedBotOverwrites(context, botRoles, profile, voice),
          ...this.provisioningBotOverwrites(context),
        ].filter(Boolean) as OverwriteResolvable[];
      case 'member-readonly':
        return this.memberOnlyOverwrites(context, false, true, botRoles, staffAccess);
      case 'member-chat':
        return this.memberOnlyOverwrites(context, voice, false, botRoles, staffAccess);
      case 'staff':
        return this.staffOnlyOverwrites(context, false, botRoles, profile, voice);
      case 'bot-staff':
        return this.staffOnlyOverwrites(context, true, botRoles, profile, voice);
      case 'bot-publication':
        return this.botPublicationOverwrites(context, voice, botRoles, profile, staffAccess);
    }
  }

  private memberOnlyOverwrites(
    context: PermissionContext,
    voice: boolean,
    readonly: boolean,
    botRoles: string[],
    staffAccess: StaffAccess = 'all',
  ): OverwriteResolvable[] {
    const memberAllow = voice
      ? MEMBER_VOICE_ALLOW
      : readonly
        ? [PermissionFlagsBits.ViewChannel]
        : MEMBER_TEXT_ALLOW;
    const memberDeny = readonly ? READ_ONLY_DENY : [];

    return [
      this.everyoneDeny(context, EVERYONE_DENY),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.member, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.elder, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel], MUTED_DENY),
      ...this.staffOverwrites(context, staffAccess),
      ...this.specializedBotOverwrites(
        context,
        botRoles,
        readonly ? 'member-readonly' : 'member-chat',
        voice,
      ),
      ...this.provisioningBotOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private botPublicationOverwrites(
    context: PermissionContext,
    voice: boolean,
    botRoles: string[],
    profile: PermissionProfile,
    staffAccess: StaffAccess = 'all',
  ): OverwriteResolvable[] {
    const memberAllow = voice
      ? MEMBER_VOICE_ALLOW
      : [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory];
    const memberDeny = voice ? [] : READ_ONLY_DENY;

    return [
      this.everyoneDeny(context, EVERYONE_DENY),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleAllow(context, ROLE_NAMES.member, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.elder, memberAllow, memberDeny),
      this.roleAllow(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel], MUTED_DENY),
      ...this.staffOverwrites(context, staffAccess),
      ...this.specializedBotOverwrites(context, botRoles, profile, voice),
      ...this.provisioningBotOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffOnlyOverwrites(
    context: PermissionContext,
    botAccess: boolean,
    botRoles: string[] = [],
    profile: PermissionProfile = 'staff',
    voice = false,
  ): OverwriteResolvable[] {
    return [
      this.everyoneDeny(context, EVERYONE_DENY),
      this.roleDeny(context, ROLE_NAMES.member, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.elder, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel]),
      ...this.staffOverwrites(context),
      ...this.specializedBotOverwrites(context, botRoles, profile, voice),
      ...(botAccess ? this.provisioningBotOverwrites(context) : []),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private roleGatedOverwrites(
    context: PermissionContext,
    accessRoles: string[],
    voice: boolean,
    profile: PermissionProfile,
    botRoles: string[],
    staffAccess: StaffAccess = 'all',
  ): OverwriteResolvable[] {
    const readonly = profile === 'member-readonly' || profile === 'bot-publication';
    const roleAllow = voice
      ? MEMBER_VOICE_ALLOW
      : readonly
        ? [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
        : MEMBER_TEXT_ALLOW;
    const roleDeny = voice ? [] : readonly ? READ_ONLY_DENY : [];

    return [
      this.everyoneDeny(context, EVERYONE_DENY),
      this.roleDeny(context, ROLE_NAMES.pending, [PermissionFlagsBits.ViewChannel]),
      this.roleDeny(context, ROLE_NAMES.guest, [PermissionFlagsBits.ViewChannel]),
      ...accessRoles.map((roleName) => this.roleAllow(context, roleName, roleAllow, roleDeny)),
      this.roleAllow(context, ROLE_NAMES.muted, [PermissionFlagsBits.ViewChannel], MUTED_DENY),
      ...this.staffOverwrites(context, staffAccess),
      ...this.specializedBotOverwrites(context, botRoles, profile, voice),
      ...this.provisioningBotOverwrites(context),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private staffOverwrites(
    context: PermissionContext,
    staffAccess: StaffAccess = 'all',
  ): OverwriteResolvable[] {
    if (staffAccess === 'founder-only') {
      return [this.roleAllow(context, ROLE_NAMES.founder, ADMIN_ALLOW)].filter(
        Boolean,
      ) as OverwriteResolvable[];
    }

    return [
      this.roleAllow(context, ROLE_NAMES.founder, ADMIN_ALLOW),
      this.roleAllow(context, ROLE_NAMES.admin, ADMIN_ALLOW),
      this.roleAllow(context, ROLE_NAMES.moderator, STAFF_ALLOW),
    ].filter(Boolean) as OverwriteResolvable[];
  }

  private provisioningBotOverwrites(context: PermissionContext): OverwriteResolvable[] {
    const botMember = context.guild.members.me;
    return [botMember ? { id: botMember.id, allow: PROVISIONING_BOT_ALLOW } : undefined].filter(
      Boolean,
    ) as OverwriteResolvable[];
  }

  private specializedBotOverwrites(
    context: PermissionContext,
    botRoles: string[],
    profile: PermissionProfile,
    voice: boolean,
  ): OverwriteResolvable[] {
    return botRoles
      .map((roleName) =>
        this.roleAllow(context, roleName, this.specializedBotAllow(roleName, profile, voice)),
      )
      .filter(Boolean) as OverwriteResolvable[];
  }

  private specializedBotAllow(
    roleName: string,
    profile: PermissionProfile,
    voice: boolean,
  ): bigint[] {
    if (roleName === ROLE_NAMES.botModeration) return BOT_MODERATION_ALLOW;
    if (roleName === ROLE_NAMES.botAutomod) return BOT_AUTOMOD_ALLOW;
    if (roleName === ROLE_NAMES.botTickets) return BOT_TICKETS_ALLOW;
    if (roleName === ROLE_NAMES.botVoice) return BOT_VOICE_ALLOW;
    if (roleName === ROLE_NAMES.botMusic) return voice ? BOT_MUSIC_ALLOW : BOT_TEXT_ALLOW;
    if (roleName === ROLE_NAMES.botStarboard) {
      return profile === 'bot-publication' ? BOT_TEXT_ALLOW : BOT_READ_ALLOW;
    }
    return voice ? BOT_VOICE_ALLOW : BOT_TEXT_ALLOW;
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
