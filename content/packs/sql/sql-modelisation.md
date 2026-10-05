Avant d'écrire la moindre requête, il faut décider **comment ranger** les données : quelles tables, quelles colonnes, quels liens. Une bonne modélisation évite les incohérences ; une mauvaise les rend inévitables.

## Le problème des données dupliquées

Imaginez une seule grande table des commandes, où l'on recopie à chaque ligne le nom, l'adresse et le téléphone du client. Le client déménage : il faut modifier des centaines de lignes, et la moindre oubliée crée une incohérence. C'est une **anomalie de mise à jour**.

## La normalisation

La **normalisation** découpe les données pour que **chaque information soit stockée à un seul endroit**. Les trois premières formes normales, en pratique :

1. **1FN** : une valeur par case (pas de liste « Python, SQL » dans une colonne) ;
2. **2FN** : chaque colonne dépend de **toute** la clé (pas seulement d'une partie) ;
3. **3FN** : chaque colonne dépend de la clé **et seulement de la clé** (la ville du client va dans `clients`, pas dans `commandes`).

:::retenir
« La clé, toute la clé, rien que la clé. » C'est la règle mnémotechnique de la 3FN.
:::

## Les relations

| Relation | Exemple | Modélisation |
|---|---|---|
| un à plusieurs (1-N) | un client a plusieurs commandes | clé étrangère `client_id` dans `commandes` |
| plusieurs à plusieurs (N-N) | une commande contient plusieurs produits, un produit est dans plusieurs commandes | **table d'association** `lignes(commande_id, produit_id, quantite)` |
| un à un (1-1) | un employé a un badge | clé étrangère unique |

## Le schéma entité-association

On dessine le modèle avant de le créer : des boîtes (les entités, futures tables) avec leurs attributs, reliées par des traits annotés (1, N). Des outils comme dbdiagram.io ou draw.io servent à cela.

## Normaliser… ou pas

- Les bases **transactionnelles** (OLTP : l'application de caisse, le site marchand) sont **normalisées** : beaucoup de petites écritures, cohérence maximale.
- Les bases **analytiques** (OLAP : l'entrepôt de données) sont souvent **dénormalisées** volontairement (schéma en étoile, module Data engineering) : peu d'écritures, beaucoup de lectures, des requêtes plus simples et plus rapides.

## À retenir

- Dupliquer l'information crée des anomalies ; la normaliser les évite.
- 1FN : une valeur par case ; 3FN : « la clé, toute la clé, rien que la clé ».
- 1-N : clé étrangère côté N ; N-N : table d'association.
- OLTP normalisé, OLAP souvent dénormalisé (schéma en étoile).
