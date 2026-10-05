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
