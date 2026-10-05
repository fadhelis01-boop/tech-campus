Quand une application « ne répond pas », le problème peut se trouver à dix endroits différents : le câble, l'adresse, le pare-feu, le nom de domaine, le certificat, l'application elle-même. Les **modèles en couches** donnent une carte pour chercher méthodiquement.

## Le principe des couches

Chaque couche rend un service à la couche du dessus, sans se soucier des détails des autres.

:::analogie Pour comprendre
Envoyer un colis : vous écrivez une lettre (application), la mettez dans une enveloppe avec l'adresse du destinataire (réseau), le transporteur la met dans un camion (liaison), le camion roule sur la route (physique). À l'arrivée, chaque étape est « déballée » dans l'ordre inverse. Personne n'a besoin de tout connaître.
:::

## Le modèle TCP/IP (celui d'Internet)

| Couche | Rôle | Exemples |
|---|---|---|
| **Application** | les échanges des programmes | HTTP, HTTPS, DNS, SSH, SMTP |
| **Transport** | acheminer les données entre deux programmes | TCP (fiable), UDP (rapide) |
| **Internet (réseau)** | acheminer les paquets de machine en machine | IP (adresses, routage) |
| **Accès réseau (liaison + physique)** | transmettre sur un support | Ethernet, Wi-Fi, fibre |

Le modèle **OSI** (sept couches) est plus détaillé et sert surtout de vocabulaire : on parle d'« équilibreur de couche 4 » (transport) ou de « couche 7 » (application, comme HTTP).

## L'encapsulation

À l'envoi, chaque couche ajoute son **en-tête** autour des données : le message HTTP est placé dans un segment TCP (ports), lui-même dans un paquet IP (adresses), lui-même dans une trame Ethernet (adresses matérielles). À la réception, on enlève les enveloppes une à une.

## TCP ou UDP ?

- **TCP** établit une connexion, numérote les paquets, renvoie ceux qui sont perdus, remet tout dans l'ordre : **fiable**. Le Web, SSH, les bases de données l'utilisent.
- **UDP** envoie sans connexion ni garantie : **rapide**. Le DNS, la vidéo en direct, les jeux en ligne l'utilisent.

## Les ports

Une machine fait tourner plusieurs services : le **port** (un numéro de 0 à 65 535) indique à quel programme s'adresse un message.

| Port | Service |
|---|---|
| 22 | SSH |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |
| 5432 | PostgreSQL |
| 3306 | MySQL |
| 6379 | Redis |
| 9092 | Kafka |

:::methode Diagnostiquer de bas en haut
1. La machine est-elle joignable ? (`ping`)
2. Le nom se traduit-il en adresse ? (`nslookup`, `dig`)
3. Le port est-il ouvert ? (`curl`, `nc -zv hôte port`)
4. Le service répond-il correctement ? (code HTTP, journaux)
:::

## À retenir

- Modèle TCP/IP : application, transport, Internet, accès réseau.
- Encapsulation : chaque couche ajoute son en-tête.
- TCP fiable, UDP rapide.
- Un port désigne un service : 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 5432 PostgreSQL.
- Diagnostiquer couche par couche.
