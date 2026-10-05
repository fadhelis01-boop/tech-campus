<!-- @lecon git-pourquoi -->
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

<!-- @lecon git-cycle -->
Vous savez faire un commit. Voyons maintenant le cycle de travail quotidien : voir ce qui a changé, choisir ce qu'on enregistre, annuler une erreur, et ignorer les fichiers qui n'ont rien à faire dans l'historique.

## Voir ce qui a changé

```bash
git status
git diff
git diff --staged
git log --oneline
```

- `git diff` montre les modifications **pas encore** préparées : les lignes retirées commencent par `-`, les ajoutées par `+` ;
- `git diff --staged` montre ce qui est préparé (ce qui partira au prochain commit) ;
- `git log --oneline` affiche l'historique en une ligne par commit.

## Préparer et enregistrer

```bash
git add nettoyage.py
git add .
git commit -m "Convertit les montants en nombres"
git commit -am "Corrige le séparateur décimal"
```

- `git add .` prépare **tout** le dossier courant (pratique, mais vérifiez avec `git status` que vous n'ajoutez rien de sensible) ;
- `git commit -am` prépare automatiquement les fichiers **déjà suivis** et commite ; il n'ajoute pas les nouveaux fichiers.

## Annuler

| Situation | Commande |
|---|---|
| J'ai modifié un fichier et veux revenir à la dernière version enregistrée | `git restore fichier` |
| J'ai préparé un fichier par erreur | `git restore --staged fichier` |
| Je veux supprimer un fichier suivi | `git rm fichier` |
| Je veux renommer un fichier suivi | `git mv ancien nouveau` |

:::attention
`git restore fichier` écrase vos modifications non enregistrées : elles sont perdues. Tant qu'un travail est commité, en revanche, Git le garde (on peut presque toujours le retrouver).
:::

## Ignorer des fichiers : .gitignore

Certains fichiers ne doivent **jamais** entrer dans Git : secrets, données volumineuses, fichiers générés. On les liste dans un fichier `.gitignore` à la racine du dépôt :

```text
# Secrets
.env
*.key

# Données et fichiers générés
data/
*.log
__pycache__/
.venv/
```

:::attention Les secrets dans Git
Un mot de passe ou une clé d'API commité reste dans l'**historique**, même si vous supprimez le fichier ensuite. Sur un dépôt public, des robots le trouvent en quelques minutes. Si cela arrive : considérez la clé comme compromise, **révoquez-la immédiatement** et créez-en une nouvelle.
:::

## Écrire de bons messages de commit

:::methode Un bon message
- À l'**impératif**, court (moins de 70 caractères) : « Ajoute le contrôle des doublons ».
- Il dit **quoi** et, si besoin, **pourquoi** (dans le corps du message).
- Un commit = une modification cohérente.
:::

Beaucoup d'équipes suivent la convention **Conventional Commits** : `feat: ajoute l'export Parquet`, `fix: corrige l'encodage du fichier clients`, `docs: complète le README`.

## À retenir

- `git diff` (non préparé) et `git diff --staged` (préparé) ; `git log --oneline`.
- `git add .` puis vérifier ; `git commit -am` pour les fichiers déjà suivis.
- `git restore` annule ; `git restore --staged` retire de l'index.
- `.gitignore` pour les secrets, données et fichiers générés ; un secret commité doit être révoqué.
- Messages courts, à l'impératif, une modification cohérente par commit.

<!-- @lecon git-branches -->
Vous voulez essayer une nouvelle idée sans risquer de casser ce qui marche. Votre collègue travaille sur une autre fonctionnalité en même temps. La solution : les **branches**, l'une des forces de Git.

## Qu'est-ce qu'une branche ?

Une **branche** est une ligne de développement parallèle. La branche principale s'appelle généralement `main`. Créer une branche, c'est dire : « à partir d'ici, je travaille de mon côté ».

:::analogie Pour comprendre
Imaginez un document partagé. Plutôt que de modifier directement la version officielle, vous en faites une copie de travail, vous la modifiez tranquillement, puis, quand c'est prêt et relu, vous reportez vos changements dans la version officielle. La branche est cette copie, en beaucoup plus léger : Git ne copie rien, il retient simplement un point de départ.
:::

## Les commandes

```bash
git branch
git switch -c nouvelle-fonction
git switch main
git branch -d nouvelle-fonction
```

- `git branch` liste les branches (l'étoile marque la branche courante) ;
- `git switch -c nom` **crée** une branche et s'y place (ancienne forme : `git checkout -b nom`) ;
- `git switch nom` change de branche : les fichiers de la copie de travail changent pour refléter cette branche ;
- `git branch -d nom` supprime une branche déjà fusionnée.

:::piege Piège classique
Changer de branche avec des modifications non commitées : Git refuse s'il risque d'écraser votre travail. Commitez d'abord (ou annulez), puis changez de branche.
:::

## Fusionner : git merge

Quand le travail sur la branche est prêt, on le **fusionne** dans `main` :

```bash
git switch main
git merge nouvelle-fonction
```

Deux cas :

- **Avance rapide** (*fast-forward*) : si `main` n'a pas bougé depuis la création de la branche, Git avance simplement `main` jusqu'au dernier commit de la branche.
- **Fusion à trois points** : si les deux branches ont avancé, Git combine les changements et crée un **commit de fusion** (*merge commit*). Si les mêmes lignes ont été modifiées des deux côtés, il y a un **conflit** (leçon suivante).

## Les flux de travail en équipe

:::metier En entreprise
La plupart des équipes suivent le **GitHub flow** (ou le *trunk-based development*, très proche) :
1. `main` est toujours dans un état déployable ;
2. chaque tâche = une branche courte (quelques heures à quelques jours) ;
3. on pousse la branche sur GitHub et on ouvre une **pull request** ;
4. un collègue relit le code, la chaîne d'intégration continue lance les tests ;
5. on fusionne dans `main`, qui est déployé.
:::

## À retenir

- Une branche = une ligne de travail parallèle ; `main` est la branche principale.
- `git switch -c` crée et bascule ; `git switch` change de branche.
- `git merge` fusionne : avance rapide ou commit de fusion.
- Branches courtes + pull requests + `main` toujours déployable : le flux de travail standard.

<!-- @lecon git-conflits -->
Deux personnes (ou deux branches) ont modifié **la même ligne** du même fichier différemment. Git ne peut pas deviner la bonne version : il vous demande de trancher. C'est un **conflit de fusion**. Il impressionne les débutants, mais se résout en quelques minutes avec méthode.

## Reconnaître un conflit

```text
CONFLIT (contenu) : conflit de fusion dans config.txt
La fusion automatique a échoué ; réglez les conflits, puis faites un commit.
```

Git a modifié le fichier pour y montrer les deux versions :

```text
<<<<<<< HEAD
seuil=100
=======
seuil=150
>>>>>>> correction-seuil
```

- entre `<<<<<<< HEAD` et `=======` : votre version (la branche courante) ;
- entre `=======` et `>>>>>>>` : la version de l'autre branche.

## Résoudre en quatre étapes

:::methode Résoudre un conflit
1. **Repérer** les fichiers en conflit : `git status` (« Fusion en cours… »).
2. **Éditer** chaque fichier : garder la bonne version (ou un mélange des deux), et **supprimer les trois lignes de marqueurs**.
3. **Marquer comme résolu** : `git add fichier`.
4. **Terminer la fusion** : `git commit -m "Fusionne correction-seuil"`.
:::

Pour abandonner et revenir à l'état d'avant la fusion : `git merge --abort`.

:::attention
Ne commitez jamais un fichier qui contient encore `<<<<<<<` ou `>>>>>>>` : le programme ne fonctionnera plus. Le terminal de TechCampus vous en empêche ; un vrai Git, non (mais les tests de la chaîne d'intégration le détecteront).
:::

## Éviter les conflits

- **Des branches courtes** : moins elles vivent longtemps, moins elles divergent.
- **Récupérer souvent** le travail des autres (`git pull`) et fusionner `main` dans sa branche.
- **Communiquer** : deux personnes qui modifient le même fichier en même temps devraient se parler.
- **Des commits petits et ciblés.**

:::metier En entreprise
Les conflits sont quotidiens dans une équipe active. Savoir les résoudre calmement, en comprenant ce que chaque version voulait faire (et en demandant à l'auteur en cas de doute), est une compétence très appréciée.
:::

## À retenir

- Conflit = même ligne modifiée différemment des deux côtés.
- Marqueurs `<<<<<<<`, `=======`, `>>>>>>>` : votre version, puis l'autre.
- Éditer, supprimer les marqueurs, `git add`, `git commit` ; `git merge --abort` pour annuler.
- Branches courtes et synchronisation fréquente évitent la plupart des conflits.

<!-- @lecon git-github -->
Votre dépôt existe sur votre machine. Pour le sauvegarder, le partager et collaborer, on le relie à un **dépôt distant** hébergé sur GitHub (ou GitLab). C'est aussi là que se construit votre portfolio.

## Dépôt distant

```bash
git remote add origin https://github.com/ada/projet.git
git remote -v
git push -u origin main
```

- `git remote add origin URL` déclare un dépôt distant nommé, par convention, `origin` ;
- `git push -u origin main` envoie la branche `main` ; `-u` mémorise le lien, ensuite `git push` suffit ;
- `git pull` récupère et fusionne les nouveautés du distant ;
- `git clone URL` copie un dépôt distant existant sur votre machine.

:::astuce S'authentifier auprès de GitHub
GitHub n'accepte plus les mots de passe pour `git push`. On utilise une **clé SSH** (voir la leçon SSH du module Linux) ou un jeton d'accès, ou l'outil `gh` (GitHub CLI) qui s'occupe de tout : `gh auth login`.
:::

## La pull request : le cœur de la collaboration

Une **pull request** (PR, ou *merge request* sur GitLab) est une demande de fusion d'une branche dans `main`, accompagnée d'une discussion.

:::methode Le cycle d'une pull request
1. Créer une branche, commiter le travail.
2. Pousser la branche : `git push -u origin ma-branche`.
3. Ouvrir la pull request sur GitHub, avec une description : quoi, pourquoi, comment tester.
4. Les tests automatiques (GitHub Actions) se lancent.
5. Un collègue **relit** le code, commente, demande des modifications.
6. On corrige (nouveaux commits sur la même branche, la PR se met à jour).
7. Une fois approuvée et les tests au vert, on **fusionne**.
:::

## La revue de code

La revue de code (*code review*) n'est pas un jugement : c'est un échange qui améliore le code et fait progresser toute l'équipe.

- En tant qu'auteur : PR **petite**, description claire, captures ou exemples si utile.
- En tant que relecteur : bienveillance, questions plutôt qu'ordres (« que se passe-t-il si la liste est vide ? »), distinguer l'essentiel du détail.

## GitHub, votre vitrine

- Un **README** soigné sur chaque projet.
- Un **profil** à jour, des projets épinglés.
- Des **commits réguliers** (le calendrier de contributions).
- Contribuer à un projet open source, même par une correction de documentation, est un excellent signal.

## À retenir

- `git remote add origin`, `git push -u origin main`, `git pull`, `git clone`.
- Authentification par clé SSH, jeton ou `gh auth login`.
- Pull request : branche → push → PR → tests → revue → corrections → fusion.
- La revue de code est un échange bienveillant ; GitHub est votre portfolio.

<!-- @lecon git-pratiques -->
Vous maîtrisez les commandes. Cette dernière leçon rassemble les pratiques qui distinguent un usage professionnel de Git, et quelques commandes avancées à connaître (au moins de nom) pour les entretiens.

## Les bonnes pratiques

:::retenir Les dix commandements
1. Commiter **souvent**, par petites étapes cohérentes.
2. Des **messages clairs** à l'impératif (Conventional Commits si l'équipe les utilise).
3. Ne **jamais** commiter de secret ; un `.gitignore` dès le début du projet.
4. Ne pas versionner les **gros fichiers de données** (on les stocke ailleurs : stockage objet, outils dédiés).
5. Une branche par tâche, **courte**.
6. `main` toujours **fonctionnelle** et protégée (fusion uniquement par pull request).
7. **Récupérer** souvent le travail des autres.
8. Relire son propre diff (`git diff --staged`) **avant** de commiter.
9. Ne jamais réécrire l'historique d'une branche **partagée**.
10. `git status` en cas de doute.
:::

## Les commandes avancées à connaître

| Commande | Usage | Prudence |
|---|---|---|
| `git stash` | mettre de côté des modifications en cours, pour changer de branche | penser à `git stash pop` |
| `git revert <commit>` | créer un commit qui **annule** un commit précédent | sûr, même sur une branche partagée |
| `git reset` | déplacer la branche vers un commit antérieur | `--hard` détruit les modifications ; jamais sur une branche partagée |
| `git rebase` | rejouer ses commits au-dessus d'une autre branche (historique linéaire) | jamais sur une branche déjà partagée |
| `git cherry-pick` | appliquer un commit précis sur une autre branche | utile pour un correctif urgent |
| `git tag v1.2.0` | marquer une version publiée | |
| `git blame fichier` | savoir qui a modifié chaque ligne (et quand) | pour comprendre, pas pour blâmer |

:::definition Merge ou rebase ?
Les deux intègrent les changements d'une branche dans une autre. `merge` conserve l'historique tel qu'il s'est passé (avec des commits de fusion) ; `rebase` le réécrit pour qu'il paraisse linéaire. Règle d'or : on peut rebaser **sa** branche locale ; on ne rebase jamais une branche que d'autres utilisent.
:::

## Git au service de l'automatisation

Dans les métiers data et cloud, **tout** est dans Git : le code des pipelines, les requêtes SQL et modèles dbt, les fichiers Docker, les manifestes Kubernetes, le code Terraform de l'infrastructure. Une modification de l'infrastructure passe par une pull request, une revue, des tests automatiques, puis un déploiement automatique : c'est le principe du **GitOps**, que vous retrouverez dans le module DevOps.

## À retenir

- Petits commits, messages clairs, pas de secrets ni de grosses données, branches courtes, `main` protégée.
- `stash`, `revert`, `reset`, `rebase`, `cherry-pick`, `tag`, `blame` : savoir à quoi ils servent.
- On ne réécrit jamais l'historique d'une branche partagée.
- En data et en cloud, tout passe par Git (GitOps).
