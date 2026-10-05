Dans la pratique, les data engineers travaillent sur des **plateformes** cloud qui intègrent stockage, calcul, SQL, orchestration et gouvernance. Les connaître (au moins de nom et dans leurs principes) est indispensable pour lire les offres d'emploi et choisir une certification.

## Le panorama

| Plateforme | Éditeur | Points forts |
|---|---|---|
| **BigQuery** | Google Cloud | entrepôt serverless : aucun serveur à gérer, facturation au volume lu ou à la capacité |
| **Snowflake** | Snowflake (multicloud) | séparation stockage/calcul, entrepôts virtuels élastiques, partage de données |
| **Databricks** | Databricks (multicloud) | lakehouse autour de Spark et Delta Lake, data engineering et IA sur la même plateforme |
| **Redshift** | AWS | entrepôt intégré à l'écosystème AWS, version serverless |
| **Microsoft Fabric** | Microsoft | plateforme unifiée (lakehouse OneLake, entrepôt, Power BI), certification DP-700 |
| **Moteurs ouverts** | Trino, DuckDB, ClickHouse | requêtes SQL sur des fichiers ouverts ; analytique rapide |

## Les principes communs

- **Séparation du stockage et du calcul** : les données dorment sur un stockage bon marché ; on allume la puissance de calcul nécessaire, seulement quand il faut.
- **SQL** comme langage principal.
- **Formats ouverts** de plus en plus (Iceberg, Delta) pour éviter l'enfermement chez un éditeur.
- **Facturation à l'usage** : chaque requête a un coût. Partitionner, ne lire que les colonnes utiles, éviter `SELECT *` sur les grosses tables.

:::piege Piège classique
Dans BigQuery (facturation au volume lu), un `SELECT *` sur une table de plusieurs To peut coûter des dizaines d'euros… même avec un `LIMIT 10`, qui ne réduit pas les données lues. Utilisez l'aperçu de table, sélectionnez les colonnes et filtrez sur la colonne de partition.
:::

## Comment choisir ?

Le choix dépend surtout de l'existant : le fournisseur cloud de l'entreprise, les compétences de l'équipe, les besoins (SQL analytique pur, ou data engineering + IA), le budget. Pour vous former, maîtrisez **SQL** et les **concepts** (stockage/calcul, partitionnement, formats ouverts) : ils se transposent d'une plateforme à l'autre. Puis approfondissez celle que demandent les offres de votre région, éventuellement jusqu'à sa certification (voir l'onglet Certifications).

## À retenir

- BigQuery, Snowflake, Databricks, Redshift, Fabric : les grandes plateformes ; Trino, DuckDB, ClickHouse : moteurs ouverts.
- Principes communs : stockage/calcul séparés, SQL, formats ouverts, facturation à l'usage.
- Maîtriser les coûts : colonnes utiles, filtre sur la partition, pas de `SELECT *`.
- Apprendre les concepts, puis la plateforme demandée localement.
