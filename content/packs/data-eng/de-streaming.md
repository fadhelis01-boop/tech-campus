Certaines décisions ne peuvent pas attendre le traitement de la nuit : bloquer une transaction frauduleuse, alerter sur une panne de capteur, mettre à jour un stock en temps réel. Le **streaming** traite les données comme un **flux continu d'événements**. **Apache Kafka** en est la plateforme de référence.

## Les concepts de Kafka

| Concept | Rôle |
|---|---|
| **Événement** (message) | un fait : « commande 1042 passée à 10 h 02 » (clé, valeur, horodatage) |
| **Producteur** | l'application qui publie des événements |
| **Topic** | un flux nommé d'événements (`commandes`, `paiements`) |
| **Partition** | un topic est découpé en partitions, pour répartir la charge ; l'ordre est garanti **dans** une partition |
| **Consommateur** | l'application qui lit les événements |
| **Groupe de consommateurs** | plusieurs instances se partagent les partitions d'un topic |
| **Offset** | la position de lecture d'un consommateur dans une partition |

Kafka **conserve** les événements pendant une durée configurée : un nouveau consommateur peut relire l'historique, et un consommateur tombé en panne reprend là où il s'était arrêté.

:::analogie Pour comprendre
Kafka ressemble à un journal de bord partagé, découpé en carnets (les partitions). Les producteurs y écrivent à la suite ; chaque lecteur garde un marque-page (l'offset) et lit à son rythme, sans gêner les autres lecteurs.
:::

## Le traitement de flux

On calcule souvent des agrégats sur des **fenêtres de temps** :

- **fenêtre fixe** (*tumbling*) : 10 h 00-10 h 05, 10 h 05-10 h 10… ;
- **fenêtre glissante** (*sliding/hopping*) : les 5 dernières minutes, recalculées chaque minute ;
- **fenêtre de session** : regroupée par période d'activité d'un utilisateur.

Moteurs de traitement de flux : **Apache Flink**, **Spark Structured Streaming**, **Kafka Streams**, ou les services managés (Kinesis, Event Hubs, Pub/Sub + Dataflow).

## Les difficultés propres au streaming

- **Temps de l'événement vs temps de traitement** : un événement survenu à 10 h 02 peut arriver à 10 h 07 (réseau, panne). On raisonne sur l'heure de l'événement, avec une tolérance aux retardataires (*watermark*).
- **Garanties de livraison** : au plus une fois, **au moins une fois** (le plus courant : il faut alors gérer les doublons), exactement une fois (plus coûteux).
- **Évolution des schémas** : gérée avec un registre de schémas (Avro, Protobuf).

## La capture des changements (CDC)

**Debezium** lit le journal de transactions d'une base (PostgreSQL, MySQL) et publie chaque insertion, modification ou suppression dans Kafka. On obtient un flux fidèle des changements, sans surcharger la base par des requêtes.

## À retenir

- Kafka : producteurs → topics (partitions, rétention) → consommateurs (groupes, offsets).
- L'ordre n'est garanti que dans une partition ; la clé détermine la partition.
- Fenêtres fixes, glissantes, de session ; Flink, Spark Streaming, Kafka Streams.
- Temps de l'événement, retardataires, au moins une fois (gérer les doublons), schémas versionnés.
- CDC (Debezium) pour diffuser les changements d'une base.
