Une requête qui met 0,1 seconde sur 1 000 lignes peut mettre une heure sur 100 millions. Comprendre les **index** et lire un **plan d'exécution** est ce qui permet de passer à l'échelle.

## L'index

:::analogie Pour comprendre
Sans index, chercher un client par son nom oblige à lire toute la table, comme chercher un mot dans un livre sans index en le lisant page par page. Un **index** est l'index alphabétique à la fin du livre : il indique directement où se trouve l'information.
:::

```sql
CREATE INDEX idx_commandes_client ON commandes(client_id);
```

- La clé primaire est indexée automatiquement.
- On indexe les colonnes souvent utilisées dans `WHERE`, `JOIN` et `ORDER BY`.

:::attention Les index ont un coût
Chaque index occupe de la place et **ralentit les écritures** (il faut le mettre à jour à chaque INSERT/UPDATE). On n'indexe pas tout : on indexe ce que les requêtes utilisent vraiment.
:::

## Lire le plan d'exécution

Le SGBD décide **comment** exécuter une requête (lire toute la table, utiliser un index, dans quel ordre faire les jointures). `EXPLAIN` montre ce plan :

```sql
EXPLAIN QUERY PLAN
SELECT * FROM commandes WHERE client_id = 3;
```

En SQLite, `SCAN commandes` signifie « lecture complète de la table », `SEARCH commandes USING INDEX …` « recherche via un index ». En PostgreSQL, `EXPLAIN ANALYZE` exécute la requête et affiche les temps réels de chaque étape.

## Les bonnes pratiques de performance

:::methode Écrire des requêtes efficaces
1. Ne sélectionner que les colonnes utiles (pas de `SELECT *` en production).
2. Filtrer le plus tôt possible (`WHERE` avant les jointures et agrégations).
3. Éviter les fonctions sur une colonne indexée dans le `WHERE` (`WHERE UPPER(nom) = 'ADA'` empêche d'utiliser l'index sur `nom`).
4. Vérifier le plan d'exécution des requêtes lentes.
5. Sur les entrepôts cloud (BigQuery, Snowflake), filtrer sur la colonne de **partition** (souvent la date) : on paie au volume lu.
:::

## À retenir

- Un index accélère les lectures ciblées, ralentit les écritures.
- Indexer les colonnes des WHERE, JOIN, ORDER BY fréquents.
- `EXPLAIN` (SQLite : SCAN vs SEARCH ; PostgreSQL : `EXPLAIN ANALYZE`).
- Colonnes utiles seulement, filtrer tôt, pas de fonction sur une colonne indexée, filtrer sur la partition.
