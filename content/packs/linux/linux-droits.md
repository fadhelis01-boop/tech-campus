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
