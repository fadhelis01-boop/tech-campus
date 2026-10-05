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
