<!-- @lecon de-metier -->
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

<!-- @lecon de-formats -->
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

<!-- @lecon de-pandas -->
**pandas** est la bibliothèque Python de référence pour manipuler des données tabulaires. Elle est idéale pour explorer, nettoyer et transformer des volumes qui tiennent en mémoire (jusqu'à quelques millions de lignes). Les exemples s'exécutent dans le labo (pandas se charge automatiquement, une quinzaine de Mo la première fois).

## Le DataFrame

```python
import pandas as pd

df = pd.DataFrame({
    "client": ["Ada", "Linus", "Grace", "Ada", "Ken"],
    "ville": ["Lyon", "Paris", "Lyon", "Lyon", "Lille"],
    "montant": [120, 80, 45, 60, 200],
})
print(df)
print(df.dtypes)
print(df.describe())
```

Un **DataFrame** est un tableau dont chaque colonne (une **Series**) a un type. On lit souvent les données depuis un fichier : `pd.read_csv("ventes.csv")`, `pd.read_parquet(...)`, `pd.read_json(...)`.

## Sélectionner et filtrer

```python
print(df["montant"].sum())
print(df[df["montant"] > 50])
print(df[(df["ville"] == "Lyon") & (df["montant"] > 50)])
print(df.loc[df["client"] == "Ada", ["ville", "montant"]])
```

:::piege Piège classique
Pour combiner des conditions, on utilise `&` (et), `|` (ou), avec des **parenthèses** autour de chaque condition — pas `and`/`or`.
:::

## Transformer

```python
df["montant_ttc"] = (df["montant"] * 1.2).round(2)
df["ville"] = df["ville"].str.upper()
df = df.rename(columns={"client": "nom_client"})
df = df.sort_values("montant", ascending=False)
print(df)
```

## Agréger : groupby

```python
resume = df.groupby("ville").agg(
    nb_commandes=("montant", "count"),
    ca=("montant", "sum"),
    panier_moyen=("montant", "mean"),
).reset_index()
print(resume)
```

C'est le `GROUP BY` de SQL, en Python.

## Joindre : merge

```python
villes = pd.DataFrame({"ville": ["LYON", "PARIS"], "region": ["Auvergne-Rhône-Alpes", "Île-de-France"]})
print(df.merge(villes, on="ville", how="left"))
```

`how="left"` correspond au `LEFT JOIN`.

## Les valeurs manquantes

```python
print(df.isna().sum())          # nombre de valeurs manquantes par colonne
df = df.dropna(subset=["montant"])
df["ville"] = df["ville"].fillna("inconnue")
```

:::futur Tendance
**Polars**, une bibliothèque plus récente écrite en Rust, gagne du terrain : beaucoup plus rapide sur de gros volumes, avec une syntaxe proche. **DuckDB** permet aussi d'exécuter du SQL directement sur des fichiers Parquet ou des DataFrames. Les concepts (filtrer, grouper, joindre) restent les mêmes.
:::

## À retenir

- DataFrame = tableau typé ; `read_csv`, `read_parquet`, `read_json`.
- Filtrer : `df[(cond1) & (cond2)]` ; sélectionner : `df.loc[lignes, colonnes]`.
- Transformer : nouvelles colonnes, `str`, `rename`, `sort_values`.
- `groupby(...).agg(...)` = GROUP BY ; `merge(..., how=...)` = JOIN.
- `isna`, `dropna`, `fillna` pour les valeurs manquantes.

<!-- @lecon de-etl -->
Assez de théorie : construisons un **pipeline**. Un pipeline ETL extrait des données d'une source, les transforme et les charge dans une destination. Écrit proprement, il est découpé en fonctions testables, idempotent et observable.

## La structure type

```python
import csv, io, logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def extraire(texte_csv):
    """Lit le CSV source et renvoie une liste de dictionnaires (tout en texte)."""
    return list(csv.DictReader(io.StringIO(texte_csv)))

def transformer(lignes):
    """Nettoie, convertit les types, écarte les lignes invalides."""
    propres, rejets = [], []
    for l in lignes:
        try:
            propres.append({
                "date": l["date"].strip(),
                "produit": l["produit"].strip().lower(),
                "montant": round(float(l["montant"].replace(",", ".")), 2),
            })
        except (ValueError, KeyError):
            rejets.append(l)
    logging.info("%d lignes valides, %d rejetées", len(propres), len(rejets))
    return propres, rejets

def charger(lignes, destination):
    """Charge de façon idempotente : remplace les données des dates concernées."""
    dates = {l["date"] for l in lignes}
    destination[:] = [d for d in destination if d["date"] not in dates] + lignes

source = "date,produit,montant\n2026-10-05,Clavier,89.9\n2026-10-05,Souris,29,9\n2026-10-05,Écran,n/a\n"
entrepot = []
propres, rejets = transformer(extraire(source))
charger(propres, entrepot)
charger(propres, entrepot)   # relancer ne crée pas de doublon
print(entrepot)
```

## L'idempotence, encore

:::retenir
Un pipeline sera relancé : après un échec, pour rattraper une journée, par erreur. S'il **ajoute** des lignes à chaque exécution, chaque relance crée des doublons. Les stratégies idempotentes :
- **remplacer une partition** (supprimer puis réinsérer la journée traitée, dans une transaction) ;
- **upsert** sur une clé (`MERGE`, `INSERT … ON CONFLICT`) ;
- écrire dans un fichier ou une partition dont le nom dépend de la date traitée (et l'écraser).
:::

## Incrémental ou complet

- **Chargement complet** (*full load*) : on recharge tout à chaque fois. Simple, pour les petites tables.
- **Chargement incrémental** : on ne traite que les nouveautés depuis la dernière exécution (par date de modification, ou par une capture des changements — **CDC**, *Change Data Capture*, qui lit le journal de la base source). Indispensable pour les gros volumes.

## Rendre le pipeline observable

- Journaliser chaque étape (début, fin, nombre de lignes, rejets).
- Vérifier des **seuils** (moins de 5 % de rejets, volume comparable à la veille).
- Exposer des métriques (durée, lignes traitées) et alerter en cas d'échec.

## À retenir

- Extraire → transformer → charger, chacun dans une fonction testable.
- Isoler les lignes invalides plutôt que de tout faire échouer, mais alerter au-delà d'un seuil.
- Idempotence : remplacer une partition ou upsert, jamais d'ajout aveugle.
- Incrémental (date de modification, CDC) pour les gros volumes ; journaux et seuils pour l'observabilité.

<!-- @lecon de-entrepot -->
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

<!-- @lecon de-modelisation -->
Dans un entrepôt de données, on ne range pas les données comme dans la base d'une application. On les organise pour que les analystes posent facilement leurs questions : c'est la **modélisation dimensionnelle**, popularisée par Ralph Kimball, et toujours la référence.

## Faits et dimensions

- Une table de **faits** enregistre des **événements mesurables** : une vente, un clic, un paiement. Elle contient des **mesures** (quantité, montant) et des clés vers les dimensions. Elle est longue (beaucoup de lignes).
- Une table de **dimension** décrit le **contexte** : le produit, le client, le magasin, la date. Elle contient des **attributs** descriptifs (nom, catégorie, région). Elle est large (beaucoup de colonnes) et plus courte.

## Le schéma en étoile

```text
               dim_date
                  │
dim_produit ── fait_ventes ── dim_magasin
                  │
              dim_client
```

La table de faits au centre, les dimensions autour : une **étoile**. Les requêtes d'analyse suivent toujours le même motif :

```sql
SELECT d.mois, p.categorie, SUM(f.montant) AS ca
FROM fait_ventes AS f
JOIN dim_date AS d ON d.date_id = f.date_id
JOIN dim_produit AS p ON p.produit_id = f.produit_id
GROUP BY d.mois, p.categorie
ORDER BY d.mois, ca DESC;
```

Ouvrez le labo SQL avec la base « Entrepôt de données (schéma en étoile) » pour l'essayer.

## Le grain

:::retenir
Avant toute chose, définissez le **grain** de la table de faits : que représente **exactement** une ligne ? « Une ligne par produit vendu par ticket de caisse » n'est pas le même grain que « une ligne par ticket ». Mélanger deux grains dans une même table est la source d'erreurs de calcul la plus fréquente.
:::

## Les dimensions qui changent (SCD)

Un client déménage de Lyon à Lille. Faut-il réécrire sa ville, au risque d'attribuer à Lille ses achats passés faits à Lyon ? Les **dimensions à évolution lente** (*Slowly Changing Dimensions*) proposent plusieurs stratégies :

- **Type 1** : on écrase l'ancienne valeur (pas d'historique).
- **Type 2** : on **ajoute une nouvelle ligne** pour la nouvelle version, avec des dates de validité (`valide_du`, `valide_au`) et un indicateur `actuel`. L'historique est conservé : les ventes passées restent rattachées à Lyon.

## Étoile ou flocon

Le schéma en **flocon** normalise les dimensions (la catégorie dans sa propre table). Plus économe en stockage, mais plus de jointures : avec les entrepôts en colonnes, l'étoile, plus simple, est généralement préférée.

## À retenir

- Faits (événements, mesures) et dimensions (contexte, attributs).
- Schéma en étoile : faits au centre, dimensions autour ; requêtes = jointures + GROUP BY.
- Définir le grain avant tout.
- SCD type 1 (écraser) ou type 2 (historiser avec des dates de validité).

<!-- @lecon de-dbt -->
Dans l'approche ELT, les données brutes sont dans l'entrepôt ; il reste à les transformer en SQL. **dbt** (*data build tool*) est devenu l'outil standard pour organiser ces transformations comme un vrai projet logiciel : versionné, testé, documenté.

## Le principe

Dans dbt, chaque **modèle** est un fichier `.sql` qui contient un simple `SELECT`. dbt se charge de le transformer en table ou en vue dans l'entrepôt, **dans le bon ordre**.

```sql
-- models/staging/stg_commandes.sql
SELECT
    id AS commande_id,
    client_id,
    CAST(date_commande AS DATE) AS date_commande,
    LOWER(statut) AS statut
FROM {{ source('boutique', 'commandes') }}
```

```sql
-- models/marts/fct_ca_par_client.sql
SELECT
    c.client_id,
    COUNT(*) AS nb_commandes
FROM {{ ref('stg_commandes') }} AS c
WHERE c.statut = 'livrée'
GROUP BY c.client_id
```

- `{{ source(...) }}` désigne une table brute déclarée ;
- `{{ ref('nom_du_modele') }}` désigne un autre modèle : dbt en déduit les **dépendances** et construit un graphe (un DAG) pour exécuter les modèles dans le bon ordre.

## Les tests de données

Dans un fichier YAML, on déclare des **tests** sur les colonnes :

```yaml
version: 2

models:
  - name: stg_commandes
    description: Commandes nettoyées, une ligne par commande.
    columns:
      - name: commande_id
        description: Identifiant unique de la commande.
        data_tests:
          - unique
          - not_null
      - name: statut
        data_tests:
          - accepted_values:
              arguments:
                values: ["livrée", "en cours", "annulée"]
      - name: client_id
        data_tests:
          - relationships:
              arguments:
                to: ref('stg_clients')
                field: client_id
```

`dbt test` vérifie ces règles à chaque exécution : un doublon ou une valeur inattendue fait échouer le pipeline **avant** que les tableaux de bord ne soient faux.

:::attention La syntaxe évolue
Les versions récentes de dbt utilisent la clé `data_tests` (l'ancienne clé `tests` reste acceptée) et placent les paramètres des tests sous `arguments`. Vérifiez la documentation de la version utilisée par votre équipe.
:::

## Les commandes

```bash
dbt run           # construit les modèles
dbt test          # exécute les tests
dbt build         # run + test, dans l'ordre du graphe
dbt docs generate # génère la documentation et le graphe de lignage
```

## Les bonnes pratiques de structure

| Couche | Préfixe | Rôle |
|---|---|---|
| staging | `stg_` | une vue par table source : renommer, typer, nettoyer légèrement |
| intermediate | `int_` | jointures et calculs intermédiaires |
| marts | `fct_`, `dim_` | tables finales de faits et de dimensions pour les métiers |

## À retenir

- dbt : chaque modèle est un `SELECT` ; `ref()` et `source()` construisent le graphe des dépendances.
- Tests de données en YAML : unique, not_null, accepted_values, relationships.
- `dbt build` construit et teste dans l'ordre ; documentation et lignage générés.
- Couches staging → intermediate → marts.

<!-- @lecon de-orchestration -->
Un pipeline réel enchaîne des dizaines de tâches : extraire de trois sources, charger, transformer, tester, rafraîchir un tableau de bord, prévenir en cas d'échec. Il faut les lancer **dans le bon ordre**, **au bon moment**, **réessayer** en cas d'erreur, et garder un **historique**. C'est le travail d'un **orchestrateur**, dont **Apache Airflow** est le plus répandu.

## Le DAG

Dans Airflow, un pipeline est un **DAG** (graphe orienté acyclique) écrit en Python : des **tâches** et leurs **dépendances**.

```python
from datetime import datetime, timedelta
from airflow.sdk import dag, task

@dag(
    schedule="0 3 * * *",           # chaque jour à 3 h
    start_date=datetime(2026, 1, 1),
    catchup=False,
    default_args={"retries": 3, "retry_delay": timedelta(minutes=5)},
    tags=["ventes"],
)
def pipeline_ventes():

    @task
    def extraire():
        ...

    @task
    def transformer(donnees):
        ...

    @task
    def charger(donnees_propres):
        ...

    charger(transformer(extraire()))

pipeline_ventes()
```

- `schedule` : la planification (une expression cron, ou `@daily`, ou déclenchée par l'arrivée de données) ;
- `retries` : nombre de nouvelles tentatives automatiques en cas d'échec ;
- les appels imbriqués définissent les **dépendances** ; avec des opérateurs classiques, on écrit `extraire >> transformer >> charger`.

:::attention Les versions d'Airflow
Airflow 3 (sorti en 2025) a fait évoluer les imports (le module `airflow.sdk`) et plusieurs paramètres. De nombreux tutoriels utilisent encore la syntaxe d'Airflow 2 (`from airflow.decorators import dag, task`, `schedule_interval`). Vérifiez la version utilisée dans votre équipe et la documentation correspondante.
:::

## Les notions clés

- **Exécution par intervalle** : chaque exécution traite une période (le jour d'hier). La date logique de l'exécution sert à rendre la tâche idempotente (« je traite les ventes du 2026-10-04 »).
- **Rattrapage** (*backfill*) : relancer le DAG sur des périodes passées (après une correction, ou à la création du pipeline).
- **Capteurs** (*sensors*) : attendre une condition (un fichier arrivé) avant de continuer.
- **Alertes** : notification en cas d'échec ou de dépassement de durée.

:::retenir
Airflow **orchestre**, il ne doit pas **calculer**. Les traitements lourds s'exécutent ailleurs (dans l'entrepôt via SQL/dbt, dans Spark, dans un conteneur Kubernetes) ; Airflow les déclenche et les surveille.
:::

## Les alternatives

**Dagster** (centré sur les « actifs » de données produits), **Prefect** (très pythonique), et les orchestrateurs des plateformes (Databricks Workflows, Azure Data Factory, Google Cloud Composer qui héberge Airflow).

## À retenir

- Orchestrateur : ordre, planification, réessais, historique, alertes.
- DAG Airflow en Python : tâches + dépendances ; `schedule`, `retries`, `catchup`.
- Exécution par intervalle et date logique = idempotence ; backfill pour rattraper.
- Airflow orchestre, ne calcule pas ; Airflow 3 a changé des imports : vérifier la version.

<!-- @lecon de-qualite -->
Un tableau de bord faux est pire qu'un tableau de bord absent : on prend de mauvaises décisions en toute confiance. La **qualité des données** est une responsabilité centrale du data engineer.

## Les dimensions de la qualité

| Dimension | Question | Exemple de test |
|---|---|---|
| **Complétude** | Les données attendues sont-elles là ? | pas de valeur nulle dans `client_id` ; volume du jour comparable à la veille |
| **Unicité** | Pas de doublon ? | `commande_id` unique |
| **Validité** | Les valeurs respectent-elles les règles ? | montant ≥ 0 ; statut dans une liste ; format d'e-mail |
| **Cohérence** | Les données concordent-elles entre elles ? | chaque `client_id` existe dans la table clients ; total = somme des lignes |
| **Fraîcheur** | Les données sont-elles à jour ? | dernière ligne de moins de 24 h |
| **Exactitude** | Reflètent-elles la réalité ? | rapprochement avec la comptabilité |

## Où tester ?

- **À l'entrée** (bronze → silver) : rejeter ou isoler ce qui est invalide.
- **Après transformation** : tests dbt, Great Expectations, Soda.
- **En continu** : surveillance des volumes, de la fraîcheur, des distributions (outils d'**observabilité des données**).

## Bloquer ou alerter ?

:::methode Graduer la réponse
- **Bloquant** : une erreur qui rendrait les résultats faux (doublons de commandes, clés orphelines) arrête le pipeline avant la publication.
- **Avertissement** : une anomalie à examiner (volume en baisse de 20 %) déclenche une alerte sans bloquer.
- **Quarantaine** : les lignes invalides sont mises de côté, avec la raison, pour être corrigées à la source.
:::

## Les contrats de données

Un **contrat de données** (*data contract*) formalise l'accord entre l'équipe qui produit les données (l'application) et celles qui les consomment : schéma, types, règles de qualité, fraîcheur, responsable. Un changement de schéma non annoncé (une colonne renommée) est l'une des premières causes de pipelines cassés ; le contrat le rend visible et testable en amont.

## À retenir

- Complétude, unicité, validité, cohérence, fraîcheur, exactitude.
- Tester à l'entrée, après transformation, et surveiller en continu.
- Bloquer ce qui fausse les résultats, alerter sur les anomalies, mettre en quarantaine les lignes invalides.
- Contrats de données entre producteurs et consommateurs.

<!-- @lecon de-spark -->
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

<!-- @lecon de-streaming -->
Certaines décisions ne peuvent pas attendre le traitement de la nuit : bloquer une transaction frauduleuse, alerter sur une panne de capteur, mettre à jour un stock en temps réel. Le **streaming** traite les données comme un **flux continu d'événements**. **Apache Kafka** en est la plateforme de référence.

## Les concepts de Kafka

| Concept | Rôle |
|---|---|
| **Événement** (message) | un fait : « commande 1042 passée à 10 h 02 » (clé, valeur, horodatage) |
| **Producteur** | l'application qui publie des événements |
| **Topic** | un flux nommé d'événements (`commandes`, `paiements`) |
| **Partition** | un topic est découpé en partitions, pour répartir la charge ; l'ordre est garanti **dans** une partition |
| **Consommateur** | l'application qui lit les événements |
| **Groupe de consommateurs** | plusieurs instances se partagent les partitions d'un topic |
| **Offset** | la position de lecture d'un consommateur dans une partition |

Kafka **conserve** les événements pendant une durée configurée : un nouveau consommateur peut relire l'historique, et un consommateur tombé en panne reprend là où il s'était arrêté.

:::analogie Pour comprendre
Kafka ressemble à un journal de bord partagé, découpé en carnets (les partitions). Les producteurs y écrivent à la suite ; chaque lecteur garde un marque-page (l'offset) et lit à son rythme, sans gêner les autres lecteurs.
:::

## Le traitement de flux

On calcule souvent des agrégats sur des **fenêtres de temps** :

- **fenêtre fixe** (*tumbling*) : 10 h 00-10 h 05, 10 h 05-10 h 10… ;
- **fenêtre glissante** (*sliding/hopping*) : les 5 dernières minutes, recalculées chaque minute ;
- **fenêtre de session** : regroupée par période d'activité d'un utilisateur.

Moteurs de traitement de flux : **Apache Flink**, **Spark Structured Streaming**, **Kafka Streams**, ou les services managés (Kinesis, Event Hubs, Pub/Sub + Dataflow).

## Les difficultés propres au streaming

- **Temps de l'événement vs temps de traitement** : un événement survenu à 10 h 02 peut arriver à 10 h 07 (réseau, panne). On raisonne sur l'heure de l'événement, avec une tolérance aux retardataires (*watermark*).
- **Garanties de livraison** : au plus une fois, **au moins une fois** (le plus courant : il faut alors gérer les doublons), exactement une fois (plus coûteux).
- **Évolution des schémas** : gérée avec un registre de schémas (Avro, Protobuf).

## La capture des changements (CDC)

**Debezium** lit le journal de transactions d'une base (PostgreSQL, MySQL) et publie chaque insertion, modification ou suppression dans Kafka. On obtient un flux fidèle des changements, sans surcharger la base par des requêtes.

## À retenir

- Kafka : producteurs → topics (partitions, rétention) → consommateurs (groupes, offsets).
- L'ordre n'est garanti que dans une partition ; la clé détermine la partition.
- Fenêtres fixes, glissantes, de session ; Flink, Spark Streaming, Kafka Streams.
- Temps de l'événement, retardataires, au moins une fois (gérer les doublons), schémas versionnés.
- CDC (Debezium) pour diffuser les changements d'une base.

<!-- @lecon de-plateformes -->
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

<!-- @lecon de-gouvernance -->
Plus une organisation a de données, plus il devient difficile de savoir **ce qui existe**, **d'où ça vient**, **qui en est responsable**, **qui a le droit de le voir**, et **si c'est fiable**. La **gouvernance des données** répond à ces questions — et elle conditionne la confiance dans tous les chiffres et toutes les IA de l'entreprise.

## Les briques de la gouvernance

| Brique | Rôle | Exemples d'outils |
|---|---|---|
| **Catalogue** | inventaire des jeux de données, avec description, propriétaire, mots-clés | DataHub, OpenMetadata, Unity Catalog, Microsoft Purview, Dataplex |
| **Lignage** | d'où vient chaque donnée et ce qui en dépend | dbt docs, OpenLineage, catalogues |
| **Glossaire métier** | définitions partagées (qu'est-ce qu'un « client actif » ?) | catalogues |
| **Contrôle d'accès** | qui voit quoi, jusqu'à la ligne et à la colonne | droits de l'entrepôt, masquage dynamique, politiques |
| **Qualité** | règles, mesures, incidents | tests dbt, Great Expectations, Soda |
| **Conformité** | données personnelles, durées de conservation, RGPD | classification, purge automatique |

:::metier En entreprise
Le **lignage** sauve des journées entières : quand un chiffre du tableau de bord semble faux, il montre immédiatement toutes les tables et transformations en amont ; quand on veut modifier une table, il montre tout ce qui en dépend et risque de casser.
:::

## Les rôles

- **Propriétaire des données** (*data owner*) : responsable métier d'un domaine de données.
- **Intendant des données** (*data steward*) : veille au quotidien sur la qualité et les définitions.
- **Équipes data** : implémentent les outils et les contrôles.

## Le data mesh

Le **data mesh** est une approche d'organisation pour les grandes entreprises : plutôt qu'une équipe data centrale débordée, chaque **domaine métier** (ventes, logistique, finance) est responsable de ses données, publiées comme des **produits de données** documentés, fiables et accessibles, sur une plateforme commune, avec une gouvernance fédérée. C'est une démarche organisationnelle autant que technique, adoptée de façon plus ou moins complète selon les entreprises.

## À retenir

- Gouvernance : catalogue, lignage, glossaire, accès, qualité, conformité.
- Le lignage accélère les diagnostics et sécurise les changements.
- Propriétaires et intendants des données, avec les équipes data.
- Data mesh : domaines responsables de leurs produits de données, plateforme commune, gouvernance fédérée.

<!-- @lecon de-projet -->
Vous avez parcouru toutes les briques. Il est temps de les assembler dans un **projet de bout en bout**, celui qui figurera en tête de votre portfolio et nourrira vos entretiens. Cette leçon donne le cahier des charges et la méthode ; l'exercice associé est corrigé par l'assistant.

## Le cahier des charges

Construire un pipeline qui :

1. **ingère** chaque jour un jeu de données ouvert réel (par exemple sur data.gouv.fr : prix des carburants, qualité de l'air, fréquentation des transports) ;
2. le stocke **brut** (bronze), puis **nettoyé** (silver), en Parquet, partitionné par date ;
3. le **modélise** en étoile dans une base analytique (DuckDB ou PostgreSQL, ou un entrepôt cloud gratuit) ;
4. le **transforme** avec dbt, avec des **tests** de qualité ;
5. est **orchestré** (Airflow ou Dagster) avec réessais et alertes ;
6. alimente un **tableau de bord** simple (Metabase, Superset, Streamlit) ;
7. tourne dans **Docker Compose** ; le code est sur **GitHub** avec une **CI** (lint + tests) ;
8. bonus : l'infrastructure cloud décrite en **Terraform**.

## La méthode

:::methode Avancer par itérations
1. **Version 0** (un week-end) : un script Python qui télécharge, nettoie et écrit un fichier. Committez.
2. **Version 1** : découpage en fonctions, tests unitaires, Docker. Committez.
3. **Version 2** : base analytique, modèle en étoile, dbt et ses tests.
4. **Version 3** : orchestration quotidienne, journaux, alertes.
5. **Version 4** : tableau de bord, README soigné avec schéma d'architecture.
6. **Version 5** (bonus) : déploiement cloud avec Terraform et CI/CD.
:::

Chaque version doit **fonctionner** : mieux vaut un petit pipeline complet qu'un grand pipeline à moitié fini.

## Ce que regardera un recruteur

- Le **README** : problème, architecture, choix techniques et leurs raisons, comment lancer.
- La **qualité du code** : fonctions, tests, gestion des erreurs, pas de secret commité.
- Les **choix** : pourquoi Parquet, pourquoi ce partitionnement, comment l'idempotence est garantie.
- Votre capacité à **expliquer** les difficultés rencontrées et comment vous les avez surmontées.

## À retenir

- Un projet de bout en bout : ingestion, bronze/silver/gold, étoile, dbt + tests, orchestration, tableau de bord, Docker, CI.
- Avancer par versions qui fonctionnent, en committant à chaque étape.
- Le README et les explications comptent autant que le code.
