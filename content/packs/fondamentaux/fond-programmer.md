Programmer, ce n'est pas connaître un langage par cœur : c'est savoir **décomposer un problème** en étapes si précises qu'une machine peut les exécuter. Cette compétence s'apprend, et elle commence avant même d'écrire du code.

## Algorithme et programme

- Un **algorithme** est une suite d'étapes non ambiguës qui résout un problème. Une recette de cuisine bien écrite en est un.
- Un **programme** est un algorithme écrit dans un **langage de programmation** (Python, SQL, Bash…) que la machine sait exécuter.

:::analogie Pour comprendre
Expliquez à quelqu'un qui n'a jamais vu de cuisine comment faire un œuf au plat. « Cassez l'œuf » ne suffit pas : où ? dans quoi ? la poêle est-elle chaude ? Programmer, c'est apprendre ce niveau de précision. L'ordinateur est un exécutant infatigable mais totalement littéral.
:::

## Les quatre briques de tout programme

Tous les langages, du plus simple au plus avancé, reposent sur les mêmes briques :

1. **Les variables** : mémoriser une valeur sous un nom (`total = 0`).
2. **Les conditions** : faire un choix (`si le stock est vide, alors commander`).
3. **Les boucles** : répéter (`pour chaque ligne du fichier, …`).
4. **Les fonctions** : regrouper des étapes sous un nom réutilisable (`calculer_tva(prix)`).

```python
# Les quatre briques en une dizaine de lignes
def prix_ttc(prix_ht):               # fonction
    return prix_ht * 1.20

panier = [12.5, 30, 7.9]             # variable (une liste)
total = 0
for prix in panier:                  # boucle
    total = total + prix_ttc(prix)

if total > 50:                       # condition
    print("Livraison offerte !")
print("Total TTC :", round(total, 2))
```

Cliquez sur « ▶ Essayer » : le code s'ouvre dans le labo Python, modifiez les prix et observez.

## La pensée « informatique »

:::methode Décomposer un problème
1. **Reformuler** : qu'entre-t-il ? que doit-il sortir ? (les entrées et la sortie).
2. **Prendre un exemple** concret et le résoudre à la main.
3. **Découper** en petites étapes, chacune simple.
4. **Repérer les répétitions** (une boucle ?) et les **choix** (une condition ?).
5. **Écrire** le code étape par étape, en testant au fur et à mesure.
6. **Tester les cas limites** : liste vide, valeur nulle, très grand nombre.
:::

## Les langages de votre futur métier

| Langage | Sert à | Où vous le verrez |
|---|---|---|
| Bash | piloter le système | terminal, scripts, CI |
| Python | programmer, automatiser, traiter des données | pipelines, scripts, API |
| SQL | interroger des bases de données | partout où il y a des données |
| YAML | décrire une configuration | Docker Compose, Kubernetes, CI/CD |
| HCL (Terraform) | décrire une infrastructure | infrastructure as code |

:::futur Tendance
Les assistants d'IA écrivent désormais une partie du code. Cela rend la pensée algorithmique **plus** importante, pas moins : il faut savoir décomposer le problème, relire le code proposé, détecter l'erreur, tester. Un professionnel qui comprend ce qu'il fait reste indispensable.
:::

## À retenir

- Un algorithme = des étapes précises ; un programme = un algorithme dans un langage.
- Quatre briques universelles : variables, conditions, boucles, fonctions.
- Méthode : entrées/sortie → exemple à la main → découpage → code → cas limites.
- Bash, Python, SQL, YAML, HCL : les langages des métiers data et cloud.
