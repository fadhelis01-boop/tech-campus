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
