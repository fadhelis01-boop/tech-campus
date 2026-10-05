import Markdown from "../components/Markdown";

const HELP = `## Comment travailler avec TechCampus

1. **Choisissez votre métier** (data engineer ou ingénieur cloud/DevOps) : l'onglet **Parcours** vous donne une feuille de route ordonnée, jalonnée de vraies certifications.
2. **Chaque jour, 30 à 60 minutes** : les cartes du jour (Révisions), une leçon (à lire ou à écouter), son exercice pratique, son quiz.
3. **Pratiquez toujours** : chaque domaine a des exercices corrigés automatiquement — code Python et requêtes SQL exécutés pour de vrai dans le navigateur, terminal Linux simulé (fichiers, Git, Docker, Kubernetes, Terraform), fichiers de configuration vérifiés (Dockerfile, YAML, Terraform, politiques IAM), calculs, remises en ordre, projets corrigés par l'assistant.
4. **Bloqué ?** Les coups de pouce de l'exercice, puis le bouton « 🤖 Expliquer mon erreur » : l'assistant explique sans donner la solution.
5. **Visez les jalons** : l'onglet **Certifications** montre votre état de préparation pour chaque certification, avec tarifs, format et liens officiels, et génère votre bloc CV.

## Le labo

- **Python** : le vrai Python 3, exécuté dans votre navigateur (aussi hors connexion après le premier lancement). Les bibliothèques importées (pandas, bcrypt…) se chargent automatiquement.
- **SQL** : SQLite avec des bases d'exemple (boutique, ressources humaines, entrepôt en étoile).
- **Terminal** : un Linux simulé où l'on peut tout casser sans risque, avec Git, Docker, kubectl et Terraform simulés. \`help\` liste les commandes, \`edit fichier\` ouvre l'éditeur intégré.
- Dans les leçons, les boutons **▶ Essayer** et **⌨️ Terminal** ouvrent les extraits de code dans le labo.

Votre code, vos terminaux et vos réponses sont enregistrés automatiquement : vous reprenez exactement où vous étiez.

## L'audio

- **🎧 Écouter la leçon** lit le texte paragraphe par paragraphe, en surlignant le passage lu. Les blocs de code ne sont pas lus en entier (seulement les commandes courtes) : on les regarde à l'écran.
- La position est mémorisée : **« Reprendre l'écoute »** repart au paragraphe où vous vous êtes arrêté ; **« Écouter depuis le début »** recommence.
- Vitesse et voix se règlent dans Réglages. Sur iPhone, la lecture s'interrompt si l'écran se verrouille.

## L'assistant

- Il répond à vos questions en s'appuyant sur une **recherche dans la documentation officielle** (Python, PostgreSQL, Docker, Kubernetes, AWS, Azure, Google Cloud, Terraform, Apache, OWASP, ANSSI, CNIL…) et **cite ses sources** [1], [2].
- Il explique vos erreurs de code, corrige vos projets, rédige les leçons des domaines que vous ajoutez, fait la veille technologique, et vérifie qu'une leçon est toujours à jour.
- Il utilise **votre clé d'API** Anthropic (Réglages). Coût indicatif affiché après chaque réponse. Une IA peut se tromper : vérifiez les points importants dans la documentation citée.

## Les certifications

TechCampus vous **prépare** ; l'examen se passe auprès de l'organisme officiel (AWS, Microsoft, Google, Linux Foundation, HashiCorp…), en ligne sous surveillance ou en centre. Les tarifs affichés sont des prix publics constatés en octobre 2026 : vérifiez toujours la page officielle. Pensez au **CPF** et aux bons d'examen gratuits des éditeurs.

## Installer sur iPhone, iPad, Android, PC

- **iPhone / iPad** : ouvrez l'adresse dans **Safari** → bouton Partager ⬆️ → « Sur l'écran d'accueil ».
- **Android** : Chrome → menu ⋮ → « Installer l'application ».
- **PC / Mac** : Chrome ou Edge → icône d'installation dans la barre d'adresse.

Une fois installée, l'application fonctionne **hors connexion** (sauf l'assistant). Réglages → « Tout rendre disponible hors connexion » précharge tous les cours.

## Passer d'un appareil à l'autre

Vos données restent sur l'appareil (aucun compte, aucun serveur). Pour continuer sur un autre appareil : Réglages → **Exporter ma progression**, puis **Importer** sur l'autre (choisissez « fusionner »). La clé d'API n'est jamais exportée.

## Mises à jour

L'application vérifie seule les nouvelles versions et propose « Mettre à jour ». Les domaines mis à jour sont signalés. Contenus & mises à jour → « Vérifier les mises à jour » force la vérification.

## Ajouter un domaine (Rust, Go, FinOps, Snowflake…)

Contenus & mises à jour → **Ajouter un domaine** :
- **avec l'assistant** : décrivez le domaine, il conçoit le programme complet ; les leçons se rédigent à la demande ;
- **par fichier** : importez un fichier de domaine (modèle téléchargeable) — sans programmation.

## Avertissement

TechCampus est un outil de formation. Les contenus sont datés (« à jour au … ») ; les technologies, les tarifs et les réglementations évoluent : vérifiez dans les sources officielles avant toute décision professionnelle.`;

export default function Aide() {
  return (
    <div className="page">
      <h1>❔ Aide</h1>
      <Markdown text={HELP} />
    </div>
  );
}
