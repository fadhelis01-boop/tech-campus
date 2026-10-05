Une IA peut discriminer à l'embauche, refuser un crédit sans explication, diffuser des informations fausses ou exposer des données personnelles. Concevoir une IA **responsable** est une exigence éthique, réglementaire… et une condition de la confiance des utilisateurs.

## Les risques

- **Biais et discrimination** : un modèle entraîné sur des décisions passées biaisées les reproduit.
- **Opacité** : impossible d'expliquer une décision qui affecte une personne.
- **Hallucinations et désinformation** : des contenus faux mais crédibles.
- **Vie privée** : données personnelles dans les données d'entraînement ou dans les réponses.
- **Sécurité** : manipulation par des entrées malveillantes (injection de prompt), extraction de données.
- **Impact environnemental** : l'entraînement et l'usage intensif consomment beaucoup d'énergie.

## Le règlement européen sur l'IA (AI Act)

Le règlement européen sur l'intelligence artificielle classe les systèmes d'IA selon leur **niveau de risque** :

| Niveau | Exemples | Régime |
|---|---|---|
| **Inacceptable** | notation sociale, manipulation exploitant des vulnérabilités, certaines reconnaissances biométriques | interdit (depuis février 2025) |
| **Haut risque** | recrutement, crédit, éducation, infrastructures critiques, certains usages en santé | obligations fortes : gestion des risques, qualité des données, documentation, contrôle humain, traçabilité |
| **Risque limité** | assistants conversationnels, contenus générés | obligations de **transparence** (informer qu'on parle à une IA, signaler les contenus générés) |
| **Risque minimal** | filtres anti-spam, recommandations simples | pas d'obligation spécifique |

Des obligations spécifiques visent aussi les **modèles d'IA à usage général** (les grands modèles de langage). L'essentiel des dispositions s'applique depuis le 2 août 2026 ; certaines obligations relatives aux systèmes à haut risque sont prévues pour décembre 2027.

:::attention
Le calendrier d'application de l'AI Act a fait l'objet de débats et d'ajustements. Vérifiez les dates en vigueur sur les sites de la Commission européenne et de la CNIL avant toute décision.
:::

## Les bonnes pratiques

:::methode Concevoir une IA responsable
1. **Documenter** les données d'entraînement (origine, représentativité, limites) et le modèle (usage prévu, performances, limites).
2. **Mesurer les biais** : comparer les performances selon les groupes concernés.
3. **Garder un humain dans la boucle** pour les décisions importantes.
4. **Expliquer** les décisions quand elles affectent des personnes.
5. **Protéger les données personnelles** (minimisation, pseudonymisation) dès la conception.
6. **Tester la robustesse** et la sécurité (y compris les injections de prompt).
7. **Surveiller** en production et prévoir un recours pour les personnes concernées.
:::

## À retenir

- Risques : biais, opacité, hallucinations, vie privée, sécurité, environnement.
- AI Act : inacceptable (interdit), haut risque (obligations fortes), risque limité (transparence), minimal.
- Calendrier : interdictions depuis février 2025, l'essentiel depuis le 2 août 2026, une partie du haut risque en décembre 2027 — à vérifier.
- Documenter, mesurer les biais, humain dans la boucle, expliquer, protéger les données, tester, surveiller.
