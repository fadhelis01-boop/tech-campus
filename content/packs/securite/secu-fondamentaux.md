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
