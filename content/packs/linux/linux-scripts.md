Taper dix commandes à la main une fois, c'est normal. Les taper chaque matin, c'est une erreur : on les met dans un **script**. L'automatisation est au cœur des métiers DevOps et data. Cette leçon vous apprend les variables d'environnement et vos premiers scripts bash.

## Les variables

Le shell sait mémoriser des valeurs dans des **variables** :

```bash
PROJET=ventes
echo "Projet : $PROJET"
```

- on affecte avec `NOM=valeur`, **sans espaces** autour du `=` ;
- on lit avec `$NOM` (ou `${NOM}`).

:::piege Piège classique
`PROJET = ventes` (avec des espaces) ne marche pas : le shell croit que vous voulez lancer une commande nommée `PROJET`.
:::

## Les variables d'environnement

Certaines variables sont transmises à tous les programmes que vous lancez : ce sont les **variables d'environnement**. On les crée avec `export` :

```bash
export ENVIRONNEMENT=production
env
echo $HOME
echo $PATH
```

- `HOME` : votre dossier personnel ;
- `USER` : votre nom d'utilisateur ;
- `PATH` : la liste des dossiers où le shell cherche les commandes que vous tapez.

:::metier En entreprise
Les variables d'environnement servent à **configurer** une application sans modifier son code : adresse de la base de données, niveau de journalisation, environnement (développement, recette, production). C'est l'un des principes de la méthode « Twelve-Factor App », appliquée partout dans le cloud : le même conteneur Docker tourne en test et en production, seules ses variables changent.
:::

:::attention
Ne mettez jamais un mot de passe en clair dans un script partagé ou dans Git. Les secrets se passent par des variables d'environnement alimentées par un coffre-fort (*vault*, gestionnaire de secrets du cloud), comme vous le verrez dans le module sécurité.
:::

## Votre premier script

Un script bash est un simple fichier texte contenant des commandes, exécutées l'une après l'autre.

```bash
#!/bin/bash
set -e
echo "Préparation du dossier de travail"
mkdir -p rapport
echo "date,ventes" > rapport/ventes.csv
echo "Terminé"
```

- La première ligne, le **shebang** `#!/bin/bash`, indique quel programme doit interpréter le fichier.
- `set -e` arrête le script à la première erreur, au lieu de continuer dans un état incohérent. C'est une bonne pratique quasi obligatoire.
- Les lignes qui commencent par `#` sont des **commentaires**.

## Lancer un script

```bash
chmod +x prepare.sh
./prepare.sh
```

- `chmod +x` le rend exécutable (une seule fois) ;
- `./prepare.sh` le lance. Le `./` signifie « le fichier `prepare.sh` qui est **ici** » : par sécurité, le dossier courant n'est pas dans le `PATH`.

On peut aussi écrire `bash prepare.sh`, qui ne nécessite pas le droit d'exécution.

:::astuce
Dans le terminal de TechCampus, `edit prepare.sh` (ou `nano prepare.sh`) ouvre un éditeur intégré pour écrire votre script confortablement. Sur un vrai serveur, `nano` est l'éditeur le plus simple pour débuter.
:::

## Pour aller plus loin

Bash sait aussi faire des conditions (`if`), des boucles (`for`), des fonctions. Mais dès qu'un script dépasse une cinquantaine de lignes ou manipule des données, les professionnels passent à **Python**, plus lisible et plus facile à tester. Bash reste imbattable pour enchaîner des commandes système.

## À retenir

- `NOM=valeur` (sans espaces), puis `$NOM`.
- `export` crée une variable d'environnement, transmise aux programmes ; `PATH` liste où chercher les commandes.
- Un script commence par `#!/bin/bash` et `set -e`.
- `chmod +x script.sh` puis `./script.sh`.
- Jamais de secret en clair dans un script.
