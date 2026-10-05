<!-- @lecon iac-pourquoi -->
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

<!-- @lecon iac-terraform -->
**Terraform** est l'outil d'IaC le plus répandu. Il décrit l'infrastructure dans un langage lisible, le **HCL**, et sait piloter des centaines de services (AWS, Azure, Google Cloud, Kubernetes, GitHub, DNS…) grâce à ses **providers**.

## Les blocs de base

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"   # Paris
}

resource "aws_s3_bucket" "donnees" {
  bucket = "techcampus-donnees-brutes"
  tags = {
    projet = "pipeline-ventes"
    env    = "dev"
  }
}
```

- `terraform { … }` : la configuration de Terraform, dont les providers et leurs versions ;
- `provider "aws"` : la connexion au fournisseur (région…) ; les identifiants ne s'écrivent **jamais** ici, ils viennent de l'environnement ;
- `resource "type" "nom"` : une ressource à créer. Le **type** (`aws_s3_bucket`) vient du provider ; le **nom** (`donnees`) est un nom local pour y faire référence ailleurs (`aws_s3_bucket.donnees.arn`).

## Le cycle de travail

```bash
terraform init      # télécharge les providers
terraform fmt       # met en forme les fichiers
terraform validate  # vérifie la syntaxe
terraform plan      # montre ce qui VA changer, sans rien toucher
terraform apply     # applique les changements (après confirmation)
terraform destroy   # supprime tout ce qui a été créé
```

:::retenir
**Lisez toujours le plan.** Il indique, ressource par ressource, ce qui sera créé (`+`), modifié (`~`) ou **détruit** (`-`). Un `destroy` inattendu sur une base de données doit vous arrêter immédiatement.
:::

## Les références entre ressources

```hcl
resource "aws_vpc" "principal" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "prive_a" {
  vpc_id            = aws_vpc.principal.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "eu-west-3a"
}
```

`aws_vpc.principal.id` fait référence à l'identifiant du VPC, connu seulement après sa création : Terraform en déduit l'**ordre** de création (le VPC d'abord). Il construit un graphe de dépendances… un DAG, comme vu en algorithmique.

## À retenir

- HCL : blocs `terraform`, `provider`, `resource "type" "nom"`.
- Cycle : init → fmt → validate → plan → apply (destroy pour tout supprimer).
- Toujours lire le plan (+ créé, ~ modifié, − détruit).
- Les références (`type.nom.attribut`) définissent l'ordre de création.

<!-- @lecon iac-variables -->
Le même code doit servir à créer l'environnement de développement, de recette et de production, avec des tailles différentes. Les **variables**, les **sorties** et les **modules** rendent le code Terraform réutilisable.

## Les variables

```hcl
variable "environnement" {
  type        = string
  description = "Nom de l'environnement (dev, recette, prod)"
}

variable "nb_instances" {
  type    = number
  default = 1
}

resource "aws_s3_bucket" "donnees" {
  bucket = "techcampus-${var.environnement}-donnees"
}
```

On les renseigne dans un fichier `terraform.tfvars` (un par environnement), ou en ligne de commande (`-var`), ou par des variables d'environnement `TF_VAR_…`.

:::attention
Un mot de passe passé en variable doit être marqué `sensitive = true` (il n'apparaîtra pas dans les affichages) — et idéalement provenir d'un gestionnaire de secrets plutôt que d'un fichier.
:::

## Les sorties

```hcl
output "nom_du_bucket" {
  value = aws_s3_bucket.donnees.bucket
}
```

Les **sorties** affichent les informations utiles après l'application (adresse d'un équilibreur, nom d'un compartiment) et permettent à d'autres configurations de les réutiliser.

## Les locales et les boucles

```hcl
locals {
  etiquettes = {
    projet = "pipeline-ventes"
    env    = var.environnement
  }
}

resource "aws_s3_bucket" "zones" {
  for_each = toset(["bronze", "silver", "gold"])
  bucket   = "techcampus-${var.environnement}-${each.key}"
  tags     = local.etiquettes
}
```

`for_each` crée une ressource par élément : ici trois compartiments, un par zone du data lake.

## Les modules

Un **module** est un dossier de fichiers Terraform réutilisable, avec ses variables (entrées) et ses sorties :

```hcl
module "reseau" {
  source         = "./modules/reseau"
  cidr           = "10.0.0.0/16"
  environnement  = var.environnement
}
```

On construit ainsi une bibliothèque de briques testées (réseau, base, cluster), assemblées différemment selon les projets. Des modules publics existent aussi sur le **Terraform Registry**.

## À retenir

- `variable` (entrées, avec type et description), `output` (sorties), `locals` (valeurs calculées).
- `${var.nom}` dans les chaînes ; `for_each` pour créer plusieurs ressources.
- Un `terraform.tfvars` par environnement ; secrets marqués `sensitive`.
- Modules : des briques réutilisables avec entrées et sorties.

<!-- @lecon iac-etat -->
Comment Terraform sait-il ce qu'il a déjà créé ? Grâce à son **état** (*state*). C'est la notion la plus importante — et la plus dangereuse — de Terraform. Mal gérée, elle mène à des ressources en double, à des suppressions accidentelles ou à des fuites de secrets.

## Le fichier d'état

Après chaque `apply`, Terraform enregistre dans `terraform.tfstate` la correspondance entre votre code et les ressources réelles (identifiants, attributs). Au `plan` suivant, il compare : **code** (ce que vous voulez) ↔ **état** (ce qu'il a créé) ↔ **réalité** (ce qui existe chez le fournisseur).

:::attention L'état contient des secrets
Le fichier d'état peut contenir des valeurs sensibles (mots de passe de bases générés…). Il ne doit **jamais** être commité dans Git. Ajoutez `*.tfstate*` et `.terraform/` au `.gitignore`.
:::

## L'état distant (backend)

En équipe, l'état ne peut pas rester sur le poste de chacun. On le stocke dans un **backend distant** :

```hcl
terraform {
  backend "s3" {
    bucket       = "techcampus-etats-terraform"
    key          = "pipeline-ventes/prod.tfstate"
    region       = "eu-west-3"
    encrypt      = true
    use_lockfile = true
  }
}
```

- stockage partagé et **chiffré** (compartiment avec versionnage) ;
- **verrouillage** (*locking*) : deux personnes ne peuvent pas appliquer en même temps et corrompre l'état.

Équivalents : backend `azurerm` (Azure Storage), `gcs` (Google Cloud Storage), ou HCP Terraform.

## La dérive

Si quelqu'un modifie une ressource à la main dans la console, la réalité ne correspond plus au code : c'est la **dérive**. Le prochain `plan` la détecte et propose de revenir à ce que dit le code. D'où la règle : **toute modification passe par le code**.

## Le travail en équipe

:::methode Le flux de travail IaC en équipe
1. Une branche Git par modification de l'infrastructure.
2. La pull request déclenche automatiquement `fmt`, `validate` et `plan` ; le plan est affiché dans la PR.
3. Un collègue relit **le code et le plan**.
4. Après fusion, la chaîne d'intégration exécute `apply` avec des droits dédiés.
5. Personne n'applique depuis son poste en production.
:::

## À retenir

- L'état relie le code aux ressources réelles ; il peut contenir des secrets : jamais dans Git.
- Backend distant chiffré, versionné, avec verrouillage.
- Dérive = modification manuelle ; le plan la révèle ; tout passe par le code.
- En équipe : plan dans la PR, revue, apply automatisé après fusion.

<!-- @lecon iac-ansible -->
Terraform crée les machines ; il faut ensuite les **configurer** : installer des paquets, déposer des fichiers de configuration, démarrer des services. C'est le domaine de la **gestion de configuration**, dont **Ansible** est l'outil le plus populaire.

## Les principes d'Ansible

- **Sans agent** : Ansible se connecte aux machines en SSH, rien à installer dessus.
- **Déclaratif et idempotent** : on décrit l'état voulu (« le paquet nginx est installé ») ; relancer ne change rien si c'est déjà le cas.
- **YAML** : les **playbooks** sont des fichiers YAML lisibles.

## Inventaire et playbook

L'**inventaire** liste les machines, groupées :

```ini
[web]
web1.example.com
web2.example.com

[bases]
base1.example.com
```

Le **playbook** décrit ce qu'il faut faire sur quels groupes :

```yaml
- name: Configurer les serveurs web
  hosts: web
  become: true
  tasks:
    - name: Installer nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Déployer la page d'accueil
      ansible.builtin.copy:
        src: index.html
        dest: /var/www/html/index.html

    - name: Démarrer nginx au démarrage
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

```bash
ansible-playbook -i inventaire.ini site.yml
```

- `hosts` : le groupe de machines ciblé ;
- `become: true` : exécuter avec les droits d'administrateur ;
- chaque tâche appelle un **module** (`apt`, `copy`, `service`, `template`, `user`…) avec l'état voulu.

## Terraform et Ansible ensemble

| Terraform | Ansible |
|---|---|
| crée et supprime l'infrastructure | configure ce qui tourne dessus |
| garde un état | sans état (vérifie à chaque exécution) |
| idéal pour les ressources cloud | idéal pour les systèmes et logiciels |

:::futur Tendance
Avec les conteneurs et Kubernetes, on configure de moins en moins des machines « à la main » : on construit des **images** (immuables) et on les remplace. Ansible reste très utilisé pour les parcs de serveurs existants, les équipements réseau et l'automatisation d'opérations.
:::

## À retenir

- Ansible : sans agent (SSH), idempotent, playbooks YAML.
- Inventaire (machines par groupes) + playbook (tâches par groupe) + modules (apt, copy, service…).
- `ansible-playbook -i inventaire site.yml`.
- Terraform crée, Ansible configure ; l'infrastructure immuable réduit le besoin de configuration manuelle.

<!-- @lecon iac-pratiques -->
L'IaC donne un pouvoir considérable : une ligne modifiée peut supprimer une base de production. Les bonnes pratiques et les **garde-fous automatiques** (*policy as code*) sont indispensables.

## Organiser son code

```text
infra/
├── modules/
│   ├── reseau/
│   └── base_donnees/
├── environnements/
│   ├── dev/        (main.tf, terraform.tfvars, backend dev)
│   ├── recette/
│   └── prod/
└── README.md
```

- Un état **par environnement** (une erreur en dev ne touche pas la prod).
- Des modules versionnés et documentés.
- Les versions des providers **fixées**.

## Protéger les ressources critiques

```hcl
resource "aws_db_instance" "principale" {
  # …
  deletion_protection = true

  lifecycle {
    prevent_destroy = true
  }
}
```

`prevent_destroy` fait échouer tout plan qui détruirait la ressource.

## Policy as code

Des règles automatiques vérifient le code ou le plan **avant** l'application :

- « aucun compartiment de stockage public » ;
- « toute ressource porte les étiquettes projet et env » ;
- « pas de port 22 ouvert sur Internet ».

Outils : **OPA** (Open Policy Agent) avec Conftest, **Checkov**, **tfsec/Trivy**, Sentinel (HashiCorp). On les intègre à la chaîne d'intégration : une pull request qui viole une règle est bloquée.

:::metier En entreprise
Dans une équipe mature, personne n'a le droit de modifier la production à la main. Tout changement d'infrastructure passe par une pull request, des vérifications automatiques (format, validation, sécurité, coût estimé), une revue humaine, puis une application automatisée et tracée. C'est le **GitOps** appliqué à l'infrastructure.
:::

## À retenir

- Modules réutilisables, un état par environnement, versions fixées.
- `prevent_destroy` et la protection contre la suppression pour les ressources critiques.
- Policy as code (OPA, Checkov, Trivy) dans la CI pour bloquer les configurations dangereuses.
- En production, tout passe par Git, revue et application automatisée.
