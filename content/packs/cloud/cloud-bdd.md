Installer, sauvegarder, mettre à jour et répliquer une base de données demande beaucoup de travail. Les **bases managées** confient ces tâches au fournisseur, et laissent l'équipe se concentrer sur les données.

## Ce que fait une base managée

- Installation et mises à jour (fenêtres de maintenance choisies).
- **Sauvegardes automatiques** et restauration à un instant précis (*point-in-time recovery*).
- **Haute disponibilité** : une copie de secours dans une autre zone, qui prend le relais automatiquement (*failover*).
- **Réplicas en lecture** pour répartir les lectures.
- Chiffrement, supervision, mise à l'échelle.

## Quelle base pour quel usage ?

| Besoin | Type | Exemples managés |
|---|---|---|
| Application transactionnelle classique | relationnel | RDS/Aurora (PostgreSQL, MySQL), Azure Database for PostgreSQL, Cloud SQL |
| Très gros volume d'accès par clé, latence constante | clé-valeur / document | DynamoDB, Cosmos DB, Firestore |
| Cache, sessions | en mémoire | ElastiCache (Redis/Valkey), Azure Cache for Redis, Memorystore |
| Analyse de gros volumes | entrepôt de données (colonnes) | Redshift, BigQuery, Synapse/Fabric, Snowflake |
| Recherche plein texte | moteur de recherche | OpenSearch, Elastic |

:::piege Piège classique
Utiliser la base transactionnelle de l'application pour faire de lourdes analyses : les requêtes d'analyse ralentissent l'application de production. On copie les données vers un **entrepôt** dédié à l'analyse (c'est l'un des rôles principaux du data engineer).
:::

## Sécuriser une base managée

- Dans un **sous-réseau privé**, jamais exposée à Internet.
- Groupe de sécurité qui n'autorise que les serveurs d'application.
- Identifiants dans un **gestionnaire de secrets**, avec rotation automatique.
- Chiffrement au repos et en transit (TLS).

## À retenir

- Base managée : sauvegardes, haute disponibilité, mises à jour, réplicas gérés par le fournisseur.
- Relationnel pour le transactionnel ; clé-valeur pour l'échelle ; cache en mémoire ; entrepôt pour l'analyse.
- Ne pas analyser directement sur la base de production : copier vers un entrepôt.
- Sous-réseau privé, accès restreint, secrets gérés, chiffrement.
