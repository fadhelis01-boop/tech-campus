<!-- @lecon secu-fondamentaux -->
Une fuite de données clients, un rançongiciel qui chiffre tous les serveurs, une facture cloud de 50 000 € après le vol d'une clé d'accès : ces incidents arrivent chaque semaine, à des entreprises de toutes tailles. La sécurité n'est pas réservée aux spécialistes : chaque data engineer et chaque ingénieur cloud en est un maillon.

## La triade CIA

La sécurité de l'information protège trois propriétés (en anglais *Confidentiality, Integrity, Availability*) :

| Propriété | Question | Exemple d'atteinte |
|---|---|---|
| **Confidentialité** | Seules les personnes autorisées accèdent-elles aux données ? | fuite d'un fichier clients |
| **Intégrité** | Les données sont-elles exactes et non altérées ? | modification frauduleuse d'un montant |
| **Disponibilité** | Le service et les données sont-ils accessibles quand il le faut ? | rançongiciel, attaque par déni de service |

On y ajoute souvent la **traçabilité** : pouvoir savoir qui a fait quoi, et quand.

## Les menaces les plus courantes

- **Hameçonnage** (*phishing*) : un faux message pour voler des identifiants. Reste la première porte d'entrée des attaques.
- **Identifiants volés ou faibles** : mots de passe réutilisés, clés d'accès publiées par erreur sur GitHub.
- **Rançongiciel** (*ransomware*) : chiffrement des données contre rançon, souvent avec vol préalable des données.
- **Vulnérabilités non corrigées** : un logiciel exposé sur Internet avec une faille connue.
- **Mauvaise configuration** : stockage public, port d'administration ouvert à tous, droits trop larges.
- **Attaques de la chaîne d'approvisionnement** : une dépendance ou un outil compromis.

## Les principes de défense

:::retenir Les principes à appliquer partout
1. **Moindre privilège** : chacun (personne ou programme) n'a que les droits nécessaires.
2. **Défense en profondeur** : plusieurs couches de protection (réseau, identité, application, données), pour qu'une faille ne suffise pas.
3. **Sécurité par défaut** : la configuration initiale est la plus sûre (tout fermé, puis on ouvre).
4. **Zéro confiance** (*zero trust*) : ne jamais faire confiance à une requête du simple fait qu'elle vient du réseau interne ; vérifier l'identité et le contexte à chaque accès.
5. **Réduire la surface d'attaque** : moins de services exposés, moins de logiciels installés.
:::

## Les références en France

- L'**ANSSI** (Agence nationale de la sécurité des systèmes d'information) publie des guides de référence (le guide d'hygiène informatique est un excellent point de départ).
- **Cybermalveillance.gouv.fr** aide les particuliers et petites structures victimes.
- La **CNIL** veille à la protection des données personnelles (RGPD).

## À retenir

- Triade CIA : confidentialité, intégrité, disponibilité (+ traçabilité).
- Menaces majeures : hameçonnage, identifiants volés, rançongiciel, failles non corrigées, mauvaise configuration, chaîne d'approvisionnement.
- Moindre privilège, défense en profondeur, sécurité par défaut, zéro confiance, surface d'attaque réduite.
- ANSSI, Cybermalveillance.gouv.fr, CNIL.

<!-- @lecon secu-crypto -->
Protéger un mot de passe, chiffrer une base de données, sécuriser une connexion : derrière chacune de ces opérations se trouve la **cryptographie**. Pas besoin de mathématiques pour l'utiliser correctement — mais il faut savoir quel outil sert à quoi, et ne jamais inventer le sien.

## Hachage, chiffrement, signature

| Opération | Réversible ? | Usage |
|---|---|---|
| **Hachage** | non | empreinte d'un fichier, stockage des mots de passe |
| **Chiffrement symétrique** | oui, avec la même clé | chiffrer des données (disque, base, fichiers) |
| **Chiffrement asymétrique** | oui, clé publique / clé privée | échanger une clé, TLS, SSH |
| **Signature** | vérifiable par tous avec la clé publique | prouver l'auteur et l'intégrité (certificats, images signées) |

## Le hachage

Une **fonction de hachage** transforme n'importe quelle donnée en une empreinte de taille fixe. La moindre modification change complètement l'empreinte, et on ne peut pas revenir en arrière.

```python
import hashlib
print(hashlib.sha256(b"bonjour").hexdigest())
print(hashlib.sha256(b"Bonjour").hexdigest())
```

Usages : vérifier qu'un fichier téléchargé n'a pas été altéré, détecter des doublons, pseudonymiser des identifiants.

## Les mots de passe

:::attention On ne stocke jamais un mot de passe en clair
Ni même un simple SHA-256 : les attaquants testent des milliards de mots de passe par seconde. On utilise des fonctions **lentes et salées**, conçues pour cela : **Argon2**, **bcrypt**, **scrypt**, ou PBKDF2 avec un grand nombre d'itérations.
:::

Le **sel** (*salt*) est une valeur aléatoire propre à chaque utilisateur, ajoutée avant le hachage : deux utilisateurs avec le même mot de passe ont des empreintes différentes, et les tables précalculées deviennent inutiles.

```python
import bcrypt
empreinte = bcrypt.hashpw(b"mon mot de passe", bcrypt.gensalt())
print(empreinte)   # le sel et le coût sont inclus dans l'empreinte
print(bcrypt.checkpw(b"mon mot de passe", empreinte))   # True
print(bcrypt.checkpw(b"autre chose", empreinte))        # False
```

La bibliothèque **bcrypt** génère le sel, l'inclut dans l'empreinte et règle le coût (la lenteur volontaire) : on ne manipule rien à la main.

## Le chiffrement en pratique

- **Au repos** : disques, bases et stockage objet chiffrés (activé par défaut chez les grands fournisseurs cloud).
- **En transit** : TLS partout (HTTPS, connexions aux bases de données).
- **Les clés** : gérées par un service dédié (KMS du fournisseur cloud, HSM), avec rotation, jamais dans le code.

:::retenir
Règle d'or : **n'inventez jamais votre propre cryptographie**. Utilisez des bibliothèques reconnues et des services managés, avec les algorithmes recommandés (AES-256-GCM, SHA-256 et au-delà, Argon2/bcrypt pour les mots de passe). Les guides de l'ANSSI précisent les recommandations à jour.
:::

## À retenir

- Hachage (irréversible, empreinte), chiffrement symétrique et asymétrique, signature.
- Mots de passe : fonctions lentes et salées (Argon2, bcrypt, scrypt, PBKDF2), jamais en clair ni en simple SHA.
- Chiffrement au repos et en transit ; clés dans un KMS, avec rotation.
- Ne jamais inventer sa cryptographie.

<!-- @lecon secu-applications -->
La plupart des attaques réussies exploitent des erreurs classiques dans les applications : des failles connues depuis vingt ans, qui continuent d'apparaître. L'**OWASP** (*Open Worldwide Application Security Project*) les recense dans son célèbre **Top 10**.

## Le Top 10 de l'OWASP (en substance)

| Risque | En clair |
|---|---|
| Contrôle d'accès défaillant | un utilisateur accède aux données d'un autre (changer `/commandes/42` en `/commandes/43`) |
| Erreurs de configuration de sécurité | comptes par défaut, messages d'erreur trop bavards, services inutiles exposés |
| Défaillances de la chaîne d'approvisionnement logicielle | dépendances vulnérables ou compromises |
| Défaillances cryptographiques | données sensibles non chiffrées, algorithmes dépassés |
| **Injection** | des données de l'utilisateur interprétées comme du code (SQL, commandes système) |
| Conception non sécurisée | la sécurité oubliée dès la conception |
| Défaillances d'authentification | mots de passe faibles, sessions mal gérées, pas de MFA |
| Défaut d'intégrité des données ou du logiciel | mises à jour non vérifiées, désérialisation dangereuse |
| Journalisation et alertes insuffisantes | l'attaque passe inaperçue |
| Mauvaise gestion des conditions exceptionnelles | erreurs mal traitées qui ouvrent des failles |

(La liste et l'ordre évoluent à chaque édition ; consultez la version en vigueur sur owasp.org.)

## L'injection SQL

C'est l'exemple le plus parlant. Une requête construite en **collant** du texte saisi par l'utilisateur :

```python
nom = "Ada' OR '1'='1"
requete = f"SELECT * FROM clients WHERE nom = '{nom}'"
print(requete)
# SELECT * FROM clients WHERE nom = 'Ada' OR '1'='1'  → renvoie TOUS les clients
```

La parade est simple et systématique : les **requêtes paramétrées**. La valeur est transmise **séparément** de la requête, et n'est jamais interprétée comme du SQL :

```python
cursor.execute("SELECT * FROM clients WHERE nom = ?", (nom,))
```

:::retenir
Ne construisez **jamais** une requête SQL (ou une commande système) en concaténant des données venues de l'extérieur. Requêtes paramétrées, ou ORM, toujours.
:::

## Les autres réflexes du développeur

- **Valider** toutes les entrées (type, taille, format attendu).
- **Contrôler l'accès** côté serveur à chaque requête (l'utilisateur a-t-il le droit de voir **cette** commande ?).
- **Ne pas révéler** d'informations dans les messages d'erreur (pas de trace technique pour l'utilisateur).
- **Mettre à jour** les dépendances (Dependabot, pip-audit).
- **Journaliser** les événements de sécurité (connexions, échecs, accès refusés).

## À retenir

- OWASP Top 10 : contrôle d'accès, configuration, chaîne d'approvisionnement, cryptographie, injection…
- Injection SQL : concaténer des entrées dans une requête ; parade : requêtes paramétrées.
- Valider les entrées, contrôler l'accès côté serveur, messages d'erreur sobres, dépendances à jour, journaliser.

<!-- @lecon secu-secrets-cloud -->
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

<!-- @lecon secu-devsecops -->
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

<!-- @lecon secu-reglementation -->
La sécurité et la protection des données ne sont pas seulement techniques : elles sont **encadrées par la loi**. Un data engineer manipule des données personnelles presque tous les jours ; un ingénieur cloud configure des systèmes soumis à des obligations. Voici le cadre à connaître (sans être juriste).

## Le RGPD

Le **Règlement général sur la protection des données** (applicable depuis mai 2018) s'applique à tout traitement de données personnelles de personnes situées dans l'Union européenne.

:::definition Donnée personnelle
Toute information se rapportant à une personne identifiée ou **identifiable**, directement ou indirectement : nom, adresse électronique, numéro de téléphone, adresse IP, identifiant client, données de localisation… Même un identifiant pseudonymisé reste une donnée personnelle si l'on peut remonter à la personne.
:::

Les principes qui concernent directement les équipes techniques :

| Principe | Traduction technique |
|---|---|
| **Minimisation** | ne collecter et ne copier que les colonnes nécessaires |
| **Limitation de la conservation** | durées de conservation, purge automatique (règles de cycle de vie) |
| **Sécurité** | chiffrement, contrôle d'accès, journalisation |
| **Protection dès la conception** (*privacy by design*) | pseudonymiser dans les environnements d'analyse et de test |
| **Droits des personnes** | pouvoir retrouver, exporter, rectifier ou effacer les données d'une personne |
| **Notification des violations** | prévenir la CNIL dans les 72 heures en cas de violation de données à risque |

:::astuce Pseudonymiser ou anonymiser ?
**Pseudonymiser** remplace les identifiants (par exemple par un hachage salé) : on peut encore relier les données à la personne avec une information supplémentaire, c'est toujours une donnée personnelle. **Anonymiser** rend toute ré-identification impossible ; c'est beaucoup plus difficile qu'il n'y paraît (croiser âge, code postal et date suffit souvent à ré-identifier).
:::

## Les autres textes à connaître

- **NIS2** : directive européenne sur la cybersécurité des entités « essentielles » et « importantes » (énergie, santé, transports, numérique, administrations…), avec des obligations de gestion des risques et de notification des incidents. Sa transposition française (projet de loi « Résilience ») était encore en attente à l'automne 2026 : vérifiez l'état actuel.
- **DORA** (le règlement européen *Digital Operational Resilience Act*, à ne pas confondre avec les indicateurs DevOps) : résilience numérique du secteur financier, applicable depuis janvier 2025.
- **AI Act** : règlement européen sur l'intelligence artificielle (module IA et données).
- **Cyber Resilience Act** : exigences de cybersécurité pour les produits comportant des éléments numériques, applicable progressivement.
- **SecNumCloud** (ANSSI) : qualification des offres cloud de confiance.

:::attention
Ces textes évoluent et leur application dépend du secteur et de la taille de l'organisation. Ce cours donne des repères ; pour une situation réelle, appuyez-vous sur le délégué à la protection des données (DPO) et le responsable de la sécurité (RSSI) de votre entreprise, et sur les publications officielles (CNIL, ANSSI, EUR-Lex).
:::

## À retenir

- RGPD : minimisation, conservation limitée, sécurité, protection dès la conception, droits des personnes, notification en 72 h.
- Pseudonymiser ≠ anonymiser ; une donnée pseudonymisée reste personnelle.
- NIS2, DORA (finance), AI Act, Cyber Resilience Act, SecNumCloud : connaître leur existence et leur objet.
- S'appuyer sur le DPO, le RSSI et les sources officielles.
