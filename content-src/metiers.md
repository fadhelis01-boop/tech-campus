<!-- @lecon met-panorama -->
« Data », « cloud », « DevOps » : derrière ces mots se cachent une dizaine de métiers différents, aux quotidiens très différents. Les connaître vous évitera de vous tromper de cible et vous aidera à lire les offres d'emploi.

## La famille data

:::analogie Pour comprendre
Pensez à l'eau potable. Le **data engineer** construit et entretient les canalisations et la station d'épuration : il fait arriver une donnée propre, au bon endroit, au bon moment. Le **data analyst** ouvre le robinet et répond aux questions (« combien a-t-on vendu en mars ? »). Le **data scientist** cherche des tendances cachées et construit des modèles prédictifs. Sans canalisations fiables, les deux autres n'ont rien à boire.
:::

| Métier | Il ou elle… | Outils typiques |
|---|---|---|
| **Data engineer** | conçoit les pipelines qui collectent, transforment et stockent les données | Python, SQL, Spark, Airflow, dbt, cloud |
| **Analytics engineer** | modélise les données prêtes à l'analyse, entre data engineer et analyst | SQL, dbt, entrepôts de données |
| **Data analyst** | répond aux questions métier avec des chiffres et des tableaux de bord | SQL, Power BI, Tableau, Excel |
| **Data scientist** | construit des modèles statistiques et prédictifs | Python, statistiques, machine learning |
| **ML engineer / MLOps** | met en production les modèles d'IA et les surveille | Python, conteneurs, cloud, outils MLOps |
| **Data architect** | conçoit l'architecture data d'ensemble (souvent après des années d'expérience) | tout ce qui précède |

## La famille cloud et infrastructure

| Métier | Il ou elle… | Outils typiques |
|---|---|---|
| **Ingénieur cloud** | construit et exploite l'infrastructure chez un fournisseur cloud | AWS/Azure/GCP, réseau, IAM, Terraform |
| **Ingénieur DevOps** | automatise la chaîne qui va du code à la production | Git, CI/CD, Docker, Kubernetes |
| **SRE** (*Site Reliability Engineer*) | garantit la fiabilité et la performance des services en production | observabilité, automatisation, astreintes |
| **Platform engineer** | construit une « plateforme interne » qui simplifie la vie des développeurs | Kubernetes, IaC, outils internes |
| **Architecte cloud** | conçoit les architectures et arbitre coûts, sécurité, performance | expérience large, certifications avancées |
| **FinOps** | pilote et optimise les coûts du cloud | facturation cloud, tableaux de bord |
| **Ingénieur sécurité cloud** | sécurise identités, réseaux, données, chaîne de déploiement | IAM, chiffrement, outils DevSecOps |

:::metier En entreprise
Dans une petite entreprise, une seule personne cumule souvent plusieurs de ces rôles. Dans un grand groupe, ils sont distincts et spécialisés. Les intitulés varient aussi d'une entreprise à l'autre : lisez toujours les **missions** et les **outils** de l'offre plutôt que le seul titre.
:::

## Ce qui est commun à tous

Quel que soit le métier, on retrouve le même socle : **Linux, Git, Python, SQL, réseaux, cloud**. C'est pourquoi les feuilles de route de TechCampus commencent toutes par ces domaines : les six premiers mois ne vous enferment dans aucune voie.

## À retenir

- Data engineer = les canalisations ; analyst = les réponses ; scientist = les modèles.
- Cloud engineer, DevOps, SRE, platform engineer, FinOps : différentes facettes de l'infrastructure.
- Lire les missions et les outils, pas seulement le titre du poste.
- Le socle (Linux, Git, Python, SQL, réseaux, cloud) est commun à tous.

<!-- @lecon met-tendances -->
Personne ne peut prédire précisément le marché dans vingt ans. Mais certaines tendances de fond sont solides, parce qu'elles reposent sur des besoins durables : toujours plus de données, toujours plus de logiciels, toujours plus d'exigences de fiabilité, de sécurité et de sobriété. Voici celles qui structurent les métiers data et cloud.

## 1. L'IA a besoin de données propres… et d'infrastructures

L'essor de l'IA générative a renforcé un constat : **un modèle ne vaut que par ses données**. Préparer, nettoyer, documenter, gouverner les données, puis faire tourner les modèles de façon fiable et économique, ce sont des tâches de data engineers et d'ingénieurs plateforme. Les architectures de type **RAG** (un modèle de langage qui s'appuie sur les documents de l'entreprise) reposent sur des pipelines de données et des bases vectorielles.

:::futur Tendance
Les métiers qui **construisent et exploitent** les systèmes (data engineering, MLOps, plateforme) sont moins menacés par l'automatisation que ceux qui produisent du code répétitif : l'IA devient un outil de productivité dans leurs mains.
:::

## 2. Le temps réel

Détection de fraude, suivi logistique, recommandations instantanées : les entreprises veulent des données **à la seconde**, pas le lendemain matin. Le **streaming** (Kafka, Flink) progresse et demande des compétences spécifiques.

## 3. Le cloud souverain et la réglementation européenne

L'Europe encadre de plus en plus le numérique, ce qui crée des besoins de compétences :

- le **RGPD** (depuis 2018) pour les données personnelles ;
- le **règlement européen sur l'IA** (*AI Act*), dont la plupart des dispositions s'appliquent depuis le 2 août 2026, certaines obligations sur les systèmes « à haut risque » étant prévues pour décembre 2027 ;
- le **Data Act**, applicable depuis le 12 septembre 2025, qui organise le partage des données (notamment des objets connectés) et facilite le changement de fournisseur cloud ;
- la directive **NIS2** sur la cybersécurité, dont la transposition française (projet de loi « Résilience ») était toujours en attente à l'automne 2026.

En France, la qualification **SecNumCloud** de l'ANSSI et les offres de « cloud de confiance » se développent pour les données sensibles.

:::attention
Ces textes évoluent (calendriers, simplifications) : la veille de l'application et le bouton « Vérifier l'actualité » vous aident à rester à jour.
:::

## 4. Plateformes et automatisation

Les entreprises industrialisent : **infrastructure as code**, **GitOps**, **plateformes internes** qui offrent aux développeurs des environnements prêts à l'emploi. Les profils capables d'automatiser restent très recherchés.

## 5. La maîtrise des coûts et la sobriété

Les factures cloud ont explosé dans beaucoup d'entreprises : la discipline **FinOps** (piloter les coûts) s'est imposée. S'y ajoute l'enjeu environnemental (**green IT**) : mesurer et réduire l'empreinte énergétique des traitements.

## 6. La sécurité partout

Les cyberattaques (rançongiciels notamment) touchent toutes les organisations. La sécurité n'est plus l'affaire d'une équipe isolée : elle s'intègre dans chaque pipeline (**DevSecOps**). Un data engineer ou un ingénieur DevOps qui a de bons réflexes de sécurité vaut plus cher.

## Ce qui ne changera pas

:::retenir
Les outils à la mode changeront (certains de ce cours seront remplacés dans dix ans). Ce qui restera : comprendre les données, raisonner sur des systèmes, automatiser, sécuriser, communiquer, et **apprendre vite**. Ce sont ces compétences que TechCampus vise derrière chaque outil.
:::

## À retenir

- L'IA augmente le besoin de données propres et d'infrastructures fiables.
- Temps réel, souveraineté et réglementation (RGPD, AI Act, Data Act, NIS2), automatisation, FinOps, sécurité : les tendances de fond.
- Les outils passent, les fondamentaux et la capacité d'apprendre restent.

<!-- @lecon met-marche -->
Avant d'investir des centaines d'heures, il est légitime de regarder les chiffres. Voici un état des lieux du marché français, avec ses sources. Les chiffres bougent chaque année : retenez les ordres de grandeur et vérifiez les dernières publications.

## Un marché en tension… pour les profils opérationnels

Selon l'enquête **Besoins en main-d'œuvre (BMO) 2026** de France Travail, les « ingénieurs et cadres d'étude et de développement informatique » figurent parmi les métiers où recruter est le plus difficile : de l'ordre de **57 % de recrutements jugés difficiles**, pour plus de 18 000 projets de recrutement. Les techniciens d'exploitation et de support et les consultants en systèmes d'information sont aussi en tension (autour de 45 à 48 %).

:::attention Lire ces chiffres correctement
« Difficile à recruter » ne veut pas dire « facile à décrocher pour un débutant ». Les analyses de France Travail soulignent que le numérique ne manque pas tant de candidats que de **profils opérationnels**, autonomes rapidement. D'où l'importance, pour vous, des **projets concrets** et des **certifications pratiques**.
:::

## Les salaires (ordres de grandeur, brut annuel)

Les sources (Apec, études de cabinets de recrutement, offres publiées) donnent pour 2025-2026 des fourchettes de cet ordre :

| Profil | Débutant (0-2 ans) | Confirmé (3-5 ans) |
|---|---|---|
| Data engineer | ≈ 38 à 50 k€ (plus haut à Paris) | ≈ 50 à 65 k€ |
| Ingénieur cloud / DevOps | ≈ 38 à 50 k€ | ≈ 50 à 70 k€ |
| Data analyst | ≈ 33 à 42 k€ | ≈ 42 à 55 k€ |

:::piege Piège classique
Ces fourchettes concernent souvent des profils **diplômés** d'école d'ingénieurs. En reconversion, le premier salaire peut être plus bas, notamment en alternance ou en ESN ; il rattrape ensuite vite la moyenne avec l'expérience. Utilisez le simulateur et les baromètres de l'**Apec** pour votre région et votre situation.
:::

## Les voies d'accès en reconversion

1. **Autoformation + certifications + projets** (ce que vous faites avec TechCampus), puis candidatures.
2. **Formations courtes intensives** (bootcamps) : plusieurs mois, souvent finançables (CPF, France Travail, Transitions Pro), avec un réseau d'entreprises partenaires.
3. **Titres professionnels et diplômes** inscrits au RNCP (par exemple des titres de niveau bac+3 à bac+5 en data ou en administration d'infrastructures), parfois en **alternance**.
4. **Reconversion interne** : dans votre entreprise actuelle, rejoindre l'équipe data ou infrastructure.

:::metier En entreprise
Les ESN (entreprises de services du numérique) recrutent beaucoup de juniors et les forment par des missions variées chez leurs clients : c'est une porte d'entrée fréquente, qui permet de découvrir plusieurs secteurs en peu de temps.
:::

## Où trouver les offres

- France Travail, Apec, LinkedIn, Welcome to the Jungle, Indeed ;
- les sites carrières des entreprises et des ESN ;
- les communautés et meetups locaux (data, cloud, Python), où circulent beaucoup d'offres non publiées.

## À retenir

- BMO 2026 : environ 57 % de recrutements difficiles pour les ingénieurs en développement informatique — on manque surtout de profils opérationnels.
- Débutant data engineer ou cloud : ordre de grandeur 38-50 k€ brut, à moduler (région, diplôme, alternance).
- Voies : autoformation + certifications + projets, bootcamp, titre RNCP, alternance, reconversion interne.
- Toujours vérifier les chiffres les plus récents (Apec, France Travail, Dares).

<!-- @lecon met-choisir -->
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
