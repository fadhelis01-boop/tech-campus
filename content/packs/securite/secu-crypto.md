Protéger un mot de passe, chiffrer une base de données, sécuriser une connexion : derrière chacune de ces opérations se trouve la **cryptographie**. Pas besoin de mathématiques pour l'utiliser correctement — mais il faut savoir quel outil sert à quoi, et ne jamais inventer le sien.

## Hachage, chiffrement, signature

| Opération | Réversible ? | Usage |
|---|---|---|
| **Hachage** | non | empreinte d'un fichier, stockage des mots de passe |
| **Chiffrement symétrique** | oui, avec la même clé | chiffrer des données (disque, base, fichiers) |
| **Chiffrement asymétrique** | oui, clé publique / clé privée | échanger une clé, TLS, SSH |
| **Signature** | vérifiable par tous avec la clé publique | prouver l'auteur et l'intégrité (certificats, images signées) |

## Le hachage

Une **fonction de hachage** transforme n'importe quelle donnée en une empreinte de taille fixe. La moindre modification change complètement l'empreinte, et on ne peut pas revenir en arrière.

```python
import hashlib
print(hashlib.sha256(b"bonjour").hexdigest())
print(hashlib.sha256(b"Bonjour").hexdigest())
```

Usages : vérifier qu'un fichier téléchargé n'a pas été altéré, détecter des doublons, pseudonymiser des identifiants.

## Les mots de passe

:::attention On ne stocke jamais un mot de passe en clair
Ni même un simple SHA-256 : les attaquants testent des milliards de mots de passe par seconde. On utilise des fonctions **lentes et salées**, conçues pour cela : **Argon2**, **bcrypt**, **scrypt**, ou PBKDF2 avec un grand nombre d'itérations.
:::

Le **sel** (*salt*) est une valeur aléatoire propre à chaque utilisateur, ajoutée avant le hachage : deux utilisateurs avec le même mot de passe ont des empreintes différentes, et les tables précalculées deviennent inutiles.

```python
import bcrypt
empreinte = bcrypt.hashpw(b"mon mot de passe", bcrypt.gensalt())
print(empreinte)   # le sel et le coût sont inclus dans l'empreinte
print(bcrypt.checkpw(b"mon mot de passe", empreinte))   # True
print(bcrypt.checkpw(b"autre chose", empreinte))        # False
```

La bibliothèque **bcrypt** génère le sel, l'inclut dans l'empreinte et règle le coût (la lenteur volontaire) : on ne manipule rien à la main.

## Le chiffrement en pratique

- **Au repos** : disques, bases et stockage objet chiffrés (activé par défaut chez les grands fournisseurs cloud).
- **En transit** : TLS partout (HTTPS, connexions aux bases de données).
- **Les clés** : gérées par un service dédié (KMS du fournisseur cloud, HSM), avec rotation, jamais dans le code.

:::retenir
Règle d'or : **n'inventez jamais votre propre cryptographie**. Utilisez des bibliothèques reconnues et des services managés, avec les algorithmes recommandés (AES-256-GCM, SHA-256 et au-delà, Argon2/bcrypt pour les mots de passe). Les guides de l'ANSSI précisent les recommandations à jour.
:::

## À retenir

- Hachage (irréversible, empreinte), chiffrement symétrique et asymétrique, signature.
- Mots de passe : fonctions lentes et salées (Argon2, bcrypt, scrypt, PBKDF2), jamais en clair ni en simple SHA.
- Chiffrement au repos et en transit ; clés dans un KMS, avec rotation.
- Ne jamais inventer sa cryptographie.
