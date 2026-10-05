La plupart des attaques réussies exploitent des erreurs classiques dans les applications : des failles connues depuis vingt ans, qui continuent d'apparaître. L'**OWASP** (*Open Worldwide Application Security Project*) les recense dans son célèbre **Top 10**.

## Le Top 10 de l'OWASP (en substance)

| Risque | En clair |
|---|---|
| Contrôle d'accès défaillant | un utilisateur accède aux données d'un autre (changer `/commandes/42` en `/commandes/43`) |
| Erreurs de configuration de sécurité | comptes par défaut, messages d'erreur trop bavards, services inutiles exposés |
| Défaillances de la chaîne d'approvisionnement logicielle | dépendances vulnérables ou compromises |
| Défaillances cryptographiques | données sensibles non chiffrées, algorithmes dépassés |
| **Injection** | des données de l'utilisateur interprétées comme du code (SQL, commandes système) |
| Conception non sécurisée | la sécurité oubliée dès la conception |
| Défaillances d'authentification | mots de passe faibles, sessions mal gérées, pas de MFA |
| Défaut d'intégrité des données ou du logiciel | mises à jour non vérifiées, désérialisation dangereuse |
| Journalisation et alertes insuffisantes | l'attaque passe inaperçue |
| Mauvaise gestion des conditions exceptionnelles | erreurs mal traitées qui ouvrent des failles |

(La liste et l'ordre évoluent à chaque édition ; consultez la version en vigueur sur owasp.org.)

## L'injection SQL

C'est l'exemple le plus parlant. Une requête construite en **collant** du texte saisi par l'utilisateur :

```python
nom = "Ada' OR '1'='1"
requete = f"SELECT * FROM clients WHERE nom = '{nom}'"
print(requete)
# SELECT * FROM clients WHERE nom = 'Ada' OR '1'='1'  → renvoie TOUS les clients
```

La parade est simple et systématique : les **requêtes paramétrées**. La valeur est transmise **séparément** de la requête, et n'est jamais interprétée comme du SQL :

```python
cursor.execute("SELECT * FROM clients WHERE nom = ?", (nom,))
```

:::retenir
Ne construisez **jamais** une requête SQL (ou une commande système) en concaténant des données venues de l'extérieur. Requêtes paramétrées, ou ORM, toujours.
:::

## Les autres réflexes du développeur

- **Valider** toutes les entrées (type, taille, format attendu).
- **Contrôler l'accès** côté serveur à chaque requête (l'utilisateur a-t-il le droit de voir **cette** commande ?).
- **Ne pas révéler** d'informations dans les messages d'erreur (pas de trace technique pour l'utilisateur).
- **Mettre à jour** les dépendances (Dependabot, pip-audit).
- **Journaliser** les événements de sécurité (connexions, échecs, accès refusés).

## À retenir

- OWASP Top 10 : contrôle d'accès, configuration, chaîne d'approvisionnement, cryptographie, injection…
- Injection SQL : concaténer des entrées dans une requête ; parade : requêtes paramétrées.
- Valider les entrées, contrôler l'accès côté serveur, messages d'erreur sobres, dépendances à jour, journaliser.
