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
