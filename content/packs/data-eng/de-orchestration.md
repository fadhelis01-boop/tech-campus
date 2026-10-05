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
