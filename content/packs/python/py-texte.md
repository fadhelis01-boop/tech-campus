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
