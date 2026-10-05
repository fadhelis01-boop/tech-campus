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
