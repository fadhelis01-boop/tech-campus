<!-- @lecon cloud-modeles -->
Le cloud a changé la façon dont les entreprises construisent leur informatique. Avant de manipuler des services, il faut comprendre **ce que l'on loue exactement** et **qui est responsable de quoi**. Ces notions sont au programme de toutes les certifications cloud d'entrée (AWS Cloud Practitioner, Azure Fundamentals).

## IaaS, PaaS, SaaS

:::analogie Pour comprendre
La pizza. **Sur site** : vous faites tout (pâte, four, cuisine, table). **IaaS** : on vous loue la cuisine équipée, vous cuisinez. **PaaS** : la pizza arrive prête à cuire, vous gérez la cuisson et le service. **SaaS** : vous mangez au restaurant.
:::

| Modèle | On loue | On gère soi-même | Exemples |
|---|---|---|---|
| **IaaS** (*Infrastructure as a Service*) | machines virtuelles, réseau, stockage | système d'exploitation, logiciels, données | AWS EC2, Azure Virtual Machines, Compute Engine |
| **PaaS** (*Platform as a Service*) | une plateforme prête à exécuter du code ou des données | code, données, configuration | AWS Elastic Beanstalk, Azure App Service, Cloud Run, bases managées |
| **SaaS** (*Software as a Service*) | un logiciel complet | ses données et ses utilisateurs | Microsoft 365, Salesforce, Gmail |

On parle aussi de **serverless** (« sans serveur ») quand on ne gère plus du tout de serveurs : on fournit une fonction ou un conteneur, et le fournisseur l'exécute et facture à l'usage (AWS Lambda, Azure Functions, Cloud Run).

## Le modèle de responsabilité partagée

:::retenir
Le fournisseur est responsable de la sécurité **du** cloud (centres de données, matériel, réseau physique, virtualisation). Le client est responsable de la sécurité **dans** le cloud : ses données, ses identités et droits d'accès, la configuration de ses ressources, et, en IaaS, la mise à jour de ses systèmes.
:::

Plus on monte vers le SaaS, plus le fournisseur prend en charge. Mais certaines responsabilités restent **toujours** au client : **les données et les accès**. La plupart des fuites de données dans le cloud viennent d'erreurs de configuration côté client (un stockage laissé public, un mot de passe faible), pas d'une faille du fournisseur.

## Public, privé, hybride, multicloud

- **Cloud public** : ressources partagées chez un fournisseur (AWS, Azure, Google Cloud, OVHcloud…).
- **Cloud privé** : infrastructure dédiée à une seule organisation (dans ses locaux ou chez un hébergeur).
- **Hybride** : combinaison des deux (données sensibles en interne, le reste dans le public).
- **Multicloud** : plusieurs fournisseurs publics, pour éviter la dépendance ou utiliser le meilleur de chacun.

## Les avantages… et les points de vigilance

| Avantages | Points de vigilance |
|---|---|
| Pas d'investissement initial (CAPEX → OPEX) | Facture variable, parfois incontrôlée |
| Élasticité et rapidité | Dépendance au fournisseur (*lock-in*) |
| Services managés (moins d'exploitation) | Compétences nécessaires (sécurité, coûts) |
| Présence mondiale, haute disponibilité | Souveraineté et réglementation des données |

## À retenir

- IaaS (machines), PaaS (plateforme), SaaS (logiciel), serverless (fonctions/conteneurs à l'usage).
- Responsabilité partagée : le fournisseur sécurise le cloud, le client sécurise ce qu'il y met (données, accès, configuration).
- Public, privé, hybride, multicloud.
- CAPEX → OPEX, élasticité ; vigilance sur coûts, dépendance et souveraineté.

<!-- @lecon cloud-fournisseurs -->
Chaque fournisseur a ses propres noms de services, mais les **concepts** sont les mêmes partout. Apprendre un cloud en profondeur, puis savoir faire la correspondance avec les autres : c'est la bonne stratégie.

## La table de correspondance

| Besoin | AWS | Azure | Google Cloud |
|---|---|---|---|
| Machine virtuelle | EC2 | Virtual Machines | Compute Engine |
| Stockage objet | S3 | Blob Storage | Cloud Storage |
| Base relationnelle managée | RDS, Aurora | Azure SQL, Database for PostgreSQL | Cloud SQL, AlloyDB |
| Base NoSQL clé-valeur | DynamoDB | Cosmos DB | Firestore, Bigtable |
| Entrepôt de données | Redshift | Synapse, Fabric | BigQuery |
| Fonctions serverless | Lambda | Functions | Cloud Run functions |
| Conteneurs serverless | Fargate, App Runner | Container Apps | Cloud Run |
| Kubernetes managé | EKS | AKS | GKE |
| Réseau virtuel | VPC | Virtual Network (VNet) | VPC |
| Identités et droits | IAM | Microsoft Entra ID + RBAC | IAM |
| Supervision | CloudWatch | Azure Monitor | Cloud Monitoring/Logging |
| Infrastructure as code native | CloudFormation | Bicep/ARM | Deployment Manager / Terraform |

## Les acteurs européens et la souveraineté

- **OVHcloud** (France), **Scaleway** (France), **Outscale** (filiale de Dassault Systèmes), **IONOS**, **Open Telekom Cloud**…
- En France, l'ANSSI délivre la qualification **SecNumCloud** aux offres répondant à des exigences élevées de sécurité et de protection contre les lois extraterritoriales. Elle est attendue pour certaines données sensibles des administrations et des opérateurs d'importance vitale.
- Des offres « de confiance » associent la technologie d'un grand fournisseur américain à un opérateur européen (par exemple S3NS, coentreprise de Thales et Google Cloud, ou Bleu, d'Orange et Capgemini avec Microsoft).

:::attention
Le paysage des offres souveraines évolue vite (qualifications, partenariats) : vérifiez la liste à jour des offres qualifiées sur le site de l'ANSSI avant toute recommandation.
:::

## Choisir un premier cloud à apprendre

:::methode Conseil
1. Regardez les offres d'emploi de votre région : quel cloud revient le plus ?
2. À défaut, **AWS** a la plus grande part de marché et le plus de ressources d'apprentissage ; **Azure** est très présent dans les grandes entreprises françaises ; **Google Cloud** est apprécié pour la data (BigQuery).
3. Apprenez-en un en profondeur ; les concepts se transposent aux autres en quelques semaines.
:::

:::astuce Pratiquer sans se ruiner
Les trois grands fournisseurs proposent des **offres gratuites** (crédits à l'ouverture, services gratuits dans certaines limites). Avant toute expérimentation : activez une **alerte de budget**, et supprimez vos ressources à la fin de chaque séance.
:::

## À retenir

- Mêmes concepts, noms différents : EC2/VM/Compute Engine, S3/Blob/Cloud Storage…
- Acteurs européens et qualification SecNumCloud pour les besoins de souveraineté.
- Apprendre un cloud à fond, puis transposer.
- Comptes gratuits + alertes de budget + suppression des ressources après usage.

<!-- @lecon cloud-regions -->
Une application cloud doit continuer de fonctionner quand un serveur, voire un centre de données entier, tombe en panne. Pour cela, il faut comprendre l'organisation physique du cloud : régions et zones de disponibilité.

## Régions et zones

- Une **région** est une zone géographique (Paris, Francfort, Irlande…) qui contient plusieurs centres de données.
- Une **zone de disponibilité** (*availability zone*, AZ) est un ou plusieurs centres de données **indépendants** (alimentation, refroidissement, réseau) au sein d'une région, reliés entre eux par un réseau à très faible latence.

On choisit la région selon : la **proximité** des utilisateurs (latence), la **réglementation** (données en Europe), la **disponibilité des services** et le **prix** (qui varie selon les régions).

## Haute disponibilité

:::retenir
Une application **hautement disponible** est déployée sur **au moins deux zones** : si une zone tombe, l'autre continue de servir. Un équilibreur de charge répartit le trafic et écarte la zone défaillante.
:::

## Mesurer la disponibilité

La disponibilité s'exprime en pourcentage du temps, et chaque « 9 » compte :

| Disponibilité | Indisponibilité maximale par an |
|---|---|
| 99 % | environ 3,65 jours |
| 99,9 % | environ 8,8 heures |
| 99,99 % | environ 53 minutes |
| 99,999 % | environ 5 minutes |

Les fournisseurs s'engagent sur une disponibilité par service : c'est le **SLA** (*Service Level Agreement*), avec des compensations financières s'il n'est pas tenu.

:::attention Les disponibilités se multiplient
Si votre application dépend de trois composants en série, chacun disponible à 99,9 %, la disponibilité globale est d'environ 99,9 % × 99,9 % × 99,9 % ≈ 99,7 %. À l'inverse, deux composants **redondants** (en parallèle) de 99 % chacun donnent 1 − (0,01 × 0,01) = 99,99 %.
:::

## Sauvegarde et reprise après sinistre

Deux indicateurs guident la stratégie de reprise :

- **RPO** (*Recovery Point Objective*) : combien de données peut-on accepter de perdre ? (une heure, une minute…)
- **RTO** (*Recovery Time Objective*) : en combien de temps doit-on être de nouveau en service ?

Plus RPO et RTO sont courts, plus la solution est coûteuse : des sauvegardes quotidiennes restaurées à la main, jusqu'à une seconde région active en permanence.

## À retenir

- Région = zone géographique ; zone de disponibilité = centre(s) de données indépendant(s).
- Haute disponibilité : au moins deux zones derrière un équilibreur.
- 99,9 % ≈ 8,8 h d'arrêt par an ; les disponibilités en série se multiplient, la redondance les améliore.
- RPO = données perdues acceptables ; RTO = durée d'interruption acceptable.

<!-- @lecon cloud-calcul -->
Exécuter du code est le premier besoin. Le cloud propose une gamme de solutions, de la machine virtuelle que l'on administre entièrement jusqu'à la fonction que l'on ne voit même pas tourner.

## Le spectre des options

| Option | Vous gérez | Facturation | Idéal pour |
|---|---|---|---|
| **Machine virtuelle** | OS, mises à jour, logiciels | à la seconde/heure tant qu'elle tourne | logiciels traditionnels, contrôle total |
| **Conteneurs managés** (Kubernetes : EKS, AKS, GKE) | les conteneurs et le cluster (en partie) | les nœuds du cluster | nombreuses applications, besoins avancés |
| **Conteneurs serverless** (Cloud Run, Fargate, Container Apps) | seulement le conteneur | à la requête / au temps d'exécution | API, services web |
| **Fonctions serverless** (Lambda, Azure Functions) | seulement le code | à l'invocation et à la durée | traitements événementiels courts |

## Les machines virtuelles

On choisit un **type d'instance** (famille et taille : nombre de vCPU, mémoire), une **image** (le système), un disque, un réseau et un groupe de sécurité.

Trois modes d'achat, à connaître pour les certifications et pour les coûts :

- **À la demande** : flexible, le plus cher.
- **Engagement** (instances réservées, *savings plans*) : engagement sur 1 ou 3 ans contre une remise importante.
- **Capacité excédentaire** (instances *spot*) : très bon marché, mais peut être reprise par le fournisseur avec un court préavis ; parfait pour des traitements interruptibles (calculs par lots).

## La mise à l'échelle

- **Verticale** (*scale up*) : une machine plus grosse. Simple, mais limitée et souvent avec interruption.
- **Horizontale** (*scale out*) : plus de machines identiques derrière un équilibreur. C'est la voie du cloud.
- **Automatique** (*autoscaling*) : le nombre de machines suit une métrique (charge CPU, nombre de requêtes).

:::retenir
Pour pouvoir ajouter et retirer des serveurs librement, ils doivent être **sans état** (*stateless*) : aucune donnée importante ne doit rester sur le serveur lui-même (on la met en base, en cache partagé ou en stockage objet).
:::

## Le serverless

Avec une fonction serverless, on écrit seulement le code qui réagit à un **événement** : un fichier déposé dans un stockage, un message dans une file, une requête HTTP, une échéance planifiée.

```python
# Exemple de fonction déclenchée par l'arrivée d'un fichier (schéma générique)
def traiter(evenement, contexte):
    fichier = evenement["fichier"]
    print(f"Nouveau fichier reçu : {fichier}")
    # lire, valider, charger…
    return {"statut": "ok"}
```

Avantages : rien à administrer, mise à l'échelle automatique, facturation à l'usage (gratuit quand rien ne se passe). Limites : durée d'exécution maximale, démarrages à froid (*cold start*), plus difficile à tester et à observer.

:::metier En entreprise
Un data engineer utilise souvent une fonction serverless pour réagir à l'arrivée d'un fichier (le valider, déclencher le chargement) ; un ingénieur cloud déploie les API sur des conteneurs serverless et réserve Kubernetes aux plateformes plus complexes.
:::

## À retenir

- VM (contrôle total) → conteneurs managés → conteneurs serverless → fonctions (rien à gérer).
- À la demande, engagement (remise), spot (bon marché, interruptible).
- Mise à l'échelle horizontale et automatique, avec des serveurs sans état.
- Serverless : événementiel, facturation à l'usage, limites de durée et démarrages à froid.

<!-- @lecon cloud-stockage -->
Le stockage est au cœur du métier de data engineer : les **data lakes** reposent sur le stockage objet. Encore faut-il choisir le bon type de stockage et la bonne classe de prix.

## Trois types de stockage

| Type | Principe | Exemples | Usage |
|---|---|---|---|
| **Objet** | des fichiers (« objets ») identifiés par une clé, dans des compartiments (*buckets*), accessibles par API HTTP | S3, Blob Storage, Cloud Storage | data lakes, sauvegardes, fichiers statiques, journaux |
| **Bloc** | un disque virtuel attaché à une machine | EBS, Managed Disks, Persistent Disk | système et données d'une VM, bases de données |
| **Fichier** | un système de fichiers partagé entre machines | EFS, Azure Files, Filestore | partage de fichiers entre serveurs |

## Le stockage objet en détail

- Un **compartiment** (*bucket*) a un nom unique ; il contient des objets désignés par une **clé** : `ventes/2026/10/05/ventes.parquet`.
- Il n'y a pas vraiment de dossiers : les `/` font partie de la clé (mais les consoles les affichent comme des dossiers).
- Capacité pratiquement illimitée, durabilité extrêmement élevée (les données sont copiées sur plusieurs zones).

:::attention Un compartiment public
Laisser un compartiment accessible publiquement par erreur est l'une des causes les plus fréquentes de fuites de données. Les fournisseurs bloquent désormais l'accès public **par défaut** : ne désactivez ce blocage que pour des contenus réellement publics (un site statique, par exemple).
:::

## Les classes de stockage

Le prix dépend de la fréquence d'accès :

| Classe | Accès | Prix du stockage | Prix de la lecture |
|---|---|---|---|
| Standard (chaud) | fréquent | le plus élevé | faible |
| Accès peu fréquent | quelques fois par mois | plus bas | plus élevé |
| Archive (froid) | exceptionnel, délai de récupération de minutes à heures | très bas | élevé |

Les **règles de cycle de vie** (*lifecycle rules*) déplacent automatiquement les objets vers une classe moins chère au bout d'un certain temps, puis les suppriment : « passer en archive après 90 jours, supprimer après 7 ans ».

## Autres fonctions utiles

- **Versionnage** : conserve les anciennes versions d'un objet (protection contre l'effacement accidentel).
- **Chiffrement** au repos, activé par défaut chez les grands fournisseurs.
- **Réplication** vers une autre région.
- **URL présignées** : un lien temporaire pour télécharger ou déposer un objet sans donner d'identifiants.

## À retenir

- Objet (data lakes, sauvegardes), bloc (disques de VM), fichier (partage).
- Bucket + clé ; capacité illimitée ; accès public bloqué par défaut — à garder ainsi.
- Classes standard, peu fréquent, archive ; règles de cycle de vie pour automatiser.
- Versionnage, chiffrement, réplication, URL présignées.

<!-- @lecon cloud-reseau-iam -->
Dans le cloud, une seule erreur de configuration peut exposer toutes les données d'une entreprise. Deux remparts : le **réseau** (vu dans le module Réseaux : VPC, sous-réseaux, groupes de sécurité) et surtout l'**identité** : qui a le droit de faire quoi. C'est l'**IAM** (*Identity and Access Management*).

## Les identités

- **Utilisateurs** : des personnes (de préférence fédérées depuis l'annuaire de l'entreprise, avec authentification unique).
- **Groupes** : pour attribuer des droits à plusieurs utilisateurs à la fois.
- **Rôles** : des identités **sans mot de passe**, que l'on « endosse » temporairement. Les applications et services (une VM, une fonction, un pipeline de déploiement) utilisent des rôles, jamais des clés écrites dans le code.

## Les politiques

Une **politique** (*policy*) décrit des permissions. Exemple au format AWS (le format JSON est similaire dans l'esprit chez les autres fournisseurs) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::ventes-brutes",
        "arn:aws:s3:::ventes-brutes/*"
      ]
    }
  ]
}
```

- **Effect** : `Allow` (autoriser) ou `Deny` (refuser) ;
- **Action** : les opérations autorisées ;
- **Resource** : sur quelles ressources (identifiées ici par leur ARN).

:::retenir Les règles d'évaluation
Par défaut, **tout est refusé**. Une autorisation explicite (`Allow`) ouvre un droit ; un refus explicite (`Deny`) l'emporte **toujours** sur une autorisation.
:::

## Le moindre privilège

:::methode Appliquer le moindre privilège
1. Partir de **zéro** droit.
2. N'ajouter que les **actions** nécessaires (`s3:GetObject`, pas `s3:*`).
3. Sur les seules **ressources** concernées (un bucket précis, pas `*`).
4. Préférer des droits **temporaires** (rôles) aux clés permanentes.
5. **Réviser** régulièrement : supprimer les droits inutilisés (les fournisseurs proposent des outils d'analyse).
:::

## Les bonnes pratiques indispensables

- Le compte **racine** (le compte qui a créé l'abonnement) ne sert **jamais** au quotidien ; il est protégé par une authentification multifacteur (**MFA**).
- MFA pour tous les utilisateurs humains.
- Pas de clés d'accès dans le code, ni dans Git : rôles, identités managées, gestionnaires de secrets.
- Journalisation de toutes les actions (AWS CloudTrail, Azure Activity Log, Cloud Audit Logs).

## À retenir

- IAM : utilisateurs, groupes, rôles (identités temporaires pour les applications), politiques.
- Politique : Effect, Action, Resource ; refus par défaut, Deny explicite prioritaire.
- Moindre privilège : actions et ressources précises, droits temporaires, révisions régulières.
- Compte racine sous MFA et jamais utilisé ; aucune clé dans le code ; tout est journalisé.

<!-- @lecon cloud-bdd -->
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

<!-- @lecon cloud-architecture -->
Savoir utiliser des services ne suffit pas : il faut les **assembler** en une architecture fiable, sûre, performante et économe. Les grands fournisseurs ont formalisé leurs bonnes pratiques dans des cadres de référence, que les certifications d'architecte évaluent.

## Les piliers du « bien architecturé »

Le **AWS Well-Architected Framework** (et ses équivalents Azure Well-Architected et Google Cloud Architecture Framework) repose sur six piliers :

| Pilier | Question clé |
|---|---|
| **Excellence opérationnelle** | Peut-on déployer, observer et améliorer facilement ? (automatisation, IaC, supervision) |
| **Sécurité** | Les données et les accès sont-ils protégés ? (moindre privilège, chiffrement, traçabilité) |
| **Fiabilité** | Le système résiste-t-il aux pannes et se rétablit-il ? (plusieurs zones, sauvegardes testées) |
| **Efficacité des performances** | Utilise-t-on les bonnes ressources, de la bonne taille ? |
| **Optimisation des coûts** | Paie-t-on uniquement ce qui sert ? |
| **Durabilité** | Minimise-t-on l'impact environnemental ? |

## Les principes de conception

:::methode Concevoir pour le cloud
1. **Supposer que tout tombe en panne** : redondance sur plusieurs zones, reprises automatiques.
2. **Découpler** les composants : files de messages entre producteurs et consommateurs, pour qu'une partie lente ne bloque pas les autres.
3. **Rendre les serveurs sans état** et jetables : on les remplace plutôt que de les réparer.
4. **Tout automatiser** : infrastructure as code, déploiements continus.
5. **Mesurer** : métriques, journaux, alertes.
6. **Sécuriser à chaque couche** : réseau, identité, données.
:::

## Une architecture type

```text
Utilisateurs
   │  DNS + CDN
   ▼
Équilibreur de charge (2 zones, sous-réseaux publics)
   │
   ▼
Conteneurs de l'API (mise à l'échelle automatique, sous-réseaux privés)
   │                     │
   ▼                     ▼
Base PostgreSQL       File de messages ──► Traitements asynchrones
managée (2 zones)                          (fonctions serverless)
   │
   ▼
Copie quotidienne vers le data lake (stockage objet) ──► Entrepôt de données
```

:::metier En entreprise
On documente les choix d'architecture dans des **ADR** (*Architecture Decision Records*) : un court document par décision (contexte, options étudiées, choix, conséquences). Dans six mois, personne ne se souviendra pourquoi on a choisi une file de messages plutôt qu'un appel direct.
:::

## À retenir

- Six piliers : excellence opérationnelle, sécurité, fiabilité, performance, coûts, durabilité.
- Concevoir pour la panne, découpler, serveurs jetables, tout automatiser, mesurer, sécuriser partout.
- Architecture type : CDN → équilibreur → conteneurs sans état → base managée + file de messages → data lake.
- Documenter les décisions (ADR).

<!-- @lecon cloud-finops -->
« Le cloud coûte trop cher » : beaucoup d'entreprises l'ont découvert en recevant leur facture. Le cloud n'est pas cher par nature ; il l'est quand personne ne pilote la dépense. C'est l'objet du **FinOps**, une compétence de plus en plus recherchée.

## Le FinOps

Le **FinOps** réunit finance, technique et métiers pour **piloter la valeur** du cloud : chaque équipe connaît ce qu'elle dépense et en est responsable. La FinOps Foundation (Linux Foundation) décrit trois phases qui tournent en boucle : **informer** (rendre les coûts visibles), **optimiser**, **opérer** (gouverner en continu).

## Rendre les coûts visibles

- **Étiqueter** (*tags*) chaque ressource : projet, équipe, environnement. Sans étiquettes, impossible de savoir qui dépense quoi.
- **Budgets et alertes** : être prévenu dès qu'une dépense dérive.
- **Tableaux de bord** par équipe et par projet.

## Les leviers d'optimisation

| Levier | Exemple | Gain typique |
|---|---|---|
| Supprimer l'inutile | disques orphelins, environnements de test oubliés, vieux instantanés | immédiat |
| Éteindre hors des heures de travail | environnements de développement la nuit et le week-end | jusqu'à ~70 % sur ces ressources |
| Bien dimensionner (*rightsizing*) | une machine utilisée à 5 % → une taille plus petite | variable |
| S'engager | instances réservées / savings plans sur la charge stable | remises importantes |
| Utiliser le spot | traitements par lots interruptibles | très fortes remises |
| Bonne classe de stockage | archiver les données anciennes | fort sur le stockage |
| Réduire les transferts | les données sortantes du cloud sont facturées | variable |

:::piege Piège classique
Les **transferts de données sortants** (vers Internet, ou entre régions) sont facturés, souvent oubliés dans les estimations. Un pipeline qui copie chaque jour des téraoctets d'une région à l'autre peut coûter plus cher que le stockage lui-même.
:::

## Estimer avant de construire

Chaque fournisseur propose un **calculateur de prix**. Une estimation simple, avant de lancer un projet, évite les mauvaises surprises :

```text
3 machines × 0,10 €/h × 730 h/mois           = 219 €
Base managée haute disponibilité             = 320 €
Stockage objet 2 To × 0,02 €/Go/mois          ≈ 41 €
Transferts sortants 500 Go × 0,09 €/Go        = 45 €
Total mensuel estimé                          ≈ 625 €
```

(Prix fictifs, pour l'exemple : vérifiez toujours dans le calculateur officiel, les tarifs varient selon la région et évoluent.)

## À retenir

- FinOps : informer, optimiser, opérer ; chaque équipe responsable de ses coûts.
- Étiquettes, budgets, alertes : la visibilité d'abord.
- Supprimer, éteindre, redimensionner, s'engager, spot, archiver, limiter les transferts.
- Estimer avec le calculateur officiel avant de construire.

<!-- @lecon cloud-certif -->
Votre feuille de route prévoit des certifications cloud comme jalons. Cette leçon fait le point sur les parcours de certification des trois grands fournisseurs et sur la meilleure façon de les préparer avec TechCampus.

## Les parcours

| Niveau | AWS | Azure | Google Cloud |
|---|---|---|---|
| Fondamentaux | Cloud Practitioner (CLF-C02) | Azure Fundamentals (AZ-900) | Cloud Digital Leader |
| Associé (cloud) | Solutions Architect Associate (SAA-C03), SysOps, Developer | Azure Administrator (AZ-104) | Associate Cloud Engineer |
| Associé (data) | Data Engineer Associate (DEA-C01) | Fabric Data Engineer (DP-700) | (Associate Data Practitioner) |
| Professionnel / expert | Solutions Architect Professional, DevOps Engineer Professional | Solutions Architect Expert (AZ-305), DevOps Engineer Expert (AZ-400) | Professional Cloud Architect, Professional Data Engineer |

L'onglet **Certifications** de l'application indique pour chacune le tarif public, le format, la validité, et votre état de préparation.

:::attention
Les fournisseurs renouvellent régulièrement leurs examens (nouvelles versions, retraits : l'ancienne certification Azure Data Engineer DP-203 a été retirée en mars 2025 au profit de DP-700). Vérifiez toujours la page officielle et téléchargez le **guide de l'examen** de la version en cours.
:::

## La préparation type (fondamentaux)

:::methode Six semaines pour AWS Cloud Practitioner ou AZ-900
- **Semaines 1-2** : domaines Fondamentaux et Cloud de TechCampus (concepts, responsabilité partagée, services principaux).
- **Semaine 3** : sécurité et IAM, réseau cloud.
- **Semaine 4** : coûts, facturation, support (une part importante de l'examen).
- **Semaine 5** : examens blancs de l'application ; révision des cartes ; formation gratuite de l'éditeur (AWS Skill Builder, Microsoft Learn).
- **Semaine 6** : examen d'entraînement officiel ; quand vous dépassez 80 %, inscrivez-vous.
:::

## Les pièges des questions

- Lisez les **mots-clés** : « le plus économique », « le moins d'effort opérationnel », « le plus disponible » — ils désignent souvent un service managé ou serverless.
- Éliminez d'abord les réponses manifestement fausses.
- Les questions de **responsabilité partagée** et de **facturation** sont nombreuses aux niveaux fondamentaux.

## À retenir

- Fondamentaux → associé → professionnel ; un parcours par fournisseur.
- Vérifier la version en cours de l'examen et télécharger son guide officiel.
- Six semaines pour une certification de fondamentaux avec une préparation régulière.
- Mots-clés des questions : « le plus économique », « le moins d'effort », « le plus disponible ».
