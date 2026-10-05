Chaque fournisseur a ses propres noms de services, mais les **concepts** sont les mêmes partout. Apprendre un cloud en profondeur, puis savoir faire la correspondance avec les autres : c'est la bonne stratégie.

## La table de correspondance

| Besoin | AWS | Azure | Google Cloud |
|---|---|---|---|
| Machine virtuelle | EC2 | Virtual Machines | Compute Engine |
| Stockage objet | S3 | Blob Storage | Cloud Storage |
| Base relationnelle managée | RDS, Aurora | Azure SQL, Database for PostgreSQL | Cloud SQL, AlloyDB |
| Base NoSQL clé-valeur | DynamoDB | Cosmos DB | Firestore, Bigtable |
| Entrepôt de données | Redshift | Synapse, Fabric | BigQuery |
| Fonctions serverless | Lambda | Functions | Cloud Run functions |
| Conteneurs serverless | Fargate, App Runner | Container Apps | Cloud Run |
| Kubernetes managé | EKS | AKS | GKE |
| Réseau virtuel | VPC | Virtual Network (VNet) | VPC |
| Identités et droits | IAM | Microsoft Entra ID + RBAC | IAM |
| Supervision | CloudWatch | Azure Monitor | Cloud Monitoring/Logging |
| Infrastructure as code native | CloudFormation | Bicep/ARM | Deployment Manager / Terraform |

## Les acteurs européens et la souveraineté

- **OVHcloud** (France), **Scaleway** (France), **Outscale** (filiale de Dassault Systèmes), **IONOS**, **Open Telekom Cloud**…
- En France, l'ANSSI délivre la qualification **SecNumCloud** aux offres répondant à des exigences élevées de sécurité et de protection contre les lois extraterritoriales. Elle est attendue pour certaines données sensibles des administrations et des opérateurs d'importance vitale.
- Des offres « de confiance » associent la technologie d'un grand fournisseur américain à un opérateur européen (par exemple S3NS, coentreprise de Thales et Google Cloud, ou Bleu, d'Orange et Capgemini avec Microsoft).

:::attention
Le paysage des offres souveraines évolue vite (qualifications, partenariats) : vérifiez la liste à jour des offres qualifiées sur le site de l'ANSSI avant toute recommandation.
:::

## Choisir un premier cloud à apprendre

:::methode Conseil
1. Regardez les offres d'emploi de votre région : quel cloud revient le plus ?
2. À défaut, **AWS** a la plus grande part de marché et le plus de ressources d'apprentissage ; **Azure** est très présent dans les grandes entreprises françaises ; **Google Cloud** est apprécié pour la data (BigQuery).
3. Apprenez-en un en profondeur ; les concepts se transposent aux autres en quelques semaines.
:::

:::astuce Pratiquer sans se ruiner
Les trois grands fournisseurs proposent des **offres gratuites** (crédits à l'ouverture, services gratuits dans certaines limites). Avant toute expérimentation : activez une **alerte de budget**, et supprimez vos ressources à la fin de chaque séance.
:::

## À retenir

- Mêmes concepts, noms différents : EC2/VM/Compute Engine, S3/Blob/Cloud Storage…
- Acteurs européens et qualification SecNumCloud pour les besoins de souveraineté.
- Apprendre un cloud à fond, puis transposer.
- Comptes gratuits + alertes de budget + suppression des ressources après usage.
