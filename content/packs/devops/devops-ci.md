L'**intégration continue** (*Continuous Integration*, CI) consiste à intégrer le travail de chacun **plusieurs fois par jour** dans la branche principale, chaque intégration étant **vérifiée automatiquement** : construction, tests, analyse. Les problèmes sont détectés en minutes, pas en semaines.

## Le principe

À chaque push ou pull request, un **serveur d'intégration** exécute une suite d'étapes définie dans un fichier du dépôt :

1. récupérer le code ;
2. installer l'environnement et les dépendances ;
3. vérifier le style (*lint*) ;
4. exécuter les tests ;
5. construire l'artefact (une image Docker, un paquet) ;
6. publier le résultat (succès/échec) dans la pull request.

Si une étape échoue, la pull request ne peut pas être fusionnée.

## GitHub Actions

**GitHub Actions** est l'outil de CI/CD intégré à GitHub. Un **workflow** se décrit dans un fichier YAML du dossier `.github/workflows/` :

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: pytest
```

| Élément | Rôle |
|---|---|
| `on` | les **déclencheurs** : push sur main, pull request, planification (`schedule`), lancement manuel (`workflow_dispatch`) |
| `jobs` | les **tâches**, exécutées en parallèle sauf dépendance (`needs`) |
| `runs-on` | la machine qui exécute la tâche (*runner*) |
| `steps` | les étapes : `uses` appelle une **action** réutilisable, `run` exécute une commande |

:::astuce
Fixez la version des actions (`actions/checkout@v5`) : une action non versionnée peut changer et casser votre chaîne, voire introduire du code malveillant. Les équipes très attentives à la sécurité épinglent même l'empreinte exacte (SHA du commit).
:::

## Les secrets dans la CI

Un déploiement a besoin d'identifiants. On ne les écrit **jamais** dans le workflow : on les enregistre dans les **secrets** du dépôt et on les lit avec `${{ secrets.NOM }}`. Mieux encore : l'authentification **OIDC** permet à GitHub Actions d'obtenir des droits temporaires auprès du fournisseur cloud, sans aucun secret stocké.

## Les autres outils

GitLab CI, Jenkins, Azure Pipelines, CircleCI… La syntaxe change, les concepts (déclencheurs, tâches, étapes, artefacts, secrets) sont les mêmes.

## À retenir

- CI : chaque changement est construit et testé automatiquement, plusieurs fois par jour.
- GitHub Actions : workflow YAML dans `.github/workflows/` ; `on`, `jobs`, `runs-on`, `steps` (`uses`, `run`).
- Versions des actions fixées ; secrets dans les secrets du dépôt ou, mieux, OIDC.
- Mêmes concepts dans GitLab CI, Jenkins, Azure Pipelines.
