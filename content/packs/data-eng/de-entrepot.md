Où ranger les données de l'entreprise pour les analyser ? Trois architectures se sont succédé : l'**entrepôt de données**, le **data lake**, puis le **lakehouse** qui combine les deux.

## L'entrepôt de données (data warehouse)

Une base **analytique** (OLAP), stockée en colonnes, optimisée pour les requêtes d'analyse sur de gros volumes. Les données y sont **structurées**, nettoyées et modélisées. Exemples cloud : **BigQuery**, **Snowflake**, **Redshift**, **Synapse/Fabric**.

## Le data lake

Un **lac de données** stocke **tout**, brut, à bas coût, sur du stockage objet : fichiers structurés (CSV, Parquet), semi-structurés (JSON), non structurés (images, documents, journaux). On y garde l'historique brut et on choisit plus tard comment l'exploiter.

:::attention Le marécage de données
Un data lake sans organisation ni documentation devient un **data swamp** : des milliers de fichiers dont personne ne sait ce qu'ils contiennent ni s'ils sont fiables. Catalogue, conventions de nommage et qualité sont indispensables.
:::

## Le lakehouse

Le **lakehouse** apporte au data lake les qualités de l'entrepôt grâce aux formats de table ouverts (Iceberg, Delta, Hudi) : transactions ACID, schémas, performances, gouvernance — sur un stockage objet bon marché, lisible par plusieurs moteurs (Spark, Trino, DuckDB, les entrepôts cloud…). Databricks a popularisé le terme ; tous les grands acteurs le proposent désormais sous une forme ou une autre.

## L'architecture en médaillon

Une convention très répandue organise les données en trois couches de qualité croissante :

| Couche | Contenu | Règles |
|---|---|---|
| **Bronze** (brut) | les données telles que reçues | jamais modifiées, historisées |
| **Silver** (nettoyé) | données nettoyées, typées, dédoublonnées, conformes | une ligne = une entité métier propre |
| **Gold** (métier) | agrégats et modèles prêts à l'emploi | tables pour les tableaux de bord, l'IA, les métiers |

:::retenir
Conserver la couche **bronze** intacte permet de **tout recalculer** si une règle de transformation était fausse. C'est un filet de sécurité précieux.
:::

## À retenir

- Entrepôt : structuré, modélisé, rapide pour l'analyse (BigQuery, Snowflake, Redshift, Fabric).
- Data lake : tout, brut, bon marché, sur stockage objet — attention au marécage.
- Lakehouse : formats de table ouverts (Iceberg, Delta) = qualités de l'entrepôt sur le lac.
- Médaillon : bronze (brut, intact) → silver (propre) → gold (métier).
