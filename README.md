# 답답한 분위기 V2 — Provisioning Bot

Bot Discord en **Node.js + TypeScript + discord.js v14** pour provisionner et maintenir la structure du serveur privé **답답한 분위기 V2**.

Ce bot est volontairement limité : il crée, synchronise, audite, exporte et ajuste l’infrastructure du serveur. Il ne gère pas la vie quotidienne.

## Ce que le bot ne fait pas

- Pas de validation automatique des membres.
- Pas de message automatique à l’arrivée.
- Pas de `guildMemberAdd` ou `guildMemberRemove`.
- Pas de menus/boutons pour attribuer des rôles.
- Pas de tickets, musique, statistiques, events ou vocaux temporaires.
- Pas de `MessageContent`.
- Pas de `GuildMembers`.

Ces usages sont documentés dans [docs/BOTS.md](docs/BOTS.md) et doivent être confiés à des bots externes.

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

Les commandes sont déployées sur le serveur indiqué par `GUILD_ID`.

## Lancer en développement

```bash
npm run dev
```

## Commandes principales

- `/setup` : crée rôles, catégories, salons et permissions sans supprimer l’existant.
- `/audit` : compare le serveur réel avec la configuration attendue.
- `/sync dry-run force` : synchronise la structure, avec mode dry-run possible.
- `/sync-permissions dry-run` : réapplique uniquement les permissions.
- `/create-channel` : crée un salon texte, vocal ou forum.
- `/delete-channel channel confirm` : supprime seulement si `confirm` vaut `CONFIRM`.
- `/create-role` : crée un rôle sans permission `Administrator`.
- `/delete-role role confirm` : supprime seulement si `confirm` vaut `CONFIRM`.
- `/export-config` : exporte la structure actuelle dans `exports/server-config-YYYY-MM-DD.json`.
- `/embed-entry` : envoie les embeds statiques bienvenue, règlement et guide.
- `/embed-bot-plan` : envoie le plan des bots externes dans `⚙️・bot-config`.

## Forums

Le bot tente de créer des salons forum pour `🎞️・clips`, `💡・suggestions` et `🎨・créatif`. Active **Community** dans Discord avant `/setup` si tu veux les forums et outils communautaires. Si la création d’un forum échoue, le bot crée un salon texte et log un avertissement.

## Parcours membre

Le nouveau membre voit seulement `👋・bienvenue`, `📜・règlement` et `🧭・guide`. La validation est prévue directement dans `📜・règlement`, via Sapphire ou Carl-bot. Une fois le rôle `✅・Membre` reçu, il débloque le serveur principal et peut accéder à `🎭・rôles`.

Voir [docs/USER_JOURNEY.md](docs/USER_JOURNEY.md).

## Bots externes

Configure manuellement les bots externes après le provisioning :

- Sapphire ou Carl-bot pour validation, rôles, embeds et logs simples.
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

Voir [docs/BOTS.md](docs/BOTS.md).

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
