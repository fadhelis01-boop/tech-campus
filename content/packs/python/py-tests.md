Comment savoir que votre code fonctionne… et qu'il fonctionne **encore** après une modification ? En écrivant des **tests automatisés**. C'est ce que fait TechCampus quand vous cliquez sur « ✓ Vérifier » : il exécute des tests sur votre code.

## assert

L'instruction `assert` vérifie qu'une condition est vraie, et lève une erreur sinon :

```python
def prix_ttc(ht):
    return round(ht * 1.2, 2)

assert prix_ttc(100) == 120.0
assert prix_ttc(0) == 0
print("Tous les tests passent")
```

## pytest

En entreprise, on utilise **pytest** : chaque fonction dont le nom commence par `test_`, dans un fichier `test_*.py`, est un test.

```python
# fichier test_prix.py
from prix import prix_ttc

def test_taux_normal():
    assert prix_ttc(100) == 120.0

def test_zero():
    assert prix_ttc(0) == 0
```

```bash
pytest
```

pytest trouve les tests, les exécute et affiche un rapport clair des échecs.

## Que tester ?

:::methode Les cas à couvrir
1. Le **cas nominal** (l'exemple typique).
2. Les **cas limites** : liste vide, zéro, une seule ligne, très grand nombre.
3. Les **entrées invalides** : la fonction doit lever l'erreur attendue.
4. Les **bugs passés** : chaque bug corrigé mérite un test qui l'empêche de revenir.
:::

Tester qu'une erreur est bien levée, avec pytest :

```python
import pytest
from remise import appliquer_remise

def test_pourcentage_invalide():
    with pytest.raises(ValueError):
        appliquer_remise(100, 150)
```

## La pyramide des tests

- Beaucoup de **tests unitaires** (une fonction isolée, rapides) ;
- moins de **tests d'intégration** (plusieurs composants ensemble : le pipeline avec une vraie base de test) ;
- peu de **tests de bout en bout** (tout le système), lents et fragiles.

:::metier En entreprise
Les tests s'exécutent automatiquement à chaque pull request (intégration continue, module DevOps). En data, on ajoute des **tests de données** (pas de doublons, pas de valeurs nulles dans une colonne obligatoire, montants positifs) : vous les verrez avec dbt et les outils de qualité.
:::

## À retenir

- `assert condition` ; en entreprise, pytest et des fonctions `test_*`.
- Tester : nominal, limites, entrées invalides, bugs passés.
- `pytest.raises` pour vérifier une erreur attendue.
- Pyramide : beaucoup d'unitaires, quelques tests d'intégration, peu de bout en bout.
- Les tests tournent automatiquement à chaque pull request.
