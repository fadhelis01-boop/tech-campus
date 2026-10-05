Une clé d'accès cloud publiée par erreur dans un dépôt GitHub public est repérée par des robots en quelques minutes, et peut servir à créer des machines de minage de cryptomonnaie aux frais de l'entreprise. La gestion des **secrets** et des **identités** est la première ligne de défense dans le cloud.

## Où mettre les secrets ?

| À ne jamais faire | À faire |
|---|---|
| dans le code ou un fichier versionné | dans un **gestionnaire de secrets** (AWS Secrets Manager, Azure Key Vault, Google Secret Manager, HashiCorp Vault) |
| dans une image Docker | injectés au démarrage (variables d'environnement, fichiers montés) |
| envoyés par messagerie | partagés via le gestionnaire, avec des droits précis |
| des clés permanentes pour les applications | des **rôles** et identités managées (droits temporaires) |

:::methode Si un secret a fuité
1. **Révoquer** immédiatement la clé (la supprimer ou la désactiver).
2. En créer une nouvelle et la distribuer par le gestionnaire de secrets.
3. Vérifier dans les journaux (CloudTrail…) ce qui a été fait avec la clé.
4. Supprimer le secret de l'historique Git si possible — mais considérer qu'il est compromis de toute façon.
5. Ajouter une détection automatique (gitleaks, détection de secrets de GitHub) pour que cela ne se reproduise pas.
:::

## La rotation

Un secret doit avoir une **durée de vie limitée** et être renouvelé régulièrement (les gestionnaires de secrets savent faire tourner automatiquement les mots de passe des bases managées). Moins un secret vit longtemps, moins sa fuite est grave.

## Les identités dans le cloud

- **Fédération** : les employés se connectent avec leur compte d'entreprise (authentification unique, *SSO*), pas avec des utilisateurs créés un par un dans chaque cloud.
- **MFA** pour tous les humains, de préférence avec des clés physiques ou des applications d'authentification résistantes à l'hameçonnage (*passkeys*).
- **Rôles** pour les applications et la CI (OIDC entre GitHub Actions et le cloud : aucun secret stocké).
- **Accès juste à temps** pour les droits d'administration élevés.

## Détecter

Les services de sécurité des fournisseurs (AWS GuardDuty et Security Hub, Microsoft Defender for Cloud, Security Command Center de Google) analysent les journaux et les configurations, et signalent les comportements suspects ou les ressources mal configurées.

## À retenir

- Secrets : gestionnaire de secrets, injection au démarrage, jamais dans le code, les images ou Git.
- Fuite : révoquer, remplacer, enquêter, prévenir.
- Rotation régulière ; durée de vie courte.
- Fédération/SSO, MFA résistante à l'hameçonnage, rôles et OIDC, accès juste à temps, services de détection.
