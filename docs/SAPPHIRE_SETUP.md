# Configuration Sapphire

Sapphire est configuré manuellement après le provisioning. Le bot custom ne pilote pas son dashboard, n'attribue aucun rôle au quotidien et peut rester éteint.

## Rôles du bot

Attribue à Sapphire :

- `🤖・Bot` pour l'identification ;
- `🛠️・Bot Modération` pour la validation et les panels de rôles.

Le vrai rôle Discord `Sapphire`, créé lors de l'invitation, doit être placé :

1. sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur` ;
2. au-dessus de `🛠️・Bot Modération` et de tous les rôles qu'il attribue ;
3. au-dessus des couleurs, de `✅・Membre`, de `🕯️・À valider`, des univers, des jeux et des notifications.

Ne donne pas `Administrator`. Accorde seulement `View Channels`, `Send Messages`, `Embed Links`, `Read Message History`, `Add Reactions` et `Manage Roles`. `Manage Messages` n'est utile que si le flux de validation l'exige.

## Validation

Dans `📜・règlement`, configure une action qui :

- ajoute `✅・Membre` ;
- retire `🕯️・À valider` ;
- ne donne aucun rôle staff, privé ou bot.

Configure l'autorole d'arrivée sur `🕯️・À valider`. Le message de validation doit rester dans `📜・règlement`; aucun salon de validation séparé n'est prévu.

## Panel Univers

Salon : `🎭・rôles`  
Whitelist : `✅・Membre`

Chaque action toggle uniquement son rôle :

- `🎮・Gaming`
- `🎌・Anime & Manga`
- `🍿・Films & Séries`
- `🎵・Musique`
- `🎨・Créatif`
- `💻・Tech`

Ces rôles débloquent leur catégorie respective. Ils ne doivent jamais ajouter de rôle de jeu automatiquement, sauf automatisation explicite de nettoyage décrite ci-dessous.

## Panel Jeux

Salon : `🎭・rôles`  
Whitelist : `🎮・Gaming`

Chaque action toggle uniquement le rôle de jeu correspondant :

- `🎯・Valorant`
- `⛏️・Minecraft`
- `🚗・GTA`
- `💀・Call of Duty`
- `🧙・League of Legends`
- `🏗️・Fortnite`
- `🧱・Roblox`
- `🚀・Rocket League`
- `🔫・FPS divers`
- `🎲・Jeux divers`

Une action Jeu ne doit jamais ajouter ou retirer `🎮・Gaming`. Quand `🎮・Gaming` est retiré, configure Sapphire pour retirer tous les rôles Jeux. Si le dashboard ne permet pas cette cascade de façon fiable, le staff doit effectuer ce nettoyage manuellement.

## Panel Notifications

Salon : `🎭・rôles`  
Whitelist : `✅・Membre`

Chaque action toggle uniquement son rôle de ping :

- `📢・Annonces`
- `🎮・Game Night`
- `🎬・Watch Party`
- `📰・Patch Notes`
- `🎁・Free Games`
- `📊・Sondages`

Ces rôles ne donnent aucun accès à un salon ou une catégorie.

## Panel Couleurs

Salon : `🎭・rôles`  
Whitelist : `✅・Membre`  
Mode : un seul choix actif

Rôles disponibles :

- `🟨・Or`
- `🟪・Violet nuit`
- `🟦・Bleu néon`
- `🟥・Rouge sang`
- `🟩・Vert jade`
- `⬛・Noir`
- `⬜・Blanc lune`
- `🌸・Sakura`

Pour chaque couleur, ajoute la couleur choisie et retire les sept autres. La couleur ajoutée ne doit jamais figurer dans sa propre liste de retrait. Les rôles couleur ne donnent aucune permission et restent au-dessus des rôles membres pour que Discord affiche bien la couleur choisie.

## Contrôles de sécurité

- Aucun panel ne propose un rôle staff, privé ou bot.
- Le panel Jeux est inutilisable sans `🎮・Gaming`.
- Le panel Univers est inutilisable sans `✅・Membre`.
- Sapphire reste sous les trois rôles staff.
- Sapphire est au-dessus de chaque rôle qu'il doit attribuer.
- Sapphire n'a pas `Administrator`.
- Dyno conserve seul le périmètre automod.

## Checklist de test

1. Un nouveau compte reçoit `🕯️・À valider` et ne voit que l'entrée.
2. La validation ajoute `✅・Membre` et retire `🕯️・À valider`.
3. Le panel Univers refuse un compte non validé.
4. `🎮・Gaming` seul affiche les salons gaming généraux, pas les salons de jeux spécifiques.
5. Chaque rôle Jeu affiche uniquement son salon correspondant.
6. Le retrait de `🎮・Gaming` entraîne le retrait des rôles Jeux.
7. Deux choix couleur successifs laissent un seul rôle couleur.
8. Les notifications ne modifient aucune visibilité.
9. Aucun test ne permet d'obtenir un rôle staff, privé ou bot.

Après une modification de hiérarchie dans la configuration, commence par `/sync dry-run:true`, relis le rapport, puis valide humainement toute opération réelle.
