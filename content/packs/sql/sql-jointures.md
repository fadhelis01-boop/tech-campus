Les données sont réparties dans plusieurs tables : le nom du client dans `clients`, ses commandes dans `commandes`. Pour les réunir, on fait une **jointure**. C'est la notion qui distingue un débutant d'un utilisateur confirmé de SQL.

## INNER JOIN

```sql
SELECT c.nom, o.id AS commande, o.date_commande
FROM commandes AS o
JOIN clients AS c ON c.id = o.client_id;
```

- `JOIN … ON condition` relie chaque commande au client dont l'`id` vaut `client_id` ;
- `o` et `c` sont des **alias de table**, qui raccourcissent l'écriture ;
- un `JOIN` simple (ou `INNER JOIN`) ne garde que les lignes qui ont une correspondance **des deux côtés**.

## LEFT JOIN

```sql
SELECT c.nom, COUNT(o.id) AS nb_commandes
FROM clients AS c
LEFT JOIN commandes AS o ON o.client_id = c.id
GROUP BY c.id, c.nom
ORDER BY nb_commandes DESC;
```

`LEFT JOIN` garde **toutes** les lignes de la table de gauche (`clients`), même sans correspondance : les colonnes de droite valent alors `NULL`. C'est indispensable pour répondre à « quels clients n'ont **jamais** commandé ? » :

```sql
SELECT c.nom
FROM clients AS c
LEFT JOIN commandes AS o ON o.client_id = c.id
WHERE o.id IS NULL;
```

:::analogie Pour comprendre
INNER JOIN : on ne garde que les couples formés. LEFT JOIN : on garde tous les invités de gauche, avec ou sans partenaire.
:::

## Plusieurs jointures

Pour connaître le chiffre d'affaires par client, il faut passer par quatre tables :

```sql
SELECT c.nom,
       ROUND(SUM(l.quantite * p.prix), 2) AS ca
FROM clients AS c
JOIN commandes AS o ON o.client_id = c.id
JOIN lignes AS l ON l.commande_id = o.id
JOIN produits AS p ON p.id = l.produit_id
WHERE o.statut = 'livrée'
GROUP BY c.id, c.nom
ORDER BY ca DESC;
```

:::piege Piège classique
Une jointure mal posée **multiplie** les lignes (une commande avec 3 lignes apparaît 3 fois). Avant d'agréger, demandez-vous : « une ligne de mon résultat représente quoi ? » (un client ? une commande ? une ligne de commande ?). Et vérifiez les volumes : un `COUNT(*)` avant et après la jointure.
:::

## Les autres jointures

- `RIGHT JOIN` : symétrique du `LEFT JOIN` (rarement utilisé, on inverse les tables).
- `FULL OUTER JOIN` : toutes les lignes des deux côtés.
- `CROSS JOIN` : toutes les combinaisons (rare, et dangereux sur de grosses tables).

## À retenir

- `JOIN … ON a.cle = b.cle` relie deux tables ; alias de table pour la lisibilité.
- INNER JOIN : correspondances des deux côtés ; LEFT JOIN : toute la table de gauche.
- `LEFT JOIN … WHERE droite.id IS NULL` : trouver les absents.
- Une jointure peut multiplier les lignes : savoir ce que représente une ligne du résultat.
