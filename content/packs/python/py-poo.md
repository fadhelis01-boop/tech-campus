Quand un programme grandit, on veut regrouper des **données** et les **traitements** qui vont avec. C'est l'idée de la **programmation orientée objet** (POO). Vous l'utilisez déjà sans le savoir : une liste est un objet, `liste.append()` est une de ses méthodes.

## Classe et objets

Une **classe** est un modèle ; un **objet** (ou instance) est un exemplaire construit à partir de ce modèle.

```python
class CompteBancaire:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire      # attributs
        self.solde = solde

    def deposer(self, montant):         # méthode
        if montant <= 0:
            raise ValueError("Montant invalide")
        self.solde += montant

    def __repr__(self):
        return f"CompteBancaire({self.titulaire!r}, {self.solde})"

c = CompteBancaire("Ada")
c.deposer(100)
print(c, c.solde)
```

- `__init__` est le **constructeur**, appelé à la création ;
- `self` désigne l'objet lui-même ;
- les **attributs** (`self.solde`) sont les données, les **méthodes** les comportements ;
- `__repr__` définit l'affichage de l'objet.

## L'héritage

Une classe peut **hériter** d'une autre et en spécialiser le comportement :

```python
class Source:
    def __init__(self, nom):
        self.nom = nom
    def lire(self):
        raise NotImplementedError

class SourceCSV(Source):
    def lire(self):
        return f"lecture du fichier {self.nom}"

class SourceAPI(Source):
    def lire(self):
        return f"appel de l'API {self.nom}"

for s in [SourceCSV("ventes.csv"), SourceAPI("https://api.example.com")]:
    print(s.lire())
```

Le code qui utilise une `Source` n'a pas besoin de savoir de quel type elle est : c'est le **polymorphisme**.

## Les dataclasses

Pour de simples « enregistrements », Python propose les `dataclasses`, qui génèrent le constructeur et l'affichage :

```python
from dataclasses import dataclass

@dataclass
class Commande:
    id: int
    client: str
    montant: float = 0.0

c = Commande(1042, "Ada", 99.9)
print(c)
```

:::metier En entreprise
En data engineering, la POO sert surtout à structurer des connecteurs (une classe par type de source), des configurations, des modèles de données (dataclasses, ou la bibliothèque **pydantic** qui valide les types à l'exécution). N'en abusez pas : une fonction simple vaut souvent mieux qu'une classe.
:::

## À retenir

- Classe = modèle ; objet = instance ; `__init__` construit, `self` désigne l'objet.
- Attributs (données) et méthodes (comportements).
- Héritage pour spécialiser ; polymorphisme : même interface, comportements différents.
- `@dataclass` pour les enregistrements simples.
