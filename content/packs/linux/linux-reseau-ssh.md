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
