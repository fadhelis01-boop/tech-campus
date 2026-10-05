« Ce fichier fait 3 Go », « notre base contient 2 To », « le texte est mal encodé » : ces phrases sont quotidiennes dans les métiers de la donnée. Cette leçon vous donne les clés pour les comprendre et faire des calculs justes.

## Le bit et l'octet

- Un **bit** (*binary digit*) vaut 0 ou 1. C'est la plus petite unité d'information.
- Un **octet** (*byte*) regroupe **8 bits**. Il peut prendre 2⁸ = **256** valeurs différentes (de 0 à 255).

:::analogie Pour comprendre
Un bit, c'est un interrupteur : éteint ou allumé. Avec 8 interrupteurs côte à côte, on peut former 256 combinaisons différentes — assez pour coder toutes les lettres, chiffres et signes de ponctuation de l'anglais.
:::

## Compter en binaire

En base 10, chaque position vaut 10 fois la précédente (unités, dizaines, centaines). En binaire, chaque position vaut **2 fois** la précédente : 1, 2, 4, 8, 16, 32, 64, 128.

| Binaire | Calcul | Décimal |
|---|---|---|
| 0000 0101 | 4 + 1 | 5 |
| 0000 1010 | 8 + 2 | 10 |
| 1111 1111 | 128+64+32+16+8+4+2+1 | 255 |

Avec *n* bits, on peut représenter 2ⁿ valeurs. C'est pour cela que les adresses IP (32 bits) sont limitées à environ 4,3 milliards, et que vous croiserez souvent des puissances de 2.

```python
# En Python, bin() montre l'écriture binaire, int(…, 2) fait l'inverse
print(bin(10))          # 0b1010
print(int("11111111", 2))  # 255
print(2 ** 8)           # 256
```

## Les unités : kilo, méga, giga… et kibi

| Unité | Valeur (système décimal) | Ordre de grandeur |
|---|---|---|
| 1 Ko (kilooctet) | 1 000 octets | une page de texte |
| 1 Mo (mégaoctet) | 1 000 000 octets | une photo compressée |
| 1 Go (gigaoctet) | 10⁹ octets | un film |
| 1 To (téraoctet) | 10¹² octets | un disque dur grand public |
| 1 Po (pétaoctet) | 10¹⁵ octets | les données d'une grande entreprise |

:::piege Piège classique
Il existe aussi des unités en puissances de 2 : 1 **Kio** (kibioctet) = 1 024 octets, 1 Mio = 1 024 Kio, 1 Gio = 1 024 Mio. Un disque vendu « 1 To » (10¹² octets) apparaît comme « 931 Go » dans certains systèmes, qui affichent en réalité des Gio. Le cloud facture parfois en Go, parfois en Gio : lisez la ligne de prix.
:::

:::attention Bits ou octets ?
Les débits réseau s'expriment en **bits** par seconde (Mbit/s), les tailles de fichiers en **octets**. Une connexion à 100 Mbit/s transfère au mieux 12,5 Mo par seconde (100 ÷ 8).
:::

## Le texte : ASCII et UTF-8

Pour stocker du texte, on associe un nombre à chaque caractère : c'est l'**encodage**.

- **ASCII** (1963) code 128 caractères : lettres anglaises, chiffres, ponctuation. Pas d'accents.
- **Unicode** recense plus de 150 000 caractères de toutes les langues, les emojis compris.
- **UTF-8** est la façon la plus répandue d'écrire Unicode en octets : 1 octet pour les caractères ASCII, 2 octets pour « é », jusqu'à 4 pour un emoji.

```python
print(len("café"))                  # 4 caractères
print(len("café".encode("utf-8")))  # 5 octets : le é en prend 2
```

:::metier En entreprise
« RÃ©sumÃ© » au lieu de « Résumé » dans un fichier : c'est le symptôme d'un fichier UTF-8 lu comme s'il était en Latin-1 (ou l'inverse). Les data engineers rencontrent ce problème chaque semaine avec des exports CSV. Règle d'or : **tout en UTF-8**, et préciser l'encodage à la lecture.
:::

## À retenir

- 1 octet = 8 bits = 256 valeurs ; avec n bits, 2ⁿ valeurs.
- Ko, Mo, Go, To : facteur 1 000 ; Kio, Mio, Gio : facteur 1 024.
- Débits en bits, tailles en octets : divisez par 8.
- UTF-8 est l'encodage de référence ; les caractères accentués y prennent plus d'un octet.
