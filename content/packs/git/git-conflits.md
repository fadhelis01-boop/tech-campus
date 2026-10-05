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
