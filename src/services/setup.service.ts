import type { Guild } from 'discord.js';
import { SyncService } from './sync.service.js';

export class SetupService {
  private readonly syncService = new SyncService();

  public async run(guild: Guild): Promise<void> {
    await this.syncService.sync(guild, { dryRun: false, force: true });
  }
}
