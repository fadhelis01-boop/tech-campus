Plus une organisation a de données, plus il devient difficile de savoir **ce qui existe**, **d'où ça vient**, **qui en est responsable**, **qui a le droit de le voir**, et **si c'est fiable**. La **gouvernance des données** répond à ces questions — et elle conditionne la confiance dans tous les chiffres et toutes les IA de l'entreprise.

## Les briques de la gouvernance

| Brique | Rôle | Exemples d'outils |
|---|---|---|
| **Catalogue** | inventaire des jeux de données, avec description, propriétaire, mots-clés | DataHub, OpenMetadata, Unity Catalog, Microsoft Purview, Dataplex |
| **Lignage** | d'où vient chaque donnée et ce qui en dépend | dbt docs, OpenLineage, catalogues |
| **Glossaire métier** | définitions partagées (qu'est-ce qu'un « client actif » ?) | catalogues |
| **Contrôle d'accès** | qui voit quoi, jusqu'à la ligne et à la colonne | droits de l'entrepôt, masquage dynamique, politiques |
| **Qualité** | règles, mesures, incidents | tests dbt, Great Expectations, Soda |
| **Conformité** | données personnelles, durées de conservation, RGPD | classification, purge automatique |

:::metier En entreprise
Le **lignage** sauve des journées entières : quand un chiffre du tableau de bord semble faux, il montre immédiatement toutes les tables et transformations en amont ; quand on veut modifier une table, il montre tout ce qui en dépend et risque de casser.
:::

## Les rôles

- **Propriétaire des données** (*data owner*) : responsable métier d'un domaine de données.
- **Intendant des données** (*data steward*) : veille au quotidien sur la qualité et les définitions.
- **Équipes data** : implémentent les outils et les contrôles.

## Le data mesh

Le **data mesh** est une approche d'organisation pour les grandes entreprises : plutôt qu'une équipe data centrale débordée, chaque **domaine métier** (ventes, logistique, finance) est responsable de ses données, publiées comme des **produits de données** documentés, fiables et accessibles, sur une plateforme commune, avec une gouvernance fédérée. C'est une démarche organisationnelle autant que technique, adoptée de façon plus ou moins complète selon les entreprises.

## À retenir

- Gouvernance : catalogue, lignage, glossaire, accès, qualité, conformité.
- Le lignage accélère les diagnostics et sécurise les changements.
- Propriétaires et intendants des données, avec les équipes data.
- Data mesh : domaines responsables de leurs produits de données, plateforme commune, gouvernance fédérée.
