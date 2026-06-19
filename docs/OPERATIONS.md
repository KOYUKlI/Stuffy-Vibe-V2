# Opérations

Ce bot est un outil ponctuel. Le serveur Discord **답답한 분위기 V2** ne doit pas dépendre du bot custom au quotidien.

## Quand lancer le bot

Lance le bot seulement pour :

- premier provisioning du serveur ;
- audit de structure ;
- synchronisation de rôles, salons ou permissions ;
- création ou suppression manuelle d’un rôle ou salon ;
- clear/rebuild des salons ou de la structure projet ;
- export de configuration.

Tu peux arrêter le bot après l’opération. Discord conserve les rôles, salons et permissions.

## Bots quotidiens

Le bot custom ne gère pas l’automod, les greetings, la validation, les reaction roles, les tickets, les events, les stats ou la musique.

Ces éléments sont configurés manuellement :

- Sapphire : autorole, greetings, validation règlement et panels de rôles.
- Dyno : automod spécialisé, anti-spam, anti-mentions massives, anti-invitations externes, logs automod.

Le bot custom peut être arrêté après provisioning. Sapphire et Dyno restent les bots opérationnels pour leurs périmètres respectifs.

## Quand utiliser `/setup`

Utilise `/setup` :

- lors de la première installation ;
- après une refonte complète de la configuration ;
- si beaucoup d’éléments attendus manquent.

Commence toujours par :

```text
/setup dry-run:true
```

Si le résultat est correct :

```text
/setup dry-run:false
```

Avant le mode réel, le bot crée automatiquement un backup dans `exports/`.

## Quand utiliser `/sync`

Utilise `/sync` quand tu as modifié :

- `src/config/roles.config.ts`
- `src/config/channels.config.ts`
- `src/config/permissions.config.ts`

Commande recommandée :

```text
/sync dry-run:true force:false
```

Puis :

```text
/sync dry-run:false force:false
```

Utilise `force:true` si tu veux réappliquer explicitement toutes les permissions attendues.

## Quand utiliser `/sync-permissions`

Utilise `/sync-permissions` quand seuls les overwrites Discord doivent être corrigés.

```text
/sync-permissions dry-run:true
/sync-permissions dry-run:false
```

Le mode réel crée automatiquement un backup dans `exports/`.

## Quand utiliser `/clear-server`

Utilise `/clear-server` uniquement si tu veux retirer proprement des salons ou la structure projet.

Scopes disponibles :

- `managed` : supprime uniquement les salons définis dans `channels.config.ts`.
- `all-channels` : supprime tous les salons détectés sur Discord, même hors configuration.
- `all-project` : supprime tous les salons et les rôles projet supprimables.

Commence par :

```text
/clear-server scope:all-channels dry-run:true
```

Le mode réel demande une confirmation exacte :

```text
/clear-server scope:all-channels dry-run:false confirm:DELETE_ALL_CHANNELS
```

Pour supprimer les rôles projet en plus des salons, utilise `scope:all-project` avec `confirm:DELETE_SERVER_STRUCTURE`. La commande conserve les éléments dangereux ou non supprimables : `@everyone`, le rôle du bot, les rôles gérés par Discord, les rôles plus hauts ou égaux au bot et `神 (Fondateur)`.

## Quand utiliser `/rebuild-server`

Utilise `/rebuild-server` pour repartir proprement depuis les fichiers de configuration actuels. La commande nettoie tous les salons existants avec un scope équivalent à `all-channels`, puis reconstruit depuis `roles.config.ts`, `channels.config.ts` et `permissions.config.ts`.

Dry-run :

```text
/rebuild-server dry-run:true
```

Mode réel :

```text
/rebuild-server dry-run:false confirm:REBUILD_SERVER force-permissions:true
```

La commande crée un backup, supprime tous les salons détectés via un fetch complet Discord, relance la synchronisation depuis `roles.config.ts`, `channels.config.ts` et `permissions.config.ts`, puis produit une synthèse. Si des salons restent après suppression, le rapport les liste avec leur ID, leur type et la raison.

En mode réel, le rapport final est envoyé en DM à l’utilisateur qui lance la commande. C’est normal : le salon de commande peut être supprimé avant que Discord permette de modifier la réponse éphémère.

## Comment faire un backup

Backup manuel :

```text
/export-config
```

Backups automatiques :

- `/setup dry-run:false`
- `/sync dry-run:false`
- `/sync-permissions dry-run:false`
- `/clear-server dry-run:false`
- `/rebuild-server dry-run:false`

Les fichiers sont écrits dans `exports/`.

## Comment revenir en arrière manuellement

Le bot ne restaure pas automatiquement un backup. Pour revenir en arrière :

1. Ouvre le fichier JSON dans `exports/`.
2. Compare les rôles, salons et overwrites avec l’état actuel du serveur.
3. Recrée ou renomme les salons manuellement dans Discord si nécessaire.
4. Restaure les rôles manuellement si nécessaire.
5. Réapplique les permissions depuis Discord ou ajuste les fichiers `src/config/*`.
6. Lance `/audit`.
7. Lance `/sync-permissions dry-run:true` pour vérifier l’impact avant correction.

## Ce que le bot ne doit jamais faire

- Écouter `guildMemberAdd` ou `guildMemberRemove`.
- Valider les membres.
- Gérer des boutons ou menus de rôles.
- Publier des messages permanents.
- Gérer automod, tickets, logs quotidiens, events, stats, musique ou vocaux temporaires.

Ces fonctions appartiennent aux bots externes documentés dans `docs/EXTERNAL_BOTS_SETUP.md`.
