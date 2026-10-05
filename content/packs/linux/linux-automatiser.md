Les tâches qui reviennent (nettoyer les vieux fichiers, lancer une extraction de données chaque nuit, sauvegarder une base) doivent tourner toutes seules, de façon fiable, et laisser une trace. Cette leçon présente la planification avec **cron**, la gestion des journaux et les bonnes pratiques d'un administrateur.

## Planifier avec cron

**cron** est le planificateur historique de Linux. Chaque utilisateur a une **crontab**, une liste de tâches avec leur calendrier, qu'on édite avec `crontab -e` et qu'on affiche avec `crontab -l`.

Une ligne de crontab a cinq champs de temps, puis la commande :

```text
# minute heure jour-du-mois mois jour-de-la-semaine  commande
  30     2     *            *    *                   /opt/scripts/extraction.sh
```

se lit : « à 2 h 30, tous les jours ».

| Exemple | Signification |
|---|---|
| `0 * * * *` | toutes les heures, à la minute 0 |
| `*/15 * * * *` | toutes les 15 minutes |
| `0 6 * * 1-5` | à 6 h, du lundi au vendredi |
| `0 0 1 * *` | à minuit, le 1er de chaque mois |

:::astuce
Le site crontab.guru traduit en clair n'importe quelle expression cron. Les mêmes expressions servent dans Airflow, GitHub Actions, Kubernetes (CronJob) et les planificateurs du cloud : les apprendre une fois sert partout.
:::

## Les journaux (logs)

Un programme qui tourne seul la nuit doit **écrire ce qu'il fait**, sinon personne ne saura pourquoi il a échoué.

```bash
./extraction.sh >> /var/log/extraction.log 2>&1
```

- `>>` ajoute la sortie au journal ;
- `2>&1` y envoie aussi les messages d'**erreur** (le canal d'erreur, numéro 2, est redirigé vers la sortie standard, numéro 1).

Les journaux grossissent indéfiniment : l'outil **logrotate** les archive et les compresse régulièrement (par exemple un fichier par jour, conservé 14 jours).

## Les bonnes pratiques de l'automatisation

:::methode Une tâche automatisée digne de ce nom
1. **Idempotente** : la relancer deux fois ne casse rien (on vérifie ce qui existe avant de le créer).
2. **Bavarde** : elle écrit dans un journal ce qu'elle fait, avec la date.
3. **Fiable** : elle s'arrête proprement en cas d'erreur (`set -e`) et renvoie un code d'erreur.
4. **Surveillée** : un échec déclenche une alerte (courriel, message sur la messagerie d'équipe).
5. **Versionnée** : le script est dans Git, pas seulement sur le serveur.
:::

:::definition
Une opération est **idempotente** si l'exécuter une ou plusieurs fois produit le même résultat. `mkdir -p dossier` est idempotent ; `echo ligne >> fichier` ne l'est pas (chaque exécution ajoute une ligne). Cette notion est centrale en data engineering et en infrastructure as code.
:::

## Le code de retour

Chaque commande renvoie un **code de retour** : 0 si tout s'est bien passé, autre chose en cas d'erreur. C'est grâce à lui que `&&` sait s'il doit continuer, que `set -e` sait quand s'arrêter, et que les outils de supervision savent qu'un traitement a échoué.

:::futur Tendance
Cron reste partout, mais les entreprises orchestrent de plus en plus leurs traitements avec des outils qui gèrent dépendances, reprises sur erreur et historique : **Airflow** ou **Dagster** pour la data, les **CronJobs Kubernetes** et les planificateurs serverless du cloud pour l'infrastructure. Vous les verrez dans les modules Data engineering et Cloud.
:::

## À retenir

- `crontab -e` planifie des tâches ; 5 champs : minute, heure, jour, mois, jour de la semaine.
- Une tâche automatique écrit dans un journal (`>> fichier.log 2>&1`).
- Idempotence, journalisation, arrêt sur erreur, alerte, versionnement : les cinq qualités d'une bonne automatisation.
- Code de retour 0 = succès.
