# Permissions

## Entrée

`@everyone` et `🕯️・À valider` voient seulement :

- `👋・bienvenue`
- `📜・règlement`
- `🧭・guide`

Ils ne peuvent pas écrire, créer de threads, réagir, créer des invitations, parler en vocal ou mentionner everyone/here.

`🚪・départs` et `🎭・rôles` sont visibles seulement après validation.

## Membre Validé

`✅・Membre` débloque uniquement :

- `✦・ENTRÉE` complète ;
- `◆・HUB` ;
- `✹・VOCAUX` avec `➕・créer-un-vocal` et `🔊・vocal-général`.

Un membre validé ne voit pas automatiquement les univers spécialisés. Il doit recevoir ou choisir le rôle adapté.

## Déblocage Par Rôle

- `🎮・Gaming` : accès aux salons généraux de `◇・GAMING`.
- Rôles jeux : chaque salon jeu spécifique demande son rôle exact, par exemple `🎯・valorant` demande `🎯・Valorant`.
- `🎌・Anime & Manga` : accès à `𖤐・ANIME & MANGA`.
- `🍿・Films & Séries` : accès à `✧・FILMS & SÉRIES`.
- `🎵・Musique` : accès à `♬・MUSIQUE` et au vocal `🎧・music`.
- `🎨・Créatif` : accès à `✎・CRÉATIF`.
- `💻・Tech` : accès à `⌘・TECH`.
- `⭐・Ancien` : accès à `☾・ANCIENS`.
- `💎・Cercle privé` : accès à `✦・CERCLE PRIVÉ` et aussi à `☾・ANCIENS`.

## Staff

`🔧・Modérateur` voit `▣・STAFF`, peut gérer les messages et timeout selon ses permissions.

`🛡️・Admin` peut gérer salons et rôles sous son niveau, sans `Administrator` automatique.

`神 (Fondateur)` reçoit les overwrites complets sans permission `Administrator` automatique dans le code.

`✦・CERCLE PRIVÉ` est limité à `💎・Cercle privé` et `神 (Fondateur)` ; les modérateurs n’y ont pas un accès automatique.

## Bots

`🤖・Bot` est un rôle commun d’identification. Il ne doit pas concentrer toutes les permissions.

Chaque bot externe reçoit `🤖・Bot` plus un rôle spécialisé :

- `🛠️・Bot Modération` : Carl-bot pour autorole, greetings, validation et reaction roles.
- `🛡️・Bot Automod` : Dyno pour automod, logs automod et modération légère.
- `🎫・Bot Tickets` : Ticket Tool pour `🎫・support`, `🎫・tickets-logs` et `🚨・signalements`.
- `🔊・Bot Vocal` : VoiceMaster/TempVoice pour `➕・créer-un-vocal` et les vocaux temporaires.
- `📅・Bot Events` : Sesh/Apollo pour annonces et watch parties.
- `📊・Bot Stats` : Statbot si ajouté plus tard.
- `📰・Bot News` : PatchBot/FreeStuff pour `📰・patch-notes` et `🎁・free-games`.
- `⭐・Bot Starboard` : lecture des salons membres nécessaires si Starboard est installé.
- `🎵・Bot Music` : `🎵・musique-bot` et `🎧・music`.

Les rôles bots spécialisés restent sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur`.

## Muted

`🔇・Muted` bloque :

- Send Messages ;
- Create Public Threads ;
- Create Private Threads ;
- Send Messages In Threads ;
- Add Reactions ;
- Create Invite ;
- Mention Everyone ;
- Speak.

Ces dénis restent appliqués même si le membre possède un rôle d’univers ou de jeu.
