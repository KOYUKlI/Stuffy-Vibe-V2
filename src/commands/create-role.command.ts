import { SlashCommandBuilder } from 'discord.js';
import type { ColorResolvable } from 'discord.js';
import type { SlashCommand } from './command.js';
import { findRole } from '../utils/finders.js';
import { hasSetupAccess } from '../utils/permissions.js';

const hexColorPattern = /^#[0-9a-f]{6}$/i;

export const createRoleCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('create-role')
    .setDescription('Crée un rôle sans permission Administrator.')
    .addStringOption((option) =>
      option.setName('name').setDescription('Nom exact du rôle.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('color')
        .setDescription('Couleur hexadécimale, ex: #F1C40F.')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName('hoist').setDescription('Afficher séparément le rôle.'),
    )
    .addBooleanOption((option) =>
      option.setName('mentionable').setDescription('Autoriser les mentions du rôle.'),
    ),
  async execute(interaction) {
    if (!hasSetupAccess(interaction)) {
      await interaction.reply({ content: 'Accès refusé.', ephemeral: true });
      return;
    }
    if (!interaction.guild) throw new Error('Commande utilisable uniquement dans un serveur.');

    const name = interaction.options.getString('name', true);
    const color = interaction.options.getString('color', true);
    const hoist = interaction.options.getBoolean('hoist') ?? false;
    const mentionable = interaction.options.getBoolean('mentionable') ?? false;

    if (!hexColorPattern.test(color)) {
      await interaction.reply({
        content: 'Couleur invalide. Format attendu : #RRGGBB.',
        ephemeral: true,
      });
      return;
    }

    if (findRole(interaction.guild, name)) {
      await interaction.reply({ content: `Le rôle existe déjà : ${name}`, ephemeral: true });
      return;
    }

    const role = await interaction.guild.roles.create({
      name,
      color: color as ColorResolvable,
      hoist,
      mentionable,
      permissions: [],
      reason: `Rôle créé par ${interaction.user.tag}`,
    });

    await interaction.reply({ content: `Rôle créé : ${role.name}`, ephemeral: true });
  },
};
