<!-- @lecon cont-pourquoi -->
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

<!-- @lecon cont-docker-base -->
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

<!-- @lecon cont-dockerfile -->
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

<!-- @lecon cont-compose -->
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

<!-- @lecon k8s-architecture -->
Faire tourner trois conteneurs sur une machine, c'est simple. En faire tourner trois cents, sur vingt machines, en remplaçant automatiquement ceux qui plantent et en ajoutant des copies quand le trafic monte, c'est le travail d'un **orchestrateur**. **Kubernetes** (souvent abrégé **K8s**) est devenu le standard.

## Ce que fait Kubernetes

- **Planifier** : décider sur quelle machine placer chaque conteneur.
- **Auto-réparer** : redémarrer un conteneur qui plante, en recréer un si une machine tombe.
- **Mettre à l'échelle** : ajuster le nombre de copies.
- **Déployer progressivement** une nouvelle version, et revenir en arrière.
- **Exposer** les applications et répartir le trafic.

:::analogie Pour comprendre
Kubernetes est un chef d'orchestre. Vous ne dites pas à chaque musicien quand jouer ; vous donnez la partition (l'**état désiré** : « je veux 3 copies de mon API, version 2.1 »), et le chef veille en permanence à ce que l'orchestre la respecte. Si un musicien s'arrête, il en fait entrer un autre.
:::

## L'architecture d'un cluster

- Le **plan de contrôle** (*control plane*) : le cerveau. Il contient l'**API server** (par où passent toutes les commandes), la base **etcd** (l'état du cluster), le **planificateur** (*scheduler*) et les **contrôleurs** (qui comparent sans cesse l'état réel à l'état désiré).
- Les **nœuds** (*nodes*) : les machines qui exécutent les conteneurs, avec l'agent **kubelet**.

Dans le cloud, on utilise un Kubernetes **managé** (EKS, AKS, GKE) : le fournisseur gère le plan de contrôle.

## Les objets de base

| Objet | Rôle |
|---|---|
| **Pod** | la plus petite unité : un (ou quelques) conteneurs qui tournent ensemble |
| **Deployment** | maintient N copies (réplicas) d'un pod et gère les mises à jour |
| **Service** | une adresse stable pour joindre un ensemble de pods, avec répartition de charge |
| **ConfigMap / Secret** | configuration et données sensibles injectées dans les pods |
| **Namespace** | un espace pour séparer équipes ou environnements |
| **Ingress** | l'entrée HTTP depuis l'extérieur, avec routage par nom ou chemin |

## Déclaratif

On ne dit pas à Kubernetes **comment** faire, on lui décrit **ce que l'on veut**, dans des fichiers YAML (les **manifestes**), et on les applique :

```bash
kubectl apply -f deploiement.yaml
kubectl get pods
```

C'est l'outil **kubectl** qui dialogue avec l'API server. Le terminal de l'application simule un petit cluster pour vous entraîner.

## À retenir

- Kubernetes orchestre les conteneurs : planification, auto-réparation, mise à l'échelle, déploiements.
- Plan de contrôle (API server, etcd, scheduler, contrôleurs) + nœuds (kubelet).
- Pod, Deployment, Service, ConfigMap/Secret, Namespace, Ingress.
- Déclaratif : on décrit l'état désiré en YAML, `kubectl apply -f`.

<!-- @lecon k8s-deploiement -->
Votre première application sur Kubernetes : un **Deployment** pour faire tourner les pods, un **Service** pour les joindre. Ces deux manifestes sont les plus écrits du monde Kubernetes.

## Le Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: nginx:1.27
          ports:
            - containerPort: 80
```

Lisez-le de haut en bas :

- `apiVersion` et `kind` : quel type d'objet (un Deployment se déclare en `apps/v1`) ;
- `metadata.name` : son nom ;
- `spec.replicas` : le nombre de pods voulus ;
- `spec.selector.matchLabels` : quels pods ce Deployment gère (ceux qui portent l'étiquette `app: api`) ;
- `spec.template` : le **modèle** des pods à créer — leurs **étiquettes** (qui doivent correspondre au sélecteur) et leurs conteneurs.

:::piege Piège classique
Les étiquettes du `selector` doivent se retrouver **exactement** dans `template.metadata.labels`, sinon Kubernetes refuse le manifeste. Et en YAML, l'indentation se fait avec des **espaces** (deux par niveau), jamais des tabulations.
:::

## Le Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

Le Service sélectionne les pods par leurs étiquettes et leur donne une adresse stable (et un nom DNS interne : `api`). Les pods peuvent mourir et renaître avec d'autres adresses : le Service, lui, ne change pas.

| Type de Service | Accessible depuis |
|---|---|
| `ClusterIP` (défaut) | l'intérieur du cluster seulement |
| `NodePort` | un port de chaque nœud |
| `LoadBalancer` | Internet, via un équilibreur de charge du fournisseur cloud |

## Les commandes du quotidien

```bash
kubectl apply -f deploiement.yaml
kubectl get deployments
kubectl get pods
kubectl describe pod <nom>
kubectl logs <nom-du-pod>
kubectl delete -f deploiement.yaml
```

:::astuce Diagnostiquer un pod qui ne démarre pas
`kubectl get pods` affiche le statut : `Running` (ça tourne), `ErrImagePull` / `ImagePullBackOff` (l'image est introuvable : faute de frappe, registre privé), `CrashLoopBackOff` (le conteneur démarre puis plante en boucle : lire `kubectl logs`). Ensuite, `kubectl describe pod` montre les **événements** qui expliquent la situation.
:::

## À retenir

- Deployment : `apiVersion: apps/v1`, `replicas`, `selector.matchLabels` = `template.metadata.labels`, conteneurs.
- Service : sélectionne les pods par étiquettes, adresse et nom DNS stables ; ClusterIP, NodePort, LoadBalancer.
- `kubectl apply -f`, `get`, `describe`, `logs`, `delete`.
- Statuts à connaître : Running, ErrImagePull, CrashLoopBackOff.

<!-- @lecon k8s-config -->
Une application a besoin de configuration (adresse de la base, niveau de journalisation), de secrets (mots de passe), de ressources (mémoire, processeur) et doit dire à Kubernetes si elle va bien. Voici comment.

## ConfigMap et Secret

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  NIVEAU_LOG: info
  URL_BASE: postgresql://base:5432/app
```

Un **Secret** a la même forme, pour les données sensibles. On les injecte dans les conteneurs comme variables d'environnement :

```yaml
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
```

:::attention Un Secret n'est pas chiffré par défaut
Les valeurs d'un Secret Kubernetes sont seulement encodées en base64 (ce n'est pas du chiffrement). On protège les Secrets par des droits d'accès stricts, le chiffrement d'etcd, ou un gestionnaire externe (coffre-fort du fournisseur cloud, HashiCorp Vault), et on ne les commite jamais en clair dans Git.
:::

## Les ressources

```yaml
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi
```

- **requests** : ce que le pod réserve ; le planificateur s'en sert pour choisir un nœud ;
- **limits** : le maximum ; un conteneur qui dépasse sa limite mémoire est tué (*OOMKilled*).

`250m` = 250 millièmes d'un processeur ; `256Mi` = 256 mébioctets.

## Les sondes de santé (probes)

- **readinessProbe** : le pod est-il **prêt** à recevoir du trafic ? Tant qu'il ne l'est pas, le Service ne lui envoie rien.
- **livenessProbe** : le pod est-il **vivant** ? Sinon, Kubernetes redémarre le conteneur.

```yaml
          readinessProbe:
            httpGet:
              path: /sante
              port: 8000
          livenessProbe:
            httpGet:
              path: /sante
              port: 8000
            initialDelaySeconds: 10
```

:::metier En entreprise
Des requests et limits bien réglées et des sondes correctes sont la différence entre un cluster stable et des pannes mystérieuses en production. Ce sont aussi des questions fréquentes en entretien DevOps et dans la certification CKA.
:::

## À retenir

- ConfigMap (configuration) et Secret (données sensibles, seulement encodées en base64) ; injection par `envFrom` ou `env`.
- requests (réservation, planification) et limits (plafond ; dépassement mémoire = OOMKilled).
- readinessProbe (prêt à recevoir du trafic) et livenessProbe (vivant, sinon redémarrage).

<!-- @lecon k8s-echelle -->
Le trafic double le lundi matin ; une nouvelle version doit être mise en production sans interruption ; la mise à jour se passe mal et il faut revenir en arrière. Kubernetes gère ces trois situations nativement.

## Mettre à l'échelle

```bash
kubectl scale deployment api --replicas=6
```

Ou en modifiant `replicas` dans le manifeste, puis `kubectl apply` (c'est la méthode recommandée : le fichier reste la source de vérité).

## La mise à l'échelle automatique

Le **HorizontalPodAutoscaler** (HPA) ajuste le nombre de réplicas selon une métrique :

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

« Entre 2 et 10 pods, de façon à ce que l'utilisation moyenne du processeur reste autour de 70 % des requests. » (D'où l'importance de définir des requests.)

## La mise à jour progressive (rolling update)

```bash
kubectl set image deployment/api api=monregistre/api:2.1
kubectl rollout status deployment/api
```

Par défaut, un Deployment remplace les pods **progressivement** : il crée quelques pods de la nouvelle version, attend qu'ils soient prêts (readinessProbe), puis supprime d'anciens pods, et ainsi de suite. Aucune interruption de service si les sondes sont bien configurées.

## Le retour arrière

```bash
kubectl rollout history deployment/api
kubectl rollout undo deployment/api
```

## L'auto-réparation

Supprimez un pod d'un Deployment : Kubernetes en recrée un immédiatement, car l'état réel (2 pods) ne correspond plus à l'état désiré (3). C'est la boucle de réconciliation, au cœur de Kubernetes.

## À retenir

- `kubectl scale` ou `replicas` dans le manifeste (source de vérité).
- HPA : min/max réplicas selon le CPU (requests indispensables).
- Rolling update : `kubectl set image`, `kubectl rollout status` ; retour arrière avec `rollout undo`.
- Auto-réparation : Kubernetes ramène toujours l'état réel vers l'état désiré.

<!-- @lecon k8s-ecosysteme -->
Kubernetes est le centre d'un vaste écosystème, porté par la **CNCF** (*Cloud Native Computing Foundation*, Linux Foundation). Voici les outils que vous rencontrerez le plus souvent autour d'un cluster.

## Helm : les paquets Kubernetes

Déployer une application complète demande souvent une dizaine de manifestes. **Helm** les regroupe en un **chart** paramétrable (comme un paquet `apt` ou `pip` pour Kubernetes) :

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install ma-base bitnami/postgresql --set auth.database=app
helm upgrade ma-base bitnami/postgresql
helm list
```

Des valeurs (`values.yaml`) personnalisent le chart selon l'environnement.

## Ingress et Gateway API : l'entrée HTTP

Un **Ingress** route le trafic HTTP externe vers les Services, selon le nom de domaine ou le chemin :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: site
spec:
  rules:
    - host: boutique.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
```

Il nécessite un **contrôleur d'Ingress** installé dans le cluster. La **Gateway API**, plus récente et plus riche, est appelée à lui succéder progressivement : vérifiez ce qu'utilise votre équipe.

## Les autres briques de l'écosystème

| Besoin | Outils courants |
|---|---|
| Déploiement continu « GitOps » | Argo CD, Flux |
| Métriques et alertes | Prometheus, Grafana |
| Journaux | Loki, Elasticsearch/OpenSearch |
| Traces | OpenTelemetry, Jaeger, Tempo |
| Certificats TLS automatiques | cert-manager |
| Politiques de sécurité | Kyverno, OPA Gatekeeper |
| Maillage de services | Istio, Linkerd |
| Tâches planifiées | CronJob (natif) |

:::astuce Ne pas tout apprendre
Le paysage CNCF compte des centaines de projets. Concentrez-vous sur le cœur (Deployment, Service, ConfigMap, Ingress), puis Helm, Prometheus/Grafana et un outil GitOps : c'est ce que demandent la plupart des offres.
:::

## Kubernetes pour la data

Les plateformes data utilisent aussi Kubernetes : Spark sur Kubernetes, Airflow avec l'exécuteur Kubernetes (chaque tâche dans son pod), Kafka via des opérateurs. Un **opérateur** est un contrôleur spécialisé qui sait installer et exploiter un logiciel complexe (une base de données, Kafka) à partir d'une simple ressource YAML.

## À retenir

- Helm : charts paramétrables pour installer des applications complètes.
- Ingress (et la Gateway API qui lui succède) : entrée HTTP, routage par nom et chemin.
- GitOps (Argo CD, Flux), observabilité (Prometheus, Grafana, OpenTelemetry), cert-manager.
- Opérateurs : exploiter des logiciels complexes sur Kubernetes.

<!-- @lecon cont-securite -->
Un conteneur partage le noyau de sa machine hôte ; une image peut contenir des centaines de bibliothèques, chacune avec ses failles. La sécurité des conteneurs se joue à la construction, au stockage et à l'exécution.

## Construire des images sûres

:::methode Les bonnes pratiques
1. **Images de base minimales** (`-slim`, `alpine`, ou images *distroless* sans shell) : moins de logiciels, moins de failles.
2. **Versions fixées** : jamais `latest` en production ; idéalement, référence par empreinte (*digest*).
3. **Utilisateur non root** dans l'image (`USER`).
4. **Aucun secret** dans l'image ni dans son historique de construction.
5. **Construction en plusieurs étapes** : les outils de compilation ne vont pas dans l'image finale.
:::

## Analyser les vulnérabilités

Des **scanners** (Trivy, Grype, ou ceux des registres cloud) comparent le contenu d'une image aux bases de vulnérabilités connues (**CVE**) :

```bash
trivy image monregistre/api:2.1
```

On les intègre à la chaîne d'intégration continue : une image avec une faille critique ne part pas en production.

## La chaîne d'approvisionnement logicielle

Une attaque peut viser non pas votre code, mais ce dont il dépend (une bibliothèque compromise, une image piégée). Les réponses :

- un **SBOM** (*Software Bill of Materials*), la liste de tous les composants d'une image ;
- la **signature** des images (Sigstore/cosign) et la vérification avant déploiement ;
- des registres de confiance et des images de base officielles.

## À l'exécution

- Ne jamais lancer de conteneurs **privilégiés** sans nécessité absolue.
- Système de fichiers en lecture seule quand c'est possible.
- Dans Kubernetes : **standards de sécurité des pods** (*Pod Security Standards*), politiques réseau (*NetworkPolicy*) pour limiter qui parle à qui, droits RBAC minimaux, Secrets protégés.

:::metier En entreprise
La sécurité de la chaîne d'approvisionnement est devenue une priorité depuis plusieurs attaques retentissantes ayant touché des éditeurs de logiciels. Les réglementations européennes (comme le Cyber Resilience Act pour les produits comportant des éléments numériques) renforcent ces exigences : savoir produire un SBOM et scanner ses images devient une compétence attendue des profils DevOps.
:::

## À retenir

- Images minimales, versionnées, non root, sans secret, multi-étapes.
- Scanner les images (Trivy, Grype) dans la CI ; bloquer les failles critiques.
- Chaîne d'approvisionnement : SBOM, signature des images, sources de confiance.
- Exécution : pas de privilèges inutiles, Pod Security Standards, NetworkPolicy, RBAC minimal.
