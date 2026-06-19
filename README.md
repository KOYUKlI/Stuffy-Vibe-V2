# 답답한 분위기 V2 — Provisioning Bot

Bot Discord en **Node.js + TypeScript + discord.js v14** pour provisionner et maintenir la structure du serveur privé **답답한 분위기 V2**.

Ce bot est volontairement limité : il crée, synchronise, audite, exporte et ajuste l’infrastructure du serveur. Il ne gère pas la vie quotidienne et peut être arrêté après `/setup` ou après une opération de maintenance.

## Ce que le bot ne fait pas

- Pas de validation automatique des membres.
- Pas de message automatique à l’arrivée.
- Pas de `guildMemberAdd` ou `guildMemberRemove`.
- Pas de menus/boutons pour attribuer des rôles.
- Pas de tickets, musique, statistiques, events ou vocaux temporaires.
- Pas de `MessageContent`.
- Pas de `GuildMembers`.

Ces usages sont documentés dans [docs/EXTERNAL_BOTS_SETUP.md](docs/EXTERNAL_BOTS_SETUP.md) et doivent être confiés à des bots externes.

## Création de l’application Discord

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Crée une application.
3. Ajoute un bot dans l’onglet **Bot**.
4. Copie le token du bot.
5. Ne donne pas `Administrator` par défaut.

## Configuration `.env`

Copie l’exemple :

```bash
cp .env.example .env
```

Remplis :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application
GUILD_ID=id_serveur
```

Ne partage jamais le token et ne commit jamais `.env`.

## Permissions minimales du bot

Invite le bot avec :

- Manage Roles
- Manage Channels
- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Application Commands

Place le rôle du bot au-dessus des rôles qu’il doit créer ou positionner. Le rôle `神 (Fondateur)` est placé le plus haut possible sous le rôle du bot.

Le rôle `神 (Fondateur)` est créé sans permission `Administrator`. Si tu veux lui ajouter `Administrator`, fais-le manuellement après `/setup`.

## Installation

```bash
npm install
```

## Déployer les commandes

```bash
npm run deploy-commands
```

Les commandes sont déployées sur le serveur indiqué par `GUILD_ID`. Relance cette commande après chaque ajout ou modification d’options slash, par exemple après une évolution de `/clear-server` ou `/rebuild-server`.

## Lancer en développement

```bash
npm run dev
```

Lance le bot uniquement quand tu dois provisionner ou maintenir la structure. Une fois l’opération terminée, tu peux l’arrêter sans casser le serveur : les rôles, salons et permissions restent dans Discord.

## Commandes principales

- `/setup dry-run` : crée rôles, catégories, salons et permissions sans supprimer l’existant.
- `/audit` : compare le serveur réel avec la configuration attendue.
- `/sync dry-run force` : synchronise la structure, avec mode dry-run possible.
- `/sync-permissions dry-run` : réapplique uniquement les permissions.
- `/create-channel` : crée un salon texte, vocal ou forum.
- `/delete-channel channel confirm` : backup puis suppression si `confirm` vaut `DELETE_CHANNEL:<ID>`.
- `/create-role` : crée un rôle sans permission `Administrator`.
- `/delete-role role confirm` : backup puis suppression si `confirm` vaut `DELETE_ROLE:<ID>` ; les rôles configurés sont protégés.
- `/export-config` : exporte la structure actuelle dans `exports/server-config-*.json`.
- `/clear-server scope dry-run confirm` : supprime selon le scope `managed`, `all-channels` ou `all-project`, avec `dry-run:true` par défaut.
- `/rebuild-server dry-run confirm force-permissions clear-project-roles` : backup, clear de tous les salons, rebuild depuis les fichiers de config, puis synthèse/audit.

Avant `/setup`, `/sync`, `/sync-permissions`, `/clear-server` et `/rebuild-server` en mode réel, le bot crée automatiquement un backup dans `exports/`. Aucun backup n’est créé en `dry-run`.

Confirmations destructives :

- `/clear-server scope:managed dry-run:false confirm:DELETE_SERVER_STRUCTURE`
- `/clear-server scope:all-channels dry-run:false confirm:DELETE_ALL_CHANNELS`
- `/rebuild-server dry-run:false confirm:REBUILD_SERVER`

Pour un reset complet des salons avant reconstruction, utilise `/rebuild-server dry-run:false confirm:REBUILD_SERVER`. La commande supprime tous les salons détectés via l’API Discord, pas seulement ceux listés dans `channels.config.ts`, puis reconstruit depuis la configuration.

En mode réel, `/clear-server` et `/rebuild-server` envoient le rapport final en DM, car le salon où la commande a été lancée peut être supprimé pendant l’opération.

## Forums

Le bot tente de créer des salons forum pour `🎞️・clips`, `💡・suggestions` et `🎨・créatif`. Active **Community** dans Discord avant `/setup` si tu veux les forums et outils communautaires. Si la création d’un forum échoue, le bot crée un salon texte et log un avertissement.

## Parcours membre

Le nouveau membre voit seulement `👋・bienvenue`, `📜・règlement` et `🧭・guide`. La validation est prévue directement dans `📜・règlement`, via Sapphire. Une fois le rôle `✅・Membre` reçu, il débloque le serveur principal et peut accéder à `🎭・rôles`.

Voir [docs/USER_JOURNEY.md](docs/USER_JOURNEY.md).

## Bots externes

Configure manuellement les bots externes après le provisioning :

- Sapphire pour autorole, greetings, validation règlement et panels de rôles.
- Dyno pour automod léger, anti-spam, anti-mentions massives, anti-invitations externes et logs automod.
- Ticket Tool pour tickets et signalements.
- VoiceMaster ou TempVoice pour vocaux temporaires.
- Sesh ou Apollo pour events.
- Statbot pour stats.
- PatchBot pour patch notes.
- FreeStuff pour jeux gratuits.
- Starboard pour best-of.
- EasyPoll ou Pollmaster pour sondages.
- Jockie Music ou Kenku FM pour musique.
- Beemo, Double Counter ou Wick pour sécurité si besoin.

Voir [docs/SAPPHIRE_SETUP.md](docs/SAPPHIRE_SETUP.md) pour les panels Sapphire et [docs/EXTERNAL_BOTS_SETUP.md](docs/EXTERNAL_BOTS_SETUP.md) pour Dyno et les autres bots externes.

## Opérations

Le guide d’exploitation est dans [docs/OPERATIONS.md](docs/OPERATIONS.md). Il explique quand lancer le bot, quand utiliser `/setup`, `/sync`, `/sync-permissions`, comment créer un backup et comment revenir en arrière manuellement.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run deploy-commands
```

## Sécurité

- Ne hardcode jamais le token.
- Ne versionne jamais `.env`.
- Ne donne pas `Administrator` inutilement au bot custom ou aux bots externes.
- Utilise `/audit` après chaque gros changement manuel.
