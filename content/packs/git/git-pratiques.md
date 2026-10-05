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
