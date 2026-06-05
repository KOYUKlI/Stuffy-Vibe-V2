import { ChannelType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import type { ProvisionedChannelType } from '../types/server-config.types.js';
import { findCategory, findChannelByNameAndType, findChannelInCategory } from '../utils/finders.js';
import { hasProvisioningAccess } from '../utils/permissions.js';
import { ChannelService } from '../services/channel.service.js';
import { RoleService } from '../services/role.service.js';

const channelTypes = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  forum: ChannelType.GuildForum,
} as const;

export const createChannelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('create-channel')
    .setDescription('Crée manuellement un salon texte, vocal ou forum.')
    .addStringOption((option) =>
      option.setName('name').setDescription('Nom exact du salon.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type de salon.')
        .setRequired(true)
        .addChoices(
          { name: 'Texte', value: 'text' },
          { name: 'Vocal', value: 'voice' },
          { name: 'Forum', value: 'forum' },
        ),
    )
    .addStringOption((option) =>
      option.setName('category').setDescription('Nom exact de la catégorie parente.'),
    )
    .addBooleanOption((option) =>
      option.setName('member-only').setDescription('Visible seulement après rôle ✅・Membre.'),
    )
    .addBooleanOption((option) =>
      option.setName('staff-only').setDescription('Visible seulement staff.'),
    )
    .addBooleanOption((option) =>
      option.setName('readonly').setDescription('Lecture seule pour les membres autorisés.'),
    ),
  async execute(interaction) {
    if (!hasProvisioningAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const name = interaction.options.getString('name', true);
    const categoryName = interaction.options.getString('category') ?? undefined;
    const typeKey = interaction.options.getString('type', true) as keyof typeof channelTypes;
    const type: ProvisionedChannelType = channelTypes[typeKey];
    const category = categoryName ? findCategory(interaction.guild, categoryName) : undefined;

    if (categoryName && !category) {
      await interaction.reply({
        content: `Catégorie introuvable : ${categoryName}`,
        ephemeral: true,
      });
      return;
    }

    const existing = category
      ? findChannelInCategory(interaction.guild, name, type, category.id)
      : findChannelByNameAndType(interaction.guild, name, type);
    if (existing) {
      await interaction.reply({
        content: `Un salon ${name} de ce type existe déjà.`,
        ephemeral: true,
      });
      return;
    }

    const roles = new RoleService().configuredRoleMap(interaction.guild);
    const channel = await new ChannelService().createManualChannel(interaction.guild, roles, {
      name,
      categoryName,
      type,
      memberOnly: interaction.options.getBoolean('member-only') ?? true,
      staffOnly: interaction.options.getBoolean('staff-only') ?? false,
      readonly: interaction.options.getBoolean('readonly') ?? false,
    });

    await interaction.reply({ content: `Salon créé : ${channel.name}`, ephemeral: true });
  },
};
