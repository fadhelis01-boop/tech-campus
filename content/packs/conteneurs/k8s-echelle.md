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
