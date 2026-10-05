Une application en production est protégée et distribuée par plusieurs équipements réseau : pare-feu, traduction d'adresses, répartiteurs de charge, proxys. Dans le cloud, ce sont des services que vous configurerez vous-même.

## Le pare-feu

Un **pare-feu** (*firewall*) filtre le trafic selon des **règles** : adresse source, adresse destination, port, protocole.

```text
Autoriser  TCP 443  depuis 0.0.0.0/0        (HTTPS depuis Internet)
Autoriser  TCP 22   depuis 203.0.113.0/24   (SSH depuis le bureau seulement)
Refuser    tout le reste
```

:::retenir
La règle d'or : **tout refuser par défaut**, puis n'ouvrir que le strict nécessaire, au plus petit périmètre possible. `0.0.0.0/0` signifie « depuis n'importe où sur Internet » : à réserver aux services réellement publics.
:::

## Le NAT

Le **NAT** (*Network Address Translation*) permet à des machines en adresses privées de sortir sur Internet derrière une adresse publique partagée. Effet de bord utile : on ne peut pas les joindre directement depuis Internet. Dans le cloud, une « passerelle NAT » donne un accès sortant aux serveurs des sous-réseaux privés.

## L'équilibreur de charge

Un **équilibreur de charge** (*load balancer*) répartit les requêtes entre plusieurs serveurs identiques :

- il **absorbe la charge** (on ajoute des serveurs quand le trafic monte) ;
- il **contourne les pannes** : grâce à des **contrôles de santé** (*health checks*), il n'envoie plus de trafic à un serveur qui ne répond pas ;
- il termine souvent le **TLS** (il gère le certificat HTTPS).

On distingue l'équilibrage de **couche 4** (TCP, rapide, sans regarder le contenu) et de **couche 7** (HTTP, capable de router selon le chemin : `/api` vers un groupe de serveurs, `/images` vers un autre).

## Proxy, reverse proxy, CDN

- Un **proxy** (mandataire) relaie les requêtes **sortantes** des clients (filtrage en entreprise).
- Un **reverse proxy** reçoit les requêtes **entrantes** devant les serveurs (Nginx en est l'exemple le plus connu).
- Un **CDN** (*Content Delivery Network*) met en cache le contenu dans des serveurs répartis dans le monde, au plus près des utilisateurs.

## Le VPN

Un **VPN** crée un tunnel chiffré entre deux réseaux (le bureau et le cloud) ou entre un poste et un réseau d'entreprise.

:::metier En entreprise
L'architecture classique d'une application web dans le cloud : Internet → CDN → équilibreur de charge (sous-réseau public) → serveurs d'application (sous-réseau privé) → base de données (sous-réseau privé, accessible seulement depuis les serveurs). Chaque flèche est autorisée par une règle de pare-feu précise. C'est l'objet de la leçon suivante.
:::

## À retenir

- Pare-feu : tout refuser par défaut, ouvrir le minimum ; `0.0.0.0/0` = tout Internet.
- NAT : sortir sur Internet depuis des adresses privées.
- Équilibreur de charge : répartition, contrôles de santé, couche 4 ou 7, terminaison TLS.
- Reverse proxy (Nginx), CDN, VPN.
