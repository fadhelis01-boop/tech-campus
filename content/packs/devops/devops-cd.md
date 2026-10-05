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
