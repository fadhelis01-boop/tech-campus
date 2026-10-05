Les grands modèles de langage (*LLM*) ont transformé les usages : assistants, résumés, extraction d'informations, génération de code. Pour qu'ils répondent sur les documents **de l'entreprise**, on utilise le plus souvent une architecture **RAG** — et c'est un travail de data engineering.

## Ce qu'est un LLM (en bref)

Un LLM est un réseau de neurones entraîné sur d'immenses quantités de texte à **prédire la suite** d'un texte. De cette tâche simple émergent des capacités étonnantes (répondre, résumer, traduire, raisonner, coder). Il a deux limites majeures pour une entreprise :

- il ne connaît **pas les documents internes** (contrats, procédures, base clients) ;
- il peut **halluciner** : produire une réponse plausible mais fausse.

## Le RAG

Le **RAG** (*Retrieval-Augmented Generation*, génération augmentée par la recherche) consiste à **chercher** les passages pertinents dans les documents de l'entreprise, puis à les donner au modèle en lui demandant de répondre **à partir de ces passages**, en les citant.

```text
Question ──► recherche des passages pertinents ──► LLM (question + passages) ──► réponse sourcée
                    ▲
        base de passages indexés (pipeline d'ingestion)
```

C'est d'ailleurs le principe de l'assistant de TechCampus : il cherche dans la documentation officielle, puis répond en citant ses sources.

## Les embeddings et la recherche vectorielle

Pour trouver les passages pertinents, on transforme chaque texte en **vecteur** de nombres (un **embedding**) qui représente son sens : deux textes de sens proche ont des vecteurs proches. On mesure la proximité, par exemple avec la **similarité cosinus**.

```python
import math

def cosinus(a, b):
    produit = sum(x * y for x, y in zip(a, b))
    return produit / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))

question = [0.9, 0.1, 0.3]
passages = {"remboursement": [0.8, 0.2, 0.4], "horaires": [0.1, 0.9, 0.2]}
for nom, v in passages.items():
    print(nom, round(cosinus(question, v), 3))
```

Les vecteurs sont stockés dans une **base vectorielle** (pgvector dans PostgreSQL, ou des bases spécialisées) qui retrouve rapidement les plus proches.

## Le pipeline d'ingestion d'un RAG

C'est là que le data engineer intervient :

1. **Collecter** les documents (PDF, pages, tickets) et leurs métadonnées (date, auteur, droits d'accès).
2. **Extraire** le texte proprement.
3. **Découper** (*chunking*) en passages de taille raisonnable, avec un léger chevauchement.
4. **Calculer** les embeddings.
5. **Indexer** dans la base vectorielle, avec les métadonnées.
6. **Mettre à jour** quand les documents changent (incrémental, suppression des versions obsolètes).
7. **Respecter les droits** : un utilisateur ne doit retrouver que les documents qu'il a le droit de lire.

:::metier En entreprise
La qualité d'un assistant RAG dépend surtout de son pipeline de données : documents à jour, bien découpés, bien filtrés par droits d'accès. Un modèle de langage brillant alimenté par des documents obsolètes donnera des réponses obsolètes, avec assurance.
:::

## À retenir

- Un LLM prédit la suite d'un texte ; il ignore les documents internes et peut halluciner.
- RAG : rechercher les passages pertinents, puis faire répondre le modèle à partir d'eux, en citant.
- Embeddings + similarité cosinus + base vectorielle (pgvector…).
- Pipeline d'ingestion : collecter, extraire, découper, vectoriser, indexer, mettre à jour, respecter les droits.
