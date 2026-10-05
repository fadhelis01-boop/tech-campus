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
