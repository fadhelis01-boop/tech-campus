« Combien de commandes par mois ? », « quel chiffre d'affaires par catégorie ? » : les questions métier sont presque toujours des **agrégations**. C'est le domaine de `GROUP BY`.

## Les fonctions d'agrégat

```sql
SELECT COUNT(*) AS nb_produits,
       AVG(prix) AS prix_moyen,
       MIN(prix) AS moins_cher,
       MAX(prix) AS plus_cher,
       SUM(prix) AS total
FROM produits;
```

Elles « résument » toutes les lignes en une seule. `COUNT(*)` compte les lignes ; `COUNT(colonne)` compte les valeurs **non NULL** de la colonne.

## GROUP BY : un résumé par groupe

```sql
SELECT categorie,
       COUNT(*) AS nb,
       ROUND(AVG(prix), 2) AS prix_moyen
FROM produits
GROUP BY categorie;
```

:::analogie Pour comprendre
`GROUP BY` fait des piles : une pile par catégorie. Puis les fonctions d'agrégat résument chaque pile (combien de produits, quel prix moyen). C'est exactement le « regroupement » que vous avez écrit à la main en Python avec un dictionnaire.
:::

:::piege Piège classique
Toute colonne du `SELECT` qui n'est pas dans une fonction d'agrégat **doit** figurer dans le `GROUP BY`. `SELECT categorie, nom, COUNT(*) … GROUP BY categorie` n'a pas de sens : quel `nom` afficher pour une pile qui en contient plusieurs ? (PostgreSQL refuse ; SQLite accepte et choisit au hasard, ce qui est pire.)
:::

## HAVING : filtrer les groupes

`WHERE` filtre les **lignes** avant le regroupement ; `HAVING` filtre les **groupes** après :

```sql
SELECT categorie, COUNT(*) AS nb
FROM produits
WHERE prix > 20
GROUP BY categorie
HAVING COUNT(*) >= 2
ORDER BY nb DESC;
```

## L'ordre d'exécution

SQL ne s'exécute pas dans l'ordre où il s'écrit :

1. `FROM` (quelles tables)
2. `WHERE` (quelles lignes)
3. `GROUP BY` (quelles piles)
4. `HAVING` (quelles piles garder)
5. `SELECT` (quelles colonnes, calculs)
6. `ORDER BY` (dans quel ordre)
7. `LIMIT`

C'est pourquoi on ne peut pas utiliser dans `WHERE` un alias défini dans le `SELECT` : il n'existe pas encore.

## À retenir

- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` résument des lignes.
- `GROUP BY` : un résumé par groupe ; toute colonne non agrégée doit y figurer.
- `WHERE` filtre les lignes, `HAVING` filtre les groupes.
- Ordre d'exécution : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.
