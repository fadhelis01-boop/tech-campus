Le stockage est au cœur du métier de data engineer : les **data lakes** reposent sur le stockage objet. Encore faut-il choisir le bon type de stockage et la bonne classe de prix.

## Trois types de stockage

| Type | Principe | Exemples | Usage |
|---|---|---|---|
| **Objet** | des fichiers (« objets ») identifiés par une clé, dans des compartiments (*buckets*), accessibles par API HTTP | S3, Blob Storage, Cloud Storage | data lakes, sauvegardes, fichiers statiques, journaux |
| **Bloc** | un disque virtuel attaché à une machine | EBS, Managed Disks, Persistent Disk | système et données d'une VM, bases de données |
| **Fichier** | un système de fichiers partagé entre machines | EFS, Azure Files, Filestore | partage de fichiers entre serveurs |

## Le stockage objet en détail

- Un **compartiment** (*bucket*) a un nom unique ; il contient des objets désignés par une **clé** : `ventes/2026/10/05/ventes.parquet`.
- Il n'y a pas vraiment de dossiers : les `/` font partie de la clé (mais les consoles les affichent comme des dossiers).
- Capacité pratiquement illimitée, durabilité extrêmement élevée (les données sont copiées sur plusieurs zones).

:::attention Un compartiment public
Laisser un compartiment accessible publiquement par erreur est l'une des causes les plus fréquentes de fuites de données. Les fournisseurs bloquent désormais l'accès public **par défaut** : ne désactivez ce blocage que pour des contenus réellement publics (un site statique, par exemple).
:::

## Les classes de stockage

Le prix dépend de la fréquence d'accès :

| Classe | Accès | Prix du stockage | Prix de la lecture |
|---|---|---|---|
| Standard (chaud) | fréquent | le plus élevé | faible |
| Accès peu fréquent | quelques fois par mois | plus bas | plus élevé |
| Archive (froid) | exceptionnel, délai de récupération de minutes à heures | très bas | élevé |

Les **règles de cycle de vie** (*lifecycle rules*) déplacent automatiquement les objets vers une classe moins chère au bout d'un certain temps, puis les suppriment : « passer en archive après 90 jours, supprimer après 7 ans ».

## Autres fonctions utiles

- **Versionnage** : conserve les anciennes versions d'un objet (protection contre l'effacement accidentel).
- **Chiffrement** au repos, activé par défaut chez les grands fournisseurs.
- **Réplication** vers une autre région.
- **URL présignées** : un lien temporaire pour télécharger ou déposer un objet sans donner d'identifiants.

## À retenir

- Objet (data lakes, sauvegardes), bloc (disques de VM), fichier (partage).
- Bucket + clé ; capacité illimitée ; accès public bloqué par défaut — à garder ainsi.
- Classes standard, peu fréquent, archive ; règles de cycle de vie pour automatiser.
- Versionnage, chiffrement, réplication, URL présignées.
