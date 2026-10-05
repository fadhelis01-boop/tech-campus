Un fichier absent, une ligne mal formée, un serveur qui ne répond pas : en production, les erreurs ne sont pas une possibilité, ce sont une certitude. Un programme professionnel les **anticipe**.

## Les exceptions

Quand quelque chose se passe mal, Python lève une **exception** : `ValueError`, `KeyError`, `FileNotFoundError`, `ZeroDivisionError`… Si personne ne l'attrape, le programme s'arrête.

## try / except

```python
def convertir_montant(texte):
    try:
        return float(texte.replace(",", "."))
    except ValueError:
        return None

print(convertir_montant("12,5"))   # 12.5
print(convertir_montant("abc"))    # None
```

- le code « risqué » va dans `try` ;
- `except TypeDErreur:` dit quoi faire si cette erreur précise se produit ;
- `else` (si aucune erreur) et `finally` (dans tous les cas) sont facultatifs.

:::attention
N'écrivez jamais `except:` tout seul (ni `except Exception: pass`) : vous masquez **toutes** les erreurs, y compris celles que vous n'aviez pas prévues, et le programme échouera plus tard de façon incompréhensible. Attrapez l'erreur **précise** que vous savez gérer.
:::

## Lever ses propres erreurs

```python
def appliquer_remise(prix, pourcentage):
    if not 0 <= pourcentage <= 100:
        raise ValueError(f"Pourcentage invalide : {pourcentage}")
    return prix * (1 - pourcentage / 100)
```

Échouer **tôt et clairement** vaut mieux que produire un résultat faux en silence.

## Erreurs et qualité des données

:::methode Stratégie pour un fichier de données imparfait
1. Lire ligne à ligne.
2. Pour chaque ligne, `try` de la convertir et la valider.
3. En cas d'erreur : **mettre la ligne de côté** (avec la raison), ne pas planter tout le traitement.
4. À la fin : compter les rejets ; si leur proportion dépasse un seuil (par exemple 5 %), **échouer** volontairement et alerter.
:::

```python
lignes = ["120", "80,5", "N/A", "45", ""]
valides, rejets = [], []
for l in lignes:
    try:
        valides.append(float(l.replace(",", ".")))
    except ValueError:
        rejets.append(l)
print(valides, "rejets :", rejets)
```

## Les journaux (logging)

En production, on n'utilise pas `print` mais le module `logging`, qui horodate les messages et gère des niveaux (`DEBUG`, `INFO`, `WARNING`, `ERROR`) :

```python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logging.info("Début du chargement")
logging.warning("3 lignes rejetées")
```

## À retenir

- Une exception non attrapée arrête le programme.
- `try` / `except ErreurPrécise` ; jamais `except:` nu.
- `raise ValueError("message clair")` pour échouer tôt.
- Données imparfaites : mettre de côté les lignes en erreur, compter, échouer au-delà d'un seuil.
- `logging` plutôt que `print` en production.
