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
