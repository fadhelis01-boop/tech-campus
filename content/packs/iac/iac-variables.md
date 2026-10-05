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
