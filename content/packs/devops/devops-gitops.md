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
