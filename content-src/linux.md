<!-- @lecon linux-pourquoi -->
Data engineers, ingénieurs cloud, DevOps, SRE : tous passent une bonne partie de leur journée dans un **terminal**. Les serveurs du cloud tournent presque tous sous **Linux**, et ils n'ont pas d'écran ni de souris : on les pilote en tapant des commandes. Cette leçon vous fait taper vos premières commandes, sans rien installer.

## Linux, c'est quoi ?

Un **système d'exploitation** (*operating system*, OS) est le logiciel qui fait le lien entre le matériel (processeur, mémoire, disque) et vos programmes. Windows, macOS, Android et Linux sont des systèmes d'exploitation.

Linux a trois particularités qui expliquent son succès dans les entreprises :

- il est **libre et gratuit** : on peut l'installer sur des milliers de serveurs sans payer de licence ;
- il est **stable et léger** : un serveur Linux peut tourner des années sans redémarrer ;
- il est **automatisable** : tout se fait par des commandes, donc tout peut être scripté.

On parle de **distributions** : Ubuntu, Debian, Red Hat Enterprise Linux, Amazon Linux… Ce sont des « saveurs » de Linux, avec le même cœur (le **noyau**, *kernel*) et des outils légèrement différents. Ce que vous apprenez ici fonctionne sur toutes.

:::futur Tendance
Plus de 90 % des serveurs du cloud public et la quasi-totalité des conteneurs Docker et des clusters Kubernetes tournent sous Linux. Savoir s'en servir n'est pas une option dans les métiers data et cloud : c'est le socle.
:::

## Le terminal, le shell et l'invite

:::analogie Pour comprendre
Imaginez un majordome très compétent mais très littéral. Vous ne pouvez pas lui montrer du doigt ce que vous voulez : vous devez le lui dire en phrases courtes et précises (« range ce fichier dans ce dossier »). Le **terminal** est le téléphone qui vous relie à lui ; le **shell** est le majordome qui comprend et exécute vos ordres.
:::

- Le **terminal** est la fenêtre où l'on tape du texte.
- Le **shell** est le programme qui interprète ce que vous tapez. Le plus répandu s'appelle **bash** (et son cousin **zsh** sur Mac).
- L'**invite** (*prompt*) est le texte affiché avant le curseur, par exemple :

```text
apprenant@techcampus:~$
```

Elle se lit : « utilisateur **apprenant**, sur la machine **techcampus**, dans le dossier **~** (votre dossier personnel), prêt à recevoir une commande (**$**) ».

## Anatomie d'une commande

Une commande a toujours la même forme :

```text
commande  -options  arguments
```

- la **commande** : le verbe (`ls` = lister) ;
- les **options** : des réglages qui commencent par un tiret (`-l` = format long) ;
- les **arguments** : ce sur quoi on agit (un fichier, un dossier).

Exemple : `ls -l /etc` signifie « liste, en format détaillé, le contenu du dossier /etc ».

:::attention
Le shell est **sensible à la casse** : `ls` fonctionne, `LS` ou `Ls` non. Et les espaces comptent : `ls-l` n'est pas `ls -l`.
:::

## Vos trois premières commandes

**Où suis-je ?** `pwd` (*print working directory*) affiche le dossier dans lequel vous vous trouvez.

```bash
pwd
```

**Qu'y a-t-il ici ?** `ls` (*list*) affiche le contenu du dossier courant. Avec `-l`, on obtient les détails (droits, taille, date) ; avec `-a`, on voit aussi les fichiers **cachés**, dont le nom commence par un point.

```bash
ls
ls -l
ls -la
```

**Aller ailleurs.** `cd` (*change directory*) change de dossier.

```bash
cd /etc
pwd
cd ..
cd ~
```

- `cd ..` remonte d'un niveau (au dossier parent) ;
- `cd ~` ou `cd` tout seul revient à votre dossier personnel ;
- `cd -` revient au dossier précédent.

## Les raccourcis qui changent la vie

:::astuce
- **Tab** complète automatiquement les noms de commandes et de fichiers. Tapez `cd /e` puis Tab : le shell écrit `/etc/`. Utilisez-le tout le temps : moins de fautes de frappe, plus de vitesse.
- **Flèche du haut** : rappelle les commandes précédentes.
- **Ctrl+C** : interrompt une commande qui tourne (ou efface la ligne en cours).
- **Ctrl+L** (ou `clear`) : efface l'écran.
- `history` : liste tout ce que vous avez tapé.
:::

## Obtenir de l'aide

Personne ne connaît toutes les options par cœur. Les professionnels consultent l'aide en permanence :

- `man ls` ouvre le manuel complet de `ls` (touche `q` pour quitter) ;
- `ls --help` affiche un résumé des options ;
- dans le terminal de TechCampus, `help` liste les commandes disponibles et `man <commande>` en donne un résumé.

:::metier En entreprise
Un data engineer se connecte en SSH à une machine pour vérifier qu'un fichier est bien arrivé (`ls -l`), lire les dernières lignes d'un journal d'erreurs, relancer un traitement. Un ingénieur DevOps fait de même sur des dizaines de serveurs, puis automatise ces gestes dans des scripts. Tout commence par `pwd`, `ls` et `cd`.
:::

## À retenir

- Linux fait tourner l'immense majorité des serveurs du cloud ; on le pilote en ligne de commande.
- Le terminal affiche une invite ; le shell (bash) interprète vos commandes.
- Une commande = un verbe, des options (`-l`), des arguments (`/etc`).
- `pwd` : où suis-je ; `ls` : que contient ce dossier ; `cd` : aller ailleurs.
- Tab, flèche du haut et `man` sont vos meilleurs amis.

<!-- @lecon linux-fichiers -->
Créer un dossier de projet, ranger des fichiers de données, renommer, copier, supprimer : c'est le quotidien de tout informaticien. Dans cette leçon, vous apprenez à manipuler fichiers et dossiers en ligne de commande, et surtout à **comprendre les chemins**, la notion qui piège le plus les débutants.

## L'arborescence Linux

Sous Linux, tout part d'une racine unique, notée `/`. Il n'y a pas de « C: » ni de « D: » : tout est rangé dans un seul arbre.

```text
/
├── etc/        fichiers de configuration du système
├── home/       dossiers personnels des utilisateurs
│   └── apprenant/   ← votre dossier personnel (~)
├── tmp/        fichiers temporaires
├── var/        données qui varient : journaux (var/log)…
└── usr/        programmes installés
```

:::analogie Pour comprendre
L'arborescence ressemble à un immeuble : la racine `/` est le hall d'entrée, chaque dossier est un étage ou un appartement, chaque fichier un objet posé dans une pièce. Un **chemin** est l'adresse complète pour aller chercher un objet.
:::

## Chemins absolus et relatifs

- Un **chemin absolu** part de la racine et commence par `/` : `/home/apprenant/projet/data.csv`. Il est valable où que vous soyez.
- Un **chemin relatif** part du dossier courant : si vous êtes dans `/home/apprenant`, alors `projet/data.csv` désigne le même fichier.

Deux raccourcis :

- `.` désigne le dossier courant ;
- `..` désigne le dossier parent ;
- `~` désigne votre dossier personnel.

:::piege Piège classique
« Aucun fichier ou dossier de ce nom » : neuf fois sur dix, vous n'êtes pas dans le dossier que vous croyez. Réflexe : `pwd` puis `ls` avant de s'acharner.
:::

## Créer

```bash
mkdir projet
mkdir -p projet/data/brut
touch projet/notes.txt
```

- `mkdir` (*make directory*) crée un dossier ;
- `mkdir -p` crée toute la chaîne de dossiers d'un coup (et ne se plaint pas s'ils existent déjà) ;
- `touch` crée un fichier vide.

:::astuce
Évitez les espaces et les accents dans les noms de fichiers : `rapport_ventes_2026.csv` plutôt que `Rapport ventes été 2026.csv`. Les espaces obligent à mettre des guillemets partout et cassent bien des scripts. La convention la plus répandue : minuscules, tirets ou soulignés.
:::

## Copier, déplacer, renommer

```bash
cp notes.txt notes_sauvegarde.txt
cp -r data data_copie
mv notes.txt docs/
mv ancien_nom.txt nouveau_nom.txt
```

- `cp source destination` copie ; `-r` (récursif) est nécessaire pour un dossier ;
- `mv` déplace… et sert aussi à **renommer** (déplacer un fichier vers un nouveau nom, dans le même dossier).

## Supprimer (avec prudence)

```bash
rm fichier.txt
rm -r dossier
rmdir dossier_vide
```

:::attention
Il n'y a **pas de corbeille** en ligne de commande : `rm` supprime définitivement. La commande `rm -rf` (récursif, sans confirmation) est l'une des plus dangereuses de l'informatique : une faute de frappe dans le chemin peut effacer un serveur entier. Relisez toujours votre commande avant d'appuyer sur Entrée, et préférez des chemins précis.
:::

## Les motifs (jokers)

Le shell sait remplacer un motif par la liste des fichiers correspondants :

- `*` remplace n'importe quelle suite de caractères : `ls *.csv` liste tous les fichiers CSV ;
- `?` remplace un seul caractère : `ls data_202?.csv`.

```bash
mv *.csv data/
```

déplace tous les fichiers CSV du dossier courant vers `data/`.

## Visualiser l'arborescence

`tree` affiche joliment un dossier et son contenu (sur un vrai serveur, il faut parfois l'installer) :

```bash
tree projet
```

:::metier En entreprise
Les équipes data organisent leurs fichiers selon des conventions strictes, par exemple `data/raw/` (données brutes, jamais modifiées), `data/staging/`, `data/curated/`, avec des noms datés (`ventes_2026-10-05.csv`). Une arborescence propre, c'est un pipeline qu'on peut automatiser et un collègue qui s'y retrouve.
:::

## À retenir

- Tout part de la racine `/` ; votre dossier personnel est `~`.
- Chemin absolu : commence par `/` ; chemin relatif : part du dossier courant ; `..` remonte.
- `mkdir -p`, `touch`, `cp -r`, `mv` (déplacer ou renommer), `rm` (définitif !).
- `*` et `?` désignent plusieurs fichiers à la fois.
- Pas d'espaces ni d'accents dans les noms de fichiers.

<!-- @lecon linux-lire -->
Un fichier de journal (*log*) de serveur peut contenir des millions de lignes. Impossible de l'ouvrir dans un éditeur : on l'interroge en ligne de commande. Cette leçon vous apprend à lire et à fouiller des fichiers comme un administrateur système.

## Afficher un fichier

```bash
cat notes.txt
cat -n notes.txt
```

`cat` affiche tout le contenu d'un fichier ; `-n` numérote les lignes. Parfait pour un petit fichier, catastrophique pour un journal de deux gigaoctets.

Pour les gros fichiers, on utilise `less` (sur un vrai système) : il affiche page par page, on navigue avec les flèches, `/mot` cherche un mot, `q` quitte.

## Le début et la fin

```bash
head data.csv
head -n 3 data.csv
tail -n 20 /var/log/syslog
```

- `head` affiche les 10 premières lignes (ou `-n N`) : idéal pour découvrir les colonnes d'un CSV ;
- `tail` affiche les dernières lignes : idéal pour un journal, où les événements récents sont à la fin.

:::astuce
`tail -f fichier.log` (*follow*) affiche les nouvelles lignes au fur et à mesure qu'elles sont écrites. C'est le réflexe numéro un quand on surveille une application qui démarre ou un traitement en cours.
:::

## Compter

```bash
wc -l data.csv
```

`wc` (*word count*) compte les lignes (`-l`), les mots (`-w`) ou les caractères (`-c`). Un data engineer s'en sert constamment pour vérifier qu'un fichier reçu a le bon nombre de lignes.

## Chercher dans un fichier : grep

`grep` est sans doute la commande la plus utile de toutes : elle affiche les lignes qui contiennent un motif.

```bash
grep "Failed" /var/log/syslog
grep -i "error" app.log
grep -n "TODO" script.py
grep -c "Failed" /var/log/syslog
grep -v "DEBUG" app.log
grep -r "password" .
```

| Option | Effet |
|---|---|
| `-i` | ignore la différence majuscules/minuscules |
| `-n` | affiche le numéro de ligne |
| `-c` | compte les lignes trouvées au lieu de les afficher |
| `-v` | inverse : les lignes qui ne contiennent **pas** le motif |
| `-r` | cherche dans tous les fichiers d'un dossier |

:::definition
Le motif de `grep` est une **expression régulière** (*regular expression*, regex) : un petit langage pour décrire du texte. `^ERROR` = « ligne qui commence par ERROR », `[0-9]+` = « un ou plusieurs chiffres ». Vous les retrouverez en Python et en SQL.
:::

## Chercher des fichiers : find

```bash
find . -name "*.csv"
find /var/log -name "*.log" -type f
```

`find` parcourt une arborescence et liste les fichiers qui correspondent aux critères (`-name` pour le nom, `-type f` pour les fichiers, `-type d` pour les dossiers).

:::piege Piège classique
Ne confondez pas : `grep` cherche **dans le contenu** des fichiers, `find` cherche **des noms de fichiers**.
:::

:::metier En entreprise
3 h du matin, une alerte : le traitement nocturne a échoué. L'ingénieur d'astreinte se connecte, tape `tail -n 50` sur le journal, repère le message d'erreur, puis `grep -c` pour savoir depuis quand l'erreur se répète. Diagnostic en deux minutes, sans interface graphique.
:::

## À retenir

- `cat` pour un petit fichier, `less` pour un gros ; `head` et `tail` pour le début et la fin.
- `tail -f` suit un journal en direct.
- `wc -l` compte les lignes.
- `grep` cherche dans le contenu (`-i`, `-n`, `-c`, `-v`, `-r`) ; `find` cherche des fichiers par nom.

<!-- @lecon linux-tubes -->
Voici la vraie puissance de la ligne de commande : **combiner** de petites commandes simples pour répondre à des questions complexes, en une ligne. C'est la philosophie Unix : « chaque programme fait une seule chose, mais la fait bien ; et les programmes se branchent les uns aux autres ».

## Les redirections : écrire dans un fichier

Par défaut, une commande affiche son résultat à l'écran. On peut le **rediriger** vers un fichier :

```bash
echo "nom,age" > personnes.csv
echo "Ada,36" >> personnes.csv
cat personnes.csv
```

- `>` écrit dans le fichier, en **écrasant** son contenu s'il existait ;
- `>>` **ajoute** à la fin du fichier.

:::attention
`>` écrase sans prévenir. `ls > important.txt` vient de remplacer le contenu de `important.txt` par la liste des fichiers. En cas de doute, utilisez `>>`.
:::

`echo` affiche simplement le texte qu'on lui donne : c'est le moyen le plus rapide de créer un petit fichier.

## Le tube (pipe) : brancher les commandes

Le caractère `|` (*pipe*, tube) envoie la sortie d'une commande dans l'entrée de la suivante.

:::analogie Pour comprendre
Une chaîne de montage : le premier poste découpe, le deuxième trie, le troisième compte. Chaque ouvrier ne sait faire qu'une chose, mais la chaîne entière produit un résultat sophistiqué.
:::

```bash
grep "Failed" /var/log/syslog | wc -l
```

se lit : « prends les lignes contenant Failed, **puis** compte-les ».

## Les outils de la chaîne de montage

| Commande | Rôle |
|---|---|
| `sort` | trie les lignes (`-n` numérique, `-r` inverse) |
| `uniq` | supprime les doublons **consécutifs** (`-c` les compte) |
| `cut -d, -f2` | extrait la 2ᵉ colonne d'un texte séparé par des virgules |
| `head -n 5` | garde les 5 premières lignes |
| `tr a-z A-Z` | transforme des caractères (ici en majuscules) |

:::piege Piège classique
`uniq` ne retire que les doublons **qui se suivent**. Il faut donc presque toujours trier avant : `sort | uniq -c`.
:::

## Un exemple complet

Question : « quelles adresses IP ont échoué à se connecter, et combien de fois ? »

```bash
grep "Failed password" /var/log/syslog | cut -d' ' -f12 | sort | uniq -c | sort -rn
```

Décomposons :

1. `grep` garde les lignes d'échec ;
2. `cut -d' ' -f12` découpe chaque ligne selon les espaces et garde le 12ᵉ morceau (l'adresse IP) ;
3. `sort` trie les adresses ;
4. `uniq -c` compte les répétitions ;
5. `sort -rn` classe du plus grand au plus petit.

En une ligne, vous avez un rapport de sécurité. Sur un vrai serveur, on vient de repérer une tentative d'intrusion.

:::methode
Construisez une chaîne **étape par étape** : tapez la première commande, regardez le résultat, ajoutez `| commande suivante`, regardez encore. Avec la flèche du haut, c'est très rapide. Personne n'écrit une chaîne de cinq commandes d'un seul coup.
:::

## Enchaîner des commandes

- `commande1 && commande2` : exécute la seconde **seulement si** la première a réussi ;
- `commande1 ; commande2` : exécute les deux, quoi qu'il arrive.

```bash
mkdir rapport && cd rapport
```

:::metier En entreprise
Avant d'écrire un programme Python pour analyser un fichier, un data engineer fait souvent un premier tour en ligne de commande : `head` pour voir les colonnes, `wc -l` pour la volumétrie, `cut | sort | uniq -c` pour repérer les valeurs d'une colonne. Cinq minutes de terminal évitent bien des surprises.
:::

## À retenir

- `>` écrit (écrase), `>>` ajoute.
- `|` branche la sortie d'une commande sur l'entrée de la suivante.
- `sort | uniq -c | sort -rn` : le trio classique pour compter des occurrences.
- `cut -d<séparateur> -f<n°>` extrait une colonne.
- Construisez vos chaînes pas à pas ; `&&` enchaîne si tout va bien.

<!-- @lecon linux-droits -->
Pourquoi un script refuse-t-il de s'exécuter ? Pourquoi une application ne peut-elle pas lire son fichier de configuration ? Réponse fréquente : les **permissions**. Linux est un système multi-utilisateurs, et chaque fichier dit précisément qui a le droit d'en faire quoi.

## Utilisateurs, groupes, root

- Chaque personne ou programme agit sous l'identité d'un **utilisateur** (`whoami` vous dit lequel).
- Les utilisateurs appartiennent à des **groupes** (par exemple `developpeurs`).
- **root** est le super-administrateur : il a tous les droits.

On ne travaille jamais en root au quotidien. Pour une action d'administration ponctuelle, on préfixe la commande par `sudo` (*superuser do*), qui demande votre mot de passe et exécute **cette seule commande** avec les droits d'administrateur.

```bash
sudo apt update
```

## Lire les permissions

```bash
ls -l
```

```text
-rwxr-x--- 1 apprenant dev  2048 oct.  5 09:00 deploy.sh
drwxr-xr-x 2 apprenant dev  4096 oct.  5 09:00 data
```

Le premier bloc de 10 caractères se lit ainsi :

| Position | Signification |
|---|---|
| 1 | type : `-` fichier, `d` dossier |
| 2 à 4 | droits du **propriétaire** (*user*) |
| 5 à 7 | droits du **groupe** (*group*) |
| 8 à 10 | droits des **autres** (*others*) |

Et chaque trio contient :

- `r` (*read*) : lire ;
- `w` (*write*) : modifier ;
- `x` (*execute*) : exécuter (pour un fichier) ou entrer dedans (pour un dossier) ;
- `-` : droit absent.

Pour `deploy.sh` ci-dessus : le propriétaire peut tout faire (`rwx`), le groupe peut lire et exécuter (`r-x`), les autres ne peuvent rien (`---`).

## La notation chiffrée

Chaque droit vaut un nombre : **r = 4, w = 2, x = 1**. On additionne pour chaque trio :

| Droits | Calcul | Chiffre |
|---|---|---|
| `rwx` | 4+2+1 | 7 |
| `rw-` | 4+2 | 6 |
| `r-x` | 4+1 | 5 |
| `r--` | 4 | 4 |
| `---` | 0 | 0 |

Donc `rwxr-x---` s'écrit **750**, et `rw-r--r--` s'écrit **644**.

## Modifier les permissions : chmod

```bash
chmod 755 script.sh
chmod +x script.sh
chmod u+x,go-w fichier
chmod 600 ~/.ssh/id_ed25519
```

- `chmod 755` : le propriétaire fait tout, les autres lisent et exécutent (classique pour un script) ;
- `chmod +x` : ajoute le droit d'exécution ;
- `chmod 600` : seul le propriétaire lit et écrit (indispensable pour une clé privée SSH, sinon SSH refuse de l'utiliser).

:::retenir Les combinaisons à connaître
- **644** : fichier ordinaire (le propriétaire modifie, tout le monde lit).
- **755** : script ou dossier (tout le monde peut l'exécuter ou y entrer).
- **600** : fichier secret (clé, mot de passe).
- **777** : tout le monde fait tout. **À ne jamais utiliser** pour « régler » un problème de droits : c'est une faille de sécurité.
:::

:::piege Piège classique
« Permission denied » en lançant `./script.sh` ? Le fichier n'a pas le droit `x`. Solution : `chmod +x script.sh`. Et non `sudo` ni `chmod 777`.
:::

:::metier En entreprise
Le **principe du moindre privilège** (*least privilege*) guide toute la sécurité : chaque utilisateur, chaque programme, chaque service cloud ne reçoit que les droits strictement nécessaires. Les permissions Linux en sont la première application ; vous retrouverez exactement la même logique avec les rôles IAM d'AWS ou d'Azure.
:::

## À retenir

- Chaque fichier a un propriétaire, un groupe, et trois trios de droits `rwx`.
- r = 4, w = 2, x = 1 : `755`, `644`, `600` sont les combinaisons usuelles.
- `chmod +x` rend un script exécutable.
- `sudo` pour une action d'administration ponctuelle ; jamais `chmod 777`.

<!-- @lecon linux-processus -->
Un serveur est une machine qui fait tourner des programmes en permanence : une base de données, un serveur web, un planificateur de tâches. Savoir observer ce qui tourne, ce que ça consomme et comment l'arrêter ou le relancer est une compétence de base en exploitation (*ops*).

## Programme et processus

- Un **programme** est un fichier sur le disque (par exemple `/usr/bin/python3`).
- Un **processus** est un programme **en cours d'exécution**, avec sa mémoire et son identifiant unique, le **PID** (*process ID*).

Le même programme peut tourner plusieurs fois en même temps : chaque exécution est un processus distinct.

## Observer les processus

```bash
ps
ps aux
top
```

- `ps` liste vos processus ; `ps aux` liste **tous** les processus de la machine, avec leur consommation ;
- `top` (ou sa version plus agréable `htop`) affiche en temps réel les processus qui consomment le plus de processeur et de mémoire. On quitte avec `q`.

## Arrêter un processus

```bash
kill 1234
kill -9 1234
```

`kill` envoie un **signal** à un processus. Par défaut, c'est une demande polie de s'arrêter (signal TERM), qui laisse au programme le temps de sauvegarder. `kill -9` (signal KILL) le tue immédiatement : à n'utiliser qu'en dernier recours, car le programme n'a pas le temps de ranger (fichiers à moitié écrits…).

## Les services : systemd

Les programmes qui doivent tourner en permanence (serveur web, base de données) sont des **services**, gérés sur la plupart des distributions par **systemd** :

```bash
systemctl status nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
journalctl -u nginx -n 50
```

- `status` : le service tourne-t-il ? depuis quand ?
- `start`, `stop`, `restart` : démarrer, arrêter, relancer ;
- `enable` : démarrer automatiquement au démarrage de la machine ;
- `journalctl -u <service>` : lire les journaux du service.

## Les ressources de la machine

```bash
df -h
free -h
du -sh dossier
uname -a
```

| Commande | Question |
|---|---|
| `df -h` | reste-t-il de la place sur les disques ? |
| `free -h` | combien de mémoire vive est utilisée ? |
| `du -sh dossier` | combien pèse ce dossier ? |
| `uname -a` | quel noyau, quelle architecture ? |

L'option `-h` (*human-readable*) affiche les tailles en Ko, Mo, Go plutôt qu'en octets.

:::piege Piège classique
Disque plein = panne garantie : la base de données ne peut plus écrire, les journaux s'arrêtent, les traitements échouent avec des messages obscurs. Quand « rien ne marche » sur un serveur, `df -h` fait partie des trois premières commandes à taper.
:::

## Installer des logiciels

Sur Ubuntu et Debian, le **gestionnaire de paquets** s'appelle `apt` :

```bash
sudo apt update
sudo apt install htop
```

`update` met à jour la liste des logiciels disponibles ; `install` installe. Sur Red Hat et Amazon Linux, l'équivalent est `dnf` (ou `yum`).

:::metier En entreprise
Dans le cloud moderne, on se connecte de moins en moins aux serveurs pour relancer des services à la main : on utilise des conteneurs et des orchestrateurs (Kubernetes) qui redémarrent automatiquement ce qui plante. Mais quand il faut comprendre une panne, ce sont ces mêmes notions (processus, mémoire, disque, journaux) qu'on interroge, simplement avec d'autres outils.
:::

## À retenir

- Un processus est un programme en cours d'exécution, identifié par un PID.
- `ps aux` et `top` pour observer ; `kill` pour arrêter (`-9` en dernier recours).
- `systemctl status|restart|enable` gère les services ; `journalctl -u` lit leurs journaux.
- `df -h`, `free -h`, `du -sh` : disque, mémoire, taille d'un dossier.
- `apt install` installe un logiciel.

<!-- @lecon linux-scripts -->
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

<!-- @lecon linux-reseau-ssh -->
Les serveurs sont dans un centre de données, parfois à l'autre bout du monde. Pour travailler dessus, on s'y connecte à distance, de façon sécurisée, avec **SSH**. Et pour diagnostiquer un problème réseau, quelques commandes suffisent.

## Diagnostiquer le réseau

```bash
ip a
ping -c 3 example.com
curl https://example.com
nslookup example.com
```

| Commande | Question |
|---|---|
| `ip a` | quelles adresses IP a ma machine ? |
| `ping` | cette machine répond-elle ? en combien de temps ? |
| `curl` | que renvoie ce serveur web ou cette API ? |
| `nslookup` / `dig` | quelle adresse IP correspond à ce nom de domaine ? |

:::astuce
`curl` est l'outil préféré des développeurs pour tester une API : `curl -I` n'affiche que les en-têtes de la réponse (code 200, 404, 500…), `curl -s` supprime la barre de progression. Vous le reverrez dans le module Réseaux.
:::

## SSH : le terminal à distance

**SSH** (*Secure Shell*) ouvre un terminal sur une machine distante, à travers une connexion **chiffrée** : personne sur le réseau ne peut lire ce que vous tapez.

```bash
ssh apprenant@203.0.113.10
```

Une fois connecté, l'invite change : vous tapez désormais vos commandes sur le serveur distant. `exit` vous ramène chez vous.

## Les clés SSH : mieux qu'un mot de passe

:::analogie Pour comprendre
Une paire de clés SSH fonctionne comme un cadenas et sa clé. Vous distribuez des **cadenas ouverts** (la clé publique) à tous les serveurs où vous voulez entrer ; vous gardez précieusement **la seule clé** qui les ouvre (la clé privée). N'importe qui peut voir un cadenas : il ne permet pas d'ouvrir quoi que ce soit.
:::

```bash
ssh-keygen -t ed25519
ls ~/.ssh
```

`ssh-keygen` crée deux fichiers :

- `id_ed25519` : la **clé privée**, qui ne quitte **jamais** votre machine (droits 600) ;
- `id_ed25519.pub` : la **clé publique**, que l'on copie sur les serveurs (ou dans les réglages GitHub).

```bash
ssh -i ~/.ssh/id_ed25519 apprenant@203.0.113.10
```

:::attention
Ne partagez jamais votre clé privée, ne la mettez jamais dans un dépôt Git, ne l'envoyez pas par messagerie. Si elle fuit, il faut la considérer comme compromise : en créer une nouvelle et retirer l'ancienne de tous les serveurs.
:::

## Copier des fichiers à distance

```bash
scp rapport.csv apprenant@203.0.113.10:/home/apprenant/
```

`scp` copie un fichier vers (ou depuis) une machine distante, à travers SSH. Pour des dossiers volumineux, `rsync` est plus efficace : il ne transfère que ce qui a changé.

:::metier En entreprise
Les clés SSH sont partout : connexion aux serveurs, authentification auprès de GitHub ou GitLab pour pousser du code, accès des outils d'automatisation (Ansible) aux machines. Dans le cloud, on va plus loin : les accès passent par des services d'identité (AWS Systems Manager, bastions, accès « juste à temps ») pour ne laisser aucune porte SSH ouverte sur Internet.
:::

## À retenir

- `ip a`, `ping`, `curl`, `nslookup` : les quatre réflexes de diagnostic réseau.
- `ssh utilisateur@hôte` ouvre un terminal chiffré à distance.
- `ssh-keygen -t ed25519` crée une paire de clés : la publique se distribue, la privée ne se partage jamais.
- `scp` et `rsync` copient des fichiers à distance.

<!-- @lecon linux-automatiser -->
Les tâches qui reviennent (nettoyer les vieux fichiers, lancer une extraction de données chaque nuit, sauvegarder une base) doivent tourner toutes seules, de façon fiable, et laisser une trace. Cette leçon présente la planification avec **cron**, la gestion des journaux et les bonnes pratiques d'un administrateur.

## Planifier avec cron

**cron** est le planificateur historique de Linux. Chaque utilisateur a une **crontab**, une liste de tâches avec leur calendrier, qu'on édite avec `crontab -e` et qu'on affiche avec `crontab -l`.

Une ligne de crontab a cinq champs de temps, puis la commande :

```text
# minute heure jour-du-mois mois jour-de-la-semaine  commande
  30     2     *            *    *                   /opt/scripts/extraction.sh
```

se lit : « à 2 h 30, tous les jours ».

| Exemple | Signification |
|---|---|
| `0 * * * *` | toutes les heures, à la minute 0 |
| `*/15 * * * *` | toutes les 15 minutes |
| `0 6 * * 1-5` | à 6 h, du lundi au vendredi |
| `0 0 1 * *` | à minuit, le 1er de chaque mois |

:::astuce
Le site crontab.guru traduit en clair n'importe quelle expression cron. Les mêmes expressions servent dans Airflow, GitHub Actions, Kubernetes (CronJob) et les planificateurs du cloud : les apprendre une fois sert partout.
:::

## Les journaux (logs)

Un programme qui tourne seul la nuit doit **écrire ce qu'il fait**, sinon personne ne saura pourquoi il a échoué.

```bash
./extraction.sh >> /var/log/extraction.log 2>&1
```

- `>>` ajoute la sortie au journal ;
- `2>&1` y envoie aussi les messages d'**erreur** (le canal d'erreur, numéro 2, est redirigé vers la sortie standard, numéro 1).

Les journaux grossissent indéfiniment : l'outil **logrotate** les archive et les compresse régulièrement (par exemple un fichier par jour, conservé 14 jours).

## Les bonnes pratiques de l'automatisation

:::methode Une tâche automatisée digne de ce nom
1. **Idempotente** : la relancer deux fois ne casse rien (on vérifie ce qui existe avant de le créer).
2. **Bavarde** : elle écrit dans un journal ce qu'elle fait, avec la date.
3. **Fiable** : elle s'arrête proprement en cas d'erreur (`set -e`) et renvoie un code d'erreur.
4. **Surveillée** : un échec déclenche une alerte (courriel, message sur la messagerie d'équipe).
5. **Versionnée** : le script est dans Git, pas seulement sur le serveur.
:::

:::definition
Une opération est **idempotente** si l'exécuter une ou plusieurs fois produit le même résultat. `mkdir -p dossier` est idempotent ; `echo ligne >> fichier` ne l'est pas (chaque exécution ajoute une ligne). Cette notion est centrale en data engineering et en infrastructure as code.
:::

## Le code de retour

Chaque commande renvoie un **code de retour** : 0 si tout s'est bien passé, autre chose en cas d'erreur. C'est grâce à lui que `&&` sait s'il doit continuer, que `set -e` sait quand s'arrêter, et que les outils de supervision savent qu'un traitement a échoué.

:::futur Tendance
Cron reste partout, mais les entreprises orchestrent de plus en plus leurs traitements avec des outils qui gèrent dépendances, reprises sur erreur et historique : **Airflow** ou **Dagster** pour la data, les **CronJobs Kubernetes** et les planificateurs serverless du cloud pour l'infrastructure. Vous les verrez dans les modules Data engineering et Cloud.
:::

## À retenir

- `crontab -e` planifie des tâches ; 5 champs : minute, heure, jour, mois, jour de la semaine.
- Une tâche automatique écrit dans un journal (`>> fichier.log 2>&1`).
- Idempotence, journalisation, arrêt sur erreur, alerte, versionnement : les cinq qualités d'une bonne automatisation.
- Code de retour 0 = succès.
