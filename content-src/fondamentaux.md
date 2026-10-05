<!-- @lecon fond-ordinateur -->
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

<!-- @lecon fond-binaire -->
« Ce fichier fait 3 Go », « notre base contient 2 To », « le texte est mal encodé » : ces phrases sont quotidiennes dans les métiers de la donnée. Cette leçon vous donne les clés pour les comprendre et faire des calculs justes.

## Le bit et l'octet

- Un **bit** (*binary digit*) vaut 0 ou 1. C'est la plus petite unité d'information.
- Un **octet** (*byte*) regroupe **8 bits**. Il peut prendre 2⁸ = **256** valeurs différentes (de 0 à 255).

:::analogie Pour comprendre
Un bit, c'est un interrupteur : éteint ou allumé. Avec 8 interrupteurs côte à côte, on peut former 256 combinaisons différentes — assez pour coder toutes les lettres, chiffres et signes de ponctuation de l'anglais.
:::

## Compter en binaire

En base 10, chaque position vaut 10 fois la précédente (unités, dizaines, centaines). En binaire, chaque position vaut **2 fois** la précédente : 1, 2, 4, 8, 16, 32, 64, 128.

| Binaire | Calcul | Décimal |
|---|---|---|
| 0000 0101 | 4 + 1 | 5 |
| 0000 1010 | 8 + 2 | 10 |
| 1111 1111 | 128+64+32+16+8+4+2+1 | 255 |

Avec *n* bits, on peut représenter 2ⁿ valeurs. C'est pour cela que les adresses IP (32 bits) sont limitées à environ 4,3 milliards, et que vous croiserez souvent des puissances de 2.

```python
# En Python, bin() montre l'écriture binaire, int(…, 2) fait l'inverse
print(bin(10))          # 0b1010
print(int("11111111", 2))  # 255
print(2 ** 8)           # 256
```

## Les unités : kilo, méga, giga… et kibi

| Unité | Valeur (système décimal) | Ordre de grandeur |
|---|---|---|
| 1 Ko (kilooctet) | 1 000 octets | une page de texte |
| 1 Mo (mégaoctet) | 1 000 000 octets | une photo compressée |
| 1 Go (gigaoctet) | 10⁹ octets | un film |
| 1 To (téraoctet) | 10¹² octets | un disque dur grand public |
| 1 Po (pétaoctet) | 10¹⁵ octets | les données d'une grande entreprise |

:::piege Piège classique
Il existe aussi des unités en puissances de 2 : 1 **Kio** (kibioctet) = 1 024 octets, 1 Mio = 1 024 Kio, 1 Gio = 1 024 Mio. Un disque vendu « 1 To » (10¹² octets) apparaît comme « 931 Go » dans certains systèmes, qui affichent en réalité des Gio. Le cloud facture parfois en Go, parfois en Gio : lisez la ligne de prix.
:::

:::attention Bits ou octets ?
Les débits réseau s'expriment en **bits** par seconde (Mbit/s), les tailles de fichiers en **octets**. Une connexion à 100 Mbit/s transfère au mieux 12,5 Mo par seconde (100 ÷ 8).
:::

## Le texte : ASCII et UTF-8

Pour stocker du texte, on associe un nombre à chaque caractère : c'est l'**encodage**.

- **ASCII** (1963) code 128 caractères : lettres anglaises, chiffres, ponctuation. Pas d'accents.
- **Unicode** recense plus de 150 000 caractères de toutes les langues, les emojis compris.
- **UTF-8** est la façon la plus répandue d'écrire Unicode en octets : 1 octet pour les caractères ASCII, 2 octets pour « é », jusqu'à 4 pour un emoji.

```python
print(len("café"))                  # 4 caractères
print(len("café".encode("utf-8")))  # 5 octets : le é en prend 2
```

:::metier En entreprise
« RÃ©sumÃ© » au lieu de « Résumé » dans un fichier : c'est le symptôme d'un fichier UTF-8 lu comme s'il était en Latin-1 (ou l'inverse). Les data engineers rencontrent ce problème chaque semaine avec des exports CSV. Règle d'or : **tout en UTF-8**, et préciser l'encodage à la lecture.
:::

## À retenir

- 1 octet = 8 bits = 256 valeurs ; avec n bits, 2ⁿ valeurs.
- Ko, Mo, Go, To : facteur 1 000 ; Kio, Mio, Gio : facteur 1 024.
- Débits en bits, tailles en octets : divisez par 8.
- UTF-8 est l'encodage de référence ; les caractères accentués y prennent plus d'un octet.

<!-- @lecon fond-fichiers -->
Les données arrivent toujours sous forme de fichiers : des CSV envoyés par un partenaire, des JSON renvoyés par une API, des journaux d'application, des images. Savoir reconnaître un format et ce qu'il implique est un réflexe de professionnel.

## Fichier, dossier, chemin

- Un **fichier** contient des données ; son **nom** se termine souvent par une **extension** (`.csv`, `.json`, `.py`) qui indique son format.
- Un **dossier** (*directory*) contient des fichiers et d'autres dossiers.
- Un **chemin** (*path*) donne l'adresse d'un fichier : `/home/ada/projet/ventes.csv` sous Linux, `C:\Users\Ada\projet\ventes.csv` sous Windows.

:::attention
L'extension n'est qu'une convention : renommer `photo.jpg` en `photo.csv` ne la transforme pas en tableau. C'est le contenu qui compte.
:::

## Fichiers texte et fichiers binaires

- Un **fichier texte** est lisible par un humain dans un éditeur : `.txt`, `.csv`, `.json`, `.yaml`, `.py`, `.sql`, `.md`. Tous les fichiers de configuration et de code sont des fichiers texte.
- Un **fichier binaire** n'a de sens que pour un programme : images, vidéos, `.xlsx`, `.parquet`, `.zip`, programmes exécutables.

## Les formats à connaître

| Format | Exemple | Usage |
|---|---|---|
| CSV | `nom,ville` puis une ligne par enregistrement | échanges de tableaux, exports |
| JSON | `{"nom": "Ada", "langages": ["Python"]}` | API web, données imbriquées |
| YAML | `nom: Ada` | fichiers de configuration (Docker Compose, Kubernetes, CI) |
| Parquet | binaire, en colonnes | stockage analytique (data lakes) |
| Markdown | `# Titre` | documentation, README |

:::exemple Le même client dans trois formats
CSV :
```text
id,nom,ville
1,Ada,Londres
```
JSON :
```json
{"id": 1, "nom": "Ada", "ville": "Londres"}
```
YAML :
```yaml
id: 1
nom: Ada
ville: Londres
```
:::

## La compression

Un fichier **compressé** (`.zip`, `.gz`) prend moins de place en réorganisant les répétitions. Les fichiers texte se compressent très bien (souvent 5 à 10 fois). En data engineering, on compresse systématiquement les gros fichiers : moins de stockage payé, des transferts plus rapides.

:::metier En entreprise
Le module Data engineering reviendra en détail sur ces formats : pourquoi Parquet remplace CSV pour l'analyse, comment JSON gère les données imbriquées, pourquoi YAML est partout dans le DevOps. Retenez dès maintenant : **CSV pour échanger, JSON pour les API, YAML pour configurer, Parquet pour analyser**.
:::

## À retenir

- Un chemin désigne un fichier ; l'extension indique (sans garantir) le format.
- Texte (lisible : CSV, JSON, YAML, code) contre binaire (images, Parquet, archives).
- CSV pour échanger, JSON pour les API, YAML pour configurer, Parquet pour analyser.
- Les fichiers texte se compressent très bien.

<!-- @lecon fond-internet -->
Quand vous tapez une adresse dans votre navigateur, une dizaine de machines collaborent en quelques millisecondes pour vous afficher la page. Comprendre ce trajet, c'est comprendre le terrain de jeu de tous les métiers du cloud.

## Client et serveur

- Le **client** (votre navigateur, une application, un script Python) **demande** quelque chose.
- Le **serveur** **répond** : une page web, des données au format JSON, un fichier.

Une API (*Application Programming Interface*) est un serveur conçu pour répondre à des programmes plutôt qu'à des humains.

## Adresses IP et noms de domaine

Chaque machine connectée a une **adresse IP**, par exemple `93.184.215.14` (IPv4) ou `2606:2800:21f:cb07::1` (IPv6).

:::analogie Pour comprendre
L'adresse IP est le numéro de téléphone d'une machine. Le **nom de domaine** (`example.com`) est le nom dans le répertoire. Le **DNS** (*Domain Name System*) est l'annuaire qui traduit le nom en numéro.
:::

## Le voyage d'une requête

1. Vous tapez `https://www.example.com/catalogue`.
2. Votre machine demande au **DNS** l'adresse IP de `www.example.com`.
3. Elle ouvre une connexion **TCP** vers cette adresse, sur le **port** 443 (celui de HTTPS).
4. Une négociation **TLS** chiffre la connexion (le cadenas du navigateur).
5. Le navigateur envoie une requête **HTTP** : « GET /catalogue ».
6. Le serveur répond avec un **code** (200 = OK, 404 = introuvable, 500 = erreur du serveur) et le contenu.
7. Le navigateur affiche la page, et refait souvent ce voyage pour chaque image ou script.

```bash
curl -I https://example.com
```

`curl -I` affiche seulement la réponse du serveur : le code et les en-têtes. Vous pouvez l'essayer dans le terminal de l'application (qui simule `curl` vers les serveurs locaux).

## Les codes HTTP à connaître

| Famille | Sens | Exemples |
|---|---|---|
| 2xx | succès | 200 OK, 201 créé |
| 3xx | redirection | 301 déplacé définitivement |
| 4xx | erreur du **client** | 400 requête invalide, 401 non authentifié, 403 interdit, 404 introuvable, 429 trop de requêtes |
| 5xx | erreur du **serveur** | 500 erreur interne, 502/503 service indisponible |

:::astuce
Code 4xx : c'est (probablement) votre requête qui est en cause. Code 5xx : c'est le serveur. Ce simple réflexe accélère énormément les diagnostics.
:::

:::metier En entreprise
Un data engineer récupère des données sur des API : il doit gérer les erreurs 429 (« vous allez trop vite », il faut ralentir), les 401 (jeton d'accès expiré), les 5xx (réessayer plus tard). Un ingénieur cloud configure le DNS, les certificats TLS et les répartiteurs de charge qui reçoivent ces requêtes. Le module Réseaux approfondit tout cela.
:::

## À retenir

- Client demande, serveur répond ; une API répond à des programmes.
- IP = numéro, nom de domaine = nom, DNS = annuaire.
- Requête : DNS → connexion TCP (port 443) → TLS → HTTP → code de réponse.
- 2xx succès, 4xx erreur du client, 5xx erreur du serveur.

<!-- @lecon fond-programmer -->
Programmer, ce n'est pas connaître un langage par cœur : c'est savoir **décomposer un problème** en étapes si précises qu'une machine peut les exécuter. Cette compétence s'apprend, et elle commence avant même d'écrire du code.

## Algorithme et programme

- Un **algorithme** est une suite d'étapes non ambiguës qui résout un problème. Une recette de cuisine bien écrite en est un.
- Un **programme** est un algorithme écrit dans un **langage de programmation** (Python, SQL, Bash…) que la machine sait exécuter.

:::analogie Pour comprendre
Expliquez à quelqu'un qui n'a jamais vu de cuisine comment faire un œuf au plat. « Cassez l'œuf » ne suffit pas : où ? dans quoi ? la poêle est-elle chaude ? Programmer, c'est apprendre ce niveau de précision. L'ordinateur est un exécutant infatigable mais totalement littéral.
:::

## Les quatre briques de tout programme

Tous les langages, du plus simple au plus avancé, reposent sur les mêmes briques :

1. **Les variables** : mémoriser une valeur sous un nom (`total = 0`).
2. **Les conditions** : faire un choix (`si le stock est vide, alors commander`).
3. **Les boucles** : répéter (`pour chaque ligne du fichier, …`).
4. **Les fonctions** : regrouper des étapes sous un nom réutilisable (`calculer_tva(prix)`).

```python
# Les quatre briques en une dizaine de lignes
def prix_ttc(prix_ht):               # fonction
    return prix_ht * 1.20

panier = [12.5, 30, 7.9]             # variable (une liste)
total = 0
for prix in panier:                  # boucle
    total = total + prix_ttc(prix)

if total > 50:                       # condition
    print("Livraison offerte !")
print("Total TTC :", round(total, 2))
```

Cliquez sur « ▶ Essayer » : le code s'ouvre dans le labo Python, modifiez les prix et observez.

## La pensée « informatique »

:::methode Décomposer un problème
1. **Reformuler** : qu'entre-t-il ? que doit-il sortir ? (les entrées et la sortie).
2. **Prendre un exemple** concret et le résoudre à la main.
3. **Découper** en petites étapes, chacune simple.
4. **Repérer les répétitions** (une boucle ?) et les **choix** (une condition ?).
5. **Écrire** le code étape par étape, en testant au fur et à mesure.
6. **Tester les cas limites** : liste vide, valeur nulle, très grand nombre.
:::

## Les langages de votre futur métier

| Langage | Sert à | Où vous le verrez |
|---|---|---|
| Bash | piloter le système | terminal, scripts, CI |
| Python | programmer, automatiser, traiter des données | pipelines, scripts, API |
| SQL | interroger des bases de données | partout où il y a des données |
| YAML | décrire une configuration | Docker Compose, Kubernetes, CI/CD |
| HCL (Terraform) | décrire une infrastructure | infrastructure as code |

:::futur Tendance
Les assistants d'IA écrivent désormais une partie du code. Cela rend la pensée algorithmique **plus** importante, pas moins : il faut savoir décomposer le problème, relire le code proposé, détecter l'erreur, tester. Un professionnel qui comprend ce qu'il fait reste indispensable.
:::

## À retenir

- Un algorithme = des étapes précises ; un programme = un algorithme dans un langage.
- Quatre briques universelles : variables, conditions, boucles, fonctions.
- Méthode : entrées/sortie → exemple à la main → découpage → code → cas limites.
- Bash, Python, SQL, YAML, HCL : les langages des métiers data et cloud.

<!-- @lecon fond-cloud -->
Le mot « cloud » est partout dans les offres d'emploi. Avant le module dédié, voici l'essentiel en une leçon : ce que c'est, pourquoi toutes les entreprises y vont, et ce que cela change pour les métiers.

## Avant le cloud

Il y a vingt ans, une entreprise qui voulait un nouveau site web devait acheter des serveurs, attendre leur livraison, les installer dans une salle climatisée, les brancher, les maintenir… et les dimensionner pour le pic de fréquentation de l'année, même s'ils dormaient le reste du temps.

## Ce que change le cloud

Le **cloud computing** consiste à **louer** de la puissance informatique (serveurs, stockage, bases de données, outils d'IA…) chez un fournisseur, **à la demande**, via Internet, et à **payer à l'usage**.

:::analogie Pour comprendre
Avant, chaque entreprise construisait sa propre centrale électrique. Avec le cloud, elle se branche sur le réseau et paie sa consommation. Elle peut doubler sa puissance en quelques minutes pour les soldes, puis la réduire.
:::

Les cinq caractéristiques du cloud (définition du NIST, l'institut de normalisation américain) :

1. **Libre-service** : on crée ses ressources soi-même, sans attendre personne.
2. **Accès par le réseau**, depuis n'importe où.
3. **Mutualisation** : les ressources physiques sont partagées entre clients.
4. **Élasticité** : on augmente ou réduit la capacité en quelques minutes.
5. **Paiement à l'usage** : à la seconde, au Go stocké, à la requête.

## Les trois grands fournisseurs… et les autres

- **AWS** (Amazon Web Services), **Microsoft Azure** et **Google Cloud** dominent le marché mondial.
- Des fournisseurs européens comme **OVHcloud**, **Scaleway** ou **Outscale** sont choisis pour des raisons de souveraineté (les données restent sous droit européen). En France, la qualification **SecNumCloud** de l'ANSSI distingue les offres de confiance pour les données sensibles.

## Ce que cela change pour les métiers

:::metier En entreprise
- Le **data engineer** utilise des services de données managés (stockage objet, entrepôts de données, outils de traitement) au lieu d'installer lui-même des serveurs.
- L'**ingénieur cloud** conçoit l'architecture (réseau, sécurité, haute disponibilité) et maîtrise les coûts.
- L'**ingénieur DevOps** automatise le déploiement des applications dans le cloud.

Tous écrivent de plus en plus leur infrastructure **sous forme de code** et la versionnent dans Git.
:::

:::attention
Le cloud n'est pas magique : une ressource oubliée continue d'être facturée, une mauvaise configuration peut exposer des données au monde entier. Coûts et sécurité sont des compétences à part entière, très recherchées.
:::

## À retenir

- Cloud = louer à la demande, via Internet, avec paiement à l'usage.
- Libre-service, accès réseau, mutualisation, élasticité, facturation à l'usage.
- AWS, Azure, Google Cloud dominent ; des acteurs européens répondent aux besoins de souveraineté.
- Coûts et sécurité font partie du métier.
