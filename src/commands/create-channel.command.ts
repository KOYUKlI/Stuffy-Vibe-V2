import { ChannelType, SlashCommandBuilder } from 'discord.js';
import type { CategoryChannel, Guild, GuildBasedChannel, Role } from 'discord.js';
import type { SlashCommand } from './command.js';
import type { CategoryConfig, ChannelConfig } from '../config/server.config.js';
import { PermissionService } from '../services/permission.service.js';
import { RoleService } from '../services/role.service.js';
import { findCategory, findChannelByNameAndType } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

type ChannelKind = 'text' | 'voice' | 'category';
type PermissionProfile = 'public-readonly' | 'member' | 'staff' | 'bot';

const channelTypes = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  category: ChannelType.GuildCategory,
} as const;

export const createChannelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('create-channel')
    .setDescription('Crée un salon ou une catégorie de provisioning.')
    .addStringOption((option) =>
      option.setName('name').setDescription('Nom exact à créer.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type de salon.')
        .setRequired(true)
        .addChoices(
          { name: 'Texte', value: 'text' },
          { name: 'Vocal', value: 'voice' },
          { name: 'Catégorie', value: 'category' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('profile')
        .setDescription('Profil de permissions à appliquer.')
        .setRequired(true)
        .addChoices(
          { name: 'Public lecture seule', value: 'public-readonly' },
          { name: 'Membres', value: 'member' },
          { name: 'Staff', value: 'staff' },
          { name: 'Bot externe', value: 'bot' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Catégorie parente existante, ignorée pour une catégorie.'),
    ),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const name = interaction.options.getString('name', true);
    const kind = interaction.options.getString('type', true) as ChannelKind;
    const profile = interaction.options.getString('profile', true) as PermissionProfile;
    const parentName = interaction.options.getString('category');

    if (kind === 'category') {
      const type = channelTypes.category;
      if (findChannelByNameAndType(interaction.guild, name, type)) {
        await interaction.reply({
          content: `Une catégorie ${name} existe déjà.`,
          ephemeral: true,
        });
        return;
      }

      const roles = new RoleService().configuredRoleMap(interaction.guild);
      const permissionService = new PermissionService();
      await interaction.guild.channels.create({
        name,
        type,
        permissionOverwrites: permissionService.categoryOverwrites(
          categoryConfigFromProfile(name, profile),
          { guild: interaction.guild, roles },
        ),
        reason: `Catégorie créée par ${interaction.user.tag}`,
      });
      await interaction.reply({ content: `Catégorie créée : ${name}`, ephemeral: true });
      return;
    }

    const type = channelTypes[kind];
    if (findChannelByNameAndType(interaction.guild, name, type)) {
      await interaction.reply({
        content: `Un élément ${name} de ce type existe déjà.`,
        ephemeral: true,
      });
      return;
    }

    const roles = new RoleService().configuredRoleMap(interaction.guild);
    const parent = parentName ? findCategory(interaction.guild, parentName) : undefined;
    if (parentName && !parent) {
      await interaction.reply({
        content: `Catégorie introuvable : ${parentName}`,
        ephemeral: true,
      });
      return;
    }

    const channelConfig = channelConfigFromProfile(name, type, profile);
    const created = await createGuildChannel(interaction.guild, channelConfig, roles, parent);
    await interaction.reply({ content: `Salon créé : ${created.name}`, ephemeral: true });
  },
};

function categoryConfigFromProfile(name: string, profile: PermissionProfile): CategoryConfig {
  return {
    name,
    staffOnly: profile === 'staff',
    memberOnly: profile === 'member' || profile === 'bot',
    channels: [],
  };
}

function channelConfigFromProfile(
  name: string,
  type: ChannelType.GuildText | ChannelType.GuildVoice,
  profile: PermissionProfile,
): ChannelConfig {
  return {
    name,
    type,
    readonly: profile === 'public-readonly',
    memberOnly: profile === 'member' || profile === 'bot',
    staffOnly: profile === 'staff',
    botAccess: profile === 'bot',
  };
}

async function createGuildChannel(
  guild: Guild,
  channelConfig: ChannelConfig,
  roles: Map<string, Role>,
  parent?: CategoryChannel,
): Promise<GuildBasedChannel> {
  return guild.channels.create({
    name: channelConfig.name,
    type: channelConfig.type,
    parent: parent?.id,
    permissionOverwrites: new PermissionService().channelOverwrites(channelConfig, {
      guild,
      roles,
    }),
    reason: 'Création manuelle par commande de provisioning',
  });
}
