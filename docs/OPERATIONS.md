# Opérations

Ce bot est un outil ponctuel. Le serveur Discord **답답한 분위기 V2** ne doit pas dépendre du bot custom au quotidien.

## Quand lancer le bot

Lance le bot seulement pour :

- premier provisioning du serveur ;
- audit de structure ;
- synchronisation de rôles, salons ou permissions ;
- création ou suppression manuelle d’un rôle ou salon ;
- export de configuration.

Tu peux arrêter le bot après l’opération. Discord conserve les rôles, salons et permissions.

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

## Comment faire un backup

Backup manuel :

```text
/export-config
```

Backups automatiques :

- `/setup dry-run:false`
- `/sync dry-run:false`
- `/sync-permissions dry-run:false`

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
- Gérer tickets, logs quotidiens, events, stats, musique ou vocaux temporaires.

Ces fonctions appartiennent aux bots externes documentés dans `docs/EXTERNAL_BOTS_SETUP.md`.
