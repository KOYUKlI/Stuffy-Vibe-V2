# Audit Discord — 답답한 분위기 V2

Audit réalisé le 19 juin 2026.

Périmètre vérifié : configuration TypeScript actuelle, services de provisioning, commandes de maintenance, documentation et dernier export local disponible (`exports/backup-before-sync-2026-06-09T08-47-38-690Z.json`).

Le backup date du 9 juin 2026 : il prouve l’état observé à cette date, pas nécessairement l’état live actuel. Aucune commande Discord, aucun dry-run Discord et aucune mutation du serveur n’ont été exécutés pendant cet audit.

## Résumé

Statut global : **CRITIQUE — corrections requises avant toute synchronisation réelle**

- Nombre de problèmes critiques : **7**
- Nombre de problèmes importants : **15**
- Nombre d’améliorations optionnelles : **5**
- Build TypeScript local : **OK** (`node .\node_modules\typescript\bin\tsc -p tsconfig.json`)
- `npm run build` : non exécuté correctement dans cette session, car le lanceur global `npm` pointe vers un `npm-cli.js` absent. Le compilateur local passe sans erreur.
- Configuration : **48 rôles, 12 catégories, 62 salons**.
- Architecture cible : **48 rôles, 12 catégories, 60 salons**.
- Dernier backup : **53 rôles et 74 canaux Discord** (12 catégories + 62 salons), sans rôle/catégorie/salon configuré manquant.

## Problèmes critiques

| Zone                         | Problème                                                                                                                                                                                                                       | Impact                                                                                                                | Correction recommandée                                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permissions réelles des bots | Le backup montre `Administrator` sur le bot custom, Sapphire, Atlas et ProBot.                                                                                                                                                 | Compromission potentielle complète du serveur ; violation directe du principe du moindre privilège.                   | Retirer manuellement `Administrator`, puis attribuer uniquement les permissions ciblées nécessaires.                                                                                                                      |
| Sapphire                     | Dans le backup, Sapphire est positionné sous `✅・Membre` et `🕯️・À valider`, tout en ayant `Administrator`.                                                                                                                   | Sans Administrator, Sapphire ne pourrait pas attribuer ces rôles ; avec Administrator, il est sur-privilégié.         | Placer le vrai rôle Sapphire sous le staff, au-dessus de tous les rôles attribuables, puis retirer Administrator.                                                                                                         |
| Hiérarchie automatique       | `RoleService` ne connaît pas les vrais rôles des bots externes. Il place les rôles spécialisés puis `🤖・Bot` et les couleurs sans réserver la position de Sapphire/Carl-bot.                                                  | Une sync peut pousser les couleurs ou rôles gérés au-dessus du vrai rôle Sapphire, cassant les panels.                | Déclarer les rôles externes comme ancres d’audit, ne jamais tenter de modifier les rôles managed, et bloquer la sync si leur position est insuffisante.                                                                   |
| `🔇・Muted`                  | Les rôles `✅・Membre`, univers et jeux reçoivent explicitement `SendMessages`/`Speak`, tandis que Muted les refuse dans un autre overwrite de rôle. Discord agrège les rôles et réapplique les `allow` après les `deny`.      | Muted n’est pas garanti : un utilisateur peut conserver écriture, réactions, threads ou parole grâce à un autre rôle. | Repenser les overwrites pour que les rôles d’accès n’autorisent que `ViewChannel`; utiliser les permissions serveur de `✅・Membre` pour les actions, puis les deny Muted. Conserver le timeout comme défense principale. |
| Sécurité setup/sync          | `/setup`, `/sync` et `/sync-permissions` utilisent `dry-run:false` par défaut. De plus, `/setup` est décrit « sans supprimer » mais `ChannelService` supprime réellement `❖・JEUX` et tous ses enfants.                        | Une commande sans option peut muter le serveur et supprimer des salons sans confirmation dédiée.                      | Passer les trois commandes en dry-run par défaut et retirer toute suppression de `ChannelService`; réserver les suppressions à clear/rebuild avec confirmation.                                                           |
| Vocaux privés                | `✹・VOCAUX` contient `⭐・vocal-anciens` et `💎・vocal-privé`, tandis que `☾・ANCIENS` et `✦・CERCLE PRIVÉ` contiennent déjà leurs vocaux définitifs.                                                                          | Deux espaces privés équivalents existent ; navigation et permissions ambiguës.                                        | Supprimer les deux entrées de `✹・VOCAUX` dans la config. Garder seulement les vocaux dans leurs catégories privées.                                                                                                      |
| Accès progressif             | `accessRoles` représente un OU, pas un ET avec `✅・Membre`. Un rôle univers/jeu attribué par erreur peut autoriser `ViewChannel` même sans validation ; le deny `🕯️・À valider` n’est pas une garantie face à un autre allow. | Contournement possible de l’entrée si Sapphire ou un admin laisse un rôle d’accès sur un non-validé.                  | Whitelist stricte Sapphire, retrait des rôles d’accès lors de la dévalidation, audit des membres, et documentation explicite de cette limite Discord.                                                                     |

## Problèmes importants

| Zone                         | Problème                                                                                                                                                  | Impact                                                                                                                        | Correction recommandée                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hiérarchie source            | `✅・Membre` est placé sous les univers, jeux et notifications.                                                                                           | Ordre différent de l’architecture attendue et gestion plus fragile par Sapphire.                                              | Placer Member avant univers, jeux et notifications.                                                                                               |
| Rôle commun bot              | `🤖・Bot` est placé au-dessus des couleurs.                                                                                                               | Ce rôle d’identification est trop haut et peut écraser la couleur des bots ou compliquer les ancres.                          | Le placer avec les rôles basiques, sous les rôles attribuables.                                                                                   |
| Zone Anciens                 | `elderAccess` contient `⭐・Ancien` **et** `💎・Cercle privé`.                                                                                            | Cercle privé débloque aussi Anciens, contrairement à la règle stricte la plus récente.                                        | Limiter `elderAccess` à `⭐・Ancien`, sauf décision produit explicite.                                                                            |
| Audit runtime                | `/audit` utilise surtout `guild.channels.cache` et quelques contrôles ponctuels.                                                                          | Il peut manquer des salons non cachés, ne compare pas les overwrites attendus/réels et ne vérifie pas la majorité des règles. | Rendre l’audit asynchrone, fetcher rôles/salons et comparer chaque overwrite normalisé.                                                           |
| Doublons sémantiques         | L’audit groupe par `nom exact + type`. Les doublons `⭐・vocal-anciens` / `🔊・vocal-anciens` et `💎・vocal-privé` / `🔊・vocal-privé` passent inaperçus. | Faux résultat « aucun doublon ».                                                                                              | Ajouter une clé canonique sans emoji/préfixe pour les contrôles métier.                                                                           |
| Types de salons              | `🎞️・clips-gaming` et `🎨・créations` sont des forums avec fallback texte, alors que la cible fournie décrit des salons textuels.                         | Écart de type et comportement différent selon Community/fallback.                                                             | Choisir explicitement : `GuildText` pour conformité stricte, ou documenter l’exception forum.                                                     |
| Bienvenue externe            | `👋・bienvenue` n’accorde pas `🛠️・Bot Modération`.                                                                                                       | Sapphire/Carl-bot peut ne pas pouvoir publier les greetings si `@everyone` est refusé en écriture.                            | Ajouter le rôle bot de validation au salon bienvenue.                                                                                             |
| Rôles bots spécialisés       | `🛠️・Bot Modération` a `ManageRoles`; Tickets et Vocal ont `ManageChannels` globalement.                                                                  | Ces permissions ne sont pas limitées à un seul salon et donnent une portée serveur.                                           | N’attribuer ces rôles qu’aux bots concernés, vérifier leur position, documenter la portée globale et retirer ce qui n’est pas strictement requis. |
| Carl-bot réel                | Le backup montre Carl-bot avec Kick/Ban/ManageGuild/ManageWebhooks/ManageRoles, etc.                                                                      | Sur-privilège significatif même sans Administrator.                                                                           | Réduire au périmètre validation/greetings/rôles, ou remplacer entièrement par Sapphire selon la stratégie retenue.                                |
| Documentation bots           | README et docs désignent Carl-bot comme gestionnaire principal ; la cible de cet audit impose Sapphire.                                                   | Deux sources de vérité, configuration manuelle incertaine.                                                                    | Remplacer/clarifier le choix et créer un guide Sapphire unique.                                                                                   |
| Panels Sapphire              | Aucun fichier ne décrit les whitelists, l’exclusivité des couleurs, les actions et la cascade Gaming → jeux.                                              | Impossible de vérifier ou reproduire les dashboards Sapphire.                                                                 | Ajouter `docs/SAPPHIRE_SETUP.md` avec IDs/rôles/actions/checklists sans automatisation runtime.                                                   |
| `force` de sync              | `ensureCategoriesAndChannels` réapplique déjà les permissions. `force:true` lance ensuite une deuxième passe identique.                                   | Écritures Discord doublées, rate limits et sémantique trompeuse.                                                              | Séparer structure et permissions ou faire de `force` le seul déclencheur d’une réapplication exhaustive.                                          |
| Suppressions ponctuelles     | `/delete-role` et `/delete-channel` ne créent pas de backup ; la liste des rôles protégés est incomplète.                                                 | Suppression irréversible d’un rôle d’accès/bot ou d’un salon important avec un simple `CONFIRM`.                              | Backup automatique, contrôle `editable/deletable`, protection étendue et confirmation spécifique à l’objet.                                       |
| Bot de provisioning en privé | `provisioningBotOverwrites` est ajouté à toutes les zones role-gated, y compris `✦・CERCLE PRIVÉ`.                                                        | Le bot custom voit un espace annoncé comme strictement privé.                                                                 | Ajouter une option `provisioningAccess` et la désactiver pour le cercle privé, ou documenter l’exception.                                         |
| Dry-run incomplet            | Si une catégorie manque, le dry-run logge sa création puis `continue`, sans lister ses salons enfants manquants.                                          | Prévisualisation incomplète avant setup/sync.                                                                                 | Continuer la simulation avec une catégorie virtuelle et lister chaque salon/overwrite prévu.                                                      |

## Améliorations optionnelles

| Zone             | Suggestion                                                                                  | Bénéfice                                                        |
| ---------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Muted vocal      | Ajouter `Connect` à l’option stricte Muted.                                                 | Empêche même l’entrée dans les vocaux, pas seulement la parole. |
| Couleurs privées | Mettre `💎・Cercle privé` et `⭐・Ancien` en couleur neutre/default.                        | Évite qu’ils deviennent une couleur de pseudo de secours.       |
| Notifications    | Mettre les rôles notifications en couleur neutre.                                           | Ils restent de purs rôles de ping.                              |
| Export           | Inclure les permissions de `@everyone` et une section de diagnostic de hiérarchie des bots. | Rend les backups plus complets pour l’audit.                    |
| Ordre Discord    | Synchroniser explicitement la position des catégories/salons, ou au minimum l’auditer.      | Conserve l’ordre cible après modifications manuelles.           |

## Audit des rôles

`Existe` signifie déclaré dans la config et présent dans le backup du 9 juin.

| Rôle                  | Existe  | Position correcte                                        | Permissions correctes     | Remarques                                                                                               |
| --------------------- | ------- | -------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| 神 (Fondateur)        | Oui/Oui | Oui                                                      | Oui en config             | Couleur `#F1C40F`, aucune permission automatique ; le rôle protégé existant n’est pas corrigé par sync. |
| 🛡️・Admin             | Oui/Oui | Oui                                                      | Oui                       | ManageChannels, ManageRoles, ManageMessages, ViewAuditLog ; pas Administrator.                          |
| 🔧・Modérateur        | Oui/Oui | Oui                                                      | Oui                       | ManageMessages, ModerateMembers, ViewAuditLog.                                                          |
| 💎・Cercle privé      | Oui/Oui | Oui sous couleurs                                        | Oui                       | Couleur visible non neutre ; attribué manuellement attendu.                                             |
| ⭐・Ancien            | Oui/Oui | Oui sous couleurs                                        | Oui                       | Couleur lavande visible ; attribué manuellement attendu.                                                |
| ✅・Membre            | Oui/Oui | **Non dans la source**                                   | Partiel                   | Placé après univers/jeux/notifs ; actions accordées via overwrites, ce qui casse Muted.                 |
| 🔇・Muted             | Oui/Oui | Oui bas                                                  | **Non garanti**           | Les deny entrent en conflit avec les allow Member/univers/jeux.                                         |
| 🕯️・À valider         | Oui/Oui | Oui bas                                                  | Partiel                   | Entrée seule si aucun rôle d’accès n’est laissé par erreur.                                             |
| 🎮・Gaming            | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque les salons gaming généraux ; dépendance jeux seulement documentée.                             |
| 🎌・Anime & Manga     | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque uniquement Anime & Manga.                                                                      |
| 🍿・Films & Séries    | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque uniquement Films & Séries.                                                                     |
| 🎵・Musique           | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque Musique et vocal music.                                                                        |
| 🎨・Créatif           | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque Créatif.                                                                                       |
| 💻・Tech              | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Débloque Tech.                                                                                          |
| 🎯・Valorant          | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Valorant, mais parent Gaming non imposé techniquement.                              |
| ⛏️・Minecraft         | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Minecraft.                                                                          |
| 🚗・GTA               | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon GTA.                                                                                |
| 💀・Call of Duty      | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Call of Duty.                                                                       |
| 🧙・League of Legends | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon League of Legends.                                                                  |
| 🏗️・Fortnite          | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Fortnite.                                                                           |
| 🧱・Roblox            | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Roblox.                                                                             |
| 🚀・Rocket League     | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Rocket League.                                                                      |
| 🔫・FPS divers        | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon FPS divers.                                                                         |
| 🎲・Jeux divers       | Oui/Oui | Non, au-dessus de Member                                 | Aucune permission serveur | Accès au seul salon Jeux divers.                                                                        |
| 📢・Annonces          | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Aucune permission et aucun `accessRoles`.                                                               |
| 🎮・Game Night        | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Ping uniquement.                                                                                        |
| 🎬・Watch Party       | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Ping uniquement ; le vocal utilise Films/Anime, pas ce rôle.                                            |
| 📰・Patch Notes       | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Ping uniquement.                                                                                        |
| 🎁・Free Games        | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Ping uniquement.                                                                                        |
| 📊・Sondages          | Oui/Oui | Non, au-dessus de Member                                 | Oui                       | Ping uniquement.                                                                                        |
| 🟨・Or                | Oui/Oui | Source oui, backup non                                   | Oui                       | Aucune permission ; doit rester sous vrais bots et au-dessus des accès privés.                          |
| 🟪・Violet nuit       | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| 🟦・Bleu néon         | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| 🟥・Rouge sang        | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| 🟩・Vert jade         | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| ⬛・Noir              | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| ⬜・Blanc lune        | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| 🌸・Sakura            | Oui/Oui | Source oui, backup non                                   | Oui                       | Même remarque.                                                                                          |
| 🤖・Bot               | Oui/Oui | **Non**                                                  | Oui                       | Identification seulement, mais placé trop haut dans la source.                                          |
| 🛠️・Bot Modération    | Oui/Oui | Sous staff, mais au-dessus des vrais bots dans le backup | À réduire/justifier       | ManageRoles + ManageMessages globaux.                                                                   |
| 🛡️・Bot Automod       | Oui/Oui | Même anomalie                                            | Correct si Dyno seul      | ManageMessages + ModerateMembers.                                                                       |
| 🎫・Bot Tickets       | Oui/Oui | Même anomalie                                            | Large                     | ManageChannels global.                                                                                  |
| 🔊・Bot Vocal         | Oui/Oui | Même anomalie                                            | Large                     | ManageChannels + MoveMembers globaux.                                                                   |
| 📅・Bot Events        | Oui/Oui | Même anomalie                                            | Oui                       | Aucune permission globale.                                                                              |
| 📊・Bot Stats         | Oui/Oui | Même anomalie                                            | Oui                       | Aucune permission globale.                                                                              |
| 📰・Bot News          | Oui/Oui | Même anomalie                                            | Oui                       | Aucune permission globale.                                                                              |
| ⭐・Bot Starboard     | Oui/Oui | Même anomalie                                            | Oui                       | Aucune permission globale.                                                                              |
| 🎵・Bot Music         | Oui/Oui | Même anomalie                                            | Oui                       | Aucune permission globale.                                                                              |

### Rôles réels des bots observés dans le backup

| Rôle réel            | Position backup | Administrator | Hiérarchie conforme | Remarques                                                                     |
| -------------------- | --------------: | ------------- | ------------------- | ----------------------------------------------------------------------------- |
| 답답한 분위기 V2 Bot |              53 | **Oui**       | Au-dessus de tout   | Administrator à retirer ; permissions ciblées suffisantes.                    |
| carl-bot             |              34 | Non           | Non                 | Sous Member/Pending et très sur-privilégié.                                   |
| ProBot ✨            |              33 | **Oui**       | Non                 | Administrator injustifié selon la cible.                                      |
| Atlas                |              32 | **Oui**       | Non                 | Administrator injustifié selon la cible.                                      |
| Sapphire             |              31 | **Oui**       | **Non**             | Sous Member (38) et Pending (36), donc dépend d’Administrator pour les gérer. |

## Audit des catégories

| Catégorie         | Existe config/backup | Protection correcte      | Remarques                                                                   |
| ----------------- | -------------------- | ------------------------ | --------------------------------------------------------------------------- |
| ✦・ENTRÉE         | Oui/Oui              | Oui au niveau salons     | La catégorie est visible à everyone, mais départs/rôles ont un deny enfant. |
| ◆・HUB            | Oui/Oui              | Oui                      | Member/Ancien uniquement ; non-validés cachés.                              |
| ◇・GAMING         | Oui/Oui              | Oui pour Gaming          | Les salons jeux remplacent correctement `accessRoles` par le rôle jeu.      |
| 𖤐・ANIME & MANGA  | Oui/Oui              | Oui                      | Rôle Anime & Manga.                                                         |
| ✧・FILMS & SÉRIES | Oui/Oui              | Oui                      | Rôle Films & Séries.                                                        |
| ♬・MUSIQUE        | Oui/Oui              | Oui                      | Rôle Musique.                                                               |
| ✎・CRÉATIF        | Oui/Oui              | Oui                      | Rôle Créatif.                                                               |
| ⌘・TECH           | Oui/Oui              | Oui                      | Rôle Tech.                                                                  |
| ✹・VOCAUX         | Oui/Oui              | **Non structurellement** | Contient deux vocaux privés interdits.                                      |
| ☾・ANCIENS        | Oui/Oui              | **Non strict**           | `💎・Cercle privé` a aussi accès via `elderAccess`.                         |
| ✦・CERCLE PRIVÉ   | Oui/Oui              | Oui sauf bot custom      | Cercle privé + Fondateur ; provisioning bot ajouté directement.             |
| ▣・STAFF          | Oui/Oui              | Oui                      | Staff uniquement ; bots spécialisés seulement sur les salons prévus.        |

`❖・JEUX` : absent de la config et du backup, conforme. Toutefois sa suppression automatique dans setup/sync est non conforme à la sécurité attendue.

## Audit des salons

| Salon                 | Catégorie         | Type  | Visible par                           | Écriture                  | Problème détecté                                                       |
| --------------------- | ----------------- | ----- | ------------------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| 👋・bienvenue         | ✦・ENTRÉE         | Texte | everyone, pending, staff              | Staff + bot custom        | Rôle Sapphire/Modération absent pour greetings.                        |
| 🚪・départs           | ✦・ENTRÉE         | Texte | Member, Ancien, staff                 | Staff + Bot Modération    | Conforme.                                                              |
| 📜・règlement         | ✦・ENTRÉE         | Texte | everyone, pending, staff              | Staff + Bot Modération    | Conforme.                                                              |
| 🧭・guide             | ✦・ENTRÉE         | Texte | everyone, pending, staff              | Staff + bot custom        | Conforme.                                                              |
| 🎭・rôles             | ✦・ENTRÉE         | Texte | Member, Ancien, staff                 | Staff + Bot Modération    | Conforme après validation.                                             |
| 📌・annonces          | ◆・HUB            | Texte | Member, Ancien, staff                 | Staff + Bot Events        | Conforme.                                                              |
| 💬・général           | ◆・HUB            | Texte | Member, Ancien, staff                 | Membres autorisés         | Muted non garanti par conflit d’overwrites.                            |
| 📸・partage           | ◆・HUB            | Texte | Member, Ancien, staff                 | Membres autorisés         | Même risque Muted.                                                     |
| 🎫・support           | ◆・HUB            | Texte | Member, Ancien, staff                 | Staff + Bot Tickets       | Conforme comme panel lecture seule.                                    |
| 📊・sondages          | ◆・HUB            | Texte | Member, Ancien, staff                 | Membres autorisés         | Le rôle notification ne donne pas d’accès, conforme.                   |
| 🔎・lfg               | ◇・GAMING         | Texte | Gaming, staff                         | Gaming                    | Parent Member non imposé techniquement ; Muted non garanti.            |
| 💬・gaming            | ◇・GAMING         | Texte | Gaming, staff                         | Gaming                    | Même remarque.                                                         |
| 🎞️・clips-gaming      | ◇・GAMING         | Forum | Gaming, staff                         | Gaming                    | Type forum différent de la cible textuelle.                            |
| 📰・patch-notes       | ◇・GAMING         | Texte | Gaming, staff                         | Staff + Bot News          | Lecture seule conforme.                                                |
| 🎁・free-games        | ◇・GAMING         | Texte | Gaming, staff                         | Staff + Bot News          | Lecture seule conforme.                                                |
| 🎯・valorant          | ◇・GAMING         | Texte | Valorant, staff                       | Valorant                  | Gaming seul n’y accède pas ; parent Gaming non imposé.                 |
| ⛏️・minecraft         | ◇・GAMING         | Texte | Minecraft, staff                      | Minecraft                 | Conforme hors parent non imposé.                                       |
| 🚗・gta               | ◇・GAMING         | Texte | GTA, staff                            | GTA                       | Conforme hors parent non imposé.                                       |
| 💀・call-of-duty      | ◇・GAMING         | Texte | Call of Duty, staff                   | Call of Duty              | Conforme hors parent non imposé.                                       |
| 🧙・league-of-legends | ◇・GAMING         | Texte | League of Legends, staff              | League of Legends         | Conforme hors parent non imposé.                                       |
| 🏗️・fortnite          | ◇・GAMING         | Texte | Fortnite, staff                       | Fortnite                  | Conforme hors parent non imposé.                                       |
| 🧱・roblox            | ◇・GAMING         | Texte | Roblox, staff                         | Roblox                    | Conforme hors parent non imposé.                                       |
| 🚀・rocket-league     | ◇・GAMING         | Texte | Rocket League, staff                  | Rocket League             | Conforme hors parent non imposé.                                       |
| 🔫・fps-divers        | ◇・GAMING         | Texte | FPS divers, staff                     | FPS divers                | Conforme hors parent non imposé.                                       |
| 🎲・jeux-divers       | ◇・GAMING         | Texte | Jeux divers, staff                    | Jeux divers               | Conforme hors parent non imposé.                                       |
| 💬・anime             | 𖤐・ANIME & MANGA  | Texte | Anime & Manga, staff                  | Rôle univers              | Conforme hors validation conjointe.                                    |
| 📖・manga             | 𖤐・ANIME & MANGA  | Texte | Anime & Manga, staff                  | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🖼️・recommandations   | 𖤐・ANIME & MANGA  | Texte | Anime & Manga, staff                  | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🎬・watch-party-anime | 𖤐・ANIME & MANGA  | Texte | Anime & Manga, staff                  | Rôle univers + Bot Events | Conforme.                                                              |
| 💬・films-séries      | ✧・FILMS & SÉRIES | Texte | Films & Séries, staff                 | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🧾・recommandations   | ✧・FILMS & SÉRIES | Texte | Films & Séries, staff                 | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🎬・watch-party       | ✧・FILMS & SÉRIES | Texte | Films & Séries, staff                 | Rôle univers + Bot Events | Conforme.                                                              |
| 💬・musique           | ♬・MUSIQUE        | Texte | Musique, staff                        | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🎧・playlists         | ♬・MUSIQUE        | Texte | Musique, staff                        | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🎵・musique-bot       | ♬・MUSIQUE        | Texte | Musique, staff, Bot Music             | Rôle univers + bot        | Conforme.                                                              |
| 🎨・créations         | ✎・CRÉATIF        | Forum | Créatif, staff                        | Rôle univers              | Type forum différent de la cible textuelle.                            |
| 🎬・montage           | ✎・CRÉATIF        | Texte | Créatif, staff                        | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🖼️・images            | ✎・CRÉATIF        | Texte | Créatif, staff                        | Rôle univers              | Conforme hors validation conjointe.                                    |
| 💡・idées             | ✎・CRÉATIF        | Texte | Créatif, staff                        | Rôle univers              | Conforme hors validation conjointe.                                    |
| 💻・dev               | ⌘・TECH           | Texte | Tech, staff                           | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🧰・hardware          | ⌘・TECH           | Texte | Tech, staff                           | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🤖・ia                | ⌘・TECH           | Texte | Tech, staff                           | Rôle univers              | Conforme hors validation conjointe.                                    |
| 🧪・projets           | ⌘・TECH           | Texte | Tech, staff                           | Rôle univers              | Conforme hors validation conjointe.                                    |
| ➕・créer-un-vocal    | ✹・VOCAUX         | Vocal | Member, Ancien, staff, Bot Vocal      | Connect + Speak           | Conforme ; Muted Speak non garanti.                                    |
| 🔊・vocal-général     | ✹・VOCAUX         | Vocal | Member, Ancien, staff                 | Connect + Speak           | Conforme ; Muted Speak non garanti.                                    |
| 🎮・gaming            | ✹・VOCAUX         | Vocal | Gaming, staff, Bot Vocal              | Connect + Speak           | Conforme hors parent Member ; Muted non garanti.                       |
| 🎬・watch-party       | ✹・VOCAUX         | Vocal | Films **ou** Anime, staff, Bot Events | Connect + Speak           | Décision claire : rôle notification Watch Party n’accorde pas l’accès. |
| 🎧・music             | ✹・VOCAUX         | Vocal | Musique, staff, Bot Music             | Connect + Speak           | Conforme hors parent Member ; Muted non garanti.                       |
| ⭐・vocal-anciens     | ✹・VOCAUX         | Vocal | Ancien ou Cercle privé, staff         | Connect + Speak           | **À supprimer de cette catégorie.**                                    |
| 💎・vocal-privé       | ✹・VOCAUX         | Vocal | Cercle privé + Fondateur              | Connect + Speak           | **À supprimer de cette catégorie.**                                    |
| 🌙・salon-ancien      | ☾・ANCIENS        | Texte | Ancien **ou Cercle privé**, staff     | Rôles autorisés           | Cercle privé en plus de la cible stricte.                              |
| 📦・archives          | ☾・ANCIENS        | Texte | Ancien **ou Cercle privé**, staff     | Lecture seule             | Même écart.                                                            |
| 🔊・vocal-anciens     | ☾・ANCIENS        | Vocal | Ancien **ou Cercle privé**, staff     | Connect + Speak           | Emplacement cible correct ; retirer l’autre vocal.                     |
| 🖤・salon-privé       | ✦・CERCLE PRIVÉ   | Texte | Cercle privé, Fondateur, bot custom   | Cercle privé              | Bot provisioning est une exception non documentée.                     |
| 🧠・discussions       | ✦・CERCLE PRIVÉ   | Texte | Cercle privé, Fondateur, bot custom   | Cercle privé              | Même remarque.                                                         |
| 🔊・vocal-privé       | ✦・CERCLE PRIVÉ   | Vocal | Cercle privé, Fondateur, bot custom   | Connect + Speak           | Emplacement cible correct ; retirer l’autre vocal.                     |
| 🛡️・staff-chat        | ▣・STAFF          | Texte | Fondateur, Admin, Modérateur          | Staff                     | Conforme.                                                              |
| 🧾・logs              | ▣・STAFF          | Texte | Staff + bots logs ciblés              | Bots/staff                | Conforme, jamais visible Member dans le backup.                        |
| ⚙️・bot-config        | ▣・STAFF          | Texte | Staff + tous bots spécialisés         | Bots/staff                | Conforme.                                                              |
| 🎫・tickets-logs      | ▣・STAFF          | Texte | Staff + Bot Tickets                   | Bots/staff                | Conforme.                                                              |
| 🚨・signalements      | ▣・STAFF          | Texte | Staff + Tickets + Automod             | Bots/staff                | Conforme.                                                              |
| 📦・archives-staff    | ▣・STAFF          | Texte | Staff                                 | Staff                     | Conforme.                                                              |

## Audit Gaming

| Salon                 | Rôle requis           | Conforme | Remarques                                     |
| --------------------- | --------------------- | -------- | --------------------------------------------- |
| 🔎・lfg               | 🎮・Gaming            | Oui      | Accès parent Member non imposé techniquement. |
| 💬・gaming            | 🎮・Gaming            | Oui      | Même remarque.                                |
| 🎞️・clips-gaming      | 🎮・Gaming            | Partiel  | Accès correct, type forum à confirmer.        |
| 📰・patch-notes       | 🎮・Gaming            | Oui      | Lecture seule + Bot News.                     |
| 🎁・free-games        | 🎮・Gaming            | Oui      | Lecture seule + Bot News.                     |
| 🎯・valorant          | 🎯・Valorant          | Oui      | Gaming seul n’accède pas.                     |
| ⛏️・minecraft         | ⛏️・Minecraft         | Oui      | Gaming seul n’accède pas.                     |
| 🚗・gta               | 🚗・GTA               | Oui      | Gaming seul n’accède pas.                     |
| 💀・call-of-duty      | 💀・Call of Duty      | Oui      | Gaming seul n’accède pas.                     |
| 🧙・league-of-legends | 🧙・League of Legends | Oui      | Gaming seul n’accède pas.                     |
| 🏗️・fortnite          | 🏗️・Fortnite          | Oui      | Gaming seul n’accède pas.                     |
| 🧱・roblox            | 🧱・Roblox            | Oui      | Gaming seul n’accède pas.                     |
| 🚀・rocket-league     | 🚀・Rocket League     | Oui      | Gaming seul n’accède pas.                     |
| 🔫・fps-divers        | 🔫・FPS divers        | Oui      | Gaming seul n’accède pas.                     |
| 🎲・jeux-divers       | 🎲・Jeux divers       | Oui      | Gaming seul n’accède pas.                     |

## Audit Staff

| Salon              | Visible uniquement staff/bots ciblés | Conforme | Remarques                                                |
| ------------------ | ------------------------------------ | -------- | -------------------------------------------------------- |
| 🛡️・staff-chat     | Oui                                  | Oui      | Staff seulement.                                         |
| 🧾・logs           | Oui                                  | Oui      | Bots Modération, Automod, Tickets, Stats + provisioning. |
| ⚙️・bot-config     | Oui                                  | Oui      | Tous bots spécialisés + provisioning.                    |
| 🎫・tickets-logs   | Oui                                  | Oui      | Bot Tickets + provisioning.                              |
| 🚨・signalements   | Oui                                  | Oui      | Bot Tickets + Automod ; pas de provisioning direct.      |
| 📦・archives-staff | Oui                                  | Oui      | Staff seulement.                                         |

## Audit Sapphire

Le dashboard et les panels Sapphire ne sont pas versionnés. Les lignes ci-dessous sont donc **non vérifiables** par le dépôt ; le backup permet seulement de vérifier le rôle Discord réel.

| Panel               | Whitelist                                  | Actions                                       | Conforme               | Remarques                                                         |
| ------------------- | ------------------------------------------ | --------------------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| Univers             | ✅・Membre                                 | Toggle uniquement les 6 rôles univers         | Non vérifiable         | Aucune définition Sapphire dans le dépôt.                         |
| Jeux                | 🎮・Gaming                                 | Toggle uniquement les 10 rôles jeux           | Non vérifiable         | Ne doit jamais toggle Gaming.                                     |
| Notifications       | ✅・Membre                                 | Toggle uniquement les 6 rôles notification    | Non vérifiable         | Aucun rôle d’accès.                                               |
| Couleurs            | ✅・Membre                                 | Un seul rôle couleur ; retirer les 7 autres   | Non vérifiable         | La couleur actuelle ne doit pas être dans sa propre liste Remove. |
| Dévalidation        | Staff/Sapphire                             | Retirer Member + univers + jeux si nécessaire | Non vérifiable         | Nécessaire pour éviter les rôles d’accès sur un pending.          |
| Hiérarchie Sapphire | Sous staff, au-dessus de tous rôles donnés | ManageRoles sans Administrator                | **Non dans le backup** | Position 31 sous Member 38 et Pending 36 ; Administrator présent. |
| Rôles interdits     | Aucun staff/bot sensible                   | Aucune action                                 | Non vérifiable         | Doit être testé manuellement dans le dashboard.                   |

## Audit Muted

| Permission               | Bloquée dans la config | Conforme                  | Remarques                                                |
| ------------------------ | ---------------------- | ------------------------- | -------------------------------------------------------- |
| Send Messages            | Deny                   | **Non garanti**           | Member/univers/jeux ont un allow concurrent.             |
| Create Public Threads    | Deny                   | **Non garanti**           | Member/univers/jeux ont un allow concurrent.             |
| Create Private Threads   | Deny                   | Oui actuellement          | Aucun rôle membre ne l’autorise, mais garder le deny.    |
| Send Messages In Threads | Deny                   | **Non garanti**           | Allow concurrent.                                        |
| Add Reactions            | Deny                   | **Non garanti**           | Allow concurrent.                                        |
| Speak                    | Deny                   | **Non garanti**           | Les rôles vocaux autorisent Speak.                       |
| Connect                  | Non bloqué             | Option stricte non active | À décider.                                               |
| Timeout Discord          | Hors provisioning      | Recommandé                | Seule garantie forte sans remodeler tous les overwrites. |

## Tableau des permissions dangereuses

| Sujet                   | Permission                                            | Source                | Niveau de risque                                     |
| ----------------------- | ----------------------------------------------------- | --------------------- | ---------------------------------------------------- |
| Bot custom réel         | Administrator                                         | Backup 2026-06-09     | Critique                                             |
| Sapphire réel           | Administrator                                         | Backup 2026-06-09     | Critique                                             |
| Atlas réel              | Administrator                                         | Backup 2026-06-09     | Critique                                             |
| ProBot réel             | Administrator                                         | Backup 2026-06-09     | Critique                                             |
| Carl-bot réel           | Kick/Ban/ManageGuild/ManageWebhooks/ManageRoles, etc. | Backup 2026-06-09     | Important                                            |
| 🛠️・Bot Modération      | ManageRoles global                                    | roles.config.ts       | Important, nécessaire seulement pour le bot de rôles |
| 🎫・Bot Tickets         | ManageChannels global                                 | roles.config.ts       | Important                                            |
| 🔊・Bot Vocal           | ManageChannels global                                 | roles.config.ts       | Important                                            |
| Provisioning bot direct | View/Send/ManageMessages sur presque tous les salons  | permission.service.ts | Important                                            |
| 神 (Fondateur)          | Aucune permission globale automatique                 | roles.config.ts       | Conforme                                             |
| 🛡️・Admin               | Permissions ciblées, sans Administrator               | roles.config.ts       | Conforme                                             |
| 🔧・Modérateur          | Permissions ciblées, sans Administrator               | roles.config.ts       | Conforme                                             |
| Couleurs/notifications  | Aucune permission                                     | roles.config.ts       | Conforme                                             |

## Tableau des doublons ou incohérences

| Élément             | Config                                                      | Backup                        | Détection actuelle                   | Statut             |
| ------------------- | ----------------------------------------------------------- | ----------------------------- | ------------------------------------ | ------------------ |
| vocal-anciens       | Deux salons sémantiquement identiques                       | Deux présents                 | Non détecté, emojis différents       | Critique           |
| vocal-privé         | Deux salons sémantiquement identiques                       | Deux présents                 | Non détecté, emojis différents       | Critique           |
| ❖・JEUX             | Absent                                                      | Absent                        | Suppression automatique encore codée | Important sécurité |
| 👁️・Invité          | Constante et logique d’overwrite, mais aucun rôle configuré | Absent                        | Silencieusement ignoré               | Incohérence morte  |
| Forums              | Deux forums alors que la cible décrit du texte              | Deux forums présents          | Acceptés via fallback                | Décision requise   |
| Carl-bot / Sapphire | Docs Carl-bot, cible Sapphire                               | Les deux rôles réels existent | Aucun audit dédié                    | Important          |

## Tableau de visibilité par rôle

| Rôle               | Visibilité attendue/configurée            | Écart principal                                                                 |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------- |
| @everyone          | Bienvenue, règlement, guide uniquement    | Conforme dans le backup ; permissions serveur globales @everyone non exportées. |
| 🕯️・À valider      | Même entrée, lecture seule                | Conforme si aucun rôle univers/jeu ne lui reste.                                |
| ✅・Membre         | Entrée complète, HUB, vocaux base         | Conforme par salons ; hiérarchie source incorrecte.                             |
| 🎮・Gaming         | Gaming général + vocal gaming             | Conforme ; pas de salons jeux spécifiques.                                      |
| Rôle jeu           | Son salon uniquement                      | Conforme, mais parent Gaming/Member non imposé.                                 |
| 🎌・Anime & Manga  | Catégorie Anime                           | Conforme.                                                                       |
| 🍿・Films & Séries | Catégorie Films + vocal watch-party       | Conforme.                                                                       |
| 🎵・Musique        | Catégorie Musique + vocal music           | Conforme.                                                                       |
| 🎨・Créatif        | Catégorie Créatif                         | Conforme.                                                                       |
| 💻・Tech           | Catégorie Tech                            | Conforme.                                                                       |
| ⭐・Ancien         | Zone Anciens + accès Member               | Conforme partiellement.                                                         |
| 💎・Cercle privé   | Cercle privé **et Anciens actuellement**  | Non conforme à la cible stricte.                                                |
| Couleur            | Aucun accès                               | Conforme.                                                                       |
| Notification       | Aucun accès                               | Conforme ; Watch Party n’ouvre pas le vocal.                                    |
| 🔇・Muted          | Voir selon accès, aucune interaction      | Non garanti.                                                                    |
| Staff              | STAFF + catégories générales/spécialisées | Conforme, sauf cercle privé limité au Fondateur.                                |

## Audit des fichiers et services

| Fichier                 | Statut             | Observation                                                                                                                                          |
| ----------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `roles.config.ts`       | À corriger         | Contenu complet, aucune permission couleurs/notifs ; métadonnée Gaming utile. Ordre final dépend toutefois de RoleService et vrais bots non décrits. |
| `channels.config.ts`    | Critique           | Deux vocaux privés dupliqués ; Anciens inclut Cercle privé ; deux forums à confirmer.                                                                |
| `permissions.config.ts` | Critique           | Listes complètes, mais le modèle allow/deny rend Muted non fiable.                                                                                   |
| `permission.service.ts` | Critique           | OU entre rôles, allow concurrents à Muted, provisioning bot ajouté aux zones privées.                                                                |
| `role.service.ts`       | Critique           | Ne tient pas compte des vrais rôles bots ; Member et Bot commun mal positionnés.                                                                     |
| `channel.service.ts`    | Critique sécurité  | Supprime `❖・JEUX` pendant setup/sync réel sans confirmation dédiée.                                                                                 |
| `sync.service.ts`       | Important          | Backup réel correct ; option force redondante ; renomme le serveur en réel.                                                                          |
| `audit.service.ts`      | Important          | Cache-only, contrôle incomplet, pas de comparaison exacte d’overwrites/Sapphire/Administrator.                                                       |
| `clear.service.ts`      | Globalement solide | Fetch complet, backup, ordre enfants/catégories, rapports ; rôles externes réels non identifiés par nom/membre.                                      |
| `rebuild.service.ts`    | Globalement solide | Backup puis all-channels puis sync ; audit final limité par AuditService.                                                                            |
| `safety.ts`             | À renforcer        | Protection delete-role limitée à quatre rôles.                                                                                                       |
| `permissions.ts`        | À corriger         | Admin nommé n’a pas accès au provisioning sans Administrator, contrairement à la politique annoncée.                                                 |
| Commandes setup/sync    | Critique sécurité  | Dry-run non activé par défaut.                                                                                                                       |
| Commandes clear/rebuild | Conforme           | Dry-run par défaut et confirmations exactes.                                                                                                         |
| Export                  | À améliorer        | Fetch salons complet ; n’exporte pas les permissions @everyone ni les panels externes.                                                               |

## Diff proposé

Les extraits ci-dessous sont des **propositions uniquement**. Ils n’ont pas été appliqués.

### `src/config/channels.config.ts`

```diff
-const elderAccess = [ROLE_NAMES.elder, ROLE_NAMES.privateCircle];
+const elderAccess = [ROLE_NAMES.elder];

-text({ name: CHANNEL_NAMES.welcome, profile: 'entry-readonly' }),
+text({
+  name: CHANNEL_NAMES.welcome,
+  profile: 'entry-readonly',
+  botRoles: [ROLE_NAMES.botModeration],
+}),

-forum({ name: CHANNEL_NAMES.gamingClips, profile: 'member-chat' }),
+text({ name: CHANNEL_NAMES.gamingClips, profile: 'member-chat' }),

-forum({ name: '🎨・créations', profile: 'member-chat' }),
+text({ name: '🎨・créations', profile: 'member-chat' }),

 // Dans ✹・VOCAUX : supprimer ces deux entrées
-voice({ name: '⭐・vocal-anciens', profile: 'member-chat', accessRoles: elderAccess }),
-voice({
-  name: '💎・vocal-privé',
-  profile: 'member-chat',
-  accessRoles: privateAccess,
-  staffAccess: 'founder-only',
-}),
```

### `src/config/roles.config.ts`

```diff
+export const EXTERNAL_BOT_ROLE_NAMES = [
+  'Sapphire',
+  'carl-bot',
+  'Ticket Tool',
+  'VoiceMaster',
+] as const;

 export const GAMING_ROLE_TREE = {
   parent: ROLE_NAMES.gaming,
   children: GAME_ROLES.map((roleConfig) => roleConfig.name),
+  panelWhitelist: ROLE_NAMES.gaming,
+  removeChildrenWhenParentRemoved: true,
 } as const;
```

À décider en plus : couleur `Default`/neutre pour `💎・Cercle privé`, `⭐・Ancien` et les rôles notifications.

### `src/services/role.service.ts`

```diff
 const hierarchy = [
   ROLE_NAMES.founder,
   ROLE_NAMES.admin,
   ROLE_NAMES.moderator,
+  // Les vrais rôles managed des bots doivent être contrôlés comme ancres,
+  // jamais édités automatiquement.
   ROLE_NAMES.botModeration,
   ROLE_NAMES.botAutomod,
   ROLE_NAMES.botTickets,
   ROLE_NAMES.botVoice,
   ROLE_NAMES.botEvents,
   ROLE_NAMES.botStats,
   ROLE_NAMES.botNews,
   ROLE_NAMES.botStarboard,
   ROLE_NAMES.botMusic,
-  ROLE_NAMES.bot,
   ...COLOR_ROLE_NAMES,
   ROLE_NAMES.privateCircle,
   ROLE_NAMES.elder,
+  ROLE_NAMES.member,
   ...UNIVERSE_ROLE_NAMES,
   ...GAME_ROLE_NAMES,
   ...NOTIFICATION_ROLE_NAMES,
-  ROLE_NAMES.member,
   ROLE_NAMES.muted,
   ROLE_NAMES.pending,
+  ROLE_NAMES.bot,
 ];
```

Ajouter avant tout déplacement : validation que Sapphire/les vrais bots sont sous staff et au-dessus du premier rôle attribuable. Si ce n’est pas le cas, refuser le repositionnement et produire une instruction manuelle.

### `src/config/permissions.config.ts` et `src/services/permission.service.ts`

Refonte recommandée pour fiabiliser Muted :

```diff
-export const MEMBER_TEXT_ALLOW = [
-  ViewChannel, SendMessages, AddReactions, EmbedLinks, AttachFiles,
-  ReadMessageHistory, CreatePublicThreads, SendMessagesInThreads,
-];
+export const MEMBER_TEXT_ALLOW = [PermissionFlagsBits.ViewChannel];

-export const MEMBER_VOICE_ALLOW = [ViewChannel, Connect, Speak];
+export const MEMBER_VOICE_ALLOW = [PermissionFlagsBits.ViewChannel];

-this.everyoneDeny(context, EVERYONE_DENY),
+this.everyoneDeny(context, MEMBER_HIDDEN_DENY),
```

`MEMBER_HIDDEN_DENY` doit refuser `ViewChannel`, invitations et mentions, sans refuser les actions que `✅・Membre` reçoit au niveau du rôle serveur. Les rôles d’accès n’autorisent alors que `ViewChannel`; `🔇・Muted` peut retirer les actions sans allow concurrent.

Dans `roles.config.ts`, donner à `✅・Membre` uniquement les permissions serveur communautaires nécessaires (`SendMessages`, réactions, pièces jointes, historique, threads publics, Connect, Speak), sans `ViewChannel` global, Manage\*, invitation ou mention everyone.

Conserver les salons readonly avec leurs deny explicites. Faire vérifier cette refonte par des tests unitaires de résolution de permissions avant sync.

### `src/services/channel.service.ts`

```diff
-await this.removeConfiguredLegacyCategories(guild, dryRun);
+// Ne jamais supprimer pendant setup/sync.
+// Signaler les catégories legacy dans AuditService ; suppression uniquement
+// via clear/rebuild avec confirmation et backup.
```

Supprimer `removeConfiguredLegacyCategories` de ce service ou le déplacer derrière une commande destructive explicitement confirmée.

### `src/commands/setup.command.ts`, `sync.command.ts`, `sync-permissions.command.ts`

```diff
-const dryRun = interaction.options.getBoolean('dry-run') ?? false;
+const dryRun = interaction.options.getBoolean('dry-run') ?? true;
```

Mettre les descriptions en cohérence et exiger une confirmation explicite pour tout futur chemin destructif.

### `src/services/audit.service.ts`

Proposition structurelle :

```diff
-public run(guild: Guild): AuditReport
+public async run(guild: Guild): Promise<AuditReport>
```

- Fetch complet des rôles et salons.
- Comparaison des rôles : couleur, permissions, hoist, mentionable, position relative.
- Comparaison des catégories/salons : parent, type, ordre, overwrites normalisés.
- Détection de `Administrator` sur chaque bot réel.
- Détection des vrais rôles bots trop bas.
- Détection canonique des doublons `vocal-anciens` et `vocal-privé`.
- Vérification de chaque accès univers/jeu, Muted et STAFF.
- Signalement de `❖・JEUX` sans suppression.

### `src/utils/permissions.ts`

```diff
 return (
   member.permissions.has(PermissionFlagsBits.Administrator) ||
-  member.roles.cache.some(role => role.name === ROLE_NAMES.founder)
+  member.roles.cache.some(role =>
+    [ROLE_NAMES.founder, ROLE_NAMES.admin].includes(role.name)
+  )
 );
```

Ainsi, le rôle `🛡️・Admin` configuré sans Administrator peut réellement lancer les commandes autorisées.

### `src/utils/safety.ts` et commandes delete

- Étendre les rôles protégés aux rôles d’état et bots sensibles.
- Vérifier `role.editable` / `channel.deletable`.
- Créer un export automatique avant suppression réelle.
- Utiliser une confirmation contenant le nom ou l’ID de l’objet.

### Documentation

- Choisir officiellement Sapphire ou Carl-bot. La cible actuelle demande Sapphire.
- Ajouter `docs/SAPPHIRE_SETUP.md` avec les quatre panels, whitelists, rôles togglés, exclusivité couleur et cascade Gaming.
- Retirer les instructions directes `/sync dry-run:false` des guides de diagnostic ; toujours passer par dry-run puis validation humaine.

## Commandes recommandées

Ces commandes sont proposées **après correction du code**, pas exécutées pendant cet audit :

```text
npm run build
/setup dry-run:true
/sync dry-run:true force:true
/audit
```

Ne lancer aucune variante réelle tant que les problèmes critiques ci-dessus ne sont pas corrigés et que le rapport dry-run n’a pas été relu.

## Tests manuels recommandés

### Compte non validé

1. Vérifier qu’il voit seulement bienvenue, règlement et guide.
2. Vérifier qu’il ne voit ni départs, ni rôles, ni HUB.
3. Attribuer temporairement un rôle univers sur un compte de test pending et vérifier le comportement ; la cible exige que l’accès reste bloqué.

### Compte `✅・Membre`

1. Vérifier entrée complète, HUB, créer-un-vocal et vocal-général.
2. Vérifier qu’aucune catégorie spécialisée n’est visible.
3. Vérifier annonces/support readonly et général/partage/sondages interactifs.

### Compte `🎮・Gaming`

1. Vérifier les cinq salons gaming généraux et le vocal gaming.
2. Vérifier qu’aucun salon jeu spécifique n’est visible.

### Compte avec rôle jeu

1. Avec Gaming + Valorant, vérifier uniquement le salon Valorant supplémentaire.
2. Retirer Gaming via Sapphire et vérifier que tous les rôles jeux sont retirés.
3. Vérifier que l’action jeu ne toggle jamais Gaming elle-même.

### Compte `⭐・Ancien`

1. Vérifier la catégorie Anciens et son unique vocal.
2. Vérifier l’absence de vocal-anciens dans `✹・VOCAUX`.

### Compte `💎・Cercle privé`

1. Vérifier uniquement la catégorie Cercle privé selon la cible stricte.
2. Vérifier l’absence de vocal-privé dans `✹・VOCAUX`.
3. Vérifier que le rôle couleur choisi reste visible.

### Compte `🔇・Muted`

1. Cumuler Member + Gaming + un rôle jeu + Muted.
2. Tester texte, réactions, threads et parole dans chaque type de salon.
3. Tester Connect séparément si l’option stricte est retenue.

### Compte staff

1. Vérifier STAFF pour Modérateur/Admin/Fondateur.
2. Vérifier que Member, univers, jeux, couleurs et notifications ne voient aucun salon STAFF.
3. Vérifier que Modérateur/Admin ne voient pas le Cercle privé si la règle founder-only est conservée.

### Sapphire

1. Retirer Administrator.
2. Tester l’attribution Member, Pending, univers, jeux, notifications et couleurs.
3. Vérifier l’impossibilité d’attribuer staff ou rôles bots sensibles.
4. Tester l’exclusivité des couleurs et la cascade de retrait Gaming.

## Conclusion

La structure d’accès par univers et par jeu est globalement bien déclarée, et le backup confirme que la majorité des rôles/salons/overwrites ont été provisionnés comme prévu. Les blocages avant sync réelle sont toutefois sérieux : Administrator sur plusieurs bots dans le backup, hiérarchie Sapphire non viable sans Administrator, Muted techniquement non fiable, suppression cachée dans setup/sync et deux vocaux privés dupliqués. Corriger ces points avant toute application réelle.
