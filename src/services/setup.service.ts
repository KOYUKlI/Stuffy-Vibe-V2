import type { Guild } from 'discord.js';
import { SyncService } from './sync.service.js';
import type { SyncResult } from './sync.service.js';

export class SetupService {
  private readonly syncService = new SyncService();

  public async run(guild: Guild, dryRun: boolean): Promise<SyncResult> {
    return this.syncService.sync(guild, { dryRun, force: true });
  }
}
