Découvrir une faille de sécurité juste avant la mise en production — ou pire, après — coûte cher. Le **DevSecOps** intègre la sécurité **tout au long** de la chaîne de livraison, de façon automatique, plutôt que comme un contrôle final : c'est le « décalage vers la gauche » (*shift left*).

## La sécurité à chaque étape

| Étape | Contrôle | Outils (exemples) |
|---|---|---|
| Poste du développeur | détection de secrets avant commit, linters de sécurité | pre-commit, gitleaks |
| Pull request | analyse du code (SAST) | Semgrep, CodeQL, Bandit |
| Dépendances | bibliothèques vulnérables (SCA), mises à jour automatiques | Dependabot, Renovate, pip-audit |
| Construction | scan de l'image, SBOM, signature | Trivy, Grype, Syft, cosign |
| Infrastructure as code | configurations dangereuses | Checkov, Trivy, OPA |
| Déploiement | politiques d'admission (images signées, pas de root) | Kyverno, OPA Gatekeeper |
| Production | analyse dynamique (DAST), détection d'intrusion, journaux | OWASP ZAP, outils cloud |

## Un exemple dans GitHub Actions

```yaml
  securite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Détection de secrets
        uses: gitleaks/gitleaks-action@v2
      - name: Dépendances Python vulnérables
        run: pip install pip-audit && pip-audit -r requirements.txt
      - name: Scan de l'image
        run: trivy image --exit-code 1 --severity CRITICAL,HIGH monregistre/api:${{ github.sha }}
```

`--exit-code 1` fait échouer la chaîne si une vulnérabilité critique ou élevée est trouvée : l'image ne part pas en production.

:::attention Le bruit
Un scanner signale souvent des dizaines de vulnérabilités, dont beaucoup sans impact réel. Une stratégie réaliste : bloquer sur les **critiques et élevées corrigeables**, traiter le reste selon un calendrier, documenter les exceptions. Sinon, l'équipe finit par ignorer tous les avertissements.
:::

:::metier En entreprise
Les équipes ont de plus en plus d'obligations de preuve : savoir quels composants sont déployés (SBOM), démontrer que les images sont scannées et signées, corriger les vulnérabilités critiques dans des délais définis. Un ingénieur DevOps qui sait mettre cela en place est très recherché.
:::

## À retenir

- DevSecOps : la sécurité automatisée à chaque étape (shift left).
- Secrets, SAST, SCA, scan d'images, SBOM, signature, IaC, politiques d'admission, DAST.
- Bloquer sur les vulnérabilités critiques corrigeables ; gérer le bruit.
- Les obligations de preuve (SBOM, scans, délais de correction) se généralisent.
