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
