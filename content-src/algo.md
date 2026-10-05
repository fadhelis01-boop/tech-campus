<!-- @lecon algo-complexite -->
Deux programmes donnent le même résultat ; l'un met une seconde, l'autre trois jours. La différence ne vient pas de l'ordinateur mais de l'**algorithme**. La **complexité** permet de prévoir ce comportement avant de lancer le calcul sur des millions de lignes — et c'est une question classique des entretiens.

## La notation « grand O »

La notation **O(…)** décrit comment le temps (ou la mémoire) **grandit** quand la taille *n* des données augmente, sans s'intéresser aux détails.

| Complexité | Nom | Exemple | Pour n = 1 million |
|---|---|---|---|
| O(1) | constante | lire un élément d'un dictionnaire | instantané |
| O(log n) | logarithmique | recherche dans une liste triée (dichotomie) | ≈ 20 étapes |
| O(n) | linéaire | parcourir une liste une fois | 1 million d'étapes |
| O(n log n) | quasi linéaire | trier | ≈ 20 millions |
| O(n²) | quadratique | comparer chaque élément à tous les autres | 10¹² étapes : des heures |
| O(2ⁿ) | exponentielle | tester toutes les combinaisons | impossible |

:::analogie Pour comprendre
Chercher un nom dans un annuaire en lisant toutes les pages : O(n). L'ouvrir au milieu, voir si le nom est avant ou après, recommencer sur la bonne moitié : O(log n). Pour un annuaire d'un million de noms, 20 coups d'œil suffisent.
:::

## Reconnaître la complexité d'un code

```python
def contient(liste, x):          # O(n) : on peut parcourir toute la liste
    for v in liste:
        if v == x:
            return True
    return False

def a_des_doublons(liste):       # O(n²) : deux boucles imbriquées
    for i in range(len(liste)):
        for j in range(i + 1, len(liste)):
            if liste[i] == liste[j]:
                return True
    return False

def a_des_doublons_rapide(liste):  # O(n) : un ensemble
    return len(set(liste)) != len(liste)
```

:::retenir Les réflexes
- Une boucle sur les données : O(n). Deux boucles imbriquées : O(n²).
- `x in liste` est O(n) ; `x in ensemble` ou `x in dictionnaire` est O(1) en moyenne.
- Trier coûte O(n log n).
:::

:::metier En entreprise
Une jointure mal écrite, une boucle Python qui cherche dans une liste à chaque ligne d'un fichier de 10 millions de lignes : c'est un O(n²) déguisé, et le pipeline qui passait sur les données de test met des heures en production. Remplacer la liste par un dictionnaire le rend linéaire.
:::

## À retenir

- O(…) décrit la croissance du coût avec la taille des données.
- O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
- Boucles imbriquées = O(n²) ; recherche dans un set/dict = O(1).
- Le bon algorithme compte plus que la puissance de la machine.

<!-- @lecon algo-recherche-tri -->
Chercher et trier sont les deux opérations les plus fréquentes de l'informatique. Les algorithmes classiques sont rarement à recoder en entreprise (Python les fournit), mais les comprendre permet de choisir et d'expliquer en entretien.

## La recherche dichotomique

Sur une liste **triée**, on regarde l'élément du milieu ; s'il est trop grand, on cherche dans la moitié gauche, sinon dans la droite ; on recommence.

```python
def recherche_dichotomique(liste_triee, x):
    debut, fin = 0, len(liste_triee) - 1
    while debut <= fin:
        milieu = (debut + fin) // 2
        if liste_triee[milieu] == x:
            return milieu
        if liste_triee[milieu] < x:
            debut = milieu + 1
        else:
            fin = milieu - 1
    return -1

print(recherche_dichotomique([3, 8, 15, 23, 42, 57], 23))
```

Complexité : O(log n). C'est le principe des **index** des bases de données (arbres B).

## Les algorithmes de tri

- **Tri par sélection / insertion** : simples, O(n²) ; pédagogiques.
- **Tri fusion** (*merge sort*) : on coupe en deux, on trie chaque moitié, on fusionne ; O(n log n).
- **Tri rapide** (*quicksort*) : on choisit un pivot, on répartit plus petits et plus grands ; O(n log n) en moyenne.
- Python utilise **Timsort** (hybride fusion/insertion), O(n log n), très efficace sur des données partiellement triées.

```python
ventes = [{"produit": "souris", "ca": 120}, {"produit": "clavier", "ca": 450}, {"produit": "écran", "ca": 300}]
classement = sorted(ventes, key=lambda v: v["ca"], reverse=True)
print([v["produit"] for v in classement])
```

`sorted(…, key=…)` trie selon le critère de votre choix ; `reverse=True` du plus grand au plus petit.

:::astuce
Un tri est **stable** si deux éléments égaux gardent leur ordre d'origine. Le tri de Python est stable : on peut trier d'abord par critère secondaire, puis par critère principal.
:::

## Fusionner deux listes triées

C'est la brique du tri fusion… et de beaucoup de traitements de données (fusionner des fichiers triés, jointures par fusion) :

```python
def fusionner(a, b):
    i = j = 0
    res = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i]); i += 1
        else:
            res.append(b[j]); j += 1
    return res + a[i:] + b[j:]

print(fusionner([1, 4, 9], [2, 3, 10]))
```

## À retenir

- Dichotomie : O(log n) sur une liste triée (principe des index).
- Tris simples O(n²) ; fusion et rapide O(n log n) ; Python : Timsort, stable.
- `sorted(données, key=…, reverse=…)` pour trier des enregistrements.
- Fusionner deux listes triées en O(n) : brique de nombreux traitements.

<!-- @lecon algo-structures -->
Choisir la bonne **structure de données**, c'est souvent rendre un programme cent fois plus rapide. Voici celles qu'il faut connaître, avec leur équivalent Python.

## Le tableau d'ensemble

| Structure | Python | Accès | Ajout | Recherche | Usage |
|---|---|---|---|---|---|
| Tableau dynamique | `list` | O(1) par position | O(1) à la fin | O(n) | séquence ordonnée |
| Table de hachage | `dict`, `set` | O(1) par clé | O(1) | O(1) | index, dédoublonnage, comptage |
| Pile (*stack*) | `list` (append/pop) | sommet | O(1) | — | annuler, parcours en profondeur |
| File (*queue*) | `collections.deque` | extrémités | O(1) | — | traitement dans l'ordre d'arrivée |
| Tas (*heap*) | `heapq` | minimum en O(1) | O(log n) | — | « les k plus grands », priorités |

## La table de hachage

:::analogie Pour comprendre
Un vestiaire : vous donnez votre manteau, on vous remet un ticket numéroté. Pour le récupérer, pas besoin de fouiller tous les manteaux : le numéro mène directement au bon crochet. Le **hachage** calcule ce « numéro de crochet » à partir de la clé.
:::

C'est la structure la plus utile au quotidien :

```python
from collections import Counter, defaultdict

mots = ["data", "cloud", "data", "devops", "data"]
print(Counter(mots).most_common(2))     # [('data', 3), ('cloud', 1)]

par_ville = defaultdict(list)
for nom, ville in [("Ada", "Lyon"), ("Ken", "Lille"), ("Grace", "Lyon")]:
    par_ville[ville].append(nom)
print(dict(par_ville))
```

## Pile et file

```python
from collections import deque

pile = []
pile.append("page1"); pile.append("page2")
print(pile.pop())          # page2 : dernier entré, premier sorti (LIFO)

file = deque()
file.append("tâche1"); file.append("tâche2")
print(file.popleft())      # tâche1 : premier entré, premier sorti (FIFO)
```

:::metier En entreprise
Les **files de messages** (Kafka, RabbitMQ, SQS) sont des files à l'échelle d'une entreprise : des producteurs y déposent des événements, des consommateurs les traitent dans l'ordre. Vous les retrouverez dans le module Data engineering.
:::

## Le tas : les k plus grands

```python
import heapq
ca = {"Ada": 1200, "Ken": 300, "Grace": 950, "Linus": 1800, "Alan": 400}
print(heapq.nlargest(3, ca.items(), key=lambda kv: kv[1]))
```

Trouver les 3 plus grands parmi un milliard de valeurs sans tout trier : c'est le rôle du tas.

## À retenir

- `dict`/`set` (hachage) : accès et recherche en O(1) — la structure reine.
- `Counter` pour compter, `defaultdict` pour regrouper.
- Pile (LIFO) : `list` ; file (FIFO) : `deque`.
- `heapq.nlargest` pour les k plus grands.

<!-- @lecon algo-recursivite -->
Certains problèmes se décrivent naturellement en fonction d'**eux-mêmes** : la taille d'un dossier, c'est la taille de ses fichiers plus la taille de ses sous-dossiers. Une fonction qui s'appelle elle-même est **récursive**.

## Le principe

Toute fonction récursive a deux parties :

1. un **cas de base**, qui s'arrête sans s'appeler (sinon, appel infini) ;
2. un **cas récursif**, qui ramène le problème à un problème **plus petit**.

```python
def factorielle(n):
    if n <= 1:                 # cas de base
        return 1
    return n * factorielle(n - 1)   # cas récursif

print(factorielle(5))   # 120
```

## Parcourir une arborescence

C'est l'usage le plus utile en pratique : des données imbriquées (dossiers, JSON, organigrammes).

```python
arbo = {"nom": "projet", "taille": 0, "enfants": [
    {"nom": "data", "taille": 0, "enfants": [{"nom": "ventes.csv", "taille": 1200, "enfants": []}]},
    {"nom": "main.py", "taille": 300, "enfants": []},
]}

def taille_totale(noeud):
    return noeud["taille"] + sum(taille_totale(e) for e in noeud["enfants"])

print(taille_totale(arbo))   # 1500
```

:::attention
Python limite la profondeur des appels (environ 1 000 par défaut) : une récursion trop profonde provoque une `RecursionError`. Pour de très grandes profondeurs, on transforme la récursion en boucle avec une pile.
:::

## Mémoïsation

Certaines récursions recalculent mille fois la même chose (Fibonacci naïf). On peut mémoriser les résultats :

```python
from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
```

C'est le principe de la **programmation dynamique** : ne jamais recalculer un sous-problème déjà résolu.

## À retenir

- Une fonction récursive a un cas de base et un cas récursif qui réduit le problème.
- Idéale pour les structures imbriquées (dossiers, JSON, arbres).
- Limite de profondeur en Python ; sinon boucle + pile.
- `@cache` (mémoïsation) évite de recalculer : programmation dynamique.

<!-- @lecon algo-graphes -->
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
