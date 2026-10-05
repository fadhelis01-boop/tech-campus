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
