# Permissions

## Entrée

`@everyone` et `🕯️・À valider` voient seulement :

- `👋・bienvenue`
- `📜・règlement`
- `🧭・guide`

Ils ne peuvent pas écrire, créer de threads, réagir, créer des invitations ou mentionner everyone/here.

## Membres

`✅・Membre` voit :

- `🎭・rôles`
- LOUNGE
- GAMING
- CULTURE
- ACTIVITÉ
- BOTS
- VOCAUX

Il peut écrire dans les salons membres, réagir, envoyer images/liens et rejoindre les vocaux.

`⭐・Ancien` suit les mêmes permissions que `✅・Membre`, avec la possibilité de futurs salons privés.

## Staff

`🔧・Modérateur` voit STAFF, peut gérer les messages et timeout.

`🛡️・Admin` peut gérer salons et rôles, sans `Administrator` automatique.

`神 (Fondateur)` reçoit des overwrites complets sans permission `Administrator` automatique dans le code.

## Bots

`🤖・Bot` est un rôle commun d’identification. Il ne doit pas concentrer toutes les permissions.

Chaque bot externe reçoit `🤖・Bot` plus un rôle spécialisé :

- `🛠️・Bot Modération` : réservé à Carl-bot pour autorole, greetings, validation et reaction roles. Accès à `👋・bienvenue`, `📜・règlement`, `🎭・rôles`, `🧾・logs`, `⚙️・bot-config`. Peut envoyer messages, embeds, réactions et gérer les rôles nécessaires.
- `🛡️・Bot Automod` : réservé à Dyno pour automod. Accès à `🧾・logs`, `⚙️・bot-config` et lecture des salons membres si nécessaire. Peut utiliser View Channel, Send Messages, Embed Links, Read Message History, Manage Messages et Moderate Members si timeout utilisé. Pas de Manage Roles sauf besoin exceptionnel, pas d’Administrator, pas d’accès inutile à STAFF privé hors logs/config.
- `🎫・Bot Tickets` : `🎫・tickets`, `🚨・signalements`, `🧾・logs`. Peut gérer les salons nécessaires aux tickets.
- `🔊・Bot Vocal` : `➕・créer-un-vocal` et catégorie `🔊・VOCAUX`. Peut gérer les vocaux temporaires.
- `📅・Bot Events` : `📅・events`, `📌・annonces-potes`. Peut envoyer messages et embeds.
- `📊・Bot Stats` : `📊・stats`, `🧾・logs`. Peut envoyer messages et embeds.
- `📰・Bot News` : `📰・patch-notes`, `🎁・free-games`. Peut envoyer messages et embeds.
- `⭐・Bot Starboard` : lecture des salons membres nécessaires et écriture dans `⭐・best-of`.
- `🎵・Bot Music` : `🎵・musique-bot` et `🎧・music`. Peut se connecter et parler.

Les rôles bots spécialisés restent sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur`.

Ne mélange pas les responsabilités : Carl-bot garde `🛠️・Bot Modération` pour validation/rôles, Dyno utilise `🛡️・Bot Automod` pour l’automod. Dyno ne gère pas la validation et Carl-bot ne gère pas l’automod.

## Muted

`🔇・Muted` peut voir certains salons membres mais ne peut pas écrire, parler en vocal, créer de threads ou réagir.
