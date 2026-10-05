`rapport_final.py`, `rapport_final_v2.py`, `rapport_final_v2_CORRIGE.py`… Tout le monde a connu ce chaos. **Git** le résout : il garde l'historique complet de chaque fichier, permet de revenir en arrière, et de travailler à plusieurs sans s'écraser. Aucun poste technique ne s'en passe : c'est la première compétence vérifiée en entretien.

## Ce que fait Git

**Git** est un **système de gestion de versions** (*version control system*). Il enregistre des **instantanés** (*snapshots*) successifs de votre projet. Chaque instantané s'appelle un **commit**, avec un message qui explique ce qui a changé, un auteur et une date.

:::analogie Pour comprendre
Git, c'est l'appareil photo de votre projet. À chaque étape importante, vous prenez une photo de **tout** le projet, avec une légende. Vous pouvez à tout moment ressortir une ancienne photo, comparer deux photos, ou tenter une variante sur une « branche » parallèle sans toucher à l'album principal.
:::

## Les trois zones

C'est **la** notion à comprendre, et elle explique toutes les commandes :

| Zone | Anglais | Contenu |
|---|---|---|
| Copie de travail | working directory | vos fichiers tels que vous les modifiez |
| Index (zone de préparation) | staging area | ce qui ira dans le **prochain** commit |
| Dépôt | repository (`.git`) | l'historique des commits |

Le cycle est toujours le même :

1. vous **modifiez** des fichiers (copie de travail) ;
2. vous **préparez** ceux qui doivent aller ensemble avec `git add` (index) ;
3. vous **enregistrez** l'instantané avec `git commit` (dépôt).

:::definition Pourquoi une zone de préparation ?
Elle permet de choisir précisément ce qui part dans un commit. Vous avez corrigé un bug et commencé une nouvelle fonctionnalité ? Deux commits séparés, chacun avec son message clair.
:::

## Première configuration

Git a besoin de savoir qui vous êtes : chaque commit porte votre nom.

```bash
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
```

À faire une seule fois par machine.

## Créer un dépôt et faire un premier commit

```bash
mkdir projet && cd projet
git init
echo "# Mon projet" > README.md
git status
git add README.md
git commit -m "Ajoute le README"
git log
```

- `git init` crée le dépôt (un dossier caché `.git`) ;
- `git status` dit où en sont vos fichiers : **à lire tout le temps** ;
- `git add` met en zone de préparation ;
- `git commit -m "message"` enregistre l'instantané ;
- `git log` affiche l'historique.

:::astuce
`git status` est la commande que les professionnels tapent le plus. Dès que vous ne savez plus où vous en êtes : `git status`. Il vous dit même quelle commande taper ensuite.
:::

## Git et GitHub, ce n'est pas pareil

- **Git** est le logiciel, qui fonctionne sur votre machine, même sans Internet.
- **GitHub** (comme GitLab ou Bitbucket) est un **service en ligne** qui héberge des dépôts Git, et ajoute la collaboration : revues de code, tickets, automatisation (GitHub Actions).

## À retenir

- Git enregistre des instantanés (commits) de tout le projet.
- Trois zones : copie de travail → `git add` → index → `git commit` → dépôt.
- `git config` une fois, `git init` par projet, `git status` tout le temps.
- Git = l'outil ; GitHub = l'hébergement et la collaboration.
