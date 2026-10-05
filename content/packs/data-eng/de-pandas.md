**pandas** est la bibliothèque Python de référence pour manipuler des données tabulaires. Elle est idéale pour explorer, nettoyer et transformer des volumes qui tiennent en mémoire (jusqu'à quelques millions de lignes). Les exemples s'exécutent dans le labo (pandas se charge automatiquement, une quinzaine de Mo la première fois).

## Le DataFrame

```python
import pandas as pd

df = pd.DataFrame({
    "client": ["Ada", "Linus", "Grace", "Ada", "Ken"],
    "ville": ["Lyon", "Paris", "Lyon", "Lyon", "Lille"],
    "montant": [120, 80, 45, 60, 200],
})
print(df)
print(df.dtypes)
print(df.describe())
```

Un **DataFrame** est un tableau dont chaque colonne (une **Series**) a un type. On lit souvent les données depuis un fichier : `pd.read_csv("ventes.csv")`, `pd.read_parquet(...)`, `pd.read_json(...)`.

## Sélectionner et filtrer

```python
print(df["montant"].sum())
print(df[df["montant"] > 50])
print(df[(df["ville"] == "Lyon") & (df["montant"] > 50)])
print(df.loc[df["client"] == "Ada", ["ville", "montant"]])
```

:::piege Piège classique
Pour combiner des conditions, on utilise `&` (et), `|` (ou), avec des **parenthèses** autour de chaque condition — pas `and`/`or`.
:::

## Transformer

```python
df["montant_ttc"] = (df["montant"] * 1.2).round(2)
df["ville"] = df["ville"].str.upper()
df = df.rename(columns={"client": "nom_client"})
df = df.sort_values("montant", ascending=False)
print(df)
```

## Agréger : groupby

```python
resume = df.groupby("ville").agg(
    nb_commandes=("montant", "count"),
    ca=("montant", "sum"),
    panier_moyen=("montant", "mean"),
).reset_index()
print(resume)
```

C'est le `GROUP BY` de SQL, en Python.

## Joindre : merge

```python
villes = pd.DataFrame({"ville": ["LYON", "PARIS"], "region": ["Auvergne-Rhône-Alpes", "Île-de-France"]})
print(df.merge(villes, on="ville", how="left"))
```

`how="left"` correspond au `LEFT JOIN`.

## Les valeurs manquantes

```python
print(df.isna().sum())          # nombre de valeurs manquantes par colonne
df = df.dropna(subset=["montant"])
df["ville"] = df["ville"].fillna("inconnue")
```

:::futur Tendance
**Polars**, une bibliothèque plus récente écrite en Rust, gagne du terrain : beaucoup plus rapide sur de gros volumes, avec une syntaxe proche. **DuckDB** permet aussi d'exécuter du SQL directement sur des fichiers Parquet ou des DataFrames. Les concepts (filtrer, grouper, joindre) restent les mêmes.
:::

## À retenir

- DataFrame = tableau typé ; `read_csv`, `read_parquet`, `read_json`.
- Filtrer : `df[(cond1) & (cond2)]` ; sélectionner : `df.loc[lignes, colonnes]`.
- Transformer : nouvelles colonnes, `str`, `rename`, `sort_values`.
- `groupby(...).agg(...)` = GROUP BY ; `merge(..., how=...)` = JOIN.
- `isna`, `dropna`, `fillna` pour les valeurs manquantes.
