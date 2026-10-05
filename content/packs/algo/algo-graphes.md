Un réseau social, un plan de métro, des dépendances entre tâches d'un pipeline : ce sont des **graphes**. Les orchestrateurs de données comme Airflow manipulent justement des graphes de tâches (les DAG).

## Vocabulaire

- Un graphe est fait de **nœuds** (sommets) reliés par des **arêtes**.
- Il est **orienté** si les arêtes ont un sens (A → B).
- Un **DAG** (*Directed Acyclic Graph*) est un graphe orienté **sans cycle** : on ne peut jamais revenir à son point de départ en suivant les flèches.

## Représenter un graphe en Python

```python
dependances = {
    "extraire_ventes": [],
    "extraire_clients": [],
    "nettoyer": ["extraire_ventes", "extraire_clients"],
    "charger": ["nettoyer"],
    "rapport": ["charger"],
}
```

(Ici : chaque tâche → la liste des tâches dont elle dépend.)

## Parcours en largeur (BFS)

Le **parcours en largeur** visite les voisins proches d'abord, avec une file. Il trouve le **plus court chemin** en nombre d'étapes :

```python
from collections import deque

def plus_court_chemin(graphe, depart, arrivee):
    file = deque([[depart]])
    vus = {depart}
    while file:
        chemin = file.popleft()
        noeud = chemin[-1]
        if noeud == arrivee:
            return chemin
        for voisin in graphe.get(noeud, []):
            if voisin not in vus:
                vus.add(voisin)
                file.append(chemin + [voisin])
    return None

metro = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": ["F"], "E": ["F"], "F": []}
print(plus_court_chemin(metro, "A", "F"))
```

Le **parcours en profondeur** (DFS) explore une branche jusqu'au bout avant de revenir, avec une pile ou la récursion.

## Le tri topologique

Dans quel ordre exécuter des tâches qui dépendent les unes des autres ? Le **tri topologique** d'un DAG donne un ordre où chaque tâche vient après ses dépendances. C'est exactement ce que fait Airflow pour planifier un pipeline. Python le fournit :

```python
from graphlib import TopologicalSorter
print(list(TopologicalSorter(dependances).static_order()))
```

Si le graphe contient un cycle (A dépend de B qui dépend de A), il n'y a pas d'ordre possible : une erreur est levée.

## À retenir

- Graphe = nœuds + arêtes ; DAG = orienté sans cycle.
- Représentation : dictionnaire nœud → voisins.
- BFS (file) : plus court chemin en nombre d'étapes ; DFS (pile/récursion) : exploration en profondeur.
- Tri topologique : ordre d'exécution de tâches dépendantes (Airflow, dbt, outils de build).
