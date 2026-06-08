# Configuration manuelle de Carl-bot

Carl-bot peut gérer la validation du règlement, les rôles de réaction, certains embeds permanents et des logs simples.

Le provisioning bot custom ne configure pas Carl-bot automatiquement.

## Rôles à donner à Carl-bot

- `🤖・Bot`
- `🛠️・Bot Modération`

Le rôle Carl-bot doit être placé :

- sous `神 (Fondateur)`, `🛡️・Admin` et `🔧・Modérateur` ;
- au-dessus de `✅・Membre`, `🕯️・À valider`, rôles d’intérêt, notifications et couleurs.

Ne donne pas `Administrator` si les permissions ciblées suffisent.

## Salons utilisés

- Règlement et validation : `📜・règlement`
- Rôles : `🎭・rôles`
- Logs simples : `🧾・logs`
- Configuration staff : `⚙️・bot-config`

## Permissions minimales

Carl-bot a besoin de :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions ou interactions selon le système choisi
- Manage Messages si tu veux qu’il nettoie certains messages
- Manage Roles pour attribuer et retirer les rôles

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

## Rôles dans `🎭・rôles`

Crée des panneaux séparés :

- Centres d’intérêt
- Notifications
- Couleurs

Pour les couleurs, configure un mode rôle unique si possible.

## Logs simples

Envoie les logs Carl-bot dans `🧾・logs`.

Garde les logs publics désactivés. Les membres classiques ne doivent pas voir `🧾・logs`.

## Checklist de test

- Un membre non validé voit seulement `👋・bienvenue`, `📜・règlement`, `🧭・guide`.
- La validation ajoute `✅・Membre`.
- La validation retire `🕯️・À valider`.
- `🎭・rôles` devient visible après validation.
- Les rôles d’intérêt s’ajoutent et se retirent correctement.
- Un seul rôle couleur est actif si configuré ainsi.
- Les logs restent dans `🧾・logs`.

## Dépannage

- Si Carl-bot ne peut pas donner `✅・Membre`, son rôle est probablement trop bas.
- Si Carl-bot peut modifier les rôles staff, son rôle est trop haut.
- Si les membres non validés voient trop de salons, vérifie les permissions `@everyone` et `🕯️・À valider`.
- Si les boutons ne fonctionnent pas, vérifie les permissions du bot et la configuration du panel Carl-bot.
