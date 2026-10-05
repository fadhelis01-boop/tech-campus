Un pipeline de déploiement n'a de valeur que si les **tests** qu'il exécute attrapent vraiment les problèmes. Quels tests écrire, et où les placer dans la chaîne ?

## La pyramide des tests

```text
          /\        tests de bout en bout (peu, lents, fragiles)
         /  \
        /----\      tests d'intégration (quelques-uns)
       /      \
      /--------\    tests unitaires (beaucoup, rapides)
```

- **Unitaires** : une fonction isolée ; des centaines, en quelques secondes.
- **D'intégration** : plusieurs composants ensemble (l'API avec une vraie base de test, le pipeline avec un vrai fichier).
- **De bout en bout** (*end-to-end*) : tout le système, comme un utilisateur ; quelques scénarios critiques.

## Les autres vérifications automatiques

| Vérification | Outils (exemples) | Ce qu'elle attrape |
|---|---|---|
| Style et erreurs courantes (*lint*) | ruff, eslint, hadolint (Dockerfile), yamllint | code incohérent, erreurs évidentes |
| Types | mypy, pyright | incohérences de types |
| Sécurité du code (SAST) | Semgrep, CodeQL, Bandit | injections, mauvaises pratiques |
| Dépendances vulnérables (SCA) | Dependabot, pip-audit, Trivy | bibliothèques avec failles connues |
| Secrets commités | gitleaks, détection de secrets de GitHub | mots de passe et clés dans le code |
| Infrastructure | terraform validate, Checkov | configurations dangereuses |
| Données | tests dbt, Great Expectations, Soda | doublons, valeurs nulles, volumes anormaux |

## Des tests rapides et fiables

:::methode Les règles d'une CI utile
1. **Rapide** : la CI doit répondre en quelques minutes ; sinon, on l'ignore. Paralléliser, mettre en cache les dépendances.
2. **Fiable** : un test qui échoue « une fois sur dix » (*flaky*) détruit la confiance ; on le corrige ou on le met en quarantaine.
3. **Bloquante** : une CI rouge empêche la fusion.
4. **Les plus rapides d'abord** : lint et tests unitaires avant les tests d'intégration.
:::

## À retenir

- Pyramide : beaucoup d'unitaires, quelques intégrations, peu de bout en bout.
- Lint, types, SAST, dépendances, secrets, infrastructure, données : autant de vérifications automatiques.
- Une CI rapide, fiable et bloquante ; les vérifications rapides en premier.
