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
