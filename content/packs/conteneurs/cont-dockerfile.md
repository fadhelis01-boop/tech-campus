Utiliser des images existantes, c'est bien ; **construire les siennes**, c'est indispensable. Le **Dockerfile** décrit, étape par étape, comment fabriquer l'image de votre application.

## Un premier Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "pipeline.py"]
```

| Instruction | Rôle |
|---|---|
| `FROM` | l'image de base (toujours la première instruction) |
| `WORKDIR` | le dossier de travail dans l'image |
| `COPY` | copie des fichiers de votre projet dans l'image |
| `RUN` | exécute une commande **pendant la construction** (installer des paquets) |
| `ENV` | définit une variable d'environnement |
| `EXPOSE` | documente le port écouté par l'application |
| `USER` | l'utilisateur sous lequel l'application tournera |
| `CMD` | la commande lancée **au démarrage du conteneur** |

:::piege Piège classique
`RUN` s'exécute à la **construction** de l'image ; `CMD` au **lancement** du conteneur. Installer des dépendances dans `CMD` les réinstallerait à chaque démarrage.
:::

## Construire et lancer

```bash
docker build -t mon-pipeline:1.0 .
docker run --rm mon-pipeline:1.0
```

- `-t nom:version` donne un nom et une **étiquette** (*tag*) à l'image ;
- le `.` final est le **contexte de construction** : le dossier dont `COPY` peut copier les fichiers.

## Les couches et le cache

Chaque instruction crée une **couche**. Docker réutilise les couches qui n'ont pas changé : c'est le **cache de construction**. D'où l'ordre du Dockerfile ci-dessus : on copie d'abord `requirements.txt` et on installe les dépendances (qui changent rarement), **puis** le code (qui change souvent). Une modification du code ne relance pas l'installation des dépendances.

## Les bonnes pratiques

:::methode Un Dockerfile de qualité
1. **Image de base minimale et versionnée** : `python:3.12-slim` plutôt que `python:latest` (latest change sans prévenir).
2. **Ordre favorable au cache** : dépendances avant le code.
3. **Un fichier `.dockerignore`** : exclure `.git`, `.venv`, les données, les secrets.
4. **Pas de secret dans l'image** (ni mot de passe, ni clé) : ils se passent au lancement (variables d'environnement, gestionnaire de secrets).
5. **Utilisateur non root** : `USER` à la fin.
6. **Construction en plusieurs étapes** (*multi-stage build*) pour ne garder dans l'image finale que le nécessaire.
:::

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home appli
USER appli
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

## À retenir

- FROM, WORKDIR, COPY, RUN (construction), CMD (démarrage), ENV, EXPOSE, USER.
- `docker build -t nom:version .` puis `docker run`.
- Couches et cache : dépendances avant le code.
- Image minimale et versionnée, .dockerignore, aucun secret, utilisateur non root.
