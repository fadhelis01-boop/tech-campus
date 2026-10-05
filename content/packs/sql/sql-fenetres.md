« Le rang de chaque produit dans sa catégorie », « le cumul des ventes jour après jour », « la différence avec la commande précédente » : ces questions, impossibles avec un simple `GROUP BY`, se résolvent avec les **fonctions de fenêtre**. Elles reviennent dans presque tous les entretiens de data engineer.

## Le principe

Une fonction de fenêtre calcule une valeur **pour chaque ligne**, en regardant un ensemble de lignes voisines (la « fenêtre »), **sans** regrouper les lignes.

```sql
SELECT nom, categorie, prix,
       AVG(prix) OVER (PARTITION BY categorie) AS prix_moyen_categorie
FROM produits;
```

- `OVER (…)` indique que c'est une fonction de fenêtre ;
- `PARTITION BY categorie` : la fenêtre de chaque ligne = les produits de sa catégorie ;
- chaque produit garde sa ligne, avec la moyenne de sa catégorie à côté.

:::analogie Pour comprendre
`GROUP BY` écrase chaque pile en une seule ligne. Une fonction de fenêtre laisse toutes les lignes en place, et écrit à côté de chacune une information sur sa pile.
:::

## Classer : ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT nom, categorie, prix,
       ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY prix DESC) AS rang
FROM produits;
```

| Fonction | Ex aequo |
|---|---|
| `ROW_NUMBER()` | numéros tous différents (1, 2, 3, 4) |
| `RANK()` | même rang, puis saut (1, 2, 2, 4) |
| `DENSE_RANK()` | même rang, sans saut (1, 2, 2, 3) |

Le grand classique : « le produit le plus cher de chaque catégorie » = garder les lignes où `rang = 1` (dans une CTE, car on ne peut pas filtrer sur une fonction de fenêtre dans le `WHERE`).

## Cumuls et moyennes glissantes

```sql
SELECT date_commande,
       COUNT(*) OVER (ORDER BY date_commande) AS cumul_commandes
FROM commandes;
```

Avec `ORDER BY` dans `OVER`, la fenêtre va du début jusqu'à la ligne courante : on obtient un **cumul**.

## Comparer avec la ligne précédente : LAG et LEAD

```sql
SELECT id, client_id, date_commande,
       LAG(date_commande) OVER (PARTITION BY client_id ORDER BY date_commande) AS commande_precedente
FROM commandes;
```

`LAG` lit la ligne précédente de la fenêtre, `LEAD` la suivante. Idéal pour mesurer un délai entre deux achats, une évolution d'un jour à l'autre.

## Dédoublonner proprement

```sql
WITH classes AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY date_commande DESC) AS rn
    FROM commandes
)
SELECT id, client_id, date_commande
FROM classes
WHERE rn = 1;
```

« La dernière commande de chaque client » : un motif que vous écrirez des dizaines de fois en data engineering (dernière version d'un enregistrement, dédoublonnage).

## À retenir

- Fonction de fenêtre = calcul par ligne sur un groupe de lignes, sans les regrouper.
- `OVER (PARTITION BY … ORDER BY …)`.
- `ROW_NUMBER`, `RANK`, `DENSE_RANK` ; le « top 1 par groupe » via une CTE et `WHERE rn = 1`.
- `SUM/COUNT … OVER (ORDER BY …)` pour un cumul ; `LAG`/`LEAD` pour la ligne précédente/suivante.
