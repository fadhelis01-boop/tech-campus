Sélectionner les bonnes lignes, dans le bon ordre, avec les bonnes colonnes : c'est 80 % des requêtes du quotidien.

## Filtrer avec WHERE

```sql
SELECT nom, prix
FROM produits
WHERE prix < 50;
```

| Opérateur | Exemple |
|---|---|
| `=`, `<>` (ou `!=`) | `categorie = 'Audio'` |
| `<`, `<=`, `>`, `>=` | `prix >= 100` |
| `AND`, `OR`, `NOT` | `categorie = 'Livres' AND prix < 40` |
| `IN` | `ville IN ('Boston', 'New York')` |
| `BETWEEN` | `prix BETWEEN 20 AND 80` (bornes incluses) |
| `LIKE` | `nom LIKE 'Livre%'` (`%` = n'importe quelle suite) |
| `IS NULL` | `ville IS NULL` |

:::attention Les textes entre apostrophes
En SQL, les textes s'écrivent entre **apostrophes simples** : `'Audio'`. Les guillemets doubles servent (dans la norme) aux noms de colonnes.
:::

## NULL, la valeur absente

`NULL` signifie « valeur inconnue ». Piège majeur : **rien n'est égal à NULL**, pas même NULL. `ville = NULL` ne renvoie jamais rien ; il faut écrire `ville IS NULL` (ou `IS NOT NULL`).

## Trier et limiter

```sql
SELECT nom, prix
FROM produits
ORDER BY prix DESC
LIMIT 3;
```

- `ORDER BY colonne` trie (`ASC` croissant par défaut, `DESC` décroissant) ;
- on peut trier sur plusieurs colonnes : `ORDER BY categorie, prix DESC` ;
- `LIMIT n` garde les n premières lignes.

## Calculer et renommer

```sql
SELECT nom,
       prix,
       ROUND(prix * 1.2, 2) AS prix_ttc
FROM produits;
```

`AS` donne un nom (un **alias**) à la colonne calculée.

## Dédoublonner

```sql
SELECT DISTINCT ville
FROM clients;
```

## L'ordre d'écriture

:::retenir
Une requête s'écrit toujours dans cet ordre : `SELECT … FROM … WHERE … ORDER BY … LIMIT …`. (Les clauses `GROUP BY` et `HAVING`, vues ensuite, se placent entre `WHERE` et `ORDER BY`.)
:::

## À retenir

- `WHERE` filtre ; `AND`, `OR`, `IN`, `BETWEEN`, `LIKE`.
- Textes entre apostrophes ; `IS NULL` pour les valeurs absentes (jamais `= NULL`).
- `ORDER BY … DESC`, `LIMIT n`.
- Colonnes calculées et alias avec `AS` ; `DISTINCT` pour dédoublonner.
