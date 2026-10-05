<!-- @lecon ia-bases -->
« Intelligence artificielle », « machine learning », « deep learning », « IA générative » : ces termes sont souvent employés indifféremment. Un professionnel de la data doit savoir les distinguer, comprendre ce qu'un modèle apprend réellement, et surtout le rôle décisif des **données**.

## Les poupées russes

- **Intelligence artificielle** : l'ensemble des techniques qui permettent à une machine d'accomplir des tâches que l'on associe à l'intelligence (comprendre une phrase, reconnaître une image, décider).
- **Apprentissage automatique** (*machine learning*) : une partie de l'IA où la machine **apprend des exemples** au lieu de suivre des règles écrites à la main.
- **Apprentissage profond** (*deep learning*) : une partie du machine learning qui utilise des **réseaux de neurones** à nombreuses couches, très performants sur les images, le son, le texte.
- **IA générative** : des modèles (souvent profonds) qui **produisent** du contenu : texte, images, code. Les **grands modèles de langage** (*LLM*, comme Claude) en font partie.

## Apprendre à partir d'exemples

:::analogie Pour comprendre
Pour apprendre à un enfant à reconnaître un chat, on ne lui donne pas une définition ; on lui montre beaucoup de chats (et de non-chats). Le machine learning fonctionne de même : on montre au modèle des milliers d'exemples **étiquetés**, et il ajuste ses paramètres pour reproduire les bonnes réponses.
:::

Les grandes familles :

| Famille | Principe | Exemples |
|---|---|---|
| **Supervisé** | exemples avec la bonne réponse (étiquette) | prédire un prix (régression), détecter une fraude (classification) |
| **Non supervisé** | trouver une structure sans étiquette | segmenter des clients (clustering), détecter des anomalies |
| **Par renforcement** | apprendre par essais, erreurs et récompenses | robotique, jeux, ajustement de comportements de modèles |

## Garbage in, garbage out

:::retenir
Un modèle reproduit les régularités de ses données d'entraînement — **y compris leurs erreurs et leurs biais**. Des données incomplètes, mal étiquetées ou déséquilibrées donnent un modèle mauvais ou injuste, quelle que soit la sophistication de l'algorithme. C'est pourquoi la qualité des données (le travail du data engineer) est le premier facteur de succès d'un projet d'IA.
:::

## Qui fait quoi dans un projet d'IA ?

- Le **data engineer** fournit des données fiables, à jour, documentées (et construit les pipelines d'entraînement et de prédiction).
- Le **data scientist** explore, conçoit et évalue les modèles.
- Le **ML engineer / MLOps** met les modèles en production, les surveille et les réentraîne.
- Les **métiers** définissent le problème et valident l'utilité réelle.

## À retenir

- IA ⊃ machine learning ⊃ deep learning ; l'IA générative (dont les LLM) produit du contenu.
- Supervisé (avec étiquettes), non supervisé (structure), par renforcement (récompenses).
- Un modèle ne vaut que par ses données : qualité, représentativité, biais.
- Data engineer, data scientist, ML engineer : trois rôles complémentaires.

<!-- @lecon ia-preparer -->
Avant d'entraîner un modèle, il faut préparer les données : c'est souvent la plus grande partie du travail. Erreurs classiques à éviter : évaluer le modèle sur les données qui ont servi à l'entraîner, ou laisser « fuiter » l'information à prédire dans les variables.

## Variables et étiquette

- Les **variables explicatives** (*features*) décrivent chaque exemple : âge du client, nombre d'achats, ancienneté.
- L'**étiquette** (*label*, *target*) est ce que l'on veut prédire : le client va-t-il résilier son abonnement ?

Le **feature engineering** consiste à construire de bonnes variables à partir des données brutes : « nombre d'achats sur les 90 derniers jours », « jours depuis la dernière commande ».

## Séparer entraînement et test

:::retenir
On évalue toujours un modèle sur des données **qu'il n'a jamais vues** : on sépare le jeu de données en un ensemble d'**entraînement** (par exemple 80 %) et un ensemble de **test** (20 %). Un modèle excellent sur ses données d'entraînement mais mauvais sur le test a appris par cœur au lieu de généraliser : c'est le **surapprentissage** (*overfitting*).
:::

```python
import random

donnees = list(range(100))       # 100 exemples
random.seed(42)                  # graine fixe : la séparation est reproductible
random.shuffle(donnees)
coupe = int(len(donnees) * 0.8)
entrainement, test = donnees[:coupe], donnees[coupe:]
print(len(entrainement), len(test))
```

Pour des données temporelles (ventes, prix), on ne mélange pas au hasard : on entraîne sur le **passé** et on teste sur une période **ultérieure**, comme dans la réalité.

## La fuite de données

:::attention Data leakage
Une **fuite** survient quand une variable contient, directement ou indirectement, l'information à prédire, ou une information qui ne serait pas disponible au moment de la prédiction. Exemple : prédire la résiliation avec la variable « date de résiliation renseignée ». Le modèle semble parfait en test… et est inutile en production.
:::

## Mesurer la performance

Pour une classification (fraude ou non, résiliation ou non) :

- **Exactitude** (*accuracy*) : proportion de bonnes réponses. Trompeuse si les classes sont déséquilibrées : avec 1 % de fraudes, un modèle qui répond toujours « pas de fraude » a 99 % d'exactitude… et ne sert à rien.
- **Précision** : parmi les alertes du modèle, combien sont de vraies fraudes ?
- **Rappel** (*recall*) : parmi les vraies fraudes, combien le modèle en trouve-t-il ?

## À retenir

- Variables explicatives (features) et étiquette (label) ; le feature engineering crée de bonnes variables.
- Toujours évaluer sur des données jamais vues ; séparation temporelle pour les séries dans le temps.
- Surapprentissage : bon en entraînement, mauvais en test.
- Fuite de données : une variable qui « triche ».
- Exactitude trompeuse sur des classes déséquilibrées : regarder précision et rappel.

<!-- @lecon ia-llm-rag -->
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

<!-- @lecon ia-mlops -->
Un modèle qui fonctionne dans un carnet Jupyter n'a encore créé aucune valeur. Le mettre en production, le surveiller et le maintenir dans la durée, c'est le **MLOps** — l'application des principes DevOps au machine learning. Pour les LLM, on parle aussi de **LLMOps**.

## Le cycle de vie d'un modèle

```text
Données → entraînement → évaluation → enregistrement (registre) → déploiement → surveillance → réentraînement
```

## Les briques du MLOps

| Besoin | Pratique | Outils (exemples) |
|---|---|---|
| Reproductibilité | versionner code, données et paramètres | Git, DVC, MLflow |
| Suivi des expériences | comparer les essais (paramètres, métriques) | MLflow, Weights & Biases |
| Registre de modèles | savoir quel modèle est en production, revenir en arrière | MLflow Model Registry, registres cloud |
| Variables partagées | calculer les mêmes features à l'entraînement et en production | feature stores |
| Déploiement | API de prédiction (conteneur) ou prédictions par lots | FastAPI, Kubernetes, services cloud (SageMaker, Vertex AI, Azure ML) |
| Surveillance | performance, dérive des données | outils d'observabilité |

## La dérive

:::retenir
Le monde change, le modèle non. La **dérive des données** (*data drift*) : les données reçues en production ne ressemblent plus à celles de l'entraînement (nouveaux produits, nouveaux comportements). La **dérive conceptuelle** (*concept drift*) : la relation elle-même change (ce qui signalait une fraude hier ne la signale plus). Il faut surveiller ces dérives et **réentraîner** régulièrement.
:::

## Spécificités des LLM (LLMOps)

- **Évaluation** : jeux de questions de référence, évaluation automatique et humaine, mesure des hallucinations.
- **Gestion des prompts** : versionnés et testés comme du code.
- **Coûts et latence** : chaque appel est facturé au nombre de jetons (*tokens*) ; mise en cache, choix du modèle selon la tâche.
- **Sécurité** : injections de prompt, fuite de données sensibles, garde-fous sur les sorties.
- **Traçabilité** : journaliser les requêtes et réponses (dans le respect du RGPD).

## À retenir

- MLOps : DevOps appliqué au ML — reproductibilité, suivi d'expériences, registre, déploiement, surveillance.
- Dérive des données et dérive conceptuelle : surveiller et réentraîner.
- LLMOps : évaluation, prompts versionnés, coûts et latence, sécurité, traçabilité.

<!-- @lecon ia-responsable -->
Une IA peut discriminer à l'embauche, refuser un crédit sans explication, diffuser des informations fausses ou exposer des données personnelles. Concevoir une IA **responsable** est une exigence éthique, réglementaire… et une condition de la confiance des utilisateurs.

## Les risques

- **Biais et discrimination** : un modèle entraîné sur des décisions passées biaisées les reproduit.
- **Opacité** : impossible d'expliquer une décision qui affecte une personne.
- **Hallucinations et désinformation** : des contenus faux mais crédibles.
- **Vie privée** : données personnelles dans les données d'entraînement ou dans les réponses.
- **Sécurité** : manipulation par des entrées malveillantes (injection de prompt), extraction de données.
- **Impact environnemental** : l'entraînement et l'usage intensif consomment beaucoup d'énergie.

## Le règlement européen sur l'IA (AI Act)

Le règlement européen sur l'intelligence artificielle classe les systèmes d'IA selon leur **niveau de risque** :

| Niveau | Exemples | Régime |
|---|---|---|
| **Inacceptable** | notation sociale, manipulation exploitant des vulnérabilités, certaines reconnaissances biométriques | interdit (depuis février 2025) |
| **Haut risque** | recrutement, crédit, éducation, infrastructures critiques, certains usages en santé | obligations fortes : gestion des risques, qualité des données, documentation, contrôle humain, traçabilité |
| **Risque limité** | assistants conversationnels, contenus générés | obligations de **transparence** (informer qu'on parle à une IA, signaler les contenus générés) |
| **Risque minimal** | filtres anti-spam, recommandations simples | pas d'obligation spécifique |

Des obligations spécifiques visent aussi les **modèles d'IA à usage général** (les grands modèles de langage). L'essentiel des dispositions s'applique depuis le 2 août 2026 ; certaines obligations relatives aux systèmes à haut risque sont prévues pour décembre 2027.

:::attention
Le calendrier d'application de l'AI Act a fait l'objet de débats et d'ajustements. Vérifiez les dates en vigueur sur les sites de la Commission européenne et de la CNIL avant toute décision.
:::

## Les bonnes pratiques

:::methode Concevoir une IA responsable
1. **Documenter** les données d'entraînement (origine, représentativité, limites) et le modèle (usage prévu, performances, limites).
2. **Mesurer les biais** : comparer les performances selon les groupes concernés.
3. **Garder un humain dans la boucle** pour les décisions importantes.
4. **Expliquer** les décisions quand elles affectent des personnes.
5. **Protéger les données personnelles** (minimisation, pseudonymisation) dès la conception.
6. **Tester la robustesse** et la sécurité (y compris les injections de prompt).
7. **Surveiller** en production et prévoir un recours pour les personnes concernées.
:::

## À retenir

- Risques : biais, opacité, hallucinations, vie privée, sécurité, environnement.
- AI Act : inacceptable (interdit), haut risque (obligations fortes), risque limité (transparence), minimal.
- Calendrier : interdictions depuis février 2025, l'essentiel depuis le 2 août 2026, une partie du haut risque en décembre 2027 — à vérifier.
- Documenter, mesurer les biais, humain dans la boucle, expliquer, protéger les données, tester, surveiller.
