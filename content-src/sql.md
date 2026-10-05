<!-- @lecon sql-bases -->
Presque toutes les données d'entreprise vivent dans des **bases de données**, et le langage pour les interroger est le même depuis quarante ans : **SQL** (*Structured Query Language*). C'est la compétence la plus citée dans les offres data, et elle est très utile en cloud et DevOps. Toutes les requêtes de ce module s'exécutent dans le labo SQL (moteur SQLite).

## Base de données relationnelle

Une base **relationnelle** range les données dans des **tables** reliées entre elles.

:::analogie Pour comprendre
Une table ressemble à une feuille de tableur très disciplinée : chaque **colonne** a un nom et un type précis (texte, nombre, date), chaque **ligne** est un enregistrement. Contrairement au tableur, on ne peut pas mettre n'importe quoi n'importe où : la base fait respecter les règles.
:::

La base d'exemple « Boutique » contient quatre tables :

| Table | Contenu | Colonnes |
|---|---|---|
| `clients` | les clients | id, nom, ville, inscription |
| `produits` | le catalogue | id, nom, categorie, prix |
| `commandes` | les commandes | id, client_id, date_commande, statut |
| `lignes` | le détail des commandes | commande_id, produit_id, quantite |

## Clé primaire et clé étrangère

- La **clé primaire** (*primary key*) identifie chaque ligne de façon unique : `clients.id`.
- Une **clé étrangère** (*foreign key*) fait référence à la clé primaire d'une autre table : `commandes.client_id` désigne un client.

C'est ce qui « relie » les tables : on ne recopie pas le nom du client dans chaque commande, on indique son identifiant.

## Votre première requête

```sql
SELECT nom, ville
FROM clients;
```

- `SELECT` : les colonnes qu'on veut voir ;
- `FROM` : la table ;
- `;` termine la requête.

```sql
SELECT * FROM produits;
```

`*` signifie « toutes les colonnes ». Pratique pour explorer, à éviter dans un programme (on ne récupère que ce dont on a besoin).

:::astuce
SQL ne tient pas compte des majuscules pour les mots-clés : `select` et `SELECT` sont équivalents. Par convention, on écrit les mots-clés en majuscules et on passe à la ligne pour chaque clause : c'est beaucoup plus lisible.
:::

## Les SGBD du marché

Le logiciel qui gère la base s'appelle un **SGBD** (système de gestion de bases de données) : **PostgreSQL** (libre, très répandu), MySQL/MariaDB, SQL Server, Oracle, et **SQLite** (une base dans un simple fichier, utilisée ici). Le SQL de base est le même partout ; seuls quelques détails changent.

## À retenir

- Base relationnelle = tables (colonnes typées, lignes) reliées entre elles.
- Clé primaire = identifiant unique ; clé étrangère = référence vers une autre table.
- `SELECT colonnes FROM table;`
- PostgreSQL, MySQL, SQL Server, Oracle, SQLite : même langage de base.

<!-- @lecon sql-select -->
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

<!-- @lecon sql-agregats -->
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

<!-- @lecon sql-jointures -->
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

<!-- @lecon sql-ecrire -->
Interroger ne suffit pas : il faut aussi **créer** des tables et **modifier** les données. C'est le travail quotidien d'un pipeline qui charge des données.

## Créer une table

```sql
CREATE TABLE fournisseurs (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    pays TEXT DEFAULT 'France',
    email TEXT UNIQUE,
    note INTEGER CHECK (note BETWEEN 1 AND 5)
);
```

Les **contraintes** protègent la qualité des données :

| Contrainte | Effet |
|---|---|
| `PRIMARY KEY` | identifiant unique, non nul |
| `NOT NULL` | valeur obligatoire |
| `UNIQUE` | pas de doublon |
| `DEFAULT` | valeur par défaut |
| `CHECK` | règle de validité |
| `REFERENCES autre_table(id)` | clé étrangère : la valeur doit exister ailleurs |

Les principaux **types** : `INTEGER`, `REAL`/`NUMERIC` (nombres), `TEXT`/`VARCHAR(n)` (texte), `DATE`, `TIMESTAMP`, `BOOLEAN` (selon les SGBD).

## Insérer

```sql
INSERT INTO fournisseurs (id, nom, email, note)
VALUES (1, 'Clavitech', 'contact@clavitech.example', 4),
       (2, 'Audiolux', 'ventes@audiolux.example', 5);
```

## Modifier et supprimer

```sql
UPDATE produits
SET prix = prix * 1.05
WHERE categorie = 'Audio';

DELETE FROM commandes
WHERE statut = 'annulée';
```

:::attention Le WHERE oublié
`UPDATE produits SET prix = 0;` sans `WHERE` met **tous** les prix à zéro. `DELETE FROM commandes;` vide la table. Réflexe professionnel : écrire d'abord le `SELECT … WHERE …` correspondant, vérifier les lignes visées, **puis** le transformer en `UPDATE` ou `DELETE`. Et travailler dans une transaction (leçon sur les transactions).
:::

## Les familles de commandes SQL

- **DDL** (*Data Definition Language*) : `CREATE`, `ALTER`, `DROP` — la structure.
- **DML** (*Data Manipulation Language*) : `INSERT`, `UPDATE`, `DELETE` — les données.
- **DQL** : `SELECT` — l'interrogation.
- **DCL** : `GRANT`, `REVOKE` — les droits.

:::metier En entreprise
Les pipelines chargent les données de façon **idempotente** : plutôt qu'un `INSERT` qui créerait des doublons à chaque relance, on supprime puis réinsère la période concernée, ou on utilise un **upsert** (`INSERT … ON CONFLICT … DO UPDATE` en PostgreSQL et SQLite, `MERGE` ailleurs).
:::

## À retenir

- `CREATE TABLE` avec types et contraintes (PRIMARY KEY, NOT NULL, UNIQUE, CHECK, REFERENCES).
- `INSERT INTO … VALUES`, `UPDATE … SET … WHERE`, `DELETE FROM … WHERE`.
- Toujours tester le `WHERE` avec un `SELECT` avant un UPDATE/DELETE.
- DDL, DML, DQL, DCL ; upsert pour des chargements idempotents.

<!-- @lecon sql-sousrequetes -->
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

<!-- @lecon sql-fenetres -->
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

<!-- @lecon sql-modelisation -->
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

<!-- @lecon sql-performance -->
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

<!-- @lecon sql-transactions -->
Un virement bancaire débite un compte et en crédite un autre. Si la panne survient entre les deux, l'argent disparaît… sauf si les deux opérations forment une **transaction**. C'est l'une des garanties fondamentales des bases de données.

## Une transaction

```sql
BEGIN;
UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;
COMMIT;
```

- `BEGIN` ouvre la transaction ;
- `COMMIT` valide **tout** d'un coup ;
- `ROLLBACK` annule **tout** ce qui a été fait depuis `BEGIN`.

## Les propriétés ACID

| Propriété | Signification |
|---|---|
| **A**tomicité | tout ou rien : la transaction s'applique entièrement ou pas du tout |
| **C**ohérence | les contraintes sont respectées avant et après |
| **I**solation | les transactions simultanées ne se voient pas à moitié faites |
| **D**urabilité | une fois validée, la transaction survit à une panne |

## La concurrence

Plusieurs utilisateurs écrivent en même temps : le SGBD gère des **verrous** et des **niveaux d'isolation**. Les problèmes classiques qu'ils évitent : lire une donnée non encore validée (lecture sale), lire deux fois une même ligne avec des valeurs différentes, deux mises à jour qui s'écrasent. Retenez surtout qu'une **transaction longue** bloque les autres : on les garde courtes.

:::metier En entreprise
Un pipeline qui recharge les données d'une journée le fait dans une transaction : `DELETE` de la journée puis `INSERT` des nouvelles lignes, validés ensemble. Si le chargement plante au milieu, `ROLLBACK` : les analystes ne voient jamais une journée à moitié chargée.
:::

## Au-delà du relationnel : NoSQL

Les bases relationnelles ne sont pas les seules :

| Famille | Exemples | Usage |
|---|---|---|
| Clé-valeur | Redis, DynamoDB | cache, sessions, accès ultra-rapide par clé |
| Document | MongoDB, Firestore | données JSON de structure variable |
| Colonnes larges | Cassandra, HBase | très gros volumes d'écriture |
| Graphe | Neo4j | relations complexes (réseaux, recommandations) |
| Vecteurs | pgvector, bases vectorielles | recherche par similarité (IA, RAG) |

:::astuce
Ces bases sacrifient souvent une partie des garanties ACID ou de la souplesse des requêtes au profit de l'échelle ou de la flexibilité. Pour la grande majorité des besoins, **PostgreSQL** reste un excellent premier choix (il gère même le JSON et, avec l'extension pgvector, les vecteurs).
:::

## À retenir

- `BEGIN … COMMIT` ou `ROLLBACK` : tout ou rien.
- ACID : atomicité, cohérence, isolation, durabilité.
- Transactions courtes ; chargements de données dans une transaction.
- NoSQL : clé-valeur, document, colonnes, graphe, vecteurs — chacun pour un usage ; PostgreSQL convient à la plupart des besoins.
