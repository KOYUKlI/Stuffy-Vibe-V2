# Setup

## Avant `/setup`

1. Crée l’application Discord.
2. Crée le bot.
3. Invite le bot avec les permissions minimales.
4. Place le rôle du bot assez haut.
5. Configure `.env`.
6. Lance `npm install`.
7. Lance `npm run deploy-commands`.

Active **Community** avant `/setup` si tu veux les salons forum pour `🎞️・clips`, `💡・suggestions` et `🎨・créatif`.

Relance aussi `npm run deploy-commands` après chaque mise à jour des commandes slash, par exemple si `/clear-server` ou `/rebuild-server` reçoit de nouvelles options.

## Lancer

```bash
npm run dev
```

Dans Discord :

```text
/setup
```

Puis :

```text
/audit
```

Les messages permanents de règlement, validation et rôles sont à créer manuellement avec Sapphire. Le bot custom ne publie pas de messages permanents.

## Après `/setup` et `/audit`

Ordre manuel recommandé :

1. Upload les emojis custom depuis `docs/EMOJI_BUNDLE.md`.
2. Configure Sapphire en suivant `docs/SAPPHIRE_SETUP.md` :
   - rôle `🤖・Bot` + `🛠️・Bot Modération` ;
   - autorole `🕯️・À valider` ;
   - greetings dans `👋・bienvenue` ;
   - validation dans `📜・règlement` ;
   - reaction roles dans `🎭・rôles`.
3. Configure Dyno :
   - rôle `🤖・Bot` + `🛡️・Bot Automod` ;
   - automod léger ;
   - logs automod dans `🧾・logs`.
4. Teste le parcours membre complet.
5. Installe Ticket Tool.
6. Installe VoiceMaster.
7. Installe Sesh.
8. Installe PatchBot et FreeStuff.
9. Ajoute Statbot, EasyPoll et musique plus tard seulement si nécessaire.

Le bot custom reste un outil d’infrastructure.
Une fois `/setup` terminé, tu peux l’arrêter.
