# Bots externes recommandés

Le bot custom ne configure pas ces bots par code. Il prépare la structure du serveur, puis peut être arrêté.

Ne donne pas `Administrator` inutilement. Préfère des permissions ciblées et place chaque rôle de bot seulement au niveau nécessaire.

## Ordre recommandé

1. Carl-bot
2. Dyno
3. Ticket Tool
4. VoiceMaster
5. Sesh
6. PatchBot
7. FreeStuff
8. Starboard dédié seulement si nécessaire
9. Statbot après quelques jours
10. EasyPoll après quelques jours
11. Kenku FM ou Jockie Music, choisir un seul
12. Beemo seulement si besoin sécurité
13. Wick seulement si besoin anti-nuke/anti-raid lourd
14. Double Counter seulement si problème d’alts/VPN

## Attribution des rôles aux bots

Chaque bot externe reçoit toujours `🤖・Bot`, qui sert uniquement à identifier les bots.

Chaque bot reçoit aussi un rôle spécialisé quand il existe :

- Carl-bot : `🤖・Bot` + `🛠️・Bot Modération`
- Dyno : `🤖・Bot` + `🛡️・Bot Automod`
- Ticket Tool : `🤖・Bot` + `🎫・Bot Tickets`
- VoiceMaster/TempVoice : `🤖・Bot` + `🔊・Bot Vocal`
- Sesh/Apollo : `🤖・Bot` + `📅・Bot Events`
- Statbot : `🤖・Bot` + `📊・Bot Stats`
- PatchBot/FreeStuff : `🤖・Bot` + `📰・Bot News`
- Starboard : `🤖・Bot` + `⭐・Bot Starboard`
- Kenku FM/Jockie Music : `🤖・Bot` + `🎵・Bot Music`

Le rôle `🛡️・Bot Automod` n’existe pas encore dans la configuration TypeScript actuelle. Ajoute-le à `src/config/roles.config.ts` lors d’une prochaine évolution, puis lance `/sync` pour le créer.

Les rôles bots spécialisés restent sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur`.

## Carl-bot

Usage limité :

- autorole `🕯️・À valider` ;
- greetings dans `👋・bienvenue` ;
- DM de bienvenue optionnel ;
- validation dans `📜・règlement` ;
- reaction roles dans `🎭・rôles`.

Carl-bot ne gère pas l’automod, les tickets, les vocaux temporaires, les events, les stats ou la musique.

Salons utiles :

- `👋・bienvenue`
- `📜・règlement`
- `🎭・rôles`
- `🧾・logs` pour logs nécessaires uniquement
- `⚙️・bot-config`

## Dyno

Usage :

- automod spécialisé ;
- anti-spam ;
- anti-mentions massives ;
- anti-invitations Discord externes ;
- anti-liens suspects si nécessaire ;
- logs automod dans `🧾・logs` ;
- modération légère si besoin.

Dyno ne doit pas gérer les rôles de validation ni les reaction roles.

Salons utiles :

- `🧾・logs`
- `⚙️・bot-config`

## Ticket Tool

Usage :

- tickets ;
- signalements ;
- support staff.

Salons utiles :

- `🎫・tickets`
- `🚨・signalements`
- `🧾・logs`

## VoiceMaster

Usage :

- vocaux temporaires ;
- création depuis `➕・créer-un-vocal`.

Salons utiles :

- `➕・créer-un-vocal`
- catégorie `🔊・VOCAUX`

## Sesh

Usage :

- events ;
- game nights ;
- watch parties.

Salons utiles :

- `📅・events`
- `📌・annonces-potes`

## PatchBot

Usage :

- patch notes de jeux.

Salons utiles :

- `📰・patch-notes`

## FreeStuff

Usage :

- jeux gratuits.

Salons utiles :

- `🎁・free-games`

## Starboard

À installer seulement si le serveur utilise vraiment le best-of.

Usage :

- best-of des messages.

Salons utiles :

- `⭐・best-of`

## Statbot

À installer après quelques jours, quand il y a assez d’activité pour que les stats aient du sens.

Salons utiles :

- `📊・stats`
- `🧾・logs`

## EasyPoll

À installer après quelques jours si les sondages natifs Discord ne suffisent pas.

Salons utiles :

- `📊・sondages`

## Kenku FM ou Jockie Music

Choisis un seul bot musique.

Salons utiles :

- `🎵・musique-bot`
- `🎧・music`

## Beemo, Wick et Double Counter

Beemo :

- option sécurité anti-raid uniquement si les invitations deviennent plus ouvertes ;
- pas à installer au lancement.

Wick :

- option sécurité lourde anti-raid / anti-nuke ;
- à éviter au lancement ;
- seulement si le serveur devient plus ouvert ou exposé.

Double Counter :

- seulement si tu observes un problème d’alts, VPN ou contournement de bans.
