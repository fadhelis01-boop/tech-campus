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
