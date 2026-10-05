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
