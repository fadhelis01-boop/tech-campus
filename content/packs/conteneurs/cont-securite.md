Un conteneur partage le noyau de sa machine hôte ; une image peut contenir des centaines de bibliothèques, chacune avec ses failles. La sécurité des conteneurs se joue à la construction, au stockage et à l'exécution.

## Construire des images sûres

:::methode Les bonnes pratiques
1. **Images de base minimales** (`-slim`, `alpine`, ou images *distroless* sans shell) : moins de logiciels, moins de failles.
2. **Versions fixées** : jamais `latest` en production ; idéalement, référence par empreinte (*digest*).
3. **Utilisateur non root** dans l'image (`USER`).
4. **Aucun secret** dans l'image ni dans son historique de construction.
5. **Construction en plusieurs étapes** : les outils de compilation ne vont pas dans l'image finale.
:::

## Analyser les vulnérabilités

Des **scanners** (Trivy, Grype, ou ceux des registres cloud) comparent le contenu d'une image aux bases de vulnérabilités connues (**CVE**) :

```bash
trivy image monregistre/api:2.1
```

On les intègre à la chaîne d'intégration continue : une image avec une faille critique ne part pas en production.

## La chaîne d'approvisionnement logicielle

Une attaque peut viser non pas votre code, mais ce dont il dépend (une bibliothèque compromise, une image piégée). Les réponses :

- un **SBOM** (*Software Bill of Materials*), la liste de tous les composants d'une image ;
- la **signature** des images (Sigstore/cosign) et la vérification avant déploiement ;
- des registres de confiance et des images de base officielles.

## À l'exécution

- Ne jamais lancer de conteneurs **privilégiés** sans nécessité absolue.
- Système de fichiers en lecture seule quand c'est possible.
- Dans Kubernetes : **standards de sécurité des pods** (*Pod Security Standards*), politiques réseau (*NetworkPolicy*) pour limiter qui parle à qui, droits RBAC minimaux, Secrets protégés.

:::metier En entreprise
La sécurité de la chaîne d'approvisionnement est devenue une priorité depuis plusieurs attaques retentissantes ayant touché des éditeurs de logiciels. Les réglementations européennes (comme le Cyber Resilience Act pour les produits comportant des éléments numériques) renforcent ces exigences : savoir produire un SBOM et scanner ses images devient une compétence attendue des profils DevOps.
:::

## À retenir

- Images minimales, versionnées, non root, sans secret, multi-étapes.
- Scanner les images (Trivy, Grype) dans la CI ; bloquer les failles critiques.
- Chaîne d'approvisionnement : SBOM, signature des images, sources de confiance.
- Exécution : pas de privilèges inutiles, Pod Security Standards, NetworkPolicy, RBAC minimal.
