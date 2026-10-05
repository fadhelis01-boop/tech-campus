« C'est toujours le DNS. » Cette plaisanterie d'administrateurs système contient une vérité : une erreur de DNS peut rendre tout un service inaccessible. Comprendre son fonctionnement fait gagner des heures de diagnostic.

## Le rôle du DNS

Le **DNS** (*Domain Name System*) traduit un nom (`www.example.com`) en adresse IP. C'est un annuaire **distribué** : aucun serveur ne connaît tout, chacun connaît une partie et sait à qui demander le reste.

## La résolution d'un nom

1. Votre machine regarde son **cache**.
2. Sinon, elle interroge un **résolveur** (celui de votre fournisseur d'accès, ou public comme `1.1.1.1`).
3. Le résolveur interroge un serveur **racine**, qui le renvoie vers les serveurs de `.com`.
4. Les serveurs de `.com` le renvoient vers les serveurs **faisant autorité** pour `example.com`.
5. Ceux-ci donnent la réponse, que le résolveur met en cache pendant la durée indiquée (**TTL**).

## Les types d'enregistrements

| Type | Rôle | Exemple |
|---|---|---|
| **A** | nom → adresse IPv4 | `www → 93.184.215.14` |
| **AAAA** | nom → adresse IPv6 | |
| **CNAME** | alias vers un autre nom | `blog → monsite.github.io` |
| **MX** | serveurs de messagerie du domaine | |
| **TXT** | texte libre (vérifications, SPF anti-spam) | |
| **NS** | serveurs faisant autorité pour le domaine | |

## Interroger le DNS

```bash
nslookup example.com
dig example.com
dig +short example.com
```

## Le TTL et la propagation

Chaque réponse a une durée de vie (**TTL**, en secondes). Si vous modifiez un enregistrement dont le TTL est de 24 heures, certains utilisateurs verront l'ancienne valeur pendant 24 heures.

:::astuce
Avant une migration (changement de serveur), **baissez le TTL** quelques jours à l'avance (par exemple à 300 secondes). Le basculement sera ensuite quasi immédiat, et un retour arrière aussi.
:::

:::metier En entreprise
Dans le cloud, le DNS est un service managé (Route 53 chez AWS, Azure DNS, Cloud DNS chez Google) qui sert aussi à répartir le trafic entre régions, à basculer automatiquement en cas de panne, et à faire pointer un nom vers un équilibreur de charge. Les noms internes des services (dans un VPC, dans Kubernetes) reposent aussi sur le DNS.
:::

## À retenir

- Le DNS traduit les noms en adresses ; il est distribué et hiérarchique.
- Résolveur → racine → TLD → serveurs faisant autorité ; réponses mises en cache selon le TTL.
- A (IPv4), AAAA (IPv6), CNAME (alias), MX (courriel), TXT, NS.
- `nslookup`, `dig` ; baisser le TTL avant une migration.
