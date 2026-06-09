import type { ChatInputCommandInteraction } from 'discord.js';
import { logger } from './logger.js';

export async function safeEditReply(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<boolean> {
  try {
    await interaction.editReply(content);
    return true;
  } catch (error) {
    logger.warn(`Impossible de modifier la réponse d'interaction: ${errorMessage(error)}`);
    return false;
  }
}

export async function safeErrorReply(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<void> {
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content, ephemeral: true });
      return;
    }

    await interaction.reply({ content, ephemeral: true });
  } catch (error) {
    logger.warn(`Impossible d'envoyer la réponse d'erreur d'interaction: ${errorMessage(error)}`);
  }
}

export async function safeUserDm(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<boolean> {
  try {
    await interaction.user.send(content);
    return true;
  } catch (error) {
    logger.warn(
      `Impossible d'envoyer le rapport en DM à ${interaction.user.tag}: ${errorMessage(error)}`,
    );
    return false;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
