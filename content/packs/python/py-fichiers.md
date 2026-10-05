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
