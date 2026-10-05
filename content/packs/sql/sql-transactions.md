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
