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
