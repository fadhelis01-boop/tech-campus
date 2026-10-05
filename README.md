# TechCampus — devenir data engineer ou ingénieur cloud/DevOps

Application web installable (PWA) pour apprendre, en partant de zéro, les métiers de la donnée et du cloud. Elle fonctionne sur PC, Mac, tablette, iPhone et Android, en ligne et hors connexion.

**En ligne : https://fadhelis01-boop.github.io/tech-campus/**

## Ce qu'elle contient

- **16 domaines, 128 leçons** écrites et **audio** (lecture à voix haute avec reprise exacte, ou depuis le début), du plus simple au plus avancé : méthode d'apprentissage, métiers de demain, fondamentaux, Linux, Git, Python, SQL, réseaux, algorithmique, data engineering, cloud, Docker et Kubernetes, infrastructure as code, DevOps et SRE, sécurité, IA et données.
- **147 exercices pratiques corrigés automatiquement**, dans chaque domaine :
  - **Python réel** dans le navigateur (Pyodide), avec tests automatiques ; pandas et autres bibliothèques chargées à la demande ;
  - **SQL réel** (SQLite) sur des bases d'exemple ;
  - **terminal Linux simulé** avec Git (branches, conflits, dépôt distant), Docker, Docker Compose, kubectl et Terraform ;
  - **fichiers de configuration** vérifiés (Dockerfile, Compose, manifestes Kubernetes, GitHub Actions, Terraform, Ansible, politiques IAM, dbt) ;
  - calculs, remises en ordre, projets corrigés par l'assistant.
- **373 questions de quiz**, cartes de révision à répétition espacée, tests de positionnement et examens blancs.
- **Deux parcours métiers** (data engineer, ingénieur cloud/DevOps) **jalonnés de vraies certifications** (Linux Essentials, GitHub, AWS, Azure, Google Cloud, Kubernetes, Terraform, Databricks, dbt…) : tarifs, format, liens officiels, état de préparation, financement CPF, et génération du bloc « certifications et compétences » du CV.
- **Labo libre** Python, SQL et terminal ; les extraits des leçons s'y ouvrent d'un clic.
- **Assistant pédagogique** (Claude, clé personnelle) : réponses sourcées par recherche dans la documentation officielle, explication des erreurs sans donner la solution, correction des projets, veille technologique, vérification de l'actualité d'une leçon, création de nouveaux domaines.
- **Ludique** : XP, grades, séries, badges, objectif quotidien.
- **Données sur l'appareil**, export/import pour changer d'appareil ; la clé d'API n'est jamais exportée.

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5192.

## Construire, vérifier, publier

```bash
npm run build     # compile les contenus, exécute TOUS les exercices, teste les moteurs, vérifie les types, construit dist/
npm run deploy    # build puis publication sur la branche gh-pages (GitHub Pages)
```

Le dossier `dist/` est un site statique publiable sur n'importe quel hébergement HTTPS (GitHub Pages, Netlify…). L'HTTPS est indispensable pour l'installation sur iPhone et le mode hors connexion.

Sur iPhone : ouvrir l'adresse dans Safari → Partager → « Sur l'écran d'accueil ».

## Mettre à jour et ajouter des domaines

Les contenus sont des fichiers Markdown + YAML dans `content-src/` : on ajoute ou modifie un domaine sans toucher au code. Voir [docs/GUIDE-CONTENU.md](docs/GUIDE-CONTENU.md). Dans l'application, un domaine peut aussi être créé par l'assistant ou importé depuis un fichier.

À chaque publication, les appareils proposent « Mettre à jour » et signalent les domaines modifiés.

## Structure

```
content-src/          sources des cours (Markdown + YAML), parcours, certifications, bases SQL
public/content/       contenus compilés (générés)
public/pyodide/       Python dans le navigateur (copié depuis node_modules à la compilation)
public/sw.js          service worker (hors connexion, mises à jour)
scripts/              compilation et vérification des contenus, icônes, publication
src/lib/shell/        terminal simulé : système de fichiers, Git, Docker, kubectl, Terraform
src/lib/              stockage, contenus, audio, IA, Python, SQL, vérification des configurations
src/pages/            écrans
tests/                tests des moteurs
```

## Limites assumées

- Le terminal est une **simulation pédagogique** : les commandes essentielles sont fidèles, mais ce n'est pas un vrai Linux. Pour aller plus loin : WSL sous Windows, ou un compte cloud gratuit.
- Les tarifs et versions des certifications, services cloud et outils évoluent : les contenus sont datés et l'application renvoie vers les pages officielles.
- L'assistant nécessite une connexion et une clé d'API Anthropic (facturation à l'usage) ; une IA peut se tromper.
- Pas de synchronisation automatique entre appareils (pas de serveur) : export / import.
- Sur iPhone, la lecture audio s'interrompt quand l'écran se verrouille.
