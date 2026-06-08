# Configuration manuelle de Carl-bot

Carl-bot gère uniquement l’accueil, la validation et les rôles utilisateur.

Le provisioning bot custom ne configure pas Carl-bot automatiquement.

## Périmètre Carl-bot

Carl-bot doit gérer :

- autorole `🕯️・À valider` ;
- greetings dans `👋・bienvenue` ;
- DM de bienvenue optionnel ;
- validation règlement dans `📜・règlement` ;
- reaction roles dans `🎭・rôles`.

Carl-bot ne doit pas gérer :

- automod ;
- tickets ;
- vocaux temporaires ;
- events ;
- stats ;
- musique ;
- suggestions ;
- starboard ;
- tags/reminders ;
- logs avancés.

L’automod est confié à Dyno. Les tickets, vocaux temporaires, events, stats et musique restent confiés à leurs bots dédiés.

## Rôles à donner à Carl-bot

- `🤖・Bot`
- `🛠️・Bot Modération`

Le rôle Carl-bot doit être placé :

- sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur` ;
- au-dessus de `✅・Membre`, `🕯️・À valider`, rôles d’intérêt, notifications et couleurs.

Ne donne pas `Administrator` si les permissions ciblées suffisent.

## Salons utilisés

- Greetings : `👋・bienvenue`
- Règlement et validation : `📜・règlement`
- Reaction roles : `🎭・rôles`
- Logs nécessaires : `🧾・logs`
- Configuration staff : `⚙️・bot-config`

## Permissions minimales

Carl-bot a besoin de :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions ou interactions selon le système choisi
- Manage Roles pour attribuer et retirer les rôles
- Manage Messages seulement si nécessaire pour nettoyer ses propres messages

Pas d’`Administrator`.

## Autorole

Objectif :

- donner `🕯️・À valider` aux nouveaux membres.

Étapes :

1. Active l’autorole dans Carl-bot.
2. Sélectionne `🕯️・À valider`.
3. Vérifie que Carl-bot peut gérer ce rôle.
4. Teste avec un compte de test.

## Greetings

Objectif :

- envoyer un message d’accueil dans `👋・bienvenue` ;
- éventuellement envoyer un DM de bienvenue.

Message conseillé :

```text
Bienvenue dans 답답한 분위기 V2.
Lis le règlement dans 📜・règlement, puis valide ton accès directement là-bas.
Une fois validé, tu débloqueras le serveur principal.
```

Le bot custom ne gère aucun message automatique de bienvenue.

## Validation du règlement

Objectif :

- ajouter `✅・Membre` ;
- retirer `🕯️・À valider`.

Étapes :

1. Crée un embed permanent dans `📜・règlement`.
2. Ajoute une section validation claire.
3. Ajoute un bouton ou une réaction.
4. Configure l’action :
   - add role `✅・Membre`
   - remove role `🕯️・À valider`
5. Teste avec un compte ou rôle de test.

Texte conseillé :

```text
Après lecture du règlement, valide ton accès avec le bouton ci-dessous.
Cela te donnera le rôle ✅・Membre et débloquera le serveur principal.
```

## Reaction roles dans `🎭・rôles`

Crée des panneaux séparés :

- Centres d’intérêt
- Notifications
- Couleurs

Pour les couleurs, configure un mode rôle unique si possible.

Carl-bot ne doit pas gérer l’automod via ces panneaux.

## Logs nécessaires

Tu peux envoyer les logs nécessaires au fonctionnement de l’autorole, de la validation et des reaction roles dans `🧾・logs`.

Les logs automod doivent venir de Dyno, pas de Carl-bot.

## Checklist de test

- Un nouveau membre reçoit `🕯️・À valider`.
- Le greeting apparaît dans `👋・bienvenue`.
- Le DM de bienvenue fonctionne si activé.
- Un membre non validé voit seulement `👋・bienvenue`, `📜・règlement`, `🧭・guide`.
- La validation ajoute `✅・Membre`.
- La validation retire `🕯️・À valider`.
- `🎭・rôles` devient visible après validation.
- Les rôles d’intérêt, notifications et couleurs fonctionnent.
- Carl-bot ne gère pas l’automod.

## Dépannage

- Si Carl-bot ne peut pas donner `✅・Membre`, son rôle est probablement trop bas.
- Si Carl-bot peut modifier les rôles staff, son rôle est trop haut.
- Si les membres non validés voient trop de salons, vérifie `@everyone` et `🕯️・À valider`.
- Si les boutons ne fonctionnent pas, vérifie les permissions et le panel Carl-bot.
