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
