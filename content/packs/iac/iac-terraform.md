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
