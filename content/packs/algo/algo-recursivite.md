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
