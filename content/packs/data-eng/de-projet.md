Vous avez parcouru toutes les briques. Il est temps de les assembler dans un **projet de bout en bout**, celui qui figurera en tête de votre portfolio et nourrira vos entretiens. Cette leçon donne le cahier des charges et la méthode ; l'exercice associé est corrigé par l'assistant.

## Le cahier des charges

Construire un pipeline qui :

1. **ingère** chaque jour un jeu de données ouvert réel (par exemple sur data.gouv.fr : prix des carburants, qualité de l'air, fréquentation des transports) ;
2. le stocke **brut** (bronze), puis **nettoyé** (silver), en Parquet, partitionné par date ;
3. le **modélise** en étoile dans une base analytique (DuckDB ou PostgreSQL, ou un entrepôt cloud gratuit) ;
4. le **transforme** avec dbt, avec des **tests** de qualité ;
5. est **orchestré** (Airflow ou Dagster) avec réessais et alertes ;
6. alimente un **tableau de bord** simple (Metabase, Superset, Streamlit) ;
7. tourne dans **Docker Compose** ; le code est sur **GitHub** avec une **CI** (lint + tests) ;
8. bonus : l'infrastructure cloud décrite en **Terraform**.

## La méthode

:::methode Avancer par itérations
1. **Version 0** (un week-end) : un script Python qui télécharge, nettoie et écrit un fichier. Committez.
2. **Version 1** : découpage en fonctions, tests unitaires, Docker. Committez.
3. **Version 2** : base analytique, modèle en étoile, dbt et ses tests.
4. **Version 3** : orchestration quotidienne, journaux, alertes.
5. **Version 4** : tableau de bord, README soigné avec schéma d'architecture.
6. **Version 5** (bonus) : déploiement cloud avec Terraform et CI/CD.
:::

Chaque version doit **fonctionner** : mieux vaut un petit pipeline complet qu'un grand pipeline à moitié fini.

## Ce que regardera un recruteur

- Le **README** : problème, architecture, choix techniques et leurs raisons, comment lancer.
- La **qualité du code** : fonctions, tests, gestion des erreurs, pas de secret commité.
- Les **choix** : pourquoi Parquet, pourquoi ce partitionnement, comment l'idempotence est garantie.
- Votre capacité à **expliquer** les difficultés rencontrées et comment vous les avez surmontées.

## À retenir

- Un projet de bout en bout : ingestion, bronze/silver/gold, étoile, dbt + tests, orchestration, tableau de bord, Docker, CI.
- Avancer par versions qui fonctionnent, en committant à chaque étape.
- Le README et les explications comptent autant que le code.
