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
