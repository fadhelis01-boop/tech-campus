Dans le cloud, une seule erreur de configuration peut exposer toutes les données d'une entreprise. Deux remparts : le **réseau** (vu dans le module Réseaux : VPC, sous-réseaux, groupes de sécurité) et surtout l'**identité** : qui a le droit de faire quoi. C'est l'**IAM** (*Identity and Access Management*).

## Les identités

- **Utilisateurs** : des personnes (de préférence fédérées depuis l'annuaire de l'entreprise, avec authentification unique).
- **Groupes** : pour attribuer des droits à plusieurs utilisateurs à la fois.
- **Rôles** : des identités **sans mot de passe**, que l'on « endosse » temporairement. Les applications et services (une VM, une fonction, un pipeline de déploiement) utilisent des rôles, jamais des clés écrites dans le code.

## Les politiques

Une **politique** (*policy*) décrit des permissions. Exemple au format AWS (le format JSON est similaire dans l'esprit chez les autres fournisseurs) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::ventes-brutes",
        "arn:aws:s3:::ventes-brutes/*"
      ]
    }
  ]
}
```

- **Effect** : `Allow` (autoriser) ou `Deny` (refuser) ;
- **Action** : les opérations autorisées ;
- **Resource** : sur quelles ressources (identifiées ici par leur ARN).

:::retenir Les règles d'évaluation
Par défaut, **tout est refusé**. Une autorisation explicite (`Allow`) ouvre un droit ; un refus explicite (`Deny`) l'emporte **toujours** sur une autorisation.
:::

## Le moindre privilège

:::methode Appliquer le moindre privilège
1. Partir de **zéro** droit.
2. N'ajouter que les **actions** nécessaires (`s3:GetObject`, pas `s3:*`).
3. Sur les seules **ressources** concernées (un bucket précis, pas `*`).
4. Préférer des droits **temporaires** (rôles) aux clés permanentes.
5. **Réviser** régulièrement : supprimer les droits inutilisés (les fournisseurs proposent des outils d'analyse).
:::

## Les bonnes pratiques indispensables

- Le compte **racine** (le compte qui a créé l'abonnement) ne sert **jamais** au quotidien ; il est protégé par une authentification multifacteur (**MFA**).
- MFA pour tous les utilisateurs humains.
- Pas de clés d'accès dans le code, ni dans Git : rôles, identités managées, gestionnaires de secrets.
- Journalisation de toutes les actions (AWS CloudTrail, Azure Activity Log, Cloud Audit Logs).

## À retenir

- IAM : utilisateurs, groupes, rôles (identités temporaires pour les applications), politiques.
- Politique : Effect, Action, Resource ; refus par défaut, Deny explicite prioritaire.
- Moindre privilège : actions et ressources précises, droits temporaires, révisions régulières.
- Compte racine sous MFA et jamais utilisé ; aucune clé dans le code ; tout est journalisé.
