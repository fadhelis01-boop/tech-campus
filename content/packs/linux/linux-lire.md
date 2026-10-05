Un fichier de journal (*log*) de serveur peut contenir des millions de lignes. Impossible de l'ouvrir dans un éditeur : on l'interroge en ligne de commande. Cette leçon vous apprend à lire et à fouiller des fichiers comme un administrateur système.

## Afficher un fichier

```bash
cat notes.txt
cat -n notes.txt
```

`cat` affiche tout le contenu d'un fichier ; `-n` numérote les lignes. Parfait pour un petit fichier, catastrophique pour un journal de deux gigaoctets.

Pour les gros fichiers, on utilise `less` (sur un vrai système) : il affiche page par page, on navigue avec les flèches, `/mot` cherche un mot, `q` quitte.

## Le début et la fin

```bash
head data.csv
head -n 3 data.csv
tail -n 20 /var/log/syslog
```

- `head` affiche les 10 premières lignes (ou `-n N`) : idéal pour découvrir les colonnes d'un CSV ;
- `tail` affiche les dernières lignes : idéal pour un journal, où les événements récents sont à la fin.

:::astuce
`tail -f fichier.log` (*follow*) affiche les nouvelles lignes au fur et à mesure qu'elles sont écrites. C'est le réflexe numéro un quand on surveille une application qui démarre ou un traitement en cours.
:::

## Compter

```bash
wc -l data.csv
```

`wc` (*word count*) compte les lignes (`-l`), les mots (`-w`) ou les caractères (`-c`). Un data engineer s'en sert constamment pour vérifier qu'un fichier reçu a le bon nombre de lignes.

## Chercher dans un fichier : grep

`grep` est sans doute la commande la plus utile de toutes : elle affiche les lignes qui contiennent un motif.

```bash
grep "Failed" /var/log/syslog
grep -i "error" app.log
grep -n "TODO" script.py
grep -c "Failed" /var/log/syslog
grep -v "DEBUG" app.log
grep -r "password" .
```

| Option | Effet |
|---|---|
| `-i` | ignore la différence majuscules/minuscules |
| `-n` | affiche le numéro de ligne |
| `-c` | compte les lignes trouvées au lieu de les afficher |
| `-v` | inverse : les lignes qui ne contiennent **pas** le motif |
| `-r` | cherche dans tous les fichiers d'un dossier |

:::definition
Le motif de `grep` est une **expression régulière** (*regular expression*, regex) : un petit langage pour décrire du texte. `^ERROR` = « ligne qui commence par ERROR », `[0-9]+` = « un ou plusieurs chiffres ». Vous les retrouverez en Python et en SQL.
:::

## Chercher des fichiers : find

```bash
find . -name "*.csv"
find /var/log -name "*.log" -type f
```

`find` parcourt une arborescence et liste les fichiers qui correspondent aux critères (`-name` pour le nom, `-type f` pour les fichiers, `-type d` pour les dossiers).

:::piege Piège classique
Ne confondez pas : `grep` cherche **dans le contenu** des fichiers, `find` cherche **des noms de fichiers**.
:::

:::metier En entreprise
3 h du matin, une alerte : le traitement nocturne a échoué. L'ingénieur d'astreinte se connecte, tape `tail -n 50` sur le journal, repère le message d'erreur, puis `grep -c` pour savoir depuis quand l'erreur se répète. Diagnostic en deux minutes, sans interface graphique.
:::

## À retenir

- `cat` pour un petit fichier, `less` pour un gros ; `head` et `tail` pour le début et la fin.
- `tail -f` suit un journal en direct.
- `wc -l` compte les lignes.
- `grep` cherche dans le contenu (`-i`, `-n`, `-c`, `-v`, `-r`) ; `find` cherche des fichiers par nom.
