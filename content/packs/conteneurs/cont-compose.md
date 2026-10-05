Une application réelle comporte plusieurs morceaux : une API, une base de données, un cache, parfois un outil d'administration. Les lancer un par un avec `docker run` devient vite pénible. **Docker Compose** décrit l'ensemble dans un seul fichier.

## Le fichier compose.yaml

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://app:secret@base:5432/app
    depends_on:
      - base
  base:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - donnees:/var/lib/postgresql/data

volumes:
  donnees:
```

- `services` : chaque conteneur de l'application ;
- `build: .` construit l'image à partir du Dockerfile du dossier ; `image:` utilise une image existante ;
- `ports`, `environment`, `volumes` : les mêmes notions qu'avec `docker run` ;
- `depends_on` : l'ordre de démarrage.

:::astuce Les services se trouvent par leur nom
Compose crée un réseau commun : l'API joint la base à l'adresse `base` (le nom du service), pas par une adresse IP. C'est pour cela que l'URL de connexion contient `@base:5432`.
:::

## Les commandes

```bash
docker compose up -d
docker compose ps
docker compose logs api
docker compose down
```

`up -d` construit si besoin et démarre tout en arrière-plan ; `down` arrête et supprime les conteneurs (pas les volumes nommés, sauf avec `-v`).

:::attention
Les mots de passe écrits dans `compose.yaml` conviennent pour un environnement **local** de développement. En production, ils viennent d'un gestionnaire de secrets, et on n'utilise généralement pas Compose mais un orchestrateur (Kubernetes) ou un service managé.
:::

:::metier En entreprise
Compose est l'outil idéal pour l'environnement de développement d'une équipe : un nouveau développeur clone le dépôt, tape `docker compose up`, et dispose en une minute de l'application complète avec sa base. Les data engineers l'utilisent pour lancer localement Airflow, PostgreSQL ou Kafka.
:::

## À retenir

- `compose.yaml` décrit tous les services : build/image, ports, environment, volumes, depends_on.
- Les services se joignent par leur nom (`base:5432`).
- `docker compose up -d`, `ps`, `logs`, `down`.
- Idéal en développement ; en production, orchestrateur et gestionnaire de secrets.
