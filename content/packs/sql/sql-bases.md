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
