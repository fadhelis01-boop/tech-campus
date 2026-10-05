Assez de théorie : construisons un **pipeline**. Un pipeline ETL extrait des données d'une source, les transforme et les charge dans une destination. Écrit proprement, il est découpé en fonctions testables, idempotent et observable.

## La structure type

```python
import csv, io, logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def extraire(texte_csv):
    """Lit le CSV source et renvoie une liste de dictionnaires (tout en texte)."""
    return list(csv.DictReader(io.StringIO(texte_csv)))

def transformer(lignes):
    """Nettoie, convertit les types, écarte les lignes invalides."""
    propres, rejets = [], []
    for l in lignes:
        try:
            propres.append({
                "date": l["date"].strip(),
                "produit": l["produit"].strip().lower(),
                "montant": round(float(l["montant"].replace(",", ".")), 2),
            })
        except (ValueError, KeyError):
            rejets.append(l)
    logging.info("%d lignes valides, %d rejetées", len(propres), len(rejets))
    return propres, rejets

def charger(lignes, destination):
    """Charge de façon idempotente : remplace les données des dates concernées."""
    dates = {l["date"] for l in lignes}
    destination[:] = [d for d in destination if d["date"] not in dates] + lignes

source = "date,produit,montant\n2026-10-05,Clavier,89.9\n2026-10-05,Souris,29,9\n2026-10-05,Écran,n/a\n"
entrepot = []
propres, rejets = transformer(extraire(source))
charger(propres, entrepot)
charger(propres, entrepot)   # relancer ne crée pas de doublon
print(entrepot)
```

## L'idempotence, encore

:::retenir
Un pipeline sera relancé : après un échec, pour rattraper une journée, par erreur. S'il **ajoute** des lignes à chaque exécution, chaque relance crée des doublons. Les stratégies idempotentes :
- **remplacer une partition** (supprimer puis réinsérer la journée traitée, dans une transaction) ;
- **upsert** sur une clé (`MERGE`, `INSERT … ON CONFLICT`) ;
- écrire dans un fichier ou une partition dont le nom dépend de la date traitée (et l'écraser).
:::

## Incrémental ou complet

- **Chargement complet** (*full load*) : on recharge tout à chaque fois. Simple, pour les petites tables.
- **Chargement incrémental** : on ne traite que les nouveautés depuis la dernière exécution (par date de modification, ou par une capture des changements — **CDC**, *Change Data Capture*, qui lit le journal de la base source). Indispensable pour les gros volumes.

## Rendre le pipeline observable

- Journaliser chaque étape (début, fin, nombre de lignes, rejets).
- Vérifier des **seuils** (moins de 5 % de rejets, volume comparable à la veille).
- Exposer des métriques (durée, lignes traitées) et alerter en cas d'échec.

## À retenir

- Extraire → transformer → charger, chacun dans une fonction testable.
- Isoler les lignes invalides plutôt que de tout faire échouer, mais alerter au-delà d'un seuil.
- Idempotence : remplacer une partition ou upsert, jamais d'ajout aveugle.
- Incrémental (date de modification, CDC) pour les gros volumes ; journaux et seuils pour l'observabilité.
