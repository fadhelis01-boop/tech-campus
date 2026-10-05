<!-- @lecon devops-culture -->
Pendant longtemps, les **développeurs** (qui veulent livrer vite) et les **exploitants** (qui veulent que rien ne casse) travaillaient séparément, et se renvoyaient la faute à chaque incident. **DevOps** est né pour abattre ce mur : une culture et des pratiques où l'on livre souvent, de façon fiable, en partageant la responsabilité de la production.

## Ce que DevOps n'est pas

- Ce n'est pas **un outil** (même si les outils comptent).
- Ce n'est pas seulement **un poste** (« l'ingénieur DevOps »), même si le métier existe.
- C'est une **façon de travailler** : petites livraisons fréquentes, automatisation, mesure, amélioration continue, responsabilité partagée.

## Le cadre CALMS

| Lettre | Principe |
|---|---|
| **C**ulture | collaboration, responsabilité partagée, pas de recherche de coupable |
| **A**utomatisation | tests, construction, déploiement, infrastructure |
| **L**ean | petits lots, élimination des gaspillages, flux continu |
| **M**esure | on mesure pour décider (performances, incidents, satisfaction) |
| **S**hare (partage) | connaissances, outils, retours d'expérience |

## Mesurer la performance : les indicateurs DORA

Les recherches du programme **DORA** (*DevOps Research and Assessment*) ont identifié quatre indicateurs qui distinguent les équipes performantes :

| Indicateur | Question |
|---|---|
| **Fréquence de déploiement** | À quelle fréquence livre-t-on en production ? |
| **Délai de mise en production** (*lead time*) | Combien de temps entre un commit et sa mise en production ? |
| **Taux d'échec des changements** | Quelle proportion des déploiements provoque un incident ? |
| **Temps de rétablissement** | Combien de temps pour rétablir le service après un incident ? |

:::retenir
Les équipes les plus performantes livrent **à la fois plus vite et plus sûrement** : vitesse et stabilité ne s'opposent pas. Le secret : de **petits** changements, testés automatiquement, faciles à annuler.
:::

## Les pratiques clés

- **Intégration continue** (CI) : fusionner souvent, chaque changement est testé automatiquement.
- **Livraison et déploiement continus** (CD) : chaque changement validé peut partir (ou part) en production automatiquement.
- **Infrastructure as code** et **GitOps**.
- **Observabilité** et **gestion des incidents** sans recherche de coupable.

:::metier En entreprise
L'ingénieur DevOps construit et entretient la « chaîne » qui va du code à la production (*pipeline* CI/CD), les environnements, l'observabilité, et accompagne les équipes de développement. Le **platform engineering** pousse l'idée plus loin : offrir aux développeurs une plateforme interne en libre-service.
:::

## À retenir

- DevOps : culture et pratiques pour livrer souvent et de façon fiable, responsabilité partagée.
- CALMS : Culture, Automatisation, Lean, Mesure, Partage.
- DORA : fréquence de déploiement, délai de mise en production, taux d'échec, temps de rétablissement.
- Petits changements testés et réversibles : vitesse ET stabilité.

<!-- @lecon devops-ci -->
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

<!-- @lecon devops-cd -->
Une fois le code testé, il faut l'amener en production. La **livraison continue** (*Continuous Delivery*) garantit que chaque version validée **peut** être déployée à tout moment ; le **déploiement continu** (*Continuous Deployment*) la déploie **automatiquement**. Encore faut-il le faire sans interrompre le service, et pouvoir revenir en arrière.

## Le pipeline de déploiement

```text
commit → CI (tests) → construction de l'image → déploiement en recette
       → tests automatisés / validation → déploiement en production → surveillance
```

Chaque environnement reçoit **le même artefact** (la même image Docker, identifiée par sa version) : on ne reconstruit jamais entre la recette et la production.

## Les stratégies de déploiement

| Stratégie | Principe | Avantage | Inconvénient |
|---|---|---|---|
| **Recréation** | arrêter l'ancienne version, démarrer la nouvelle | simple | interruption de service |
| **Progressive** (*rolling*) | remplacer les instances petit à petit | pas d'interruption | deux versions coexistent un moment |
| **Bleu/vert** (*blue/green*) | déployer la nouvelle version à côté, puis basculer tout le trafic | retour arrière instantané | double infrastructure pendant la bascule |
| **Canari** (*canary*) | envoyer d'abord une petite part du trafic (5 %) à la nouvelle version, surveiller, puis augmenter | risque limité, détection réelle | plus complexe, nécessite une bonne surveillance |

:::analogie Pour comprendre
Le canari descendait autrefois dans les mines : s'il allait mal, les mineurs savaient que l'air était dangereux. Le déploiement canari envoie quelques utilisateurs en éclaireurs : si les indicateurs se dégradent, on arrête avant que tout le monde soit touché.
:::

## Les drapeaux de fonctionnalité

Les **feature flags** permettent de déployer du code **désactivé**, puis de l'activer pour certains utilisateurs, sans redéployer. On dissocie ainsi le **déploiement** (technique) de la **mise à disposition** (décision métier).

## Le retour arrière

:::retenir
Tout déploiement doit avoir un plan de **retour arrière** (*rollback*) testé : redéployer la version précédente, basculer le trafic (bleu/vert), désactiver un drapeau. Les changements de base de données, difficiles à annuler, se font de façon **rétrocompatible** (ajouter une colonne avant de s'en servir, ne la supprimer que plus tard).
:::

## À retenir

- Livraison continue (prêt à déployer) vs déploiement continu (déployé automatiquement).
- Un seul artefact versionné, promu d'environnement en environnement.
- Recréation, progressive, bleu/vert, canari : interruption vs risque vs coût.
- Feature flags pour dissocier déploiement et mise à disposition ; toujours un plan de retour arrière.

<!-- @lecon devops-tests -->
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

<!-- @lecon devops-gitops -->
Comment savoir ce qui tourne réellement en production ? Qui a déployé quoi ? Comment revenir à l'état d'hier ? Le **GitOps** répond : **Git est la source de vérité** de l'état voulu des systèmes, et un agent automatique fait en sorte que la réalité y corresponde.

## Le principe

1. L'état voulu (manifestes Kubernetes, valeurs Helm, code Terraform) est décrit dans un dépôt Git.
2. Toute modification passe par une **pull request** (revue, tests, traçabilité).
3. Un **agent** (Argo CD, Flux) surveille le dépôt et **applique** automatiquement les changements au cluster.
4. Il détecte aussi la **dérive** : si quelqu'un modifie le cluster à la main, l'agent le signale ou le corrige.

:::retenir
Avec le GitOps, **déployer = fusionner une pull request**, et **revenir en arrière = annuler un commit**. L'historique Git devient le journal de bord complet de la production.
:::

## Pousser ou tirer

- **Modèle « push »** (classique) : la CI se connecte au cluster et applique. Elle a besoin d'identifiants puissants.
- **Modèle « pull »** (GitOps) : l'agent, **dans** le cluster, tire les changements du dépôt. Aucun identifiant du cluster ne sort.

## Les environnements

Une organisation courante : un dépôt (ou un dossier) par environnement, ou des valeurs Helm par environnement.

```text
deploiement/
├── base/                (manifestes communs)
├── dev/                 (surcharges : 1 réplica, image :latest du jour)
├── recette/
└── prod/                (3 réplicas, image versionnée 2.4.1)
```

La **promotion** d'une version vers la production consiste à modifier le numéro de version dans `prod/` par une pull request.

:::metier En entreprise
Le GitOps est devenu la façon standard de gérer les déploiements Kubernetes dans de nombreuses équipes, et s'étend à l'infrastructure (Terraform piloté par Git). Il rassure aussi les auditeurs : chaque changement en production est tracé, relu et réversible.
:::

## À retenir

- Git = source de vérité de l'état voulu ; un agent (Argo CD, Flux) applique et détecte la dérive.
- Déployer = fusionner ; revenir en arrière = annuler un commit.
- Modèle pull : aucun identifiant du cluster ne sort.
- Un dossier ou des valeurs par environnement ; promotion par pull request.

<!-- @lecon devops-observabilite -->
Quand un utilisateur se plaint que « c'est lent », il faut pouvoir répondre en minutes : quoi, où, depuis quand, pourquoi. C'est l'**observabilité** : la capacité à comprendre l'état interne d'un système à partir de ce qu'il émet.

## Les trois piliers

| Pilier | Ce que c'est | Exemple | Outils |
|---|---|---|---|
| **Métriques** | des nombres mesurés dans le temps | requêtes/s, taux d'erreur, latence, CPU | Prometheus, CloudWatch, Azure Monitor |
| **Journaux** (*logs*) | des événements horodatés | « paiement refusé pour la commande 1042 » | Loki, Elasticsearch/OpenSearch, Cloud Logging |
| **Traces** | le parcours d'une requête à travers les services | API → service paiement → base (320 ms dont 280 en base) | OpenTelemetry, Jaeger, Tempo |

**Grafana** affiche tout cela dans des tableaux de bord ; **OpenTelemetry** est le standard ouvert pour instrumenter les applications.

:::astuce Des journaux exploitables
Écrivez des journaux **structurés** (en JSON, avec des champs : niveau, horodatage, identifiant de requête, utilisateur) plutôt que des phrases libres : ils se filtrent et s'agrègent facilement.
:::

## Les signaux d'or

Pour un service, quatre métriques suffisent souvent à savoir s'il va bien (les « signaux d'or » du livre *Site Reliability Engineering* de Google) : **latence**, **trafic**, **erreurs**, **saturation**.

## SLI, SLO, SLA et budget d'erreur

- **SLI** (*Service Level Indicator*) : ce que l'on mesure. « Proportion de requêtes réussies en moins de 300 ms. »
- **SLO** (*Service Level Objective*) : l'objectif interne. « 99,5 % sur 30 jours. »
- **SLA** (*Service Level Agreement*) : l'engagement contractuel envers le client (moins exigeant que le SLO, avec pénalités).
- **Budget d'erreur** : 100 % − SLO. Avec un SLO de 99,5 %, on « a le droit » à 0,5 % d'échecs.

:::retenir
Le budget d'erreur arbitre entre vitesse et fiabilité : tant qu'il reste du budget, on peut livrer des nouveautés ; s'il est épuisé, on se concentre sur la fiabilité.
:::

## Les alertes

On alerte sur les **symptômes** vus par les utilisateurs (le SLO est menacé, le taux d'erreur monte), pas sur chaque cause possible (un CPU à 80 % n'est pas forcément un problème). Une alerte doit être **actionnable** : si personne ne doit rien faire en la recevant, ce n'est pas une alerte.

## À retenir

- Métriques, journaux (structurés), traces ; OpenTelemetry pour instrumenter, Grafana pour visualiser.
- Signaux d'or : latence, trafic, erreurs, saturation.
- SLI (mesure), SLO (objectif), SLA (contrat), budget d'erreur = 100 % − SLO.
- Alerter sur les symptômes, avec des alertes actionnables.

<!-- @lecon devops-sre -->
Les pannes arriveront. Ce qui distingue une équipe mature, c'est sa façon de les **gérer** (vite, calmement, en communiquant) et d'en **apprendre** (pour qu'elles ne se reproduisent pas). C'est l'un des cœurs du métier de **SRE** (*Site Reliability Engineer*), né chez Google.

## Le cycle d'un incident

1. **Détection** : une alerte (ou, moins bien, un utilisateur).
2. **Mobilisation** : l'ingénieur d'astreinte prend l'incident ; on désigne un **responsable d'incident** qui coordonne.
3. **Diagnostic et atténuation** : d'abord **rétablir le service** (retour arrière, bascule, ajout de capacité), ensuite seulement chercher la cause profonde.
4. **Communication** : informer régulièrement les utilisateurs et la direction (page de statut).
5. **Résolution** puis **post-mortem**.

:::retenir
En incident, la priorité est de **rétablir** le service, pas de trouver le coupable ni même la cause exacte. Un retour arrière immédiat vaut mieux qu'une heure de diagnostic en production.
:::

## Le post-mortem sans reproche

Après un incident significatif, l'équipe rédige un **post-mortem** :

- **Résumé** : ce qui s'est passé, l'impact (durée, utilisateurs touchés).
- **Chronologie** : détection, actions, rétablissement.
- **Causes** : la cause déclenchante et les causes profondes (« pourquoi ? » plusieurs fois).
- **Ce qui a bien marché / moins bien marché.**
- **Actions** : des améliorations concrètes, avec un responsable et une date.

:::attention Sans reproche (*blameless*)
On cherche ce qui, dans le système (outils, processus, documentation), a permis l'erreur — pas la personne à blâmer. Si les gens ont peur d'être sanctionnés, ils cachent les problèmes, et l'organisation n'apprend plus rien.
:::

## Réduire le « labeur »

Les SRE cherchent à réduire le **labeur** (*toil*) : le travail manuel, répétitif, automatisable, sans valeur durable (relancer un service à la main chaque semaine). Objectif : l'automatiser pour libérer du temps pour l'amélioration.

## Les astreintes

L'astreinte (*on-call*) se prépare : des **runbooks** (procédures écrites pour chaque alerte), des alertes peu nombreuses et pertinentes, une rotation équitable, et du repos après une nuit difficile.

## À retenir

- Incident : détecter, mobiliser, rétablir d'abord, communiquer, résoudre, analyser.
- Post-mortem sans reproche : chronologie, causes profondes, actions avec responsable et date.
- Réduire le labeur par l'automatisation.
- Astreintes préparées : runbooks, alertes pertinentes, rotation et repos.
