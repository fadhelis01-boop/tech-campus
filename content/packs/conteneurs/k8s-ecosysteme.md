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
