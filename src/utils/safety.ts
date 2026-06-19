import type { Role } from 'discord.js';
import { SERVER_ROLES } from '../config/roles.config.js';

export type DeletionTarget = 'CHANNEL' | 'ROLE';

export function deletionConfirmation(target: DeletionTarget, id: string): string {
  return `DELETE_${target}:${id}`;
}

export function isDeletionConfirmed(value: string, target: DeletionTarget, id: string): boolean {
  return value === deletionConfirmation(target, id);
}

export function roleDeletionBlockReason(role: Role): string | undefined {
  if (role.guild.roles.everyone.id === role.id) return '@everyone ne peut jamais être supprimé.';
  if (role.managed || role.tags?.botId) return 'Ce rôle est géré par Discord ou une intégration.';
  if (SERVER_ROLES.some((configuredRole) => configuredRole.name === role.name)) {
    return 'Ce rôle appartient à la configuration du projet.';
  }
  if (!role.editable) return 'Le rôle est plus haut ou égal au rôle du bot.';
  return undefined;
}
