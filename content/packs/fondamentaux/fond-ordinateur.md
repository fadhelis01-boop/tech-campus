Avant de programmer des pipelines de données ou de piloter des serveurs dans le cloud, il faut savoir ce qui se passe à l'intérieur d'une machine. Rassurez-vous : pas besoin d'électronique. Quatre pièces et une idée suffisent.

## Les quatre pièces maîtresses

:::analogie Pour comprendre
Imaginez une cuisine de restaurant. Le **processeur** est le cuisinier : il exécute les recettes, une étape après l'autre, très vite. La **mémoire vive** est le plan de travail : on y pose ce dont on a besoin maintenant ; c'est rapide d'accès, mais on le débarrasse à la fermeture. Le **stockage** (disque) est la réserve : on y range tout durablement, mais il faut aller le chercher. Le **réseau** est la porte de livraison, par laquelle arrivent et partent les commandes.
:::

| Composant | Anglais | Rôle | Ce qui se passe s'il manque |
|---|---|---|---|
| Processeur | CPU | exécute les instructions | tout est lent |
| Mémoire vive | RAM | données en cours d'utilisation, effacées à l'extinction | la machine « rame » ou le programme plante |
| Stockage | disque, SSD | données conservées durablement | plus de place pour écrire |
| Carte réseau | NIC | communique avec les autres machines | plus de connexion |

:::metier En entreprise
Quand vous créerez une machine virtuelle dans le cloud, on vous demandera exactement cela : combien de processeurs (vCPU), combien de mémoire (Go de RAM), quel disque (Go de SSD). Et quand un traitement de données plante avec « out of memory », vous saurez que c'est le plan de travail qui est trop petit, pas la réserve.
:::

## Le logiciel : système d'exploitation et applications

- Le **système d'exploitation** (*operating system*, OS) — Linux, Windows, macOS, Android — gère le matériel et le partage entre les programmes.
- Les **applications** (navigateur, tableur, base de données…) demandent au système de lire un fichier, d'afficher quelque chose, d'envoyer un message sur le réseau.
- Un **programme** est un fichier d'instructions ; quand on le lance, il devient un **processus** qui occupe du processeur et de la mémoire.

## Tout est nombre

Pour l'ordinateur, tout — texte, image, son, vidéo, programme — n'est qu'une suite de nombres, eux-mêmes écrits en **binaire** (avec des 0 et des 1). C'est le sujet de la leçon suivante.

## Serveur, client, machine virtuelle

- Un **serveur** est un ordinateur (souvent sans écran) qui rend un service à d'autres : héberger un site, une base de données…
- Un **client** est celui qui demande le service : votre navigateur, votre application mobile.
- Une **machine virtuelle** (*virtual machine*, VM) est un ordinateur simulé par logiciel sur un vrai serveur. Un serveur physique puissant peut héberger des dizaines de VM. C'est la base du cloud.

:::retenir
Le cloud, ce n'est pas « un nuage » : ce sont des centres de données remplis de serveurs physiques, que l'on loue à la minute sous forme de machines virtuelles ou de services prêts à l'emploi.
:::

## À retenir

- CPU = calcule, RAM = mémoire de travail (volatile), disque = stockage durable, réseau = communication.
- Le système d'exploitation gère le matériel ; un programme lancé devient un processus.
- Un serveur rend un service à des clients ; une machine virtuelle est un ordinateur simulé.
- Ces notions reviennent sans cesse quand on dimensionne une machine ou diagnostique une panne.
