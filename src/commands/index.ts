import type { SlashCommand } from './command.js';
import { auditCommand } from './audit.command.js';
import { createChannelCommand } from './create-channel.command.js';
import { createRoleCommand } from './create-role.command.js';
import { deleteChannelCommand } from './delete-channel.command.js';
import { deleteRoleCommand } from './delete-role.command.js';
import { embedGuideCommand } from './embed-guide.command.js';
import { embedRolesCommand } from './embed-roles.command.js';
import { embedRulesCommand } from './embed-rules.command.js';
import { embedWelcomeCommand } from './embed-welcome.command.js';
import { exportConfigCommand } from './export-config.command.js';
import { setupCommand } from './setup.command.js';
import { syncCommand } from './sync.command.js';
import { syncPermissionsCommand } from './sync-permissions.command.js';

export const commands = [
  setupCommand,
  auditCommand,
  syncCommand,
  syncPermissionsCommand,
  createChannelCommand,
  deleteChannelCommand,
  createRoleCommand,
  deleteRoleCommand,
  exportConfigCommand,
  embedRulesCommand,
  embedWelcomeCommand,
  embedGuideCommand,
  embedRolesCommand,
] satisfies SlashCommand[];

export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
