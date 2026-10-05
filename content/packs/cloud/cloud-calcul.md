Exécuter du code est le premier besoin. Le cloud propose une gamme de solutions, de la machine virtuelle que l'on administre entièrement jusqu'à la fonction que l'on ne voit même pas tourner.

## Le spectre des options

| Option | Vous gérez | Facturation | Idéal pour |
|---|---|---|---|
| **Machine virtuelle** | OS, mises à jour, logiciels | à la seconde/heure tant qu'elle tourne | logiciels traditionnels, contrôle total |
| **Conteneurs managés** (Kubernetes : EKS, AKS, GKE) | les conteneurs et le cluster (en partie) | les nœuds du cluster | nombreuses applications, besoins avancés |
| **Conteneurs serverless** (Cloud Run, Fargate, Container Apps) | seulement le conteneur | à la requête / au temps d'exécution | API, services web |
| **Fonctions serverless** (Lambda, Azure Functions) | seulement le code | à l'invocation et à la durée | traitements événementiels courts |

## Les machines virtuelles

On choisit un **type d'instance** (famille et taille : nombre de vCPU, mémoire), une **image** (le système), un disque, un réseau et un groupe de sécurité.

Trois modes d'achat, à connaître pour les certifications et pour les coûts :

- **À la demande** : flexible, le plus cher.
- **Engagement** (instances réservées, *savings plans*) : engagement sur 1 ou 3 ans contre une remise importante.
- **Capacité excédentaire** (instances *spot*) : très bon marché, mais peut être reprise par le fournisseur avec un court préavis ; parfait pour des traitements interruptibles (calculs par lots).

## La mise à l'échelle

- **Verticale** (*scale up*) : une machine plus grosse. Simple, mais limitée et souvent avec interruption.
- **Horizontale** (*scale out*) : plus de machines identiques derrière un équilibreur. C'est la voie du cloud.
- **Automatique** (*autoscaling*) : le nombre de machines suit une métrique (charge CPU, nombre de requêtes).

:::retenir
Pour pouvoir ajouter et retirer des serveurs librement, ils doivent être **sans état** (*stateless*) : aucune donnée importante ne doit rester sur le serveur lui-même (on la met en base, en cache partagé ou en stockage objet).
:::

## Le serverless

Avec une fonction serverless, on écrit seulement le code qui réagit à un **événement** : un fichier déposé dans un stockage, un message dans une file, une requête HTTP, une échéance planifiée.

```python
# Exemple de fonction déclenchée par l'arrivée d'un fichier (schéma générique)
def traiter(evenement, contexte):
    fichier = evenement["fichier"]
    print(f"Nouveau fichier reçu : {fichier}")
    # lire, valider, charger…
    return {"statut": "ok"}
```

Avantages : rien à administrer, mise à l'échelle automatique, facturation à l'usage (gratuit quand rien ne se passe). Limites : durée d'exécution maximale, démarrages à froid (*cold start*), plus difficile à tester et à observer.

:::metier En entreprise
Un data engineer utilise souvent une fonction serverless pour réagir à l'arrivée d'un fichier (le valider, déclencher le chargement) ; un ingénieur cloud déploie les API sur des conteneurs serverless et réserve Kubernetes aux plateformes plus complexes.
:::

## À retenir

- VM (contrôle total) → conteneurs managés → conteneurs serverless → fonctions (rien à gérer).
- À la demande, engagement (remise), spot (bon marché, interruptible).
- Mise à l'échelle horizontale et automatique, avec des serveurs sans état.
- Serverless : événementiel, facturation à l'usage, limites de durée et démarrages à froid.
