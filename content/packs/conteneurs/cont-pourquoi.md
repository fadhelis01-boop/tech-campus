« Ça marche sur ma machine ! » Cette phrase a fait perdre des milliers d'heures aux équipes informatiques : une version de Python différente, une bibliothèque manquante, une configuration oubliée, et l'application refuse de démarrer en production. Les **conteneurs** ont résolu ce problème, et sont devenus la façon standard de livrer un logiciel.

## L'idée

Un **conteneur** emballe une application **avec tout ce dont elle a besoin** : son code, son langage, ses bibliothèques, sa configuration. Il s'exécute de la même façon sur le poste du développeur, sur le serveur de test et en production.

:::analogie Pour comprendre
Avant les conteneurs maritimes, chaque marchandise se chargeait différemment (sacs, tonneaux, caisses) : lent et risqué. Le conteneur standard a tout changé : peu importe ce qu'il contient, tous les navires, grues et camions savent le manipuler. Les conteneurs logiciels font la même chose pour les applications.
:::

## Conteneur ou machine virtuelle ?

| | Machine virtuelle | Conteneur |
|---|---|---|
| Ce qui est virtualisé | tout un ordinateur, avec son propre système d'exploitation | seulement l'application, qui partage le noyau de l'hôte |
| Taille | plusieurs Go | quelques dizaines à centaines de Mo |
| Démarrage | des minutes | des secondes, voire moins |
| Isolation | très forte | forte, mais partage du noyau |
| Densité | quelques VM par serveur | des dizaines de conteneurs |

Les deux se combinent : dans le cloud, les conteneurs tournent souvent… dans des machines virtuelles.

## Le vocabulaire de Docker

**Docker** est l'outil qui a popularisé les conteneurs.

- **Image** : le modèle, en lecture seule (comme une recette ou un moule). Exemple : `nginx`, `python:3.12-slim`, `postgres:16`.
- **Conteneur** : une instance **en cours d'exécution** d'une image (le gâteau sorti du moule). On peut lancer plusieurs conteneurs à partir de la même image.
- **Registre** (*registry*) : le dépôt où l'on publie et récupère les images. **Docker Hub** est le registre public principal ; chaque fournisseur cloud a le sien.
- **Dockerfile** : la recette qui décrit comment construire une image.

## Votre premier conteneur

```bash
docker run hello-world
```

Docker cherche l'image `hello-world` localement, la télécharge depuis Docker Hub si elle n'y est pas, crée un conteneur, l'exécute et affiche le message. Essayez-le dans le terminal de l'application.

:::metier En entreprise
Les conteneurs sont partout : les data engineers y emballent leurs pipelines (pour qu'Airflow ou Kubernetes les exécutent), les développeurs leurs API, les équipes DevOps toute la chaîne de déploiement. Savoir écrire un Dockerfile et lancer un conteneur est attendu de tous les profils techniques.
:::

## À retenir

- Un conteneur emballe l'application et ses dépendances : même comportement partout.
- Conteneur = léger et rapide, partage le noyau ; VM = système complet, plus lourde.
- Image (modèle), conteneur (instance en cours), registre (dépôt d'images), Dockerfile (recette).
- `docker run hello-world` pour vérifier que tout fonctionne.
