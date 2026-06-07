# Bots externes recommandés

Le bot custom ne configure pas ces bots par code. Il prépare les salons, les permissions et la documentation pour les accueillir.

Ne donne pas `Administrator` inutilement. Préfère des permissions ciblées et place chaque rôle de bot seulement au niveau nécessaire.

## Attribution des rôles aux bots

Chaque bot externe reçoit toujours le rôle commun `🤖・Bot`, qui sert uniquement à identifier les bots. Ce rôle ne doit pas porter toutes les permissions.

Chaque bot reçoit aussi un rôle spécialisé, utilisé pour limiter ses accès aux salons nécessaires :

- Carl-bot/Sapphire : `🤖・Bot` + `🛠️・Bot Modération`
- Ticket Tool : `🤖・Bot` + `🎫・Bot Tickets`
- VoiceMaster/TempVoice : `🤖・Bot` + `🔊・Bot Vocal`
- Sesh/Apollo : `🤖・Bot` + `📅・Bot Events`
- Statbot : `🤖・Bot` + `📊・Bot Stats`
- PatchBot/FreeStuff : `🤖・Bot` + `📰・Bot News`
- Starboard : `🤖・Bot` + `⭐・Bot Starboard`
- Jockie Music/Kenku FM : `🤖・Bot` + `🎵・Bot Music`

Les rôles bots spécialisés restent sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur`. `🛠️・Bot Modération` peut être placé au-dessus de `✅・Membre`, `🕯️・À valider`, des rôles d’intérêt, des rôles notifications et des rôles couleurs pour permettre l’attribution de rôles par Carl-bot ou Sapphire.

## Sapphire ou Carl-bot

Usage :

- Validation dans `📜・règlement`.
- Attribution de `✅・Membre`.
- Rôles dans `🎭・rôles`.
- Embeds et logs simples.

Salons utiles :

- `📜・règlement`
- `🎭・rôles`
- `🧾・logs`
- `⚙️・bot-config`

Rôles à attribuer :

- `🤖・Bot`
- `🛠️・Bot Modération`

## Ticket Tool

Usage :

- Tickets.
- Signalements.
- Support staff.

Salons utiles :

- `🎫・tickets`
- `🚨・signalements`
- `🧾・logs`

Rôles à attribuer :

- `🤖・Bot`
- `🎫・Bot Tickets`

## VoiceMaster ou TempVoice

Usage :

- Vocaux temporaires.
- Création depuis `➕・créer-un-vocal`.

Salons utiles :

- `➕・créer-un-vocal`
- catégorie `🔊・VOCAUX`

Rôles à attribuer :

- `🤖・Bot`
- `🔊・Bot Vocal`

## Sesh ou Apollo

Usage :

- Events.
- Game nights.
- Watch parties.

Salons utiles :

- `📅・events`
- `📌・annonces-potes`

Rôles à attribuer :

- `🤖・Bot`

Il n’y a pas de rôle spécialisé dédié aux sondages dans la configuration actuelle. Donne seulement `🤖・Bot`, puis limite Pollmaster/EasyPoll au salon `📊・sondages` avec des permissions de salon ciblées.

## Statbot

Usage :

- Statistiques d’activité.
- Comptes et dashboards.

Salons utiles :

- `📊・stats`
- `🧾・logs`

Rôles à attribuer :

- `🤖・Bot`
- `📊・Bot Stats`

## PatchBot

Usage :

- Patch notes de jeux.

Salons utiles :

- `📰・patch-notes`

Rôles à attribuer :

- `🤖・Bot`
- `📰・Bot News`

## FreeStuff

Usage :

- Jeux gratuits.

Salons utiles :

- `🎁・free-games`

Rôles à attribuer :

- `🤖・Bot`
- `📰・Bot News`

## Starboard

Usage :

- Best-of des messages.

Salons utiles :

- `⭐・best-of`

Rôles à attribuer :

- `🤖・Bot`
- `⭐・Bot Starboard`

## EasyPoll ou Pollmaster

Usage :

- Sondages avancés.

Salons utiles :

- `📊・sondages`

Rôles à attribuer :

- `🤖・Bot`

Il n’y a pas de rôle spécialisé dédié aux sondages dans la configuration actuelle. Donne seulement `🤖・Bot`, puis limite Pollmaster/EasyPoll au salon `📊・sondages` avec des permissions de salon ciblées.

## Jockie Music ou Kenku FM

Usage :

- Musique.

Salons utiles :

- `🎵・musique-bot`
- `🎧・music`

Rôles à attribuer :

- `🤖・Bot`
- `🎵・Bot Music`

## Beemo, Double Counter ou Wick

Usage :

- Sécurité anti-raid si les invitations deviennent plus ouvertes.
- Détection d’alts ou de comportements suspects.

Salons utiles :

- `🧾・logs`
- `⚙️・bot-config`
