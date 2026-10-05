Les recruteurs du secteur tech le répètent : pour un profil junior ou en reconversion, **les projets montrent ce que les diplômes ne montrent pas**. Un portfolio de trois à cinq projets sérieux, bien présentés sur GitHub, vaut souvent plus qu'une longue liste de cours suivis.

## Pourquoi les projets ?

- Ils prouvent que vous savez **faire**, pas seulement réciter.
- Ils vous confrontent aux vrais problèmes : données sales, erreurs inattendues, choix techniques.
- Ils alimentent l'entretien : « parlez-moi d'un problème difficile que vous avez résolu » — vous aurez des histoires vraies à raconter.

## Un bon projet de portfolio

:::methode Les critères
1. **Un vrai problème**, même modeste : « suivre l'évolution des prix des carburants près de chez moi » plutôt que « un projet de démonstration ».
2. **Des données réelles** : les jeux de données ouverts (data.gouv.fr, INSEE, API publiques) sont parfaits.
3. **De bout en bout** : récupération, traitement, stockage, résultat visible (tableau de bord, API, site).
4. **Industrialisé** : code versionné, tests, conteneur Docker, déploiement automatique — c'est ce qui distingue un professionnel.
5. **Documenté** : un README clair.
:::

Chaque feuille de route (onglet Parcours) propose une liste de projets adaptés à votre métier cible.

## Le README, vitrine du projet

Un recruteur passe moins d'une minute sur un dépôt. Le README doit répondre immédiatement à :

```markdown
# Prix des carburants en Rhône-Alpes

Pipeline quotidien qui collecte les prix publiés en open data,
les nettoie et les publie dans un tableau de bord.

## Architecture
(schéma : API open data → Python → PostgreSQL → tableau de bord)

## Technologies
Python, SQL, Airflow, Docker, GitHub Actions

## Lancer le projet
docker compose up

## Ce que j'ai appris / difficultés rencontrées
- gérer les doublons des données sources…
```

:::astuce
La section « difficultés rencontrées » est souvent la plus lue : elle montre votre façon de raisonner.
:::

## Apprendre en construisant

Ne finissez pas tous les cours avant de commencer un projet. La bonne stratégie : dès que vous connaissez les bases d'un domaine, lancez un petit projet qui l'utilise, et faites-le grandir au fil des modules.

:::attention
Un projet copié d'un tutoriel, identique à des milliers d'autres sur GitHub, ne convainc personne. Partez d'un tutoriel si besoin, puis **personnalisez** : autre source de données, fonctionnalité en plus, déploiement dans le cloud.
:::

## À retenir

- Pour un junior, les projets sont la meilleure preuve de compétence.
- Un vrai problème, des données réelles, de bout en bout, industrialisé, documenté.
- Le README se lit en une minute : quoi, comment, technologies, lancement, difficultés.
- Commencer les projets tôt et les faire grandir.
