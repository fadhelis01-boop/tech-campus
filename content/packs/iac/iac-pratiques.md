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
