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
