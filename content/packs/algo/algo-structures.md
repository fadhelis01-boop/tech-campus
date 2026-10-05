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
