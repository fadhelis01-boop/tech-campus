Vous allez apprendre des centaines de commandes, de concepts, d'astuces. Impossible de tout retenir, et ce n'est pas le but : le but est de pouvoir **retrouver** en dix secondes ce que vous avez déjà compris une fois. Les professionnels se construisent une **base de connaissances personnelle**.

## Prendre des notes qui servent

:::methode Une bonne note technique
- Elle répond à une **question** : « comment compter les lignes d'un CSV ? ».
- Elle contient l'**exemple qui marche**, copiable.
- Elle explique le **pourquoi** en une phrase (sinon vous ne saurez pas l'adapter).
- Elle indique la **source** (lien vers la doc).
:::

Mauvaise note : « grep = chercher ». Bonne note : « Compter les erreurs d'un journal : `grep -c ERROR app.log` (-c compte au lieu d'afficher) — doc : man grep ».

## Les antisèches (cheat sheets)

Pour chaque domaine (Linux, Git, SQL, Docker…), tenez une antisèche d'une page avec les commandes que **vous** utilisez vraiment. Elle grandira au fil des mois. Les notes de chaque leçon de TechCampus (en bas de page) et la page « Mes notes » sont faites pour cela ; vous pouvez les exporter en Markdown.

## Le journal « Aujourd'hui j'ai appris »

Beaucoup de développeurs tiennent un journal TIL (*Today I Learned*) : une entrée courte par découverte. Avantages :

- il ancre la mémoire (c'est de la récupération active) ;
- il nourrit votre confiance (relisez-le dans les moments de doute) ;
- publié sur GitHub, il montre à un recruteur votre régularité et votre curiosité.

## Markdown, le format des notes techniques

**Markdown** est un format de texte simple, utilisé partout (GitHub, documentation, ces leçons) :

```markdown
# Titre
## Sous-titre
- une puce
**gras**, *italique*, `code`
[un lien](https://docs.python.org/fr/3/)
```

Apprenez-le une fois : il vous servira pour vos notes, vos README de projets et votre documentation.

## À retenir

- On ne retient pas tout : on sait retrouver.
- Une note = une question, un exemple qui marche, le pourquoi, la source.
- Une antisèche par domaine, enrichie au fil des mois.
- Le journal TIL ancre la mémoire et montre votre progression.
- Markdown est le format standard des notes et de la documentation.
