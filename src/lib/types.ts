// Format des « packs » de contenu. Un pack = un domaine (Linux, Python,
// SQL, Cloud, Kubernetes…). Ajouter un domaine = écrire un pack JSON
// conforme à ce format : aucune ligne de code à modifier.
// Documentation complète : docs/GUIDE-CONTENU.md

export type Level = 1 | 2 | 3;

export interface Pack {
  id: string;
  version: string; // ex. "2026.10.1" — sert aux mises à jour
  title: string;
  branch: string; // regroupement : "Socle", "Data", "Cloud & DevOps", "Méthode & carrière"…
  icon: string; // emoji
  color: string; // couleur d'accent du domaine
  description: string;
  updatedAt: string; // « à jour au » (AAAA-MM-JJ)
  order?: number;
  outlook?: string; // pourquoi ce domaine compte pour les métiers de demain
  modules: Module[];
  glossary?: GlossaryEntry[];
  changelog?: { date: string; text: string }[];
  origin?: "officiel" | "importé" | "généré"; // renseigné par l'application
}

export interface Module {
  id: string;
  title: string;
  level: Level;
  summary: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  level?: Level;
  duration?: number; // minutes
  objectives?: string[];
  body?: string; // Markdown (blocs ::: possibles)
  src?: string; // ou chemin d'un fichier .md relatif au dossier content/
  outline?: string[]; // plan : sert à la génération IA si pas de body
  docs?: { title: string; url: string }[]; // documentation officielle
  quiz?: Question[];
  flashcards?: Flashcard[];
  exercises?: Exercise[];
  updatedAt?: string;
}

export interface Question {
  type: "qcm" | "vf";
  q: string;
  choices?: string[]; // qcm
  answer: number | boolean; // index (qcm) ou vrai/faux
  explain: string;
  level?: Level;
}

export interface Flashcard {
  q: string;
  a: string;
}

// ---------- Exercices pratiques ----------
// code      : programme Python ou requête SQL exécutés dans le navigateur, tests automatiques
// terminal  : terminal Linux simulé (fichiers, Git, Docker, kubectl), objectifs vérifiés en direct
// config    : fichier de configuration à écrire (Dockerfile, YAML Kubernetes / GitHub Actions, Terraform…)
// calcul    : questions chiffrées corrigées automatiquement (sous-réseaux, coûts, volumes…)
// ordre     : remettre des étapes dans le bon ordre
// projet    : conception / rédaction libre, corrigé type + correction par l'IA
export type ExerciseType = "code" | "terminal" | "config" | "calcul" | "ordre" | "projet";

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  statement: string; // Markdown : énoncé
  level?: Level;
  hints?: string[];
  model?: string; // Markdown : corrigé commenté
  timerMin?: number;
  rubric?: string[]; // grille (projet)

  // code
  lang?: "python" | "sql";
  starter?: string; // code de départ
  solution?: string; // solution de référence (SQL : sert aussi à calculer le résultat attendu)
  setup?: string; // SQL : création et remplissage des tables ; Python : code exécuté avant
  tests?: CodeTest[]; // Python : tests automatiques
  ordered?: boolean; // SQL : l'ordre des lignes compte
  packages?: string[]; // Python : paquets à charger (pandas…)
  stdin?: string; // Python : entrées simulées pour input()

  // terminal
  files?: Record<string, string>; // fichiers présents au départ (chemin absolu ou relatif au dossier personnel)
  tasks?: TerminalTask[];
  commands?: string[]; // solution de référence (montrée dans le corrigé, rejouée à la compilation)
  prepare?: string[]; // commandes exécutées en silence à l'ouverture (préparer un dépôt, un conflit…)

  // config
  filename?: string; // « Dockerfile », « deployment.yaml »…
  syntax?: "yaml" | "dockerfile" | "hcl" | "json" | "text" | "ini";
  checks?: ConfigCheck[];

  // calcul
  questions?: CalcQuestion[];

  // ordre
  items?: string[]; // dans le bon ordre (mélangés à l'affichage)
}

export interface CodeTest {
  label: string; // ce qui est vérifié, en clair
  code?: string; // Python : assertions exécutées après le code de l'élève
  stdout?: string; // texte qui doit apparaître dans la sortie
}

export interface TerminalTask {
  label: string;
  check: TerminalCheck;
  hint?: string;
}

export type TerminalCheck =
  | { type: "exists"; path: string; kind?: "file" | "dir" }
  | { type: "absent"; path: string }
  | { type: "content"; path: string; includes?: string; regex?: string }
  | { type: "cwd"; path: string }
  | { type: "ran"; regex: string } // une commande tapée correspond
  | { type: "output"; regex: string } // une sortie affichée correspond
  | { type: "exec"; path: string } // fichier rendu exécutable
  | { type: "git"; repo: string; commits?: number; branch?: string; clean?: boolean; tracked?: string; current?: string; merged?: string; remote?: string; notTracked?: string }
  | { type: "docker"; running?: string; image?: string; stopped?: string }
  | { type: "k8s"; kind: string; name: string; replicas?: number; absent?: boolean };

export interface ConfigCheck {
  label: string;
  regex?: string; // doit apparaître (drapeaux « mi »)
  not?: boolean; // …ou ne doit pas apparaître
  path?: string; // YAML/JSON : chemin « spec.replicas », « jobs.*.steps[*].uses »
  equals?: string | number | boolean;
  contains?: string; // une des valeurs trouvées contient ce texte
  exists?: boolean;
  hint?: string;
}

export interface CalcQuestion {
  q: string;
  answer: number;
  tolerance?: number; // écart admis (défaut : 0,01)
  unit?: string;
  explain: string;
}

export interface GlossaryEntry {
  term: string;
  def: string;
  en?: string; // terme anglais d'origine
}

export interface Track {
  id: string;
  title: string; // « Data Engineer »
  icon: string;
  color: string;
  pitch: string;
  jobs: string[]; // métiers visés
  steps: { title: string; packs: string[]; note?: string; months?: number; milestones?: string[] }[];
  certifications?: string[]; // certifications complémentaires (identifiants)
  projects?: string[]; // projets de portfolio
}

// Certification professionnelle réelle (éditeur ou organisme officiel)
export interface Certification {
  id: string;
  name: string;
  vendor: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  url: string;
  price: string;
  format?: string;
  validity?: string;
  validates: string[]; // domaines qui préparent l'examen
  why: string;
  cv: string; // libellé prêt à coller dans un CV
}

export interface CertStatus {
  status: "visee" | "preparation" | "planifiee" | "obtenue";
  examDate?: string; // AAAA-MM-JJ
  obtainedAt?: string;
  credentialUrl?: string; // lien de vérification (Credly…)
}

export interface ManifestEntry {
  id: string;
  file: string;
  version: string;
  title: string;
}

export interface Manifest {
  version: string;
  updatedAt: string;
  packs: ManifestEntry[];
  tracks?: Track[];
  datasets?: Record<string, { title: string; description: string; sql: string }>;
  certifications?: Certification[];
  changelog?: { date: string; text: string }[];
}

// ---------- État utilisateur ----------

export interface LessonProgress {
  status: "nouveau" | "en-cours" | "termine" | "acquis";
  block: number; // dernier bloc lu/écouté
  audioBlock?: number;
  quizBest?: number; // %
  lastOpened?: number;
  completedAt?: number;
}

export interface SrsCard {
  id: string;
  q: string;
  a: string;
  source: string;
  ease: number;
  interval: number; // jours
  due: number; // timestamp
  reps: number;
  lapses: number;
}

export interface Settings {
  apiKey: string;
  model: string;
  communitySources: boolean; // élargir la recherche aux blogs techniques reconnus
  ttsVoice: string;
  ttsRate: number;
  theme: "auto" | "clair" | "sombre";
  fontScale: number;
  dailyGoal: number; // minutes
  name: string;
  track: string; // parcours choisi (data-engineer, cloud-devops…)
}

export interface Profile {
  xp: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string; // AAAA-MM-JJ
  days: Record<string, number>; // jour -> minutes
  badges: string[];
  exercisesDone: number;
  cardsReviewed: number;
  labsPassed: string[]; // exercices pratiques réussis (clé pack/lecon/exercice)
  examBest?: Record<string, number>; // meilleur score à l'examen blanc, par domaine
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sources?: { url: string; title: string }[];
  cost?: number;
  at: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  context?: string; // leçon d'origine
  updatedAt: number;
}

export interface SavedReport {
  id: string;
  kind: "veille" | "actualite" | "correction";
  title: string;
  text: string;
  sources?: { url: string; title: string }[];
  at: number;
}
