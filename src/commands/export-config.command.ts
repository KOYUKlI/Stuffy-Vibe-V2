import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import {
  BRANDING,
  CHANNEL_NAMES,
  ROLE_NAMES,
  SERVER_CATEGORIES,
  SERVER_ROLES,
} from '../config/server.config.js';
import { hasSetupAccess } from '../utils/permissions.js';

export const exportConfigCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('export-config')
    .setDescription('Exporte la configuration attendue du serveur en JSON.'),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }

    const payload = {
      branding: BRANDING,
      roleNames: ROLE_NAMES,
      channelNames: CHANNEL_NAMES,
      roles: SERVER_ROLES,
      categories: SERVER_CATEGORIES,
    };
    const json = JSON.stringify(payload, bigintSafeReplacer, 2);
    const attachment = new AttachmentBuilder(Buffer.from(json, 'utf8'), {
      name: 'stuffy-vibe-v2.server-config.json',
    });

    await interaction.reply({
      content: 'Configuration exportée.',
      files: [attachment],
      ephemeral: true,
    });
  },
};

function bigintSafeReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}
