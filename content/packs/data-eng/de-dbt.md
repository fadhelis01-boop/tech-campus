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
