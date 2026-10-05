Un professionnel n'est pas plus intelligent qu'un débutant : il a surtout des **outils bien réglés** et des **réflexes** qui lui font gagner des heures chaque semaine. Voici ceux qui valent le coup dès le début.

## L'éditeur de code : Visual Studio Code

**VS Code** (gratuit, Windows, macOS, Linux) est l'éditeur le plus utilisé au monde. Installez-le dès que vous travaillez sur votre propre machine, avec quelques extensions : Python, YAML, Docker, et un correcteur d'orthographe pour vos README.

| Raccourci (Windows/Linux) | Mac | Effet |
|---|---|---|
| Ctrl+P | Cmd+P | ouvrir un fichier par son nom |
| Ctrl+Maj+P | Cmd+Maj+P | palette de commandes (tout est là) |
| Ctrl+F / Ctrl+H | Cmd+F / Cmd+Alt+F | chercher / remplacer |
| Ctrl+/ | Cmd+/ | commenter la ligne |
| Alt+↑/↓ | Option+↑/↓ | déplacer la ligne |
| Ctrl+D | Cmd+D | sélectionner l'occurrence suivante (édition multiple) |
| Ctrl+` | Ctrl+` | ouvrir le terminal intégré |

## Le terminal

- **Tab** pour compléter, **flèche du haut** pour rappeler, **Ctrl+R** pour chercher dans l'historique (sur un vrai shell).
- Créez des **alias** pour vos commandes fréquentes : `alias gs="git status"`.
- Un bon terminal vaut l'investissement : Windows Terminal (avec WSL pour avoir Linux sous Windows), iTerm2 ou le terminal intégré sur Mac.

:::astuce Linux sous Windows
Sous Windows, **WSL** (*Windows Subsystem for Linux*) installe un vrai Ubuntu en une commande (`wsl --install`). C'est la meilleure façon de pratiquer Linux, Docker et Python sur votre propre PC.
:::

## L'organisation

- **Un dossier par projet**, toujours versionné avec Git, même pour un essai.
- **Ne travaillez jamais sur la seule copie** de vos données : gardez les fichiers bruts intacts.
- **Nommez clairement** : `nettoyer_ventes.py` plutôt que `test2_final_v3.py`.
- **Automatisez ce que vous faites trois fois** : un script, un alias, un Makefile.

## La santé

:::attention
Le métier se pratique assis devant un écran, longtemps. Écran à hauteur des yeux, pauses régulières (la règle 20-20-20 : toutes les 20 minutes, regarder à 20 pieds — environ 6 mètres — pendant 20 secondes), une vraie coupure le soir. La progression vient aussi d'un cerveau reposé.
:::

## Les réflexes de pro

1. **Lire avant d'exécuter** une commande trouvée sur Internet (surtout avec `sudo` ou `rm`).
2. **Sauvegarder et committer souvent.**
3. **Tester sur un petit échantillon** avant de lancer sur 10 millions de lignes.
4. **Écrire la documentation au fil de l'eau**, pas « à la fin ».
5. **Ne jamais mettre de secret dans le code.**

## À retenir

- VS Code + quelques raccourcis (Ctrl+P, Ctrl+Maj+P, Ctrl+D) = des heures gagnées.
- Sous Windows, WSL donne un vrai Linux.
- Un dossier par projet, sous Git ; données brutes intactes ; noms explicites.
- Automatiser ce qu'on fait trois fois ; lire avant d'exécuter ; tester sur un échantillon.
