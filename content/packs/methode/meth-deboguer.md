Votre code ne marche pas. C'est la situation la plus fréquente de votre future vie professionnelle, et la compétence de **débogage** (*debugging*) distingue un professionnel d'un débutant bien plus que la connaissance d'un langage. La bonne nouvelle : c'est une **méthode**, pas un don.

## Lire le message d'erreur (vraiment)

Le réflexe du débutant : voir du rouge, paniquer, modifier le code au hasard. Le réflexe du pro : **lire** l'erreur, en entier, en commençant par la fin.

```text
Traceback (most recent call last):
  File "nettoyage.py", line 12, in <module>
    total = total + ligne["montant"]
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

1. **La dernière ligne** dit **quoi** : `TypeError`, on ajoute un nombre (`int`) et un texte (`str`).
2. **Les lignes au-dessus** disent **où** : fichier `nettoyage.py`, ligne 12.
3. **Votre hypothèse** : le montant lu dans le CSV est du texte (`"120"`), pas un nombre. Solution : `float(ligne["montant"])`.

:::astuce
Copiez la dernière ligne de l'erreur dans un moteur de recherche (en retirant vos noms de fichiers et de variables) : quelqu'un a presque toujours eu le même problème.
:::

## La méthode scientifique du débogage

:::methode Six étapes
1. **Reproduire** : savoir déclencher le problème à coup sûr.
2. **Observer** : que se passe-t-il exactement ? Qu'est-ce qui était attendu ?
3. **Formuler une hypothèse** : « je pense que la variable X vaut None ici ».
4. **Tester l'hypothèse** : afficher la valeur (`print`), lire le journal, isoler.
5. **Corriger** une seule chose à la fois.
6. **Vérifier** que c'est réglé… et que rien d'autre n'est cassé.
:::

## Les outils du détective

- **`print()` stratégiques** : afficher les valeurs intermédiaires. Simple et redoutablement efficace.
- **Réduire le problème** : supprimer tout ce qui n'est pas nécessaire jusqu'à obtenir le plus petit code qui reproduit l'erreur. Souvent, la cause apparaît en chemin.
- **Diviser pour régner** : si un pipeline de 10 étapes produit un mauvais résultat, vérifiez le résultat à l'étape 5. Le problème est avant ou après : vous avez divisé la recherche par deux.
- **Le canard en plastique** (*rubber duck debugging*) : expliquer son code ligne par ligne, à voix haute, à un objet (ou à une personne). En expliquant, on voit l'erreur.
- **Le débogueur** de l'éditeur (VS Code) : arrêter le programme à une ligne et inspecter toutes les variables.

## Les erreurs les plus fréquentes

| Symptôme | Cause habituelle |
|---|---|
| `NameError`, « column does not exist » | faute de frappe dans un nom |
| `IndentationError` en Python | mélange d'espaces et de tabulations, bloc mal aligné |
| `KeyError`, `IndexError` | clé ou position qui n'existe pas (donnée manquante) |
| Résultat faux mais pas d'erreur | logique : condition inversée, boucle qui s'arrête trop tôt |
| « Permission denied » | droits du fichier ou de l'utilisateur |
| « Connection refused » | le service n'est pas démarré, ou mauvais port |

:::piege Piège classique
Changer trois choses à la fois « pour voir ». Si ça marche, vous ne savez pas pourquoi ; si ça ne marche pas, vous avez peut-être ajouté deux nouveaux bugs. Une modification, un test.
:::

## À retenir

- Lire l'erreur en entier, en commençant par la dernière ligne (quoi), puis remonter (où).
- Reproduire → observer → hypothèse → test → correction → vérification.
- `print`, réduction du problème, diviser pour régner, canard en plastique.
- Une seule modification à la fois.
