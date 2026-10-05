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
