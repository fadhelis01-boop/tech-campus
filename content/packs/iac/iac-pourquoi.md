Créer un réseau, trois machines et une base de données en cliquant dans la console du fournisseur cloud : une heure de travail… impossible à refaire à l'identique, à relire ou à corriger proprement. L'**infrastructure as code** (IaC) décrit l'infrastructure dans des fichiers texte, versionnés dans Git, appliqués automatiquement.

## Les problèmes du « clic dans la console »

- **Pas reproductible** : recréer un environnement de test identique à la production est un casse-tête.
- **Pas traçable** : qui a ouvert ce port ? quand ? pourquoi ?
- **Pas relu** : une erreur passe directement en production.
- **Dérive** (*drift*) : au fil des corrections manuelles, plus personne ne sait ce qui est réellement configuré.

## Ce que change l'IaC

:::retenir
Avec l'IaC, l'infrastructure suit le même cycle que le code : écrite dans des fichiers, versionnée dans Git, relue en pull request, testée, appliquée automatiquement. Le fichier est la **source de vérité**.
:::

## Déclaratif ou impératif

- **Impératif** : on décrit les **étapes** (« crée une machine, puis ouvre le port 443 »). Un script qui le fait deux fois crée deux machines.
- **Déclaratif** : on décrit l'**état voulu** (« il doit exister une machine avec le port 443 ouvert »). L'outil compare avec l'existant et ne fait que ce qui manque.

:::analogie Pour comprendre
Impératif : « Avance de 100 mètres, tourne à gauche, avance de 50 mètres. » Déclaratif : « Je veux être au 12 rue des Lilas. » Le GPS calcule le chemin, quel que soit votre point de départ.
:::

Le déclaratif rend les opérations **idempotentes** : appliquer deux fois la même description ne change rien la seconde fois.

## Les outils

| Outil | Approche | Usage principal |
|---|---|---|
| **Terraform** / **OpenTofu** | déclaratif, multi-fournisseurs | créer l'infrastructure (réseaux, machines, bases, droits) |
| CloudFormation (AWS), Bicep (Azure) | déclaratif, propre à un fournisseur | idem, dans un seul cloud |
| Pulumi | déclaratif, dans un langage de programmation (Python, TypeScript) | idem |
| **Ansible** | surtout déclaratif, sans agent | configurer des machines existantes (paquets, fichiers, services) |

:::futur Tendance
**OpenTofu** est un fork libre de Terraform, né en 2023 après le changement de licence de Terraform, et hébergé par la Linux Foundation. Les deux restent très proches dans leur usage ; ce module utilise la syntaxe commune (HCL).
:::

## À retenir

- IaC : l'infrastructure décrite dans des fichiers, versionnés, relus, appliqués automatiquement.
- Évite la non-reproductibilité, l'absence de traces et la dérive.
- Déclaratif (état voulu, idempotent) plutôt qu'impératif (étapes).
- Terraform/OpenTofu pour créer, Ansible pour configurer.
