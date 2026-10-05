Quand vous tapez une adresse dans votre navigateur, une dizaine de machines collaborent en quelques millisecondes pour vous afficher la page. Comprendre ce trajet, c'est comprendre le terrain de jeu de tous les métiers du cloud.

## Client et serveur

- Le **client** (votre navigateur, une application, un script Python) **demande** quelque chose.
- Le **serveur** **répond** : une page web, des données au format JSON, un fichier.

Une API (*Application Programming Interface*) est un serveur conçu pour répondre à des programmes plutôt qu'à des humains.

## Adresses IP et noms de domaine

Chaque machine connectée a une **adresse IP**, par exemple `93.184.215.14` (IPv4) ou `2606:2800:21f:cb07::1` (IPv6).

:::analogie Pour comprendre
L'adresse IP est le numéro de téléphone d'une machine. Le **nom de domaine** (`example.com`) est le nom dans le répertoire. Le **DNS** (*Domain Name System*) est l'annuaire qui traduit le nom en numéro.
:::

## Le voyage d'une requête

1. Vous tapez `https://www.example.com/catalogue`.
2. Votre machine demande au **DNS** l'adresse IP de `www.example.com`.
3. Elle ouvre une connexion **TCP** vers cette adresse, sur le **port** 443 (celui de HTTPS).
4. Une négociation **TLS** chiffre la connexion (le cadenas du navigateur).
5. Le navigateur envoie une requête **HTTP** : « GET /catalogue ».
6. Le serveur répond avec un **code** (200 = OK, 404 = introuvable, 500 = erreur du serveur) et le contenu.
7. Le navigateur affiche la page, et refait souvent ce voyage pour chaque image ou script.

```bash
curl -I https://example.com
```

`curl -I` affiche seulement la réponse du serveur : le code et les en-têtes. Vous pouvez l'essayer dans le terminal de l'application (qui simule `curl` vers les serveurs locaux).

## Les codes HTTP à connaître

| Famille | Sens | Exemples |
|---|---|---|
| 2xx | succès | 200 OK, 201 créé |
| 3xx | redirection | 301 déplacé définitivement |
| 4xx | erreur du **client** | 400 requête invalide, 401 non authentifié, 403 interdit, 404 introuvable, 429 trop de requêtes |
| 5xx | erreur du **serveur** | 500 erreur interne, 502/503 service indisponible |

:::astuce
Code 4xx : c'est (probablement) votre requête qui est en cause. Code 5xx : c'est le serveur. Ce simple réflexe accélère énormément les diagnostics.
:::

:::metier En entreprise
Un data engineer récupère des données sur des API : il doit gérer les erreurs 429 (« vous allez trop vite », il faut ralentir), les 401 (jeton d'accès expiré), les 5xx (réessayer plus tard). Un ingénieur cloud configure le DNS, les certificats TLS et les répartiteurs de charge qui reçoivent ces requêtes. Le module Réseaux approfondit tout cela.
:::

## À retenir

- Client demande, serveur répond ; une API répond à des programmes.
- IP = numéro, nom de domaine = nom, DNS = annuaire.
- Requête : DNS → connexion TCP (port 443) → TLS → HTTP → code de réponse.
- 2xx succès, 4xx erreur du client, 5xx erreur du serveur.
