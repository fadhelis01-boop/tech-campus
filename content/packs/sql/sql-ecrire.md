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
