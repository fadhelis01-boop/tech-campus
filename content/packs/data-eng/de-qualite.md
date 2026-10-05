Un tableau de bord faux est pire qu'un tableau de bord absent : on prend de mauvaises décisions en toute confiance. La **qualité des données** est une responsabilité centrale du data engineer.

## Les dimensions de la qualité

| Dimension | Question | Exemple de test |
|---|---|---|
| **Complétude** | Les données attendues sont-elles là ? | pas de valeur nulle dans `client_id` ; volume du jour comparable à la veille |
| **Unicité** | Pas de doublon ? | `commande_id` unique |
| **Validité** | Les valeurs respectent-elles les règles ? | montant ≥ 0 ; statut dans une liste ; format d'e-mail |
| **Cohérence** | Les données concordent-elles entre elles ? | chaque `client_id` existe dans la table clients ; total = somme des lignes |
| **Fraîcheur** | Les données sont-elles à jour ? | dernière ligne de moins de 24 h |
| **Exactitude** | Reflètent-elles la réalité ? | rapprochement avec la comptabilité |

## Où tester ?

- **À l'entrée** (bronze → silver) : rejeter ou isoler ce qui est invalide.
- **Après transformation** : tests dbt, Great Expectations, Soda.
- **En continu** : surveillance des volumes, de la fraîcheur, des distributions (outils d'**observabilité des données**).

## Bloquer ou alerter ?

:::methode Graduer la réponse
- **Bloquant** : une erreur qui rendrait les résultats faux (doublons de commandes, clés orphelines) arrête le pipeline avant la publication.
- **Avertissement** : une anomalie à examiner (volume en baisse de 20 %) déclenche une alerte sans bloquer.
- **Quarantaine** : les lignes invalides sont mises de côté, avec la raison, pour être corrigées à la source.
:::

## Les contrats de données

Un **contrat de données** (*data contract*) formalise l'accord entre l'équipe qui produit les données (l'application) et celles qui les consomment : schéma, types, règles de qualité, fraîcheur, responsable. Un changement de schéma non annoncé (une colonne renommée) est l'une des premières causes de pipelines cassés ; le contrat le rend visible et testable en amont.

## À retenir

- Complétude, unicité, validité, cohérence, fraîcheur, exactitude.
- Tester à l'entrée, après transformation, et surveiller en continu.
- Bloquer ce qui fausse les résultats, alerter sur les anomalies, mettre en quarantaine les lignes invalides.
- Contrats de données entre producteurs et consommateurs.
