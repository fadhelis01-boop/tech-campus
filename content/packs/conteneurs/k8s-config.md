Une application a besoin de configuration (adresse de la base, niveau de journalisation), de secrets (mots de passe), de ressources (mémoire, processeur) et doit dire à Kubernetes si elle va bien. Voici comment.

## ConfigMap et Secret

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  NIVEAU_LOG: info
  URL_BASE: postgresql://base:5432/app
```

Un **Secret** a la même forme, pour les données sensibles. On les injecte dans les conteneurs comme variables d'environnement :

```yaml
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
```

:::attention Un Secret n'est pas chiffré par défaut
Les valeurs d'un Secret Kubernetes sont seulement encodées en base64 (ce n'est pas du chiffrement). On protège les Secrets par des droits d'accès stricts, le chiffrement d'etcd, ou un gestionnaire externe (coffre-fort du fournisseur cloud, HashiCorp Vault), et on ne les commite jamais en clair dans Git.
:::

## Les ressources

```yaml
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi
```

- **requests** : ce que le pod réserve ; le planificateur s'en sert pour choisir un nœud ;
- **limits** : le maximum ; un conteneur qui dépasse sa limite mémoire est tué (*OOMKilled*).

`250m` = 250 millièmes d'un processeur ; `256Mi` = 256 mébioctets.

## Les sondes de santé (probes)

- **readinessProbe** : le pod est-il **prêt** à recevoir du trafic ? Tant qu'il ne l'est pas, le Service ne lui envoie rien.
- **livenessProbe** : le pod est-il **vivant** ? Sinon, Kubernetes redémarre le conteneur.

```yaml
          readinessProbe:
            httpGet:
              path: /sante
              port: 8000
          livenessProbe:
            httpGet:
              path: /sante
              port: 8000
            initialDelaySeconds: 10
```

:::metier En entreprise
Des requests et limits bien réglées et des sondes correctes sont la différence entre un cluster stable et des pannes mystérieuses en production. Ce sont aussi des questions fréquentes en entretien DevOps et dans la certification CKA.
:::

## À retenir

- ConfigMap (configuration) et Secret (données sensibles, seulement encodées en base64) ; injection par `envFrom` ou `env`.
- requests (réservation, planification) et limits (plafond ; dépassement mémoire = OOMKilled).
- readinessProbe (prêt à recevoir du trafic) et livenessProbe (vivant, sinon redémarrage).
