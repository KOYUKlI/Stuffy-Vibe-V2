import type { ChannelType, ColorResolvable } from 'discord.js';

export type RoleKind = 'hierarchy' | 'interest' | 'notification' | 'color';

export interface RoleConfig {
  name: string;
  color: ColorResolvable;
  hoist: boolean;
  mentionable: boolean;
  permissions: bigint[];
  kind: RoleKind;
  protected?: boolean;
}

export type ProvisionedChannelType =
  | ChannelType.GuildText
  | ChannelType.GuildVoice
  | ChannelType.GuildForum;

export type PermissionProfile =
  | 'entry-readonly'
  | 'member-chat'
  | 'member-readonly'
  | 'staff'
  | 'bot-publication'
  | 'bot-staff';

export interface ChannelConfig {
  name: string;
  type: ProvisionedChannelType;
  fallbackType?: ChannelType.GuildText;
  profile: PermissionProfile;
  topic?: string;
  reason?: string;
}

export interface CategoryConfig {
  name: string;
  profile: 'entry' | 'member' | 'staff' | 'bots';
  channels: ChannelConfig[];
}

export interface ManualChannelOptions {
  name: string;
  categoryName?: string;
  type: ProvisionedChannelType;
  memberOnly: boolean;
  staffOnly: boolean;
  readonly: boolean;
}

export interface SyncOptions {
  dryRun: boolean;
  force: boolean;
}
