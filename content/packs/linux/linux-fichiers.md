Créer un dossier de projet, ranger des fichiers de données, renommer, copier, supprimer : c'est le quotidien de tout informaticien. Dans cette leçon, vous apprenez à manipuler fichiers et dossiers en ligne de commande, et surtout à **comprendre les chemins**, la notion qui piège le plus les débutants.

## L'arborescence Linux

Sous Linux, tout part d'une racine unique, notée `/`. Il n'y a pas de « C: » ni de « D: » : tout est rangé dans un seul arbre.

```text
/
├── etc/        fichiers de configuration du système
├── home/       dossiers personnels des utilisateurs
│   └── apprenant/   ← votre dossier personnel (~)
├── tmp/        fichiers temporaires
├── var/        données qui varient : journaux (var/log)…
└── usr/        programmes installés
```

:::analogie Pour comprendre
L'arborescence ressemble à un immeuble : la racine `/` est le hall d'entrée, chaque dossier est un étage ou un appartement, chaque fichier un objet posé dans une pièce. Un **chemin** est l'adresse complète pour aller chercher un objet.
:::

## Chemins absolus et relatifs

- Un **chemin absolu** part de la racine et commence par `/` : `/home/apprenant/projet/data.csv`. Il est valable où que vous soyez.
- Un **chemin relatif** part du dossier courant : si vous êtes dans `/home/apprenant`, alors `projet/data.csv` désigne le même fichier.

Deux raccourcis :

- `.` désigne le dossier courant ;
- `..` désigne le dossier parent ;
- `~` désigne votre dossier personnel.

:::piege Piège classique
« Aucun fichier ou dossier de ce nom » : neuf fois sur dix, vous n'êtes pas dans le dossier que vous croyez. Réflexe : `pwd` puis `ls` avant de s'acharner.
:::

## Créer

```bash
mkdir projet
mkdir -p projet/data/brut
touch projet/notes.txt
```

- `mkdir` (*make directory*) crée un dossier ;
- `mkdir -p` crée toute la chaîne de dossiers d'un coup (et ne se plaint pas s'ils existent déjà) ;
- `touch` crée un fichier vide.

:::astuce
Évitez les espaces et les accents dans les noms de fichiers : `rapport_ventes_2026.csv` plutôt que `Rapport ventes été 2026.csv`. Les espaces obligent à mettre des guillemets partout et cassent bien des scripts. La convention la plus répandue : minuscules, tirets ou soulignés.
:::

## Copier, déplacer, renommer

```bash
cp notes.txt notes_sauvegarde.txt
cp -r data data_copie
mv notes.txt docs/
mv ancien_nom.txt nouveau_nom.txt
```

- `cp source destination` copie ; `-r` (récursif) est nécessaire pour un dossier ;
- `mv` déplace… et sert aussi à **renommer** (déplacer un fichier vers un nouveau nom, dans le même dossier).

## Supprimer (avec prudence)

```bash
rm fichier.txt
rm -r dossier
rmdir dossier_vide
```

:::attention
Il n'y a **pas de corbeille** en ligne de commande : `rm` supprime définitivement. La commande `rm -rf` (récursif, sans confirmation) est l'une des plus dangereuses de l'informatique : une faute de frappe dans le chemin peut effacer un serveur entier. Relisez toujours votre commande avant d'appuyer sur Entrée, et préférez des chemins précis.
:::

## Les motifs (jokers)

Le shell sait remplacer un motif par la liste des fichiers correspondants :

- `*` remplace n'importe quelle suite de caractères : `ls *.csv` liste tous les fichiers CSV ;
- `?` remplace un seul caractère : `ls data_202?.csv`.

```bash
mv *.csv data/
```

déplace tous les fichiers CSV du dossier courant vers `data/`.

## Visualiser l'arborescence

`tree` affiche joliment un dossier et son contenu (sur un vrai serveur, il faut parfois l'installer) :

```bash
tree projet
```

:::metier En entreprise
Les équipes data organisent leurs fichiers selon des conventions strictes, par exemple `data/raw/` (données brutes, jamais modifiées), `data/staging/`, `data/curated/`, avec des noms datés (`ventes_2026-10-05.csv`). Une arborescence propre, c'est un pipeline qu'on peut automatiser et un collègue qui s'y retrouve.
:::

## À retenir

- Tout part de la racine `/` ; votre dossier personnel est `~`.
- Chemin absolu : commence par `/` ; chemin relatif : part du dossier courant ; `..` remonte.
- `mkdir -p`, `touch`, `cp -r`, `mv` (déplacer ou renommer), `rm` (définitif !).
- `*` et `?` désignent plusieurs fichiers à la fois.
- Pas d'espaces ni d'accents dans les noms de fichiers.
