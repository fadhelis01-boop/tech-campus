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
