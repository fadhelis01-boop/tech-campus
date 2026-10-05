<!-- @lecon py-premiers-pas -->
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

<!-- @lecon py-conditions -->
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

<!-- @lecon py-boucles -->
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

<!-- @lecon py-listes-dicts -->
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

<!-- @lecon py-fonctions -->
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

<!-- @lecon py-texte -->
Nettoyer des noms de clients, découper des lignes de journaux, normaliser des codes postaux : le traitement du texte occupe une grande partie du temps d'un data engineer. Python est excellent pour cela.

## Les méthodes essentielles

```python
s = "  Ada LOVELACE  "
print(s.strip())             # retire les espaces au début et à la fin
print(s.lower(), s.upper())  # minuscules, majuscules
print(s.strip().title())     # "Ada Lovelace"
print("data,engineer".split(","))      # ['data', 'engineer']
print("-".join(["2026", "10", "05"]))  # "2026-10-05"
print("rapport.csv".endswith(".csv"))  # True
print("Lyon".replace("y", "i"))        # "Lion"
print("data" in "data engineer")       # True
```

## Indexer et découper le texte

Un texte se manipule comme une liste de caractères :

```python
code = "FR-75001"
print(code[:2])     # "FR"
print(code[3:])     # "75001"
print(len(code))    # 8
```

## Mettre en forme

```python
montant = 1234.5
print(f"{montant:,.2f}")           # 1,234.50
print(f"{'Nom':<10}|{'Ville':>10}") # alignements
print(f"{7:03d}")                   # 007
```

## Les expressions régulières (aperçu)

Pour chercher des **motifs** (une adresse e-mail, un numéro, une date), on utilise le module `re` :

```python
import re
texte = "Commande 1042 du 2026-10-05, client 77"
print(re.findall(r"\d+", texte))                 # tous les nombres
print(re.search(r"\d{4}-\d{2}-\d{2}", texte).group())  # la date
```

`\d` = un chiffre, `+` = un ou plusieurs, `{4}` = exactement quatre. Le `r` devant la chaîne évite que Python interprète les `\`.

:::astuce
Les expressions régulières sont puissantes mais vite illisibles. Commencez par les méthodes simples (`split`, `strip`, `startswith`) ; utilisez `re` quand c'est vraiment nécessaire, et testez vos motifs sur des exemples (le site regex101.com aide beaucoup).
:::

:::metier En entreprise
Normaliser les données textuelles (espaces, casse, accents, formats de date) avant de les charger est une étape systématique des pipelines : deux « Lyon » et « lyon  » non nettoyés créent deux villes différentes dans un tableau de bord.
:::

## À retenir

- `strip`, `lower`/`upper`/`title`, `split`, `join`, `replace`, `startswith`/`endswith`, `in`.
- Tranches comme pour les listes : `s[:2]`, `s[3:]`.
- f-strings pour mettre en forme (`:.2f`, alignements).
- `re` pour les motifs (`\d+`, `findall`, `search`) — avec parcimonie.

<!-- @lecon py-fichiers -->
Les données arrivent sous forme de fichiers : CSV, JSON, journaux. Python les lit et les écrit avec quelques lignes de code, grâce à sa bibliothèque standard.

## Lire et écrire un fichier texte

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("première ligne\n")
    f.write("deuxième ligne\n")

with open("notes.txt", encoding="utf-8") as f:
    for ligne in f:
        print(ligne.strip())
```

- `open(chemin, mode)` : `"r"` lecture (par défaut), `"w"` écriture (écrase), `"a"` ajout ;
- `with` garantit que le fichier est **refermé**, même en cas d'erreur ;
- précisez **toujours** `encoding="utf-8"`.

Le labo Python dispose d'un petit système de fichiers en mémoire : vous pouvez y créer et relire des fichiers.

## Le format CSV

```python
import csv

with open("clients.csv", "w", newline="", encoding="utf-8") as f:
    ecrivain = csv.writer(f)
    ecrivain.writerow(["nom", "ville"])
    ecrivain.writerow(["Ada", "Londres"])
    ecrivain.writerow(["Grace", "New York"])

with open("clients.csv", encoding="utf-8") as f:
    for ligne in csv.DictReader(f):
        print(ligne["nom"], "habite", ligne["ville"])
```

`csv.DictReader` renvoie chaque ligne sous forme de **dictionnaire** dont les clés sont les noms de colonnes : c'est la façon la plus lisible de lire un CSV.

:::piege Piège classique
Ne découpez pas un CSV avec `ligne.split(",")` : une valeur peut contenir une virgule entre guillemets (`"Paris, France"`). Le module `csv` gère ces cas.
:::

## Le format JSON

```python
import json

commande = {"id": 1042, "client": "Ada", "lignes": [{"produit": "clavier", "qte": 1}]}
texte = json.dumps(commande, ensure_ascii=False, indent=2)   # objet → texte
print(texte)
retour = json.loads(texte)                                   # texte → objet
print(retour["lignes"][0]["produit"])
```

Pour les fichiers : `json.dump(objet, f)` et `json.load(f)`.

## Les chemins

Le module `pathlib` manipule les chemins de façon portable (Linux, Windows) :

```python
from pathlib import Path
dossier = Path("donnees")
dossier.mkdir(exist_ok=True)
fichier = dossier / "ventes.csv"
fichier.write_text("date,montant\n", encoding="utf-8")
print(fichier.exists(), fichier.suffix, fichier.name)
```

## À retenir

- `with open(..., encoding="utf-8") as f:` ; modes `r`, `w`, `a`.
- `csv.DictReader` / `csv.writer` pour les CSV, jamais `split(",")`.
- `json.loads`/`dumps` (texte) et `json.load`/`dump` (fichiers).
- `pathlib.Path` pour les chemins.

<!-- @lecon py-erreurs -->
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

<!-- @lecon py-modules -->
Personne ne réécrit tout. La force de Python, c'est son immense écosystème de **bibliothèques** : pandas pour les données, requests pour le Web, boto3 pour AWS… Encore faut-il savoir les installer proprement.

## Importer

```python
import math
from datetime import date, timedelta
import statistics as st

print(math.sqrt(16))
print(date.today() + timedelta(days=30))
print(st.mean([12, 15, 9]))
```

La **bibliothèque standard** (installée avec Python) contient déjà beaucoup : `csv`, `json`, `datetime`, `pathlib`, `re`, `logging`, `sqlite3`, `statistics`…

## Installer des paquets : pip

Les autres bibliothèques viennent du dépôt **PyPI** (*Python Package Index*) et s'installent avec `pip` :

```bash
pip install pandas requests
pip list
pip freeze > requirements.txt
pip install -r requirements.txt
```

## Les environnements virtuels

:::analogie Pour comprendre
Un projet A a besoin de pandas 2.1, un projet B de pandas 2.3. Si tout est installé au même endroit, l'un des deux casse. Un **environnement virtuel** est une « boîte » isolée par projet, avec ses propres versions.
:::

```bash
python -m venv .venv
source .venv/bin/activate      # Linux / Mac   (Windows : .venv\Scripts\activate)
pip install -r requirements.txt
deactivate
```

:::retenir
Un projet Python professionnel = un environnement virtuel + un fichier de dépendances (`requirements.txt` ou `pyproject.toml`) versionné dans Git + le dossier `.venv/` dans le `.gitignore`.
:::

:::futur Tendance
L'outil **uv** (très rapide, écrit en Rust) gagne beaucoup de terrain pour gérer environnements et dépendances (`uv venv`, `uv add pandas`). Les notions restent les mêmes : isoler, déclarer, reproduire.
:::

## Organiser son propre code en modules

Un fichier `outils.py` est un **module** : on peut écrire `from outils import nettoyer_montant` depuis un autre fichier du même dossier. Un projet structuré ressemble à :

```text
mon_pipeline/
├── pyproject.toml
├── src/mon_pipeline/
│   ├── __init__.py
│   ├── extraction.py
│   └── transformation.py
└── tests/
    └── test_transformation.py
```

Le bloc `if __name__ == "__main__":` permet d'exécuter du code seulement quand le fichier est lancé directement, pas quand il est importé.

## À retenir

- `import module`, `from module import nom` ; la bibliothèque standard est riche.
- `pip install`, `requirements.txt` pour figer les dépendances.
- Un environnement virtuel (`python -m venv .venv`) par projet ; `.venv/` dans `.gitignore`.
- Découper son code en modules ; `if __name__ == "__main__":`.

<!-- @lecon py-poo -->
Quand un programme grandit, on veut regrouper des **données** et les **traitements** qui vont avec. C'est l'idée de la **programmation orientée objet** (POO). Vous l'utilisez déjà sans le savoir : une liste est un objet, `liste.append()` est une de ses méthodes.

## Classe et objets

Une **classe** est un modèle ; un **objet** (ou instance) est un exemplaire construit à partir de ce modèle.

```python
class CompteBancaire:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire      # attributs
        self.solde = solde

    def deposer(self, montant):         # méthode
        if montant <= 0:
            raise ValueError("Montant invalide")
        self.solde += montant

    def __repr__(self):
        return f"CompteBancaire({self.titulaire!r}, {self.solde})"

c = CompteBancaire("Ada")
c.deposer(100)
print(c, c.solde)
```

- `__init__` est le **constructeur**, appelé à la création ;
- `self` désigne l'objet lui-même ;
- les **attributs** (`self.solde`) sont les données, les **méthodes** les comportements ;
- `__repr__` définit l'affichage de l'objet.

## L'héritage

Une classe peut **hériter** d'une autre et en spécialiser le comportement :

```python
class Source:
    def __init__(self, nom):
        self.nom = nom
    def lire(self):
        raise NotImplementedError

class SourceCSV(Source):
    def lire(self):
        return f"lecture du fichier {self.nom}"

class SourceAPI(Source):
    def lire(self):
        return f"appel de l'API {self.nom}"

for s in [SourceCSV("ventes.csv"), SourceAPI("https://api.example.com")]:
    print(s.lire())
```

Le code qui utilise une `Source` n'a pas besoin de savoir de quel type elle est : c'est le **polymorphisme**.

## Les dataclasses

Pour de simples « enregistrements », Python propose les `dataclasses`, qui génèrent le constructeur et l'affichage :

```python
from dataclasses import dataclass

@dataclass
class Commande:
    id: int
    client: str
    montant: float = 0.0

c = Commande(1042, "Ada", 99.9)
print(c)
```

:::metier En entreprise
En data engineering, la POO sert surtout à structurer des connecteurs (une classe par type de source), des configurations, des modèles de données (dataclasses, ou la bibliothèque **pydantic** qui valide les types à l'exécution). N'en abusez pas : une fonction simple vaut souvent mieux qu'une classe.
:::

## À retenir

- Classe = modèle ; objet = instance ; `__init__` construit, `self` désigne l'objet.
- Attributs (données) et méthodes (comportements).
- Héritage pour spécialiser ; polymorphisme : même interface, comportements différents.
- `@dataclass` pour les enregistrements simples.

<!-- @lecon py-pythonique -->
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

<!-- @lecon py-tests -->
Comment savoir que votre code fonctionne… et qu'il fonctionne **encore** après une modification ? En écrivant des **tests automatisés**. C'est ce que fait TechCampus quand vous cliquez sur « ✓ Vérifier » : il exécute des tests sur votre code.

## assert

L'instruction `assert` vérifie qu'une condition est vraie, et lève une erreur sinon :

```python
def prix_ttc(ht):
    return round(ht * 1.2, 2)

assert prix_ttc(100) == 120.0
assert prix_ttc(0) == 0
print("Tous les tests passent")
```

## pytest

En entreprise, on utilise **pytest** : chaque fonction dont le nom commence par `test_`, dans un fichier `test_*.py`, est un test.

```python
# fichier test_prix.py
from prix import prix_ttc

def test_taux_normal():
    assert prix_ttc(100) == 120.0

def test_zero():
    assert prix_ttc(0) == 0
```

```bash
pytest
```

pytest trouve les tests, les exécute et affiche un rapport clair des échecs.

## Que tester ?

:::methode Les cas à couvrir
1. Le **cas nominal** (l'exemple typique).
2. Les **cas limites** : liste vide, zéro, une seule ligne, très grand nombre.
3. Les **entrées invalides** : la fonction doit lever l'erreur attendue.
4. Les **bugs passés** : chaque bug corrigé mérite un test qui l'empêche de revenir.
:::

Tester qu'une erreur est bien levée, avec pytest :

```python
import pytest
from remise import appliquer_remise

def test_pourcentage_invalide():
    with pytest.raises(ValueError):
        appliquer_remise(100, 150)
```

## La pyramide des tests

- Beaucoup de **tests unitaires** (une fonction isolée, rapides) ;
- moins de **tests d'intégration** (plusieurs composants ensemble : le pipeline avec une vraie base de test) ;
- peu de **tests de bout en bout** (tout le système), lents et fragiles.

:::metier En entreprise
Les tests s'exécutent automatiquement à chaque pull request (intégration continue, module DevOps). En data, on ajoute des **tests de données** (pas de doublons, pas de valeurs nulles dans une colonne obligatoire, montants positifs) : vous les verrez avec dbt et les outils de qualité.
:::

## À retenir

- `assert condition` ; en entreprise, pytest et des fonctions `test_*`.
- Tester : nominal, limites, entrées invalides, bugs passés.
- `pytest.raises` pour vérifier une erreur attendue.
- Pyramide : beaucoup d'unitaires, quelques tests d'intégration, peu de bout en bout.
- Les tests tournent automatiquement à chaque pull request.

<!-- @lecon py-api -->
Une grande partie des données d'une entreprise provient d'**API** : celle d'un outil de CRM, d'un service de paiement, d'un portail open data. Savoir les interroger proprement est une compétence centrale du data engineer.

## Une requête avec requests

Sur votre machine, la bibliothèque **requests** est la plus utilisée :

```python
import requests

reponse = requests.get(
    "https://api.example.com/v1/commandes",
    params={"depuis": "2026-10-01", "page": 1},
    headers={"Authorization": "Bearer MON_JETON"},
    timeout=10,
)
reponse.raise_for_status()      # lève une erreur si code 4xx ou 5xx
donnees = reponse.json()        # texte JSON → dictionnaires et listes
```

:::attention
- Toujours un **timeout** : sans lui, un serveur qui ne répond pas bloque votre programme indéfiniment.
- Le **jeton** ne s'écrit jamais en dur dans le code : on le lit dans une variable d'environnement (`os.environ["API_TOKEN"]`).
:::

(Le labo de l'application n'a pas accès à Internet : les exercices simulent les réponses des API, ce qui permet de se concentrer sur leur traitement.)

## La pagination

Une API renvoie rarement tout d'un coup : les résultats sont découpés en **pages**.

```python
def toutes_les_commandes(appeler_page):
    page = 1
    resultat = []
    while True:
        donnees = appeler_page(page)
        resultat.extend(donnees["commandes"])
        if not donnees["page_suivante"]:
            break
        page += 1
    return resultat
```

## Les limites et les erreurs

| Situation | Code | Réaction |
|---|---|---|
| Trop de requêtes | 429 | ralentir, attendre (souvent indiqué dans l'en-tête `Retry-After`) |
| Jeton expiré | 401 | renouveler le jeton |
| Erreur temporaire du serveur | 500, 502, 503 | réessayer plus tard, avec un délai croissant |
| Requête invalide | 400, 404 | ne pas réessayer : corriger la requête |

:::methode Le motif « réessayer avec délai croissant »
1. Tenter la requête.
2. En cas d'erreur **temporaire**, attendre 1 s, puis 2 s, puis 4 s… (*exponential backoff*).
3. Abandonner après quelques tentatives et **journaliser** l'échec.
:::

## Écrire sa propre API

Avec des bibliothèques comme **FastAPI**, quelques lignes suffisent pour exposer vos données sous forme d'API — utile pour servir les résultats d'un pipeline ou d'un modèle :

```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/clients/{client_id}")
def lire_client(client_id: int):
    return {"id": client_id, "nom": "Ada"}
```

## À retenir

- `requests.get(url, params=…, headers=…, timeout=…)`, `raise_for_status()`, `.json()`.
- Toujours un timeout ; jeton dans une variable d'environnement.
- Pagination : boucler jusqu'à la dernière page.
- 429 → ralentir ; 5xx → réessayer avec délai croissant ; 4xx → corriger.
- FastAPI pour exposer ses propres données.
