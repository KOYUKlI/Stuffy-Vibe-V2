import { ChannelType, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from './command.js';
import { findChannelByNameAndType } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

type DeletableChannelKind = 'text' | 'voice' | 'category';

const channelTypes = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  category: ChannelType.GuildCategory,
} as const;

export const deleteChannelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('delete-channel')
    .setDescription('Supprime un salon ou une catégorie par nom et type.')
    .addStringOption((option) =>
      option.setName('name').setDescription('Nom exact à supprimer.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type à supprimer.')
        .setRequired(true)
        .addChoices(
          { name: 'Texte', value: 'text' },
          { name: 'Vocal', value: 'voice' },
          { name: 'Catégorie', value: 'category' },
        ),
    ),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const name = interaction.options.getString('name', true);
    const kind = interaction.options.getString('type', true) as DeletableChannelKind;
    const channel = findChannelByNameAndType(interaction.guild, name, channelTypes[kind]);

    if (!channel || !('delete' in channel)) {
      await interaction.reply({ content: `Élément introuvable : ${name}`, ephemeral: true });
      return;
    }

    await channel.delete(`Suppression par ${interaction.user.tag}`);
    await interaction.reply({ content: `Élément supprimé : ${name}`, ephemeral: true });
  },
};
