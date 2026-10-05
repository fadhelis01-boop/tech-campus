Le Web, les API, les tableaux de bord, les services cloud : presque tout passe par **HTTP**. Un data engineer qui interroge une API et un ingénieur cloud qui configure un équilibreur de charge doivent le connaître dans le détail.

## Requête et réponse

Une **requête** HTTP contient :

- une **méthode** : que veut-on faire ?
- un **chemin** : sur quelle ressource ?
- des **en-têtes** (*headers*) : informations complémentaires (authentification, format) ;
- éventuellement un **corps** (*body*) : les données envoyées.

```text
POST /api/v1/commandes HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{"client_id": 42, "produits": [1, 7]}
```

La **réponse** contient un **code de statut**, des en-têtes et un corps :

```text
HTTP/1.1 201 Created
Content-Type: application/json

{"id": 1043, "statut": "en cours"}
```

## Les méthodes

| Méthode | Usage | Idempotente ? |
|---|---|---|
| `GET` | lire | oui |
| `POST` | créer | non (deux POST = deux créations) |
| `PUT` | remplacer | oui |
| `PATCH` | modifier en partie | pas forcément |
| `DELETE` | supprimer | oui |

## Les API REST

Une API **REST** organise les échanges autour de **ressources** désignées par des URL, manipulées avec les méthodes HTTP :

```text
GET    /clients          liste des clients
GET    /clients/42       le client 42
POST   /clients          créer un client
PATCH  /clients/42       modifier le client 42
DELETE /clients/42       supprimer le client 42
```

Les données sont échangées en JSON. Les API modernes publient leur description au format **OpenAPI**, qui permet de générer une documentation interactive.

## HTTPS et TLS

**HTTPS** = HTTP à l'intérieur d'une connexion chiffrée par **TLS**. TLS garantit :

- la **confidentialité** : personne ne peut lire les échanges ;
- l'**intégrité** : personne ne peut les modifier ;
- l'**authenticité** du serveur, grâce à un **certificat** signé par une autorité de certification.

:::astuce
Les certificats ont une date d'expiration. Un certificat expiré rend un site inaccessible du jour au lendemain : on les renouvelle automatiquement (Let's Encrypt, gestionnaires de certificats des fournisseurs cloud).
:::

## Authentification des API

- **Clé d'API** : un jeton secret envoyé dans un en-tête.
- **Bearer token** / **OAuth 2.0** : un jeton à durée limitée, obtenu auprès d'un serveur d'autorisation.
- **JWT** : un format de jeton signé, qui contient des informations (identité, expiration) vérifiables sans interroger la base.

## Tester avec curl

```bash
curl -I https://example.com
curl -s https://api.example.com/v1/statut
curl -X POST -H "Content-Type: application/json" -d '{"nom": "Ada"}' https://api.example.com/v1/clients
```

## À retenir

- Requête : méthode, chemin, en-têtes, corps ; réponse : code, en-têtes, corps.
- GET lire, POST créer, PUT remplacer, PATCH modifier, DELETE supprimer.
- REST : des ressources désignées par des URL, échangées en JSON, décrites en OpenAPI.
- HTTPS = TLS : confidentialité, intégrité, authenticité (certificats à renouveler automatiquement).
- Clés d'API, OAuth 2.0, JWT ; `curl` pour tester.
