Data ou cloud/DevOps ? Les deux voies sont porteuses et partagent un large socle. Ce qui doit guider votre choix, c'est le **quotidien** qui vous attire. Voici une journée type dans chaque métier, puis quelques questions pour trancher.

## Une journée de data engineer

- **9 h** : point d'équipe (*daily stand-up*) de 15 minutes : qui fait quoi, qui est bloqué.
- **9 h 30** : un pipeline de la nuit a échoué. Lecture du journal dans Airflow : la source a changé le format d'une colonne. Correction, test, relance.
- **11 h** : réunion avec l'équipe marketing, qui veut croiser les ventes avec les campagnes. Questions : quelles sources, quelle fréquence, quelle définition d'un « client actif » ?
- **14 h** : développement d'un nouveau modèle dbt en SQL, avec ses tests de qualité.
- **16 h** : revue du code d'un collègue (*pull request*), commentaires constructifs.
- **17 h** : documentation du nouveau jeu de données pour les analystes.

## Une journée d'ingénieur cloud / DevOps

- **9 h** : point d'équipe.
- **9 h 30** : une alerte de nuit indique un disque presque plein sur une base de données : augmentation de la taille via Terraform, revue par un collègue, application.
- **11 h** : une équipe de développement veut un nouvel environnement de test. Écriture du code d'infrastructure, mise en place du pipeline de déploiement.
- **14 h** : optimisation des coûts : des machines surdimensionnées tournent la nuit ; mise en place d'un arrêt automatique.
- **16 h** : mise à jour de la version de Kubernetes sur le cluster de recette, vérifications.
- **Une semaine par mois** : astreinte, joignable en cas d'incident grave.

## Les questions pour trancher

:::methode Cinq questions
1. **Préférez-vous les données ou les systèmes ?** Comprendre un chiffre faux, ou comprendre une panne ?
2. **Avec qui aimez-vous travailler ?** Métiers (finance, marketing) ou développeurs et exploitants ?
3. **SQL vous plaît-il ?** C'est l'outil quotidien du data engineer.
4. **L'urgence vous stimule-t-elle ?** Les astreintes sont plus fréquentes côté infrastructure.
5. **Quel était votre ancien métier ?** Un profil gestion, finance, marketing valorise sa connaissance métier en data ; un profil technique, logistique ou support s'épanouit souvent côté infrastructure.
:::

Le petit test d'orientation de la page « Métiers de demain » reprend ces questions.

:::astuce
Vous hésitez encore ? Commencez le socle commun (Linux, Git, Python, SQL) : vous saurez vite ce qui vous plaît le plus. Beaucoup de professionnels passent d'ailleurs d'une voie à l'autre au cours de leur carrière ; le métier de **DataOps** ou d'**ingénieur plateforme data** est à la frontière des deux.
:::

## À retenir

- Data engineer : pipelines, SQL, qualité des données, dialogue avec les métiers.
- Cloud/DevOps : infrastructure, automatisation, fiabilité, astreintes.
- Choisir selon le quotidien qui vous attire et ce que votre ancien métier valorise.
- Le socle commun permet de décider en chemin.
