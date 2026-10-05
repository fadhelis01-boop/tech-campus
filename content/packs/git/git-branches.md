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
