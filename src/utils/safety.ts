import type { Role } from 'discord.js';
import { PROTECTED_ROLE_NAMES } from '../config/roles.config.js';

export const CONFIRMATION_WORD = 'CONFIRM';

export function isConfirmed(value: string): boolean {
  return value === CONFIRMATION_WORD;
}

export function isProtectedRole(role: Role): boolean {
  return (
    role.guild.roles.everyone.id === role.id ||
    (PROTECTED_ROLE_NAMES as readonly string[]).includes(role.name)
  );
}
