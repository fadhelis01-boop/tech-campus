Un code qui marche n'est pas forcément un bon code. Un code **pythonique** est clair, concis, et utilise les idiomes du langage. C'est ce que regardera un relecteur, et ce que vous devrez maintenir dans six mois.

## Les compréhensions

Une **compréhension de liste** construit une liste en une ligne lisible :

```python
montants = [120, -5, 80, 0, 300]
positifs = [m for m in montants if m > 0]
ttc = [round(m * 1.2, 2) for m in positifs]
print(positifs, ttc)

carres = {n: n * n for n in range(5)}      # compréhension de dictionnaire
villes = {v.lower() for v in ["Lyon", "lyon", "Paris"]}   # d'ensemble
print(carres, villes)
```

:::astuce
Une compréhension doit rester **lisible** en une ligne. Si elle devient longue ou imbriquée, une boucle `for` classique est préférable.
:::

## Les générateurs

Un **générateur** produit les valeurs une par une, à la demande, sans tout charger en mémoire. Indispensable pour les gros fichiers :

```python
def lignes_valides(lignes):
    for l in lignes:
        l = l.strip()
        if l and not l.startswith("#"):
            yield l

for l in lignes_valides(["a", "", "# commentaire", "b"]):
    print(l)

total = sum(x * x for x in range(1_000_000))   # expression génératrice
print(total)
```

## Quelques idiomes

```python
# Échanger deux variables
a, b = 1, 2
a, b = b, a

# Déballer
prenom, nom = "Ada Lovelace".split()

# Valeur par défaut
ville = None
print(ville or "inconnue")

# Tester l'appartenance plutôt qu'enchaîner des or
statut = "livrée"
if statut in {"livrée", "expédiée"}:
    print("en route ou arrivée")

# any / all
print(any(m < 0 for m in [5, -1]), all(m > 0 for m in [5, 1]))
```

## Le style : PEP 8 et les outils

La **PEP 8** est le guide de style officiel : 4 espaces, `snake_case` pour les variables et fonctions, `PascalCase` pour les classes, lignes raisonnablement courtes, deux lignes vides entre les fonctions.

Personne ne vérifie cela à la main : des outils le font.

- **ruff** : vérifie le style et détecte des erreurs, et reformate le code ;
- **mypy** ou **pyright** : vérifient les annotations de type.

:::retenir
« Le code est lu bien plus souvent qu'il n'est écrit » (Guido van Rossum, créateur de Python). Des noms clairs et des fonctions courtes valent plus que des astuces.
:::

## À retenir

- Compréhensions de liste, dictionnaire, ensemble — tant qu'elles restent lisibles.
- Générateurs (`yield`) pour traiter de gros volumes sans tout charger.
- Idiomes : déballage, `or` pour une valeur par défaut, `in` sur un ensemble, `any`/`all`.
- PEP 8 + ruff + vérification de types.
