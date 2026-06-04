import type { SlashCommand } from './command.js';
import { auditCommand } from './audit.command.js';
import { clearCommand } from './clear.command.js';
import { embedGuideCommand } from './embed-guide.command.js';
import { embedRolesCommand } from './embed-roles.command.js';
import { embedRulesCommand } from './embed-rules.command.js';
import { embedWelcomeCommand } from './embed-welcome.command.js';
import { lockCommand } from './lock.command.js';
import { setupCommand } from './setup.command.js';
import { unlockCommand } from './unlock.command.js';
import { welcomeTestCommand } from './welcome-test.command.js';

export const commands = [
  setupCommand,
  auditCommand,
  embedRulesCommand,
  embedWelcomeCommand,
  welcomeTestCommand,
  embedGuideCommand,
  embedRolesCommand,
  lockCommand,
  unlockCommand,
  clearCommand,
] satisfies SlashCommand[];

export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
