Quand les données ne tiennent plus sur une seule machine (des centaines de Go, des To), on répartit le calcul sur un **cluster**. **Apache Spark** est le moteur de traitement distribué le plus utilisé, notamment au cœur de Databricks et des services managés des fournisseurs cloud.

## L'idée du calcul distribué

Les données sont découpées en **partitions**, réparties sur plusieurs machines (les **exécuteurs**). Chaque exécuteur traite ses partitions en parallèle ; un **pilote** (*driver*) coordonne.

:::analogie Pour comprendre
Compter les votes d'une élection nationale : on ne fait pas tout dépouiller par une seule personne. Chaque bureau de vote compte ses bulletins (traitement local, en parallèle), puis on additionne les résultats des bureaux (agrégation). Spark fait de même avec les partitions.
:::

## Un exemple en PySpark

```python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("ventes").getOrCreate()

ventes = spark.read.parquet("s3://datalake/silver/ventes/")
resultat = (
    ventes
    .filter(F.col("statut") == "livrée")
    .groupBy("region")
    .agg(F.sum("montant").alias("ca"), F.countDistinct("client_id").alias("clients"))
    .orderBy(F.desc("ca"))
)
resultat.write.mode("overwrite").parquet("s3://datalake/gold/ca_par_region/")
```

La syntaxe ressemble beaucoup à pandas… et à SQL. On peut d'ailleurs écrire directement du SQL : `spark.sql("SELECT …")`.

## L'évaluation paresseuse

Spark n'exécute **rien** tant qu'une **action** ne le demande pas :

- les **transformations** (`filter`, `select`, `groupBy`, `join`) construisent un plan ;
- les **actions** (`count`, `show`, `collect`, `write`) déclenchent le calcul.

Cela permet à Spark d'**optimiser** tout le plan avant de l'exécuter (par exemple, filtrer le plus tôt possible et ne lire que les colonnes utiles dans les fichiers Parquet).

## Le shuffle, ennemi de la performance

Certaines opérations (`groupBy`, `join`, `orderBy`) obligent à **redistribuer** les données entre les machines selon une clé : c'est le **shuffle**, coûteux en réseau et en disque.

:::methode Accélérer un traitement Spark
1. Filtrer et ne sélectionner que les colonnes utiles **avant** les jointures.
2. Joindre une petite table à une grande par **diffusion** (*broadcast join*) : la petite table est copiée sur chaque machine, sans shuffle.
3. Surveiller le **déséquilibre** (*skew*) : une clé très fréquente surcharge une seule machine.
4. Choisir un nombre de partitions adapté au volume.
5. Lire l'interface de Spark (Spark UI) pour voir quelle étape coûte le plus.
:::

:::astuce
N'utilisez Spark que si nécessaire. Jusqu'à quelques dizaines de Go, **DuckDB** ou **Polars** sur une seule machine sont souvent plus simples et plus rapides, et un entrepôt cloud (SQL) fait très bien l'affaire.
:::

## À retenir

- Spark répartit les données en partitions traitées en parallèle par des exécuteurs, coordonnés par un pilote.
- PySpark : `read`, `filter`, `groupBy().agg()`, `write` ; ou du SQL.
- Évaluation paresseuse : transformations (plan) vs actions (exécution).
- Le shuffle coûte cher : filtrer tôt, broadcast join, attention au skew.
- Pas de Spark sans nécessité : DuckDB, Polars ou l'entrepôt suffisent souvent.
