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
