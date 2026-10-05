<!-- @lecon res-modeles -->
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

<!-- @lecon res-ip -->
Concevoir le réseau d'un projet cloud, c'est d'abord découper des plages d'adresses IP. Ce calcul revient dans les certifications cloud et dans le quotidien d'un ingénieur cloud. Il fait peur, mais il est mécanique.

## L'adresse IPv4

Une adresse IPv4 fait **32 bits**, écrits en quatre nombres de 0 à 255 : `192.168.1.42`. Chaque nombre représente 8 bits (un octet).

## Partie réseau et partie hôte

Une adresse se découpe en deux :

- la **partie réseau** (identique pour toutes les machines du même réseau) ;
- la **partie hôte** (propre à chaque machine).

La **notation CIDR** indique combien de bits forment la partie réseau : `192.168.1.0/24` signifie « les 24 premiers bits sont le réseau ». Il reste 32 − 24 = **8 bits** pour les hôtes.

## Combien d'adresses ?

Avec *h* bits d'hôte, il y a **2^h adresses** dans le réseau.

| CIDR | Bits d'hôte | Adresses | Masque |
|---|---|---|---|
| /16 | 16 | 65 536 | 255.255.0.0 |
| /20 | 12 | 4 096 | 255.255.240.0 |
| /24 | 8 | 256 | 255.255.255.0 |
| /26 | 6 | 64 | 255.255.255.192 |
| /28 | 4 | 16 | 255.255.255.240 |
| /32 | 0 | 1 | 255.255.255.255 |

Sur un réseau classique, deux adresses sont réservées : l'adresse du **réseau** (la première) et l'adresse de **diffusion** (*broadcast*, la dernière). Un /24 offre donc 254 adresses utilisables.

:::attention Dans le cloud
Chez AWS, **5 adresses** sont réservées dans chaque sous-réseau (la première, les trois suivantes et la dernière). Un sous-réseau /24 offre donc 251 adresses utilisables. Azure en réserve également 5. Ce détail revient dans les examens de certification.
:::

## Découper un réseau

Un réseau /16 (`10.0.0.0/16`) peut être découpé en sous-réseaux /24 : `10.0.0.0/24`, `10.0.1.0/24`, `10.0.2.0/24`… Chaque bit ajouté au préfixe **divise par deux** la taille et **double** le nombre de sous-réseaux : un /16 contient 2^(24−16) = 256 sous-réseaux /24.

## Les adresses privées

Certaines plages sont réservées aux réseaux internes (RFC 1918) et ne circulent pas sur Internet :

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`

Votre box, les réseaux d'entreprise et les réseaux virtuels du cloud les utilisent. Le **NAT** (traduction d'adresses) permet à ces machines d'accéder à Internet via une adresse publique partagée.

## IPv6

IPv4 n'offre qu'environ 4,3 milliards d'adresses, épuisées depuis longtemps. **IPv6** utilise 128 bits (`2001:db8::1`), soit un nombre d'adresses pratiquement illimité. Les deux coexistent ; le cloud les gère toutes les deux.

```python
# Le module ipaddress de Python fait ces calculs pour vous
import ipaddress
reseau = ipaddress.ip_network("10.0.0.0/24")
print(reseau.num_addresses, reseau.netmask, reseau[1], reseau[-1])
print(ipaddress.ip_address("10.0.0.42") in reseau)
print(list(ipaddress.ip_network("10.0.0.0/22").subnets(new_prefix=24)))
```

## À retenir

- IPv4 : 32 bits ; CIDR /n = n bits de réseau, 32 − n bits d'hôte, 2^(32−n) adresses.
- /24 = 256 adresses ; /16 = 65 536 ; un bit de plus = deux fois moins d'adresses.
- Adresses privées : 10/8, 172.16/12, 192.168/16 ; NAT pour sortir sur Internet.
- AWS et Azure réservent 5 adresses par sous-réseau.
- Le module Python `ipaddress` vérifie vos calculs.

<!-- @lecon res-dns -->
« C'est toujours le DNS. » Cette plaisanterie d'administrateurs système contient une vérité : une erreur de DNS peut rendre tout un service inaccessible. Comprendre son fonctionnement fait gagner des heures de diagnostic.

## Le rôle du DNS

Le **DNS** (*Domain Name System*) traduit un nom (`www.example.com`) en adresse IP. C'est un annuaire **distribué** : aucun serveur ne connaît tout, chacun connaît une partie et sait à qui demander le reste.

## La résolution d'un nom

1. Votre machine regarde son **cache**.
2. Sinon, elle interroge un **résolveur** (celui de votre fournisseur d'accès, ou public comme `1.1.1.1`).
3. Le résolveur interroge un serveur **racine**, qui le renvoie vers les serveurs de `.com`.
4. Les serveurs de `.com` le renvoient vers les serveurs **faisant autorité** pour `example.com`.
5. Ceux-ci donnent la réponse, que le résolveur met en cache pendant la durée indiquée (**TTL**).

## Les types d'enregistrements

| Type | Rôle | Exemple |
|---|---|---|
| **A** | nom → adresse IPv4 | `www → 93.184.215.14` |
| **AAAA** | nom → adresse IPv6 | |
| **CNAME** | alias vers un autre nom | `blog → monsite.github.io` |
| **MX** | serveurs de messagerie du domaine | |
| **TXT** | texte libre (vérifications, SPF anti-spam) | |
| **NS** | serveurs faisant autorité pour le domaine | |

## Interroger le DNS

```bash
nslookup example.com
dig example.com
dig +short example.com
```

## Le TTL et la propagation

Chaque réponse a une durée de vie (**TTL**, en secondes). Si vous modifiez un enregistrement dont le TTL est de 24 heures, certains utilisateurs verront l'ancienne valeur pendant 24 heures.

:::astuce
Avant une migration (changement de serveur), **baissez le TTL** quelques jours à l'avance (par exemple à 300 secondes). Le basculement sera ensuite quasi immédiat, et un retour arrière aussi.
:::

:::metier En entreprise
Dans le cloud, le DNS est un service managé (Route 53 chez AWS, Azure DNS, Cloud DNS chez Google) qui sert aussi à répartir le trafic entre régions, à basculer automatiquement en cas de panne, et à faire pointer un nom vers un équilibreur de charge. Les noms internes des services (dans un VPC, dans Kubernetes) reposent aussi sur le DNS.
:::

## À retenir

- Le DNS traduit les noms en adresses ; il est distribué et hiérarchique.
- Résolveur → racine → TLD → serveurs faisant autorité ; réponses mises en cache selon le TTL.
- A (IPv4), AAAA (IPv6), CNAME (alias), MX (courriel), TXT, NS.
- `nslookup`, `dig` ; baisser le TTL avant une migration.

<!-- @lecon res-http -->
Le Web, les API, les tableaux de bord, les services cloud : presque tout passe par **HTTP**. Un data engineer qui interroge une API et un ingénieur cloud qui configure un équilibreur de charge doivent le connaître dans le détail.

## Requête et réponse

Une **requête** HTTP contient :

- une **méthode** : que veut-on faire ?
- un **chemin** : sur quelle ressource ?
- des **en-têtes** (*headers*) : informations complémentaires (authentification, format) ;
- éventuellement un **corps** (*body*) : les données envoyées.

```text
POST /api/v1/commandes HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{"client_id": 42, "produits": [1, 7]}
```

La **réponse** contient un **code de statut**, des en-têtes et un corps :

```text
HTTP/1.1 201 Created
Content-Type: application/json

{"id": 1043, "statut": "en cours"}
```

## Les méthodes

| Méthode | Usage | Idempotente ? |
|---|---|---|
| `GET` | lire | oui |
| `POST` | créer | non (deux POST = deux créations) |
| `PUT` | remplacer | oui |
| `PATCH` | modifier en partie | pas forcément |
| `DELETE` | supprimer | oui |

## Les API REST

Une API **REST** organise les échanges autour de **ressources** désignées par des URL, manipulées avec les méthodes HTTP :

```text
GET    /clients          liste des clients
GET    /clients/42       le client 42
POST   /clients          créer un client
PATCH  /clients/42       modifier le client 42
DELETE /clients/42       supprimer le client 42
```

Les données sont échangées en JSON. Les API modernes publient leur description au format **OpenAPI**, qui permet de générer une documentation interactive.

## HTTPS et TLS

**HTTPS** = HTTP à l'intérieur d'une connexion chiffrée par **TLS**. TLS garantit :

- la **confidentialité** : personne ne peut lire les échanges ;
- l'**intégrité** : personne ne peut les modifier ;
- l'**authenticité** du serveur, grâce à un **certificat** signé par une autorité de certification.

:::astuce
Les certificats ont une date d'expiration. Un certificat expiré rend un site inaccessible du jour au lendemain : on les renouvelle automatiquement (Let's Encrypt, gestionnaires de certificats des fournisseurs cloud).
:::

## Authentification des API

- **Clé d'API** : un jeton secret envoyé dans un en-tête.
- **Bearer token** / **OAuth 2.0** : un jeton à durée limitée, obtenu auprès d'un serveur d'autorisation.
- **JWT** : un format de jeton signé, qui contient des informations (identité, expiration) vérifiables sans interroger la base.

## Tester avec curl

```bash
curl -I https://example.com
curl -s https://api.example.com/v1/statut
curl -X POST -H "Content-Type: application/json" -d '{"nom": "Ada"}' https://api.example.com/v1/clients
```

## À retenir

- Requête : méthode, chemin, en-têtes, corps ; réponse : code, en-têtes, corps.
- GET lire, POST créer, PUT remplacer, PATCH modifier, DELETE supprimer.
- REST : des ressources désignées par des URL, échangées en JSON, décrites en OpenAPI.
- HTTPS = TLS : confidentialité, intégrité, authenticité (certificats à renouveler automatiquement).
- Clés d'API, OAuth 2.0, JWT ; `curl` pour tester.

<!-- @lecon res-securite-reseau -->
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

<!-- @lecon res-cloud -->
Dans le cloud, on ne branche pas de câbles : on **décrit** son réseau. Un réseau virtuel (VPC chez AWS et Google, VNet chez Azure), des sous-réseaux, des tables de routage et des règles de filtrage. C'est l'un des sujets les plus présents dans les certifications cloud.

## Le réseau virtuel (VPC)

Un **VPC** (*Virtual Private Cloud*) est votre réseau privé et isolé chez le fournisseur, avec une plage d'adresses privées, par exemple `10.0.0.0/16`.

## Les sous-réseaux publics et privés

On découpe le VPC en **sous-réseaux**, chacun dans une **zone de disponibilité** (un centre de données distinct) :

| Sous-réseau | Plage | Contenu | Accès Internet |
|---|---|---|---|
| public A | 10.0.1.0/24 | équilibreur de charge | entrant et sortant (passerelle Internet) |
| public B | 10.0.2.0/24 | équilibreur de charge | idem, dans une 2e zone |
| privé A | 10.0.11.0/24 | serveurs d'application | sortant seulement (passerelle NAT) |
| privé B | 10.0.12.0/24 | serveurs d'application | idem |
| données A/B | 10.0.21.0/24, 10.0.22.0/24 | bases de données | aucun |

Un sous-réseau est **public** si sa table de routage envoie le trafic Internet vers une **passerelle Internet** ; il est **privé** sinon.

:::retenir
On répartit chaque niveau sur **au moins deux zones de disponibilité** : si un centre de données tombe, l'autre prend le relais.
:::

## Groupes de sécurité et listes de contrôle

- Le **groupe de sécurité** (*security group*) est un pare-feu attaché à chaque ressource (machine, base). Il est **à état** (*stateful*) : une réponse à une connexion autorisée repasse automatiquement.
- Les **listes de contrôle d'accès réseau** (*NACL*) filtrent au niveau du sous-réseau, sans état.

Bonne pratique : le groupe de sécurité de la base n'autorise le port 5432 que **depuis le groupe de sécurité des serveurs d'application**, pas depuis une plage d'adresses.

## Relier des réseaux

- **Appairage** (*peering*) entre deux VPC ;
- **passerelle de transit** pour relier beaucoup de réseaux ;
- **VPN** ou **liaison dédiée** (Direct Connect, ExpressRoute) vers les locaux de l'entreprise ;
- **points de terminaison privés** (*private endpoints*) pour joindre les services du fournisseur (stockage objet…) sans passer par Internet.

:::attention Les plages qui se chevauchent
Deux réseaux dont les plages se chevauchent (deux VPC en `10.0.0.0/16`) ne peuvent pas être reliés. Planifiez vos plages d'adresses dès le début, à l'échelle de toute l'entreprise.
:::

## À retenir

- VPC = réseau privé isolé dans le cloud, avec une plage privée (ex. 10.0.0.0/16).
- Sous-réseaux publics (passerelle Internet) et privés (passerelle NAT pour sortir), sur plusieurs zones.
- Groupes de sécurité (par ressource, avec état) et NACL (par sous-réseau, sans état).
- Peering, transit, VPN, liaisons dédiées, points de terminaison privés.
- Planifier les plages d'adresses pour éviter les chevauchements.
