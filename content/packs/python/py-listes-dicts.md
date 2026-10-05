Les données ne viennent jamais seules : une liste de clients, un enregistrement avec plusieurs champs. Python offre deux structures que vous utiliserez **en permanence** : la **liste** et le **dictionnaire**.

## Les listes

Une **liste** est une suite ordonnée de valeurs, entre crochets :

```python
ventes = [120, 80, 45]
ventes.append(300)          # ajoute à la fin
print(ventes[0])            # premier élément : 120 (on compte à partir de 0)
print(ventes[-1])           # dernier : 300
print(ventes[1:3])          # tranche : [80, 45]
print(len(ventes), sum(ventes), max(ventes), sorted(ventes))
```

:::piege Piège classique
Les positions commencent à **0**. Dans une liste de 4 éléments, `ventes[4]` provoque une `IndexError`.
:::

## Les dictionnaires

Un **dictionnaire** associe des **clés** à des **valeurs**, entre accolades. C'est la forme naturelle d'un enregistrement :

```python
client = {"nom": "Ada", "ville": "Londres", "age": 36}
print(client["nom"])
client["email"] = "ada@example.com"   # ajoute une clé
print(client.get("telephone", "inconnu"))  # valeur par défaut si la clé manque
for cle, valeur in client.items():
    print(cle, "→", valeur)
```

:::astuce
`client["telephone"]` provoque une `KeyError` si la clé n'existe pas ; `client.get("telephone")` renvoie `None` (ou la valeur par défaut donnée). Avec des données réelles, souvent incomplètes, `get` évite bien des plantages.
:::

## Liste de dictionnaires : la forme des données

C'est exactement ce que renvoie une API JSON ou la lecture d'un CSV :

```python
clients = [
    {"nom": "Ada", "ville": "Londres", "ca": 1200},
    {"nom": "Grace", "ville": "New York", "ca": 800},
    {"nom": "Alan", "ville": "Londres", "ca": 450},
]
ca_par_ville = {}
for c in clients:
    ville = c["ville"]
    ca_par_ville[ville] = ca_par_ville.get(ville, 0) + c["ca"]
print(ca_par_ville)   # {'Londres': 1650, 'New York': 800}
```

Ce petit programme fait un **regroupement** (*group by*) : c'est le cœur de l'analyse de données, que vous retrouverez en SQL et avec pandas.

## Les autres structures

- **Tuple** `(48.85, 2.35)` : comme une liste, mais non modifiable (coordonnées, couples).
- **Ensemble** (*set*) `{"Lyon", "Paris"}` : sans doublons ni ordre ; idéal pour dédoublonner : `set(liste)`.

## À retenir

- Liste `[...]` : ordonnée, positions à partir de 0, `append`, tranches `[a:b]`.
- Dictionnaire `{clé: valeur}` : `d[clé]`, `d.get(clé, défaut)`, `d.items()`.
- Liste de dictionnaires = forme standard des données (JSON, CSV).
- `d[k] = d.get(k, 0) + x` : le motif du regroupement.
- `set()` pour dédoublonner.
