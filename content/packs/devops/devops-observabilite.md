Quand un utilisateur se plaint que « c'est lent », il faut pouvoir répondre en minutes : quoi, où, depuis quand, pourquoi. C'est l'**observabilité** : la capacité à comprendre l'état interne d'un système à partir de ce qu'il émet.

## Les trois piliers

| Pilier | Ce que c'est | Exemple | Outils |
|---|---|---|---|
| **Métriques** | des nombres mesurés dans le temps | requêtes/s, taux d'erreur, latence, CPU | Prometheus, CloudWatch, Azure Monitor |
| **Journaux** (*logs*) | des événements horodatés | « paiement refusé pour la commande 1042 » | Loki, Elasticsearch/OpenSearch, Cloud Logging |
| **Traces** | le parcours d'une requête à travers les services | API → service paiement → base (320 ms dont 280 en base) | OpenTelemetry, Jaeger, Tempo |

**Grafana** affiche tout cela dans des tableaux de bord ; **OpenTelemetry** est le standard ouvert pour instrumenter les applications.

:::astuce Des journaux exploitables
Écrivez des journaux **structurés** (en JSON, avec des champs : niveau, horodatage, identifiant de requête, utilisateur) plutôt que des phrases libres : ils se filtrent et s'agrègent facilement.
:::

## Les signaux d'or

Pour un service, quatre métriques suffisent souvent à savoir s'il va bien (les « signaux d'or » du livre *Site Reliability Engineering* de Google) : **latence**, **trafic**, **erreurs**, **saturation**.

## SLI, SLO, SLA et budget d'erreur

- **SLI** (*Service Level Indicator*) : ce que l'on mesure. « Proportion de requêtes réussies en moins de 300 ms. »
- **SLO** (*Service Level Objective*) : l'objectif interne. « 99,5 % sur 30 jours. »
- **SLA** (*Service Level Agreement*) : l'engagement contractuel envers le client (moins exigeant que le SLO, avec pénalités).
- **Budget d'erreur** : 100 % − SLO. Avec un SLO de 99,5 %, on « a le droit » à 0,5 % d'échecs.

:::retenir
Le budget d'erreur arbitre entre vitesse et fiabilité : tant qu'il reste du budget, on peut livrer des nouveautés ; s'il est épuisé, on se concentre sur la fiabilité.
:::

## Les alertes

On alerte sur les **symptômes** vus par les utilisateurs (le SLO est menacé, le taux d'erreur monte), pas sur chaque cause possible (un CPU à 80 % n'est pas forcément un problème). Une alerte doit être **actionnable** : si personne ne doit rien faire en la recevant, ce n'est pas une alerte.

## À retenir

- Métriques, journaux (structurés), traces ; OpenTelemetry pour instrumenter, Grafana pour visualiser.
- Signaux d'or : latence, trafic, erreurs, saturation.
- SLI (mesure), SLO (objectif), SLA (contrat), budget d'erreur = 100 % − SLO.
- Alerter sur les symptômes, avec des alertes actionnables.
