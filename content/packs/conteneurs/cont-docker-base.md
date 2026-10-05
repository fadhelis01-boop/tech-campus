Lancer, observer, arrêter, supprimer : les commandes de base de Docker se maîtrisent en une séance. Elles s'utilisent ensuite tous les jours.

## Lancer un conteneur

```bash
docker run -d --name web -p 8080:80 nginx
```

| Option | Rôle |
|---|---|
| `-d` | en arrière-plan (*detached*) : la main revient tout de suite |
| `--name web` | donne un nom au conteneur (sinon Docker en invente un) |
| `-p 8080:80` | publie le port : le port **8080 de votre machine** est relié au port **80 du conteneur** |
| `-e CLE=valeur` | passe une variable d'environnement |
| `--rm` | supprime le conteneur automatiquement à l'arrêt |

:::piege Piège classique
L'ordre de `-p` : **hôte:conteneur**. `-p 8080:80` signifie « ce qui arrive sur mon port 8080 va au port 80 du conteneur ». Ensuite, on accède au service par `http://localhost:8080`.
:::

## Observer

```bash
docker ps
docker ps -a
docker logs web
docker images
```

- `docker ps` liste les conteneurs **en cours** ; `-a` ajoute ceux qui sont arrêtés ;
- `docker logs` affiche ce que le conteneur a écrit (indispensable pour diagnostiquer) ;
- `docker images` liste les images présentes localement.

## Arrêter, redémarrer, supprimer

```bash
docker stop web
docker start web
docker rm web
docker rm -f web
docker rmi nginx
```

On ne peut pas supprimer un conteneur en cours d'exécution sans `-f`, ni une image utilisée par un conteneur.

## Entrer dans un conteneur

```bash
docker exec -it web sh
```

`docker exec` exécute une commande dans un conteneur qui tourne (ici, un shell interactif). Pratique pour inspecter, mais on ne **modifie** jamais un conteneur à la main : au prochain redémarrage, les modifications seraient perdues. On modifie l'image (le Dockerfile).

## Les données : les volumes

Un conteneur est **jetable** : ce qu'il écrit disparaît avec lui. Pour conserver des données (une base de données, par exemple), on utilise un **volume** :

```bash
docker run -d --name base -e POSTGRES_PASSWORD=motdepasse -v donnees:/var/lib/postgresql/data postgres:16
```

Le volume `donnees` survit à la suppression du conteneur.

## À retenir

- `docker run -d --name … -p hôte:conteneur -e … image`.
- `docker ps (-a)`, `docker logs`, `docker images`.
- `docker stop/start/rm (-f)`, `docker rmi`.
- `docker exec -it … sh` pour inspecter, jamais pour modifier durablement.
- Un conteneur est jetable ; les données à conserver vont dans des volumes.
