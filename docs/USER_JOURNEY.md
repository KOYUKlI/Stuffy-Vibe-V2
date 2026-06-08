# Parcours utilisateur

## Arrivée

Un nouveau membre rejoint **답답한 분위기 V2**.

Il voit seulement :

- `👋・bienvenue`
- `📜・règlement`
- `🧭・guide`

Il ne peut écrire nulle part tant qu’il n’est pas validé.

Carl-bot gère l’autorole `🕯️・À valider`, le greeting dans `👋・bienvenue` et le DM de bienvenue optionnel.

## Validation

Le membre lit `📜・règlement`.

La validation est directement prévue dans ce salon, avec un bouton ou une réaction configuré par Carl-bot. Le bot custom ne valide personne et n’attribue aucun rôle automatiquement.

Après validation, Carl-bot donne le rôle `✅・Membre` et retire `🕯️・À valider`.

## Serveur principal

Avec `✅・Membre`, le membre débloque :

- `🎭・rôles`
- LOUNGE
- GAMING
- CULTURE
- ACTIVITÉ
- BOTS
- VOCAUX

Il peut choisir ses rôles avec Carl-bot, participer dans `💬・général`, chercher des joueurs dans `🔎・lfg`, rejoindre les events, poster clips et suggestions, et rejoindre les vocaux.

Dyno protège les salons membres après validation avec un automod léger. Les membres ne le voient pas comme une étape du parcours : il agit en arrière-plan contre spam, mentions massives, invitations externes et liens suspects si activés.

## Staff

Les tickets, signalements, logs automod, events, stats et vocaux temporaires sont gérés par les bots externes documentés dans `docs/BOTS.md`.
