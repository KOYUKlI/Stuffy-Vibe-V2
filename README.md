# 답답한 분위기 V2 — Bot Discord privé

Bot Discord en **Node.js + TypeScript + discord.js** pour configurer automatiquement un serveur privé nommé **답답한 분위기 V2**.

Le projet crée une V2 propre, esthétique, sécurisée et maintenable : rôles, catégories, salons, permissions, embeds et panneau de rôles.

## Stack

- Node.js 20+
- TypeScript
- discord.js v14
- dotenv
- eslint
- prettier

## 1. Créer l’application Discord

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique sur **New Application**.
3. Donne-lui un nom clair, par exemple `Stuffy Vibe V2 Bot`.
4. Ouvre l’application créée.

## 2. Créer le bot

1. Dans l’application, ouvre l’onglet **Bot**.
2. Clique sur **Add Bot**.
3. Configure son nom et son avatar si besoin.
4. Ne donne pas la permission **Administrator** par défaut.

## 3. Récupérer le token

1. Onglet **Bot**.
2. Clique sur **Reset Token** si nécessaire.
3. Copie le token.
4. Garde-le privé : ne l’envoie jamais et ne le commit jamais.

## 4. Activer Server Members Intent

Le bot utilise `GatewayIntentBits.GuildMembers` pour envoyer le message de bienvenue avec `guildMemberAdd`.

Dans le Developer Portal :

1. Ouvre l’onglet **Bot**.
2. Active **Server Members Intent**.
3. Sauvegarde.

`Message Content Intent` n’est pas nécessaire.

## 5. Configurer `.env`

Copie le fichier d’exemple :

```bash
cp .env.example .env
```

Remplis ensuite :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_de_l_application
GUILD_ID=id_du_serveur_prive
```

> ⚠️ Ne versionne jamais `.env`. Il est ignoré par `.gitignore`.

## 6. Installer les dépendances

```bash
npm install
```

## 7. Lancer en développement

```bash
npm run dev
```

## 8. Déployer les commandes slash

Les commandes sont déployées uniquement sur le serveur défini par `GUILD_ID` pour faciliter le développement.

```bash
npm run deploy-commands
```

## 9. Utiliser `/setup`

Dans Discord, lance :

```text
/setup
```

La commande :

- renomme le serveur en `답답한 분위기 V2` ;
- crée les rôles manquants ;
- crée les catégories manquantes ;
- crée les salons manquants ;
- applique les permissions attendues ;
- reste idempotente : les éléments existants ne sont pas recréés.

Accès autorisé à `/setup` :

- propriétaire du serveur ;
- rôle `神 (Fondateur)` ;
- administrateurs.

Le rôle `神 (Fondateur)` est protégé : s’il existe déjà, le bot ne le modifie pas sans confirmation humaine.

## 10. Tester le message de bienvenue

```text
/welcome-test
```

Cette commande envoie le même embed que l’événement `guildMemberAdd` dans `👋・bienvenue` sans faire rejoindre un vrai membre.

## 11. Permissions minimales recommandées pour inviter le bot

Évite `Administrator`. Utilise plutôt les permissions nécessaires :

- Manage Roles
- Manage Channels
- Manage Messages
- Moderate Members
- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Application Commands

Le rôle du bot doit être placé au-dessus des rôles qu’il doit gérer, notamment `神 (Fondateur)` si tu veux que le bot puisse le positionner juste sous lui lors de la première création.

## 12. Commandes disponibles

- `/setup` : crée et synchronise la structure du serveur.
- `/audit` : liste rôles, catégories, salons et permissions critiques manquantes.
- `/embed-rules` : envoie l’embed du règlement dans `📜・règlement`.
- `/embed-welcome` : envoie un embed fixe de présentation dans `👋・bienvenue`.
- `/welcome-test` : teste le message automatique de bienvenue.
- `/embed-guide` : envoie le guide dans `🧭・guide`.
- `/embed-roles` : envoie le panneau de sélection de rôles dans `🎭・rôles`.
- `/lock` : verrouille le salon actuel pour les membres.
- `/unlock` : déverrouille le salon actuel pour les membres.
- `/clear amount` : supprime jusqu’à 100 messages.

## 13. Scripts npm

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run deploy-commands
```

## Sécurité

- Ne hardcode jamais le token Discord.
- Ne partage jamais le fichier `.env`.
- N’accorde pas `Administrator` au bot par défaut.
- Déploie les commandes uniquement sur ton serveur privé pendant le développement.
