Savoir utiliser des services ne suffit pas : il faut les **assembler** en une architecture fiable, sûre, performante et économe. Les grands fournisseurs ont formalisé leurs bonnes pratiques dans des cadres de référence, que les certifications d'architecte évaluent.

## Les piliers du « bien architecturé »

Le **AWS Well-Architected Framework** (et ses équivalents Azure Well-Architected et Google Cloud Architecture Framework) repose sur six piliers :

| Pilier | Question clé |
|---|---|
| **Excellence opérationnelle** | Peut-on déployer, observer et améliorer facilement ? (automatisation, IaC, supervision) |
| **Sécurité** | Les données et les accès sont-ils protégés ? (moindre privilège, chiffrement, traçabilité) |
| **Fiabilité** | Le système résiste-t-il aux pannes et se rétablit-il ? (plusieurs zones, sauvegardes testées) |
| **Efficacité des performances** | Utilise-t-on les bonnes ressources, de la bonne taille ? |
| **Optimisation des coûts** | Paie-t-on uniquement ce qui sert ? |
| **Durabilité** | Minimise-t-on l'impact environnemental ? |

## Les principes de conception

:::methode Concevoir pour le cloud
1. **Supposer que tout tombe en panne** : redondance sur plusieurs zones, reprises automatiques.
2. **Découpler** les composants : files de messages entre producteurs et consommateurs, pour qu'une partie lente ne bloque pas les autres.
3. **Rendre les serveurs sans état** et jetables : on les remplace plutôt que de les réparer.
4. **Tout automatiser** : infrastructure as code, déploiements continus.
5. **Mesurer** : métriques, journaux, alertes.
6. **Sécuriser à chaque couche** : réseau, identité, données.
:::

## Une architecture type

```text
Utilisateurs
   │  DNS + CDN
   ▼
Équilibreur de charge (2 zones, sous-réseaux publics)
   │
   ▼
Conteneurs de l'API (mise à l'échelle automatique, sous-réseaux privés)
   │                     │
   ▼                     ▼
Base PostgreSQL       File de messages ──► Traitements asynchrones
managée (2 zones)                          (fonctions serverless)
   │
   ▼
Copie quotidienne vers le data lake (stockage objet) ──► Entrepôt de données
```

:::metier En entreprise
On documente les choix d'architecture dans des **ADR** (*Architecture Decision Records*) : un court document par décision (contexte, options étudiées, choix, conséquences). Dans six mois, personne ne se souviendra pourquoi on a choisi une file de messages plutôt qu'un appel direct.
:::

## À retenir

- Six piliers : excellence opérationnelle, sécurité, fiabilité, performance, coûts, durabilité.
- Concevoir pour la panne, découpler, serveurs jetables, tout automatiser, mesurer, sécuriser partout.
- Architecture type : CDN → équilibreur → conteneurs sans état → base managée + file de messages → data lake.
- Documenter les décisions (ADR).
