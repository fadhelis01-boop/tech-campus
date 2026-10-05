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
