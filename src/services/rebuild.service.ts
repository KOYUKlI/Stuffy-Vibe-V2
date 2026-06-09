import { PermissionFlagsBits } from 'discord.js';
import type { Guild, GuildMember } from 'discord.js';
import { SERVER_CATEGORIES } from '../config/channels.config.js';
import { SERVER_ROLES } from '../config/roles.config.js';
import { AuditService } from './audit.service.js';
import { ClearService } from './clear.service.js';
import type { ClearResult } from './clear.service.js';
import { ExportService } from './export.service.js';
import { SyncService } from './sync.service.js';

export interface RebuildOptions {
  dryRun: boolean;
  forcePermissions: boolean;
  clearProjectRoles: boolean;
  includeExternalBotRoles: boolean;
}

export interface RebuildResult {
  blocked: boolean;
  backupPath?: string;
  clearResult: ClearResult;
  rolesCreated: number;
  rolesModified: number;
  channelsDeleted: number;
  channelsCreated: number;
  permissionsApplied: number;
  auditIssues: string[];
}

export class RebuildService {
  private readonly auditService = new AuditService();
  private readonly clearService = new ClearService();
  private readonly exportService = new ExportService();
  private readonly syncService = new SyncService();

  public async rebuild(guild: Guild, options: RebuildOptions): Promise<RebuildResult> {
    const beforeAudit = this.auditService.run(guild);
    const clearScope = options.clearProjectRoles ? 'all-project' : 'all-channels';
    const plannedClearResult = await this.clearService.clear(guild, {
      dryRun: true,
      scope: clearScope,
      includeExternalBotRoles: options.includeExternalBotRoles,
      backup: false,
    });
    const blockingIssues = plannedClearResult.skippedRoles.filter((role) =>
      role.includes('plus haut ou égal au rôle du bot'),
    );

    if (!options.dryRun && blockingIssues.length > 0) {
      return {
        blocked: true,
        clearResult: plannedClearResult,
        rolesCreated: 0,
        rolesModified: 0,
        channelsDeleted: 0,
        channelsCreated: 0,
        permissionsApplied: 0,
        auditIssues: blockingIssues,
      };
    }

    if (!options.dryRun) {
      const missingPermissions = await this.missingRequiredPermissions(guild, clearScope);
      if (missingPermissions.length > 0) {
        return {
          blocked: true,
          clearResult: plannedClearResult,
          rolesCreated: 0,
          rolesModified: 0,
          channelsDeleted: 0,
          channelsCreated: 0,
          permissionsApplied: 0,
          auditIssues: [`Permissions bot manquantes: ${missingPermissions.join(', ')}`],
        };
      }
    }

    if (options.dryRun) {
      return {
        blocked: false,
        clearResult: plannedClearResult,
        rolesCreated: beforeAudit.missingRoles.length,
        rolesModified: this.configuredRoleCount() - beforeAudit.missingRoles.length,
        channelsDeleted:
          plannedClearResult.deletedChannels.length + plannedClearResult.deletedCategories.length,
        channelsCreated: beforeAudit.missingChannels.length + beforeAudit.missingCategories.length,
        permissionsApplied: this.configuredPermissionTargetCount(),
        auditIssues: [
          ...beforeAudit.permissionIssues,
          ...beforeAudit.duplicateIssues,
          ...plannedClearResult.warnings,
        ],
      };
    }

    const backupPath = (await this.exportService.exportGuild(guild, 'backup-before-rebuild-server'))
      .filePath;
    const realClearResult = await this.clearService.clear(guild, {
      dryRun: false,
      scope: clearScope,
      includeExternalBotRoles: options.includeExternalBotRoles,
      backup: false,
    });

    await this.syncService.sync(guild, {
      dryRun: false,
      force: options.forcePermissions,
      backup: false,
    });

    const afterAudit = this.auditService.run(guild);

    return {
      blocked: false,
      backupPath,
      clearResult: realClearResult,
      rolesCreated: beforeAudit.missingRoles.length + realClearResult.deletedRoles.length,
      rolesModified: this.configuredRoleCount() - beforeAudit.missingRoles.length,
      channelsDeleted:
        realClearResult.deletedChannels.length + realClearResult.deletedCategories.length,
      channelsCreated:
        realClearResult.deletedChannels.length +
        realClearResult.deletedCategories.length +
        beforeAudit.missingChannels.length +
        beforeAudit.missingCategories.length,
      permissionsApplied: this.configuredPermissionTargetCount(),
      auditIssues: [
        ...afterAudit.missingRoles,
        ...afterAudit.missingCategories,
        ...afterAudit.missingChannels,
        ...afterAudit.permissionIssues,
        ...afterAudit.duplicateIssues,
        ...realClearResult.warnings,
      ],
    };
  }

  private configuredRoleCount(): number {
    return SERVER_ROLES.length;
  }

  private configuredPermissionTargetCount(): number {
    return (
      SERVER_CATEGORIES.length +
      SERVER_CATEGORIES.reduce((count, category) => count + category.channels.length, 0)
    );
  }

  private async missingRequiredPermissions(
    guild: Guild,
    clearScope: 'all-channels' | 'all-project',
  ) {
    const missing = await this.clearService.missingRequiredPermissions(guild, clearScope);
    const botMember = await this.fetchBotMember(guild);

    if (!botMember) return missing;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      missing.push('ManageRoles');
    }

    return [...new Set(missing)];
  }

  private async fetchBotMember(guild: Guild): Promise<GuildMember | null> {
    if (guild.members.me) return guild.members.me;

    try {
      return await guild.members.fetchMe();
    } catch {
      return null;
    }
  }
}
