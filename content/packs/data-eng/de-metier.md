Les entreprises produisent des données partout : caisses, sites web, applications mobiles, capteurs, logiciels de gestion. Mais ces données sont dispersées, hétérogènes, souvent sales. Le **data engineer** construit les systèmes qui les **collectent**, les **nettoient**, les **organisent** et les **mettent à disposition** — de façon fiable, automatique et sécurisée.

## Le cycle de vie de la donnée

```text
Génération → Ingestion → Stockage → Transformation → Mise à disposition
(applications,  (collecte)   (data lake,   (nettoyage,       (tableaux de bord,
 capteurs, API)               entrepôt)     modélisation)     IA, API, exports)
```

Autour de ce cycle, des préoccupations transverses : **sécurité**, **qualité**, **gouvernance**, **orchestration**, **coûts**, **observabilité**.

:::analogie Pour comprendre
Le data engineer est le plombier et le traiteur de l'eau de l'entreprise : il capte l'eau à différentes sources, la fait passer par la station d'épuration, la stocke dans des réservoirs et l'amène, propre, à chaque robinet. Si un tuyau fuit ou si l'eau est polluée, c'est lui qu'on appelle.
:::

## Batch ou streaming

- **Traitement par lots** (*batch*) : on traite les données par paquets, à intervalles (chaque nuit, chaque heure). Simple, robuste, la majorité des besoins.
- **Flux continu** (*streaming*) : on traite chaque événement à son arrivée, en secondes. Indispensable pour la détection de fraude, le suivi en temps réel ; plus complexe.

## ETL ou ELT

- **ETL** (*Extract, Transform, Load*) : on extrait, on **transforme avant** de charger dans l'entrepôt. Approche historique, quand le stockage et le calcul de l'entrepôt coûtaient cher.
- **ELT** (*Extract, Load, Transform*) : on charge d'abord les données **brutes** dans l'entrepôt ou le lakehouse, puis on les transforme **sur place**, en SQL. Approche dominante avec le cloud : stockage bon marché, calcul élastique, données brutes conservées pour retraiter si besoin.

:::retenir
Les qualités d'un pipeline professionnel : **fiable** (il ne perd ni ne duplique rien), **idempotent** (le relancer ne crée pas de doublons), **observable** (on sait quand et pourquoi il échoue), **testé**, **documenté**, **sécurisé** et **économe**.
:::

## La boîte à outils (aperçu)

| Étape | Outils fréquents |
|---|---|
| Langages | SQL, Python (et parfois Scala, Java) |
| Ingestion | scripts Python, Airbyte, Fivetran, Kafka, Debezium (CDC) |
| Stockage | stockage objet (S3, ADLS, GCS), entrepôts (BigQuery, Snowflake, Redshift), lakehouse (Databricks, Iceberg/Delta) |
| Transformation | SQL + dbt, Spark, pandas/Polars |
| Orchestration | Airflow, Dagster, Prefect |
| Qualité | tests dbt, Great Expectations, Soda |
| Infrastructure | Docker, Kubernetes, Terraform, CI/CD |

## À retenir

- Le data engineer construit les pipelines : ingestion, stockage, transformation, mise à disposition.
- Batch (la majorité des besoins) ou streaming (temps réel).
- ETL (transformer avant) vs ELT (charger brut, transformer dans l'entrepôt) — l'ELT domine dans le cloud.
- Un bon pipeline est fiable, idempotent, observable, testé, documenté, sécurisé, économe.
