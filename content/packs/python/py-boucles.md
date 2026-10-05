Traiter un million de lignes, interroger cinquante serveurs, réessayer trois fois une requête : tout cela, ce sont des **boucles**.

## La boucle for

`for` parcourt une séquence, élément par élément :

```python
villes = ["Lyon", "Paris", "Lille"]
for ville in villes:
    print(ville.upper())
```

## range : compter

```python
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)
for i in range(1, 11, 2): # 1, 3, 5, 7, 9
    print(i)
```

`range(n)` va de 0 à n-1 (n exclu). C'est une source fréquente d'erreurs « décalées d'un ».

## Accumuler

Le motif le plus courant : une variable initialisée avant la boucle, mise à jour à chaque tour.

```python
montants = [120, 80.5, 45, 300]
total = 0
nb_gros = 0
for m in montants:
    total += m              # équivaut à total = total + m
    if m > 100:
        nb_gros += 1
print(total, nb_gros)
```

## enumerate et zip

```python
for numero, ville in enumerate(["Lyon", "Paris"], start=1):
    print(numero, ville)

noms = ["Ada", "Alan"]
ages = [36, 41]
for nom, age in zip(noms, ages):
    print(nom, age)
```

## La boucle while

`while` répète **tant qu'**une condition est vraie :

```python
tentative = 1
while tentative <= 3:
    print("Tentative", tentative)
    tentative += 1
```

:::attention Boucle infinie
Si la condition ne devient jamais fausse, la boucle ne s'arrête pas. Dans le labo, l'exécution est interrompue au bout de quelques secondes ; sur un serveur, le programme tourne indéfiniment. Vérifiez toujours que quelque chose fait évoluer la condition.
:::

## break et continue

```python
for ligne in ["ok", "ok", "", "ok", "FIN", "ok"]:
    if ligne == "":
        continue          # ignore cette ligne, passe à la suivante
    if ligne == "FIN":
        break             # sort de la boucle
    print(ligne)
```

:::metier En entreprise
« Réessayer jusqu'à 3 fois en cas d'erreur réseau, en attendant de plus en plus longtemps » (*retry with backoff*) s'écrit avec une boucle, un compteur et `break`. On le retrouve dans tous les scripts qui appellent des API.
:::

## À retenir

- `for x in séquence:` parcourt ; `range(a, b)` exclut `b`.
- Accumulateur initialisé avant la boucle, `+=` à chaque tour.
- `enumerate` (numéro + élément), `zip` (deux listes en parallèle).
- `while` tant qu'une condition est vraie ; attention aux boucles infinies.
- `continue` saute un tour, `break` sort de la boucle.
