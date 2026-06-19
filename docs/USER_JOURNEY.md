# Parcours utilisateur

## Arrivée

Un nouveau membre rejoint **답답한 분위기 V2**.

Il voit seulement :

- `👋・bienvenue`
- `📜・règlement`
- `🧭・guide`

Il ne peut écrire nulle part tant qu’il n’est pas validé.

Sapphire gère l’autorole `🕯️・À valider`, le greeting dans `👋・bienvenue` et le DM de bienvenue optionnel.

## Validation

Le membre lit `📜・règlement`.

La validation est directement prévue dans ce salon, avec un bouton ou une réaction configuré par Sapphire. Le bot custom ne valide personne et n’attribue aucun rôle automatiquement.

Après validation, Sapphire donne le rôle `✅・Membre` et retire `🕯️・À valider`.

## Serveur principal

Avec `✅・Membre`, le membre débloque :

- `🎭・rôles`
- `◆・HUB`
- `➕・créer-un-vocal`
- `🔊・vocal-général`

Il peut choisir ses rôles avec Sapphire, participer dans `💬・général`, poster dans `📸・partage`, utiliser `🎫・support`, voter dans `📊・sondages` et rejoindre le vocal général.

Les univers restent cachés tant qu’il n’a pas choisi le rôle correspondant :

- `🎮・Gaming` pour `◇・GAMING` ;
- `🎌・Anime & Manga` pour `𖤐・ANIME & MANGA` ;
- `🍿・Films & Séries` pour `✧・FILMS & SÉRIES` ;
- `🎵・Musique` pour `♬・MUSIQUE` ;
- `🎨・Créatif` pour `✎・CRÉATIF` ;
- `💻・Tech` pour `⌘・TECH`.

Les salons de jeux spécifiques demandent aussi leur rôle exact. Par exemple, `🎯・valorant` demande `🎯・Valorant`, même si le membre possède déjà `🎮・Gaming`.

Dyno protège les salons membres après validation avec un automod léger. Les membres ne le voient pas comme une étape du parcours : il agit en arrière-plan contre spam, mentions massives, invitations externes et liens suspects si activés.

## Staff

Les tickets, signalements, logs automod, events, stats et vocaux temporaires sont gérés par les bots externes documentés dans `docs/EXTERNAL_BOTS_SETUP.md`.
