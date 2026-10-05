Dès qu'un bout de code sert plusieurs fois, ou qu'il mérite un nom, on en fait une **fonction**. Les fonctions rendent le code lisible, réutilisable et testable : c'est la base du code professionnel.

## Définir et appeler

```python
def prix_ttc(prix_ht, taux=0.20):
    """Renvoie le prix toutes taxes comprises."""
    return round(prix_ht * (1 + taux), 2)

print(prix_ttc(100))          # 120.0 (taux par défaut)
print(prix_ttc(100, 0.055))   # 105.5
print(prix_ttc(prix_ht=50, taux=0.10))
```

- `def nom(paramètres):` puis un bloc indenté ;
- `return` renvoie le résultat (sans `return`, la fonction renvoie `None`) ;
- un paramètre peut avoir une **valeur par défaut** (`taux=0.20`) ;
- la chaîne entre triples guillemets est la **docstring** : elle documente la fonction.

:::piege Piège classique
Confondre `print` et `return`. `print` **affiche** une valeur à l'écran ; `return` la **renvoie** au code qui a appelé la fonction, pour qu'il s'en serve. Une fonction de calcul doit presque toujours **renvoyer**.
:::

## Portée des variables

Une variable créée **dans** une fonction n'existe que dans cette fonction (portée locale). Pour transmettre une information, on passe des **paramètres** et on **renvoie** un résultat. Évitez de modifier des variables globales depuis une fonction.

## Une fonction = une tâche

:::methode Écrire de bonnes fonctions
- Un **nom** qui dit ce qu'elle fait, avec un verbe : `nettoyer_montant`, `charger_clients`.
- **Une seule responsabilité** : si vous écrivez « et » dans la description, coupez-la en deux.
- **Courte** : au-delà d'une trentaine de lignes, découpez.
- **Sans surprise** : mêmes entrées → même sortie, pas d'effet caché.
:::

## Les annotations de type

Python permet d'indiquer les types attendus. Elles ne changent rien à l'exécution, mais documentent le code et permettent aux outils de détecter des erreurs :

```python
def moyenne(valeurs: list[float]) -> float:
    if not valeurs:
        return 0.0
    return sum(valeurs) / len(valeurs)

print(moyenne([12, 15, 9]))
```

:::metier En entreprise
Un pipeline de données bien écrit est une suite de petites fonctions testées : `extraire()`, `nettoyer()`, `valider()`, `charger()`. Chacune peut être testée seule, réutilisée, et remplacée sans tout casser.
:::

## À retenir

- `def nom(params):` + bloc indenté + `return`.
- Paramètres avec valeur par défaut ; arguments nommés.
- `return` renvoie, `print` affiche : ne pas les confondre.
- Une fonction = une tâche, un nom avec un verbe, courte, sans surprise.
- Annotations de type et docstrings documentent le code.
