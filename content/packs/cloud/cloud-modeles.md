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
