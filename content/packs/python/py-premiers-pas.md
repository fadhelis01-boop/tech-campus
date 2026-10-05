Python est le langage le plus utilisé en data et l'un des plus utilisés en automatisation d'infrastructure. Il est réputé pour sa lisibilité : un bon code Python se lit presque comme de l'anglais. Tous les extraits de ce module s'exécutent dans le labo de l'application : cliquez sur « ▶ Essayer » et modifiez-les sans crainte.

## Afficher et calculer

```python
print("Bonjour !")
print(2 + 3 * 4)        # 14 : la multiplication passe avant
print(10 / 4)           # 2.5 : la division donne un nombre à virgule
print(10 // 4)          # 2   : division entière
print(10 % 4)           # 2   : reste de la division (modulo)
print(2 ** 10)          # 1024 : puissance
```

`print()` affiche ce qu'on lui donne. Le texte après `#` est un **commentaire** : Python l'ignore, il sert aux humains.

## Les variables

Une **variable** est un nom qui désigne une valeur.

```python
prix_ht = 49.90
quantite = 3
total = prix_ht * quantite
print(total)
```

:::analogie Pour comprendre
Une variable est une étiquette collée sur une boîte. `quantite = 3` colle l'étiquette « quantite » sur une boîte contenant 3. Si on écrit ensuite `quantite = 5`, l'étiquette passe sur une boîte contenant 5.
:::

Règles de nommage : lettres minuscules, chiffres et `_`, sans espace ni accent, sans commencer par un chiffre. Par convention (PEP 8) : `snake_case`, des noms explicites (`nb_clients` plutôt que `x`).

## Les types de base

| Type | Exemple | Nom |
|---|---|---|
| entier | `42` | `int` |
| nombre à virgule | `3.14` | `float` |
| texte | `"Lyon"` ou `'Lyon'` | `str` (chaîne de caractères) |
| booléen | `True`, `False` | `bool` |
| « rien » | `None` | `NoneType` |

```python
print(type(42), type(3.14), type("Lyon"), type(True))
```

## Convertir

Ce qui vient d'un fichier ou d'une saisie est **du texte**. Pour calculer, il faut convertir :

```python
age_texte = "36"
age = int(age_texte)
print(age + 1)              # 37
print(float("12.5") * 2)    # 25.0
print(str(2026) + " !")     # "2026 !"
```

:::piege Piège classique
`"36" + 1` provoque une `TypeError` : on ne peut pas additionner du texte et un nombre. C'est l'erreur n° 1 des débutants en traitement de données.
:::

## Les f-strings

Pour fabriquer un texte qui contient des valeurs, la forme moderne est la **f-string** (un `f` devant les guillemets, les variables entre accolades) :

```python
nom = "Ada"
total = 149.7
print(f"{nom} doit {total} €")
print(f"{nom} doit {total:.2f} €")   # 2 décimales
```

## À retenir

- `print()` affiche ; `#` commente.
- Une variable nomme une valeur ; noms en `snake_case`, explicites.
- Types de base : `int`, `float`, `str`, `bool`, `None`.
- Ce qui vient d'un fichier est du texte : convertir avec `int()`, `float()`.
- f-strings : `f"{variable}"`, `f"{nombre:.2f}"`.
