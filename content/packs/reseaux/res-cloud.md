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
