Un programme utile prend des décisions : alerter si un seuil est dépassé, rejeter une ligne invalide, appliquer une remise. C'est le rôle des **conditions**.

## if, elif, else

```python
temperature = 31

if temperature > 30:
    print("Alerte canicule")
elif temperature > 25:
    print("Chaud")
else:
    print("Normal")
```

- La condition est suivie de `:` ;
- le bloc à exécuter est **indenté** (4 espaces) : en Python, l'indentation n'est pas décorative, elle **définit** les blocs ;
- `elif` (« sinon si ») et `else` (« sinon ») sont facultatifs.

:::attention
Une indentation incohérente provoque une `IndentationError`. Utilisez toujours 4 espaces (la touche Tab de l'éditeur les insère pour vous).
:::

## Les comparaisons

| Opérateur | Sens |
|---|---|
| `==` | égal (attention : un seul `=` sert à affecter) |
| `!=` | différent |
| `<`, `<=`, `>`, `>=` | inférieur, supérieur |
| `in` | appartient à (`"a" in "data"`, `3 in [1, 2, 3]`) |

Python permet d'enchaîner : `18 <= age < 65`.

## and, or, not

```python
age = 30
abonne = True
if age >= 18 and abonne:
    print("Accès accordé")
if not abonne or age < 18:
    print("Accès refusé")
```

## Valeurs « vraies » et « fausses »

Dans une condition, `0`, `""` (texte vide), `[]` (liste vide), `None` comptent comme **faux** ; tout le reste comme vrai.

```python
ville = ""
if not ville:
    print("Ville manquante")
```

:::exemple En data engineering
```python
def statut_ligne(montant):
    if montant is None:
        return "manquant"
    elif montant < 0:
        return "invalide"
    elif montant > 10_000:
        return "à vérifier"
    return "ok"

print(statut_ligne(-5), statut_ligne(50), statut_ligne(None))
```
C'est exactement le genre de règles de **qualité des données** qu'on écrit tous les jours. Notez `is None` : on teste l'absence de valeur avec `is`, pas `==`.
:::

## À retenir

- `if` / `elif` / `else`, deux-points, bloc indenté de 4 espaces.
- `==` compare, `=` affecte ; `in` teste l'appartenance ; comparaisons enchaînables.
- `and`, `or`, `not` ; 0, "", [], None sont faux.
- `is None` pour tester l'absence de valeur.
