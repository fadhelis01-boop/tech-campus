# Guide du contenu — ajouter ou mettre à jour un domaine sans programmer

Un **domaine** (Linux, SQL, Kubernetes, ou demain Rust, FinOps, Snowflake…) est un **pack** : un programme de modules et de leçons, avec quiz, cartes de révision, exercices pratiques et lexique. L'application n'a besoin d'aucune modification de code pour afficher un nouveau domaine.

## Trois façons d'ajouter un domaine

| Méthode | Pour qui | Portée |
|---|---|---|
| **Contenus → Créer avec l'assistant** | Vous, dans l'application | Programme complet généré par l'IA ; leçons rédigées à la demande. Stocké sur l'appareil. |
| **Contenus → Importer un fichier** | Vous, avec un fichier `.json` (modèle téléchargeable dans l'application) | Stocké sur l'appareil ; réimporter une version supérieure le met à jour. |
| **Ajouter deux fichiers dans `content-src/`** | Pour diffuser le domaine à tous vos appareils | Après `npm run deploy`. |

## Les sources du projet

```
content-src/
├── <domaine>.yaml        métadonnées, modules, leçons, quiz, cartes, exercices, lexique
├── <domaine>.md          le texte des leçons
├── _parcours.yaml        les feuilles de route métiers et leurs jalons de certification
├── _certifications.yaml  les certifications réelles (tarifs, format, liens)
├── _datasets.yaml        les bases SQL d'exemple (réutilisables : setup: "@boutique")
└── _changelog.yaml       le journal des mises à jour
```

### Le texte des leçons (`<domaine>.md`)

Une section par leçon, introduite par un marqueur :

```markdown
<!-- @lecon linux-pourquoi -->
Introduction…

## Une section

:::analogie Pour comprendre
Une image de la vie courante.
:::

​```bash
ls -la
​```
```

Blocs disponibles : `analogie`, `definition`, `retenir`, `astuce`, `attention`, `exemple`, `methode`, `metier`, `piege`, `futur`, `commande`, `defi`. Les blocs de code `python` et `sql` reçoivent un bouton « ▶ Essayer » (ouverture dans le labo), les blocs `bash` un bouton « ⌨️ Terminal ».

### Le programme (`<domaine>.yaml`)

```yaml
id: mon-domaine
version: 2026.11.1          # à incrémenter à chaque mise à jour
title: Mon domaine
branch: Data                # Socle, Data, Cloud & DevOps, Sécurité & IA, Méthode & carrière…
icon: 🧱
color: "#4f46e5"
order: 50
updatedAt: 2026-11-01
description: Une phrase.
outlook: Pourquoi ce domaine compte pour les métiers de demain.
glossary:
  - { term: Terme, en: English term, def: "Définition." }
modules:
  - id: m1
    title: Premier module
    level: 1               # 1 fondamentaux, 2 approfondissement, 3 expert
    summary: Ce que couvre le module.
    lessons:
      - id: ma-lecon         # doit correspondre au marqueur <!-- @lecon ma-lecon -->
        title: Titre
        objectives: [Comprendre…, Savoir faire…]
        docs:
          - { title: "Documentation officielle", url: "https://…" }
        quiz:
          - { type: qcm, q: "Question ?", choices: ["A", "B", "C", "D"], answer: 0, explain: "Pourquoi." }
          - { type: vf, q: "Affirmation.", answer: true, explain: "Pourquoi." }
        flashcards:
          - { q: "Question", a: "Réponse" }
        exercises: []         # voir ci-dessous
```

Une leçon sans texte mais avec un champ `outline` (plan) sera rédigée à la demande par l'assistant.

## Les exercices pratiques

| Type | Ce qu'il faut fournir | Correction |
|---|---|---|
| `code` + `lang: python` | `starter`, `solution`, `tests` (assertions ou `stdout` attendu), éventuellement `setup` | tests exécutés dans le vrai Python (Pyodide) |
| `code` + `lang: sql` | `setup` (ou `"@boutique"`), `starter`, `solution`, `ordered` | résultat comparé à celui de la solution (ou état final des tables) |
| `terminal` | `files` de départ, `prepare` (commandes silencieuses), `tasks` (objectifs vérifiés), `commands` (solution) | objectifs vérifiés en direct dans le terminal simulé |
| `config` | `filename`, `syntax` (yaml, json, dockerfile, hcl, text), `starter`, `solution`, `checks` (regex ou chemin YAML/JSON) | critères vérifiés automatiquement |
| `calcul` | `questions` (réponse numérique, tolérance, explication) | comparaison numérique |
| `ordre` | `items` dans le bon ordre | comparaison |
| `projet` | `statement`, `rubric`, `model` | corrigé type + correction par l'assistant |

Objectifs de terminal disponibles : `exists`, `absent`, `content`, `cwd`, `ran` (commande tapée), `output` (sortie affichée), `exec`, `git` (commits, branche, fusion, distant, fichier suivi ou non), `docker` (conteneur, image), `k8s` (objet, réplicas).

## Compiler et vérifier

```bash
npm run content          # compile les sources (vérifie la structure, les quiz, les références)
npm run content:check    # EXÉCUTE chaque exercice : la solution doit réussir, le code de départ échouer
npm run deploy           # compile, vérifie, construit et publie
```

`content:check` garantit qu'aucun exercice publié n'est cassé : chaque solution Python passe ses tests, chaque requête SQL s'exécute, chaque solution de terminal atteint ses objectifs, chaque configuration remplit ses critères — et le point de départ ne les remplit pas déjà.

## Mettre à jour un domaine

1. Modifiez le `.md` ou le `.yaml`.
2. Incrémentez `version` et `updatedAt`.
3. `npm run deploy`. Les appareils signalent « Contenus mis à jour ».
