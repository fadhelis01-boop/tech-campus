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
