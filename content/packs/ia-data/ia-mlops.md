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
