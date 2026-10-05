Le choix du format de fichier change tout : la taille stockée (et donc le coût), la vitesse des requêtes, la capacité à faire évoluer les colonnes. Un data engineer doit savoir choisir.

## Les formats texte : CSV et JSON

| Format | Forces | Faiblesses |
|---|---|---|
| **CSV** | universel, lisible, ouvert par tous les outils | pas de types (tout est texte), séparateurs et encodages variables, pas de structure imbriquée |
| **JSON** | structures imbriquées, format des API | verbeux, lent à lire en masse, types limités |
| **JSON Lines** (`.jsonl`) | un objet JSON par ligne : se lit en flux, se découpe facilement | idem JSON |

## Les formats binaires analytiques : Parquet et Avro

- **Parquet** : stockage **en colonnes**, compressé, typé, avec des statistiques par bloc. Le standard des data lakes et de l'analyse.
- **Avro** : stockage **en lignes**, avec un schéma intégré et gérant bien l'évolution des schémas. Fréquent dans le streaming (Kafka).
- **ORC** : proche de Parquet, historique de l'écosystème Hadoop.

## Lignes ou colonnes ?

:::analogie Pour comprendre
Un tableau de 100 colonnes et 100 millions de lignes. Question : « quelle est la moyenne des montants ? ». En **lignes**, il faut lire chaque ligne en entier (les 100 colonnes) pour en extraire une seule valeur. En **colonnes**, on lit uniquement la colonne « montant », stockée d'un seul tenant : 100 fois moins de données à lire.
:::

| | Orienté lignes (CSV, Avro, bases transactionnelles) | Orienté colonnes (Parquet, entrepôts) |
|---|---|---|
| Idéal pour | écrire et lire des enregistrements complets | analyser quelques colonnes sur beaucoup de lignes |
| Compression | moyenne | excellente (valeurs similaires côte à côte) |

## Partitionnement

On range souvent les fichiers par **partitions**, par exemple par date :

```text
ventes/annee=2026/mois=10/jour=05/part-0000.parquet
```

Une requête qui filtre sur une date ne lit que les dossiers concernés (*partition pruning*). C'est l'un des leviers les plus efficaces pour réduire temps et coût.

:::piege Piège classique
Trop de partitions (par heure et par client, par exemple) produit des millions de petits fichiers : le problème des « petits fichiers » ralentit tout. Visez des fichiers de taille raisonnable (de l'ordre de la centaine de Mo).
:::

## Les formats de table ouverts

Au-dessus des fichiers Parquet, les formats de **table** **Apache Iceberg**, **Delta Lake** et **Apache Hudi** ajoutent des transactions ACID, la gestion des schémas, le « voyage dans le temps » (lire la table telle qu'elle était hier) et des mises à jour efficaces. Ils sont au cœur des architectures **lakehouse**.

## À retenir

- CSV (universel, sans types), JSON/JSONL (imbriqué, API), Parquet (colonnes, analytique), Avro (lignes, streaming).
- Colonnes : idéal pour l'analyse et la compression ; lignes : idéal pour les écritures d'enregistrements.
- Partitionner par date, sans multiplier les petits fichiers.
- Iceberg, Delta, Hudi : des tables transactionnelles sur des fichiers Parquet.
