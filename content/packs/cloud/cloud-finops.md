« Le cloud coûte trop cher » : beaucoup d'entreprises l'ont découvert en recevant leur facture. Le cloud n'est pas cher par nature ; il l'est quand personne ne pilote la dépense. C'est l'objet du **FinOps**, une compétence de plus en plus recherchée.

## Le FinOps

Le **FinOps** réunit finance, technique et métiers pour **piloter la valeur** du cloud : chaque équipe connaît ce qu'elle dépense et en est responsable. La FinOps Foundation (Linux Foundation) décrit trois phases qui tournent en boucle : **informer** (rendre les coûts visibles), **optimiser**, **opérer** (gouverner en continu).

## Rendre les coûts visibles

- **Étiqueter** (*tags*) chaque ressource : projet, équipe, environnement. Sans étiquettes, impossible de savoir qui dépense quoi.
- **Budgets et alertes** : être prévenu dès qu'une dépense dérive.
- **Tableaux de bord** par équipe et par projet.

## Les leviers d'optimisation

| Levier | Exemple | Gain typique |
|---|---|---|
| Supprimer l'inutile | disques orphelins, environnements de test oubliés, vieux instantanés | immédiat |
| Éteindre hors des heures de travail | environnements de développement la nuit et le week-end | jusqu'à ~70 % sur ces ressources |
| Bien dimensionner (*rightsizing*) | une machine utilisée à 5 % → une taille plus petite | variable |
| S'engager | instances réservées / savings plans sur la charge stable | remises importantes |
| Utiliser le spot | traitements par lots interruptibles | très fortes remises |
| Bonne classe de stockage | archiver les données anciennes | fort sur le stockage |
| Réduire les transferts | les données sortantes du cloud sont facturées | variable |

:::piege Piège classique
Les **transferts de données sortants** (vers Internet, ou entre régions) sont facturés, souvent oubliés dans les estimations. Un pipeline qui copie chaque jour des téraoctets d'une région à l'autre peut coûter plus cher que le stockage lui-même.
:::

## Estimer avant de construire

Chaque fournisseur propose un **calculateur de prix**. Une estimation simple, avant de lancer un projet, évite les mauvaises surprises :

```text
3 machines × 0,10 €/h × 730 h/mois           = 219 €
Base managée haute disponibilité             = 320 €
Stockage objet 2 To × 0,02 €/Go/mois          ≈ 41 €
Transferts sortants 500 Go × 0,09 €/Go        = 45 €
Total mensuel estimé                          ≈ 625 €
```

(Prix fictifs, pour l'exemple : vérifiez toujours dans le calculateur officiel, les tarifs varient selon la région et évoluent.)

## À retenir

- FinOps : informer, optimiser, opérer ; chaque équipe responsable de ses coûts.
- Étiquettes, budgets, alertes : la visibilité d'abord.
- Supprimer, éteindre, redimensionner, s'engager, spot, archiver, limiter les transferts.
- Estimer avec le calculateur officiel avant de construire.
