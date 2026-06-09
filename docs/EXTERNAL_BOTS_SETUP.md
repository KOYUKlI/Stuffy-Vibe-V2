# Configuration manuelle des bots externes

Guide de configuration pour les bots externes du serveur **답답한 분위기 V2**.

Le bot custom du projet reste un provisioning bot : il prépare la structure, les salons et les permissions. Les fonctionnalités quotidiennes sont confiées aux bots ci-dessous.

## Règles générales

- Ne donne pas `Administrator` inutilement.
- Place les rôles des bots seulement au niveau nécessaire.
- Ne place jamais un bot externe au-dessus de `神 (Fondateur)`.
- Donne toujours `🤖・Bot` comme rôle commun d’identification.
- Ajoute ensuite le rôle spécialisé adapté au bot.
- Donne à chaque bot accès uniquement aux salons dont il a besoin.
- Teste chaque bot immédiatement après configuration.
- Lance `/audit` avec le provisioning bot après les gros changements.

## Ordre d’installation recommandé

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

## Permissions minimales communes

Selon le bot, commence par :

- View Channels
- Send Messages
- Embed Links
- Attach Files si le bot envoie des images
- Read Message History
- Add Reactions si le bot utilise des réactions
- Use External Emojis si nécessaire
- Manage Messages seulement pour Dyno, logs, starboard ou modération légère
- Manage Roles seulement pour Carl-bot quand il attribue des rôles
- Move Members et Manage Channels seulement pour VoiceMaster/TempVoice

Évite `Administrator`. Si un bot demande trop de permissions, limite-le avec les permissions de salon.

## 1. Carl-bot

Objectif :

- Autorole `🕯️・À valider`.
- Greetings dans `👋・bienvenue`.
- DM de bienvenue optionnel.
- Validation du règlement.
- Attribution du rôle `✅・Membre`.
- Retrait du rôle `🕯️・À valider`.
- Sélection de rôles dans `🎭・rôles`.

Carl-bot ne gère pas l’automod, les tickets, les vocaux temporaires, les events, les stats ou la musique.

Rôles à attribuer :

- `🤖・Bot`
- `🛠️・Bot Modération`

Salons :

- Greetings : `👋・bienvenue`
- Règlement : `📜・règlement`
- Rôles : `🎭・rôles`
- Logs nécessaires : `🧾・logs`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions ou Use Buttons selon le système choisi
- Manage Roles
- Manage Messages si le bot nettoie certains messages

Placement du rôle :

- Le rôle du bot doit être au-dessus de `✅・Membre`, `🕯️・À valider`, rôles d’intérêt, rôles notifications et rôles couleurs.
- Il ne doit pas être au-dessus de `神 (Fondateur)`, `🛡️・Admin` ou `🔧・Modérateur` sauf besoin explicite.

Configuration validation :

1. Dans `📜・règlement`, crée un embed de validation.
2. Ajoute un bouton ou une réaction de validation.
3. Action à appliquer :
   - Ajouter `✅・Membre`
   - Retirer `🕯️・À valider`
4. Vérifie que `🎭・rôles` devient visible après validation.

Configuration rôles :

1. Dans `🎭・rôles`, crée un panneau de rôles.
2. Ajoute les centres d’intérêt.
3. Ajoute les notifications.
4. Ajoute les couleurs.
5. Configure les couleurs en mode rôle unique si le bot le permet.

Checklist de test :

- Un nouveau membre reçoit `🕯️・À valider`.
- Le greeting apparaît dans `👋・bienvenue`.
- Un membre non validé voit seulement `👋・bienvenue`, `📜・règlement`, `🧭・guide`.
- Le bouton/réaction de validation ajoute `✅・Membre`.
- Le bouton/réaction retire `🕯️・À valider`.
- `🎭・rôles` devient visible après validation.
- Les rôles sélectionnés dans `🎭・rôles` s’ajoutent et se retirent correctement.
- Carl-bot ne gère pas l’automod.

## 2. Dyno

Objectif :

- automod spécialisé ;
- anti-spam ;
- anti-mentions massives ;
- anti-invites Discord externes ;
- anti-liens suspects si besoin ;
- logs automod.

Dyno ne doit pas gérer les rôles de validation ni les reaction roles.

Rôles :

- `🤖・Bot`
- `🛡️・Bot Automod`

Le rôle `🛡️・Bot Automod` est prévu dans `src/config/roles.config.ts` et peut être créé via `/setup` ou `/sync`.

Salons :

- Logs : `🧾・logs`
- Config staff : `⚙️・bot-config`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Messages
- Moderate Members si timeout automatique utilisé
- Mention Roles seulement si nécessaire
- Pas Administrator

Réglages recommandés :

- anti-spam léger ;
- anti-mentions massives ;
- anti-invites Discord externes ;
- anti-liens suspects optionnel ;
- pas de ban automatique agressif ;
- pas de filtre insultes trop strict au début ;
- logs automod dans `🧾・logs`.

Checklist de test :

- Un spam test est supprimé ou loggé.
- Une invitation Discord externe est bloquée si activée.
- Les logs arrivent dans `🧾・logs`.
- Dyno ne peut pas écrire partout.
- Dyno n’a pas Administrator.
- Dyno ne gère pas les rôles de validation.

## 3. Ticket Tool

Objectif :

- Tickets.
- Signalements.

Rôles à attribuer :

- `🤖・Bot`
- `🎫・Bot Tickets`

Salons :

- Panel : `🎫・support`
- Signalements : `🚨・signalements`
- Logs tickets : `🎫・tickets-logs`
- Logs généraux : `🧾・logs`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels
- Manage Messages
- Attach Files si les utilisateurs doivent envoyer des preuves

Configuration :

1. Crée un panel de ticket dans `🎫・support`.
2. Configure une catégorie ou un espace de tickets privés.
3. Donne accès aux tickets au staff uniquement.
4. Configure les logs de création, fermeture et suppression dans `🧾・logs`.
5. Configure un type de ticket pour les signalements si utile.

Checklist de test :

- Un membre peut ouvrir un ticket.
- Le ticket est visible par le membre concerné et le staff.
- Les autres membres ne voient pas le ticket.
- Le staff peut fermer le ticket.
- Les logs apparaissent dans `🧾・logs`.
- Le panel reste lisible dans `🎫・support`.

## 4. VoiceMaster ou TempVoice

Objectif :

- Vocaux temporaires.

Rôles à attribuer :

- `🤖・Bot`
- `🔊・Bot Vocal`

Salons :

- Déclencheur : `➕・créer-un-vocal`
- Catégorie : `✹・VOCAUX`

Permissions attendues :

- View Channels
- Connect
- Speak
- Move Members
- Manage Channels
- Manage Permissions pour les salons temporaires

Configuration :

1. Défini `➕・créer-un-vocal` comme salon déclencheur.
2. Configure la création des vocaux temporaires dans `✹・VOCAUX`.
3. Donne au créateur du vocal les droits de base sur son salon temporaire si souhaité.
4. Configure la suppression automatique quand le salon est vide.

Checklist de test :

- Rejoindre `➕・créer-un-vocal` crée un vocal temporaire.
- Le membre est déplacé dans le nouveau vocal.
- Le vocal temporaire disparaît quand il est vide.
- Le bot ne modifie pas les vocaux permanents.
- Les permissions vocales restent propres pour `✅・Membre`.

## 5. Sesh ou Apollo

Objectif :

- Events.
- Game nights.
- Watch parties.

Rôles à attribuer :

- `🤖・Bot`
- `📅・Bot Events`

Salons et rôles :

- Annonces : `📌・annonces`
- Watch parties : `🎬・watch-party` et `🎬・watch-party-anime`
- Rôles notifications : `🎮・Game Night`, `🎬・Watch Party`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Add Reactions ou interactions
- Read Message History
- Mention Roles pour les rôles notifications ciblés

Configuration :

1. Configure `📌・annonces` pour les annonces importantes si besoin.
2. Utilise `🎬・watch-party` et `🎬・watch-party-anime` pour les sessions dédiées.
3. Autorise uniquement les mentions des rôles `🎮・Game Night` et `🎬・Watch Party`.
4. Crée un event test.

Checklist de test :

- Un event ou une annonce s’affiche dans le salon prévu.
- Les membres peuvent s’inscrire.
- Les rappels fonctionnent.
- Les rôles `🎮・Game Night` ou `🎬・Watch Party` sont mentionnés correctement.
- Le bot ne mentionne pas `@everyone` inutilement.

## 6. PatchBot

Objectif :

- Patch notes.

Rôles à attribuer :

- `🤖・Bot`
- `📰・Bot News`

Salons et rôles :

- Salon : `📰・patch-notes`
- Rôle notification : `📰・Patch Notes`
- Jeux recommandés : Valorant, Minecraft, jeux utilisés par le serveur.

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Mention Roles pour `📰・Patch Notes`

Configuration :

1. Configure `📰・patch-notes` comme salon de publication.
2. Ajoute Valorant.
3. Ajoute Minecraft si pertinent.
4. Ajoute les jeux réellement joués par le serveur.
5. Configure la mention du rôle `📰・Patch Notes` si souhaité.

Checklist de test :

- Un patch note test arrive dans `📰・patch-notes`.
- Le format est lisible.
- Le rôle `📰・Patch Notes` est mentionné seulement quand nécessaire.
- Le bot ne publie pas dans `💬・général`.

## 7. FreeStuff

Objectif :

- Jeux gratuits.

Rôles à attribuer :

- `🤖・Bot`
- `📰・Bot News`

Salons et rôles :

- Salon : `🎁・free-games`
- Rôle notification : `🎁・Free Games`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Mention Roles pour `🎁・Free Games`

Configuration :

1. Configure `🎁・free-games` comme salon de publication.
2. Filtre les plateformes si possible.
3. Configure la mention `🎁・Free Games`.
4. Évite les notifications trop fréquentes si le bot le permet.

Checklist de test :

- Une annonce test arrive dans `🎁・free-games`.
- Le rôle `🎁・Free Games` est mentionné correctement.
- Les liens sont visibles.
- Le bot ne spam pas les autres salons.

## 8. Starboard

Objectif :

- Best-of des messages.

Rôles à attribuer :

- `🤖・Bot`
- `⭐・Bot Starboard`

Salon :

- Aucun salon Starboard dédié n’est créé par défaut. Ajoute un salon `⭐・best-of` plus tard si le serveur en a vraiment besoin.

Réglages recommandés :

- Seuil : 2 ou 3 étoiles.
- Ignorer STAFF, logs et tickets.
- Ignorer `▣・STAFF`, `🧾・logs`, `🎫・tickets-logs`, `🚨・signalements`, `📦・archives-staff`.

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions
- Manage Messages si le bot doit nettoyer ou mettre à jour ses posts

Configuration :

1. Crée puis configure `⭐・best-of` comme salon Starboard si tu l’ajoutes.
2. Défini le seuil à 2 ou 3.
3. Exclue les salons staff, logs et tickets.
4. Empêche l’auto-star si le bot le permet.

Checklist de test :

- Un message avec assez d’étoiles apparaît dans le salon Starboard choisi.
- Les messages staff ne peuvent pas apparaître.
- Les tickets ne peuvent pas apparaître.
- Le bot met à jour le post si le nombre d’étoiles change.

## 9. Statbot

À installer après quelques jours, quand l’activité du serveur commence à produire des données utiles.

Objectif :

- Statistiques d’activité.

Rôles à attribuer :

- `🤖・Bot`
- `📊・Bot Stats`

Salons :

- Aucun salon stats dédié n’est créé par défaut.
- Logs : `🧾・logs`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- View Server Insights si nécessaire

Configuration :

1. Crée un salon stats dédié si tu veux afficher des statistiques publiquement.
2. Configure les logs techniques dans `🧾・logs` si disponible.
3. Limite les statistiques visibles aux données utiles.
4. Évite d’exposer des stats sensibles si inutile.

Checklist de test :

- Les stats apparaissent dans le salon choisi.
- Les stats ne révèlent pas d’informations sensibles.
- Le bot n’écrit pas dans les salons publics non prévus.
- Les logs restent dans `🧾・logs`.

## 10. EasyPoll ou Pollmaster

Objectif :

- Sondages avancés.

Rôles à attribuer :

- `🤖・Bot`

Il n’y a pas de rôle spécialisé dédié aux sondages dans cette configuration. Limite EasyPoll/Pollmaster au salon `📊・sondages` avec les permissions de salon.

Salons et rôles :

- Salon : `📊・sondages`
- Rôle notification : `📊・Sondages`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Add Reactions ou interactions
- Read Message History
- Mention Roles pour `📊・Sondages`

Configuration :

1. Configure `📊・sondages` comme salon principal.
2. Autorise les sondages simples pour le staff.
3. Autorise éventuellement les suggestions de sondages côté membres.
4. Configure la mention `📊・Sondages` seulement pour les sondages importants.

Checklist de test :

- Un sondage test est créé dans `📊・sondages`.
- Les votes fonctionnent.
- Le résultat est visible.
- La mention `📊・Sondages` n’est pas abusive.

## 11. Jockie Music ou Kenku FM

Objectif :

- Musique.

Rôles à attribuer :

- `🤖・Bot`
- `🎵・Bot Music`

Salons :

- Texte : `🎵・musique-bot`
- Vocal : `🎧・music`

Permissions minimales :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Connect
- Speak
- Use Voice Activity

Configuration :

1. Configure `🎵・musique-bot` pour les commandes.
2. Configure `🎧・music` comme vocal principal.
3. Limite les commandes musique au salon texte prévu.
4. Configure le volume et les permissions de file d’attente si le bot le permet.

Checklist de test :

- Le bot rejoint `🎧・music`.
- Une musique test se lance.
- Les commandes fonctionnent dans `🎵・musique-bot`.
- Les commandes ne polluent pas les autres salons.
- Le bot quitte correctement le vocal.

## Erreurs fréquentes

- Le rôle du bot est trop bas et ne peut pas attribuer `✅・Membre`.
- `Administrator` est donné par facilité alors que des permissions ciblées suffisent.
- Le bot peut écrire dans trop de salons.
- Les logs sont envoyés dans un salon public.
- Carl-bot gère l’automod alors que Dyno doit le faire.
- Dyno gère les rôles de validation alors que Carl-bot doit le faire.
- Les tickets sont visibles par tout le monde.
- Le Starboard inclut des salons staff.
- Les rôles notifications sont mentionnés trop souvent.
- Les salons forum ne fonctionnent pas car Community n’est pas activé.

## Test final global

Après avoir configuré tous les bots :

1. Crée un compte ou rôle de test non validé.
2. Vérifie qu’il ne voit que `👋・bienvenue`, `📜・règlement`, `🧭・guide`.
3. Valide-le via Carl-bot.
4. Vérifie qu’il reçoit `✅・Membre` et perd `🕯️・À valider`.
5. Vérifie l’accès à `🎭・rôles`, `◆・HUB`, `✹・VOCAUX`, puis aux univers selon les rôles choisis.
6. Ouvre un ticket test.
7. Crée un vocal temporaire test.
8. Crée un event test.
9. Publie un sondage test.
10. Vérifie que les logs restent dans `🧾・logs`.
