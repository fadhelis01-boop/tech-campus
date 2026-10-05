Certaines questions demandent un raisonnement en plusieurs étapes : « les produits plus chers que la moyenne », « les clients dont la première commande date de 2026 ». Les **sous-requêtes** et les **CTE** permettent d'écrire ces étapes proprement.

## Les sous-requêtes

Une sous-requête est une requête à l'intérieur d'une autre :

```sql
SELECT nom, prix
FROM produits
WHERE prix > (SELECT AVG(prix) FROM produits);
```

```sql
SELECT nom
FROM clients
WHERE id IN (SELECT client_id FROM commandes WHERE statut = 'en cours');
```

## Les CTE : WITH

Une **CTE** (*Common Table Expression*) donne un nom à un résultat intermédiaire, comme une variable. C'est beaucoup plus lisible que des sous-requêtes imbriquées :

```sql
WITH ca_par_commande AS (
    SELECT l.commande_id,
           SUM(l.quantite * p.prix) AS montant
    FROM lignes AS l
    JOIN produits AS p ON p.id = l.produit_id
    GROUP BY l.commande_id
)
SELECT o.id, o.statut, ROUND(c.montant, 2) AS montant
FROM commandes AS o
JOIN ca_par_commande AS c ON c.commande_id = o.id
ORDER BY montant DESC;
```

:::methode Décomposer une question complexe
1. Écrire chaque étape comme une CTE, avec un nom explicite.
2. Tester chaque CTE seule (`SELECT * FROM etape1`).
3. Combiner dans la requête finale.
:::

On peut enchaîner plusieurs CTE, séparées par des virgules : `WITH a AS (…), b AS (… FROM a …) SELECT …`.

## CASE : des conditions dans une requête

```sql
SELECT nom, prix,
       CASE
           WHEN prix < 30 THEN 'petit prix'
           WHEN prix < 100 THEN 'milieu de gamme'
           ELSE 'haut de gamme'
       END AS gamme
FROM produits;
```

## COALESCE : remplacer les NULL

```sql
SELECT nom, COALESCE(ville, 'inconnue') AS ville
FROM clients;
```

:::metier En entreprise
Les outils de transformation comme **dbt** reposent entièrement sur ce style : chaque modèle est un `SELECT` construit à partir de CTE lisibles, qui s'appuient sur d'autres modèles. Savoir découper en CTE, c'est savoir écrire du SQL maintenable.
:::

## À retenir

- Sous-requête : `WHERE prix > (SELECT AVG(prix) …)`, `IN (SELECT …)`.
- `WITH nom AS (…)` : des étapes nommées, testables, lisibles.
- `CASE WHEN … THEN … ELSE … END` pour des catégories.
- `COALESCE(colonne, valeur)` pour remplacer les NULL.
