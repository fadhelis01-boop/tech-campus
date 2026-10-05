import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaMessageParam,
  BetaMessage,
  BetaToolUnion,
  BetaMessageStreamParams,
  BetaRawMessageStreamEvent,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { getState } from "./store";

// ---------------------------------------------------------------------
// Assistant pédagogique : appels à l'API Claude directement depuis
// l'appareil, avec la clé personnelle de l'utilisateur (stockée
// localement, jamais envoyée ailleurs qu'à api.anthropic.com).
// La recherche web est restreinte aux sources officielles (+ doctrine
// en accès libre si l'option est activée) pour des réponses sourcées.
// ---------------------------------------------------------------------

export const MODELS = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5 — rigueur maximale (recommandé)", inPrice: 4, outPrice: 20 },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 — plus rapide, environ 2 fois moins cher", inPrice: 2, outPrice: 10 },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — économique, moins approfondi", inPrice: 1, outPrice: 5 },
];

// Recherche web restreinte aux documentations officielles et aux sources
// de référence : les réponses citent la doc d'origine, pas un blog au hasard.
export const OFFICIAL_DOMAINS = [
  // Langages, bases de données, outils
  "docs.python.org", "python.org", "peps.python.org", "pandas.pydata.org", "numpy.org",
  "postgresql.org", "sqlite.org", "dev.mysql.com", "learn.microsoft.com",
  "git-scm.com", "docs.github.com", "github.blog", "docs.gitlab.com",
  "man7.org", "gnu.org", "kernel.org", "ubuntu.com", "debian.org", "redhat.com",
  "developer.mozilla.org", "rfc-editor.org", "ietf.org", "w3.org", "json-schema.org", "yaml.org",
  // Cloud
  "aws.amazon.com", "docs.aws.amazon.com", "cloud.google.com", "azure.microsoft.com", "scaleway.com", "ovhcloud.com",
  // Conteneurs, orchestration, IaC, CI/CD, observabilité
  "docs.docker.com", "docker.com", "kubernetes.io", "helm.sh", "cncf.io", "linuxfoundation.org",
  "developer.hashicorp.com", "opentofu.org", "ansible.com", "docs.ansible.com", "argo-cd.readthedocs.io",
  "prometheus.io", "grafana.com", "opentelemetry.io", "sre.google",
  // Data
  "spark.apache.org", "kafka.apache.org", "airflow.apache.org", "iceberg.apache.org", "parquet.apache.org", "arrow.apache.org", "flink.apache.org",
  "docs.getdbt.com", "docs.databricks.com", "delta.io", "docs.snowflake.com", "duckdb.org", "dagster.io", "great-expectations.io", "docs.greatexpectations.io",
  // IA
  "docs.anthropic.com", "docs.claude.com", "huggingface.co", "pytorch.org", "scikit-learn.org", "mlflow.org",
  // Sécurité, normes, emploi et formation (France / Europe)
  "owasp.org", "cyber.gouv.fr", "cnil.fr", "nist.gov", "csrc.nist.gov", "cisecurity.org", "enisa.europa.eu", "eur-lex.europa.eu",
  "francetravail.fr", "apec.fr", "dares.travail-emploi.gouv.fr", "francecompetences.fr", "onisep.fr", "moncompteformation.gouv.fr", "insee.fr",
  "stackoverflow.blog", "survey.stackoverflow.co",
];

// Sources communautaires reconnues (option « élargir aux blogs techniques »)
export const COMMUNITY_DOMAINS = [
  "martinfowler.com", "realpython.com", "freecodecamp.org", "datatalks.club", "roadmap.sh",
  "thenewstack.io", "infoq.com", "blog.cloudflare.com", "netflixtechblog.com", "engineering.fb.com",
  "eng.uber.com", "blog.bytebytego.com", "aws.amazon.com", "stackoverflow.com", "wikipedia.org",
];

export class AiError extends Error {}

function client() {
  const key = getState().settings.apiKey.trim();
  if (!key) throw new AiError("Aucune clé d'API n'est configurée. Ouvrez Réglages → Assistant IA.");
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

export function aiConfigured() {
  return !!getState().settings.apiKey.trim();
}

const todayLong = () =>
  new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const TEACHER_SYSTEM = `Tu es un professeur d'informatique avec plus de vingt ans d'expérience d'enseignement (du lycée au master et en reconversion professionnelle) et un ingénieur senior en activité : data engineering, cloud (AWS, Azure, GCP), DevOps, SRE, sécurité. Ton élève part de zéro et se forme pour devenir data engineer ou ingénieur cloud/DevOps ; il apprend sur ordinateur, tablette et téléphone, dans l'application TechCampus (qui contient un labo Python, un labo SQL et un terminal Linux simulé avec Git, Docker et kubectl).

Exigences de fond :
- Exactitude d'abord. Appuie-toi sur la documentation officielle (vérifie par la recherche dès qu'un point peut avoir évolué : versions, commandes, services cloud, prix, limites, dépréciations) et cite-la. N'invente jamais une option de commande, une API, un nom de service ou un chiffre : si tu n'as pas pu vérifier, dis-le (« à vérifier dans la doc officielle »).
- Indique les versions quand elles comptent (Python 3.x, Kubernetes 1.x, Terraform…), et signale ce qui est déprécié.
- Pour le marché de l'emploi, les salaires ou les tendances, cite des sources identifiables (France Travail, Apec, Dares, enquêtes Stack Overflow…) avec leur date ; distingue les faits des projections.
- Distingue ce qui est certain, ce qui relève d'une bonne pratique discutée, et ce qui dépend du contexte.

Pédagogie :
- Du simple au complexe. Commence par l'intuition (une analogie concrète de la vie courante), puis le concept exact avec son vocabulaire (terme anglais entre parenthèses), puis un exemple minimal qui fonctionne, puis les pièges.
- Le code doit être correct, minimal et commenté en français ; précise où l'exécuter (labo Python, labo SQL, terminal de l'application, ou sa propre machine).
- Quand l'élève montre du code qui ne marche pas : explique l'erreur (cause, ligne, pourquoi), donne une piste ou un indice, et ne livre la solution complète que s'il la demande explicitement.
- Termine si utile par un mini-exercice pour vérifier la compréhension.

Forme :
- Français clair, phrases courtes, pas de jargon non expliqué.
- Markdown structuré selon la question : **En bref** (2 à 4 lignes) ; **Explication** ; **Exemple** (bloc de code) ; **Pièges fréquents** ; **En entreprise** (comment c'est utilisé en vrai) ; **Pour aller plus loin** (liens vers la doc officielle).
- Pour une question simple, une réponse courte et exacte vaut mieux qu'un exposé.`;

export interface AiResult {
  text: string;
  sources: { url: string; title: string }[];
  cost: number;
  stop: string;
}

export interface RunOptions {
  system: string;
  messages: BetaMessageParam[];
  search?: boolean;
  maxSearches?: number;
  effort?: "low" | "medium" | "high" | "xhigh";
  maxTokens?: number;
  onText?: (fullText: string) => void;
  onStatus?: (s: string) => void;
  signal?: AbortSignal;
  jsonSchema?: Record<string, unknown>;
}

function priceOf(model: string) {
  return MODELS.find((m) => m.id === model) ?? MODELS[0];
}

function costOf(model: string, msg: BetaMessage): number {
  const p = priceOf(model);
  const u = msg.usage;
  const input =
    (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) * 1.25 + (u.cache_read_input_tokens ?? 0) * 0.1;
  const searches = u.server_tool_use?.web_search_requests ?? 0;
  return (input * p.inPrice + (u.output_tokens ?? 0) * p.outPrice) / 1_000_000 + searches * 0.01;
}

export async function runClaude(o: RunOptions): Promise<AiResult> {
  const c = client();
  const s = getState().settings;
  const model = s.model || MODELS[0].id;
  const isHaiku = model.startsWith("claude-haiku");
  const domains = [...new Set([...OFFICIAL_DOMAINS, ...(s.communitySources ? COMMUNITY_DOMAINS : [])])];

  const tools: BetaToolUnion[] = [];
  if (o.search) {
    tools.push(
      isHaiku
        ? { type: "web_search_20250305", name: "web_search", max_uses: o.maxSearches ?? 6, allowed_domains: domains }
        : {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: o.maxSearches ?? 8,
            allowed_domains: domains,
            user_location: { type: "approximate", country: "FR", timezone: "Europe/Paris" },
          },
    );
  }

  const system = `${o.system}\n\nNous sommes le ${todayLong()}.`;
  const messages = [...o.messages];
  let text = "";
  let cost = 0;
  const sources: { url: string; title: string }[] = [];
  const index = new Map<string, number>();
  const consulted = new Map<string, string>();
  const addSource = (url: string, title: string | null) => {
    if (!url) return 0;
    if (!index.has(url)) {
      sources.push({ url, title: title || url });
      index.set(url, sources.length);
    }
    return index.get(url)!;
  };

  let stop = "";
  for (let turn = 0; turn < 4; turn++) {
    const format = o.jsonSchema ? { type: "json_schema" as const, schema: o.jsonSchema } : undefined;
    const params: BetaMessageStreamParams = {
      model,
      max_tokens: o.maxTokens ?? 16000,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      ...(tools.length ? { tools } : {}),
      // Haiku 4.5 : pas de réflexion adaptative ni de repli serveur.
      ...(isHaiku
        ? format
          ? { output_config: { format } }
          : {}
        : {
            thinking: { type: "adaptive" },
            output_config: { effort: o.effort ?? "medium", ...(format ? { format } : {}) },
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
          }),
    };

    let final: BetaMessage;
    try {
      const stream = c.beta.messages.stream(params, { signal: o.signal });
      const prefix = text;
      let live = "";
      stream.on("text", (delta: string) => {
        live += delta;
        o.onText?.(prefix + live);
      });
      stream.on("streamEvent", (ev: BetaRawMessageStreamEvent) => {
        if (ev.type !== "content_block_start") return;
        if (ev.content_block.type === "server_tool_use") o.onStatus?.("Recherche dans la documentation officielle…");
        if (ev.content_block.type === "text") o.onStatus?.("Rédaction…");
      });
      final = await stream.finalMessage();
    } catch (e) {
      throw translateError(e);
    }
    cost += costOf(model, final);
    stop = final.stop_reason ?? "";

    // Texte final annoté avec les renvois aux sources [n]
    let annotated = "";
    for (const b of final.content) {
      if (b.type === "text") {
        annotated += b.text;
        const marks = new Set<number>();
        for (const ci of b.citations ?? []) {
          if (ci.type === "web_search_result_location") marks.add(addSource(ci.url, ci.title));
        }
        if (marks.size) annotated += [...marks].filter(Boolean).map((n) => `[${n}]`).join("");
      } else if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        // Les résultats consultés sont listés à la fin s'ils ne sont pas cités.
        for (const r of b.content) if (r.type === "web_search_result") consulted.set(r.url, r.title);
      }
    }
    text += annotated;
    o.onText?.(text);

    if (stop === "pause_turn") {
      messages.push({ role: "assistant", content: final.content });
      continue;
    }
    break;
  }
  if (stop === "refusal") {
    throw new AiError("La requête a été déclinée par les filtres de sécurité du modèle. Reformulez la question.");
  }
  if (stop === "max_tokens") text += "\n\n*(Réponse tronquée : longueur maximale atteinte.)*";
  // Aucune citation explicite : on liste au moins les pages consultées.
  if (!sources.length) for (const [url, title] of consulted) sources.push({ url, title });
  return { text: text.trim(), sources, cost, stop };
}

function translateError(e: unknown): Error {
  if (e instanceof Anthropic.AuthenticationError) return new AiError("Clé d'API refusée. Vérifiez-la dans Réglages.");
  if (e instanceof Anthropic.PermissionDeniedError)
    return new AiError("Accès refusé par l'API (droits du compte ou du modèle choisi).");
  if (e instanceof Anthropic.RateLimitError)
    return new AiError("Trop de requêtes ou crédit épuisé. Patientez une minute ou vérifiez votre solde sur console.anthropic.com.");
  if (e instanceof Anthropic.BadRequestError) return new AiError("Requête refusée par l'API : " + e.message);
  if (e instanceof Anthropic.APIConnectionError)
    return new AiError("Connexion impossible. L'assistant nécessite une connexion Internet.");
  if (e instanceof Anthropic.APIUserAbortError) return new AiError("Arrêté.");
  if (e instanceof Anthropic.APIError) return new AiError("Erreur de l'API : " + e.message);
  return e instanceof Error ? e : new Error(String(e));
}

// ---------------------------------------------------------------------
// Usages spécialisés
// ---------------------------------------------------------------------

export const LESSON_FORMAT = `Format de la leçon (Markdown) :
- Commence directement par une courte introduction qui dit à quoi sert la notion dans un métier (pas de titre de niveau 1).
- Titres de sections en « ## », sous-sections en « ### ».
- Blocs de code avec le langage indiqué (python, sql, bash, yaml, dockerfile, hcl). Code correct, minimal, commenté en français. Les blocs python et sql s'ouvrent dans le labo de l'application : ils doivent pouvoir s'exécuter tels quels (Python standard, SQLite).
- Blocs pédagogiques (une ligne d'ouverture, le contenu, puis une ligne « ::: ») :
  :::analogie Pour comprendre   (une image de la vie courante)
  :::definition / :::retenir / :::astuce / :::attention / :::exemple / :::methode
  :::metier En entreprise        (comment c'est utilisé concrètement, par qui)
  :::piege Piège classique
  :::futur Tendance              (ce qui monte, à surveiller)
- Progression du simple au complexe, pour un débutant motivé ; chaque terme technique est défini à sa première apparition, avec le terme anglais entre parenthèses.
- Termine par « ## À retenir » (5 à 8 puces) puis « ## Pour aller plus loin » (2 à 4 liens vers la documentation officielle).
- Longueur : 1 200 à 2 200 mots.`;

export async function generateLesson(o: {
  packTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  level: number;
  outline?: string[];
  objectives?: string[];
  onText?: (t: string) => void;
  onStatus?: (s: string) => void;
  signal?: AbortSignal;
}) {
  const levelLabel = ["", "fondamentaux", "approfondissement", "expert"][o.level] ?? "approfondissement";
  return runClaude({
    system: TEACHER_SYSTEM + "\n\n" + LESSON_FORMAT,
    search: true,
    maxSearches: 8,
    effort: "high",
    maxTokens: 32000,
    onText: o.onText,
    onStatus: o.onStatus,
    signal: o.signal,
    messages: [
      {
        role: "user",
        content: `Rédige la leçon « ${o.lessonTitle} » (domaine : ${o.packTitle} ; module : ${o.moduleTitle} ; niveau : ${levelLabel}).
${o.objectives?.length ? "Objectifs : " + o.objectives.join(" ; ") + "\n" : ""}${o.outline?.length ? "Plan indicatif : " + o.outline.join(" ; ") + "\n" : ""}
Vérifie au préalable dans la documentation officielle les versions, commandes et services actuels. Rédige ensuite uniquement la leçon, sans préambule ni commentaire sur tes recherches.`,
      },
    ],
  });
}

const QUIZ_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["quiz", "flashcards"],
  properties: {
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "q", "choices", "answer", "explain"],
        properties: {
          type: { type: "string", enum: ["qcm"] },
          q: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          answer: { type: "integer" },
          explain: { type: "string" },
        },
      },
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["q", "a"],
        properties: { q: { type: "string" }, a: { type: "string" } },
      },
    },
  },
};

export async function generateQuiz(lessonTitle: string, body: string) {
  const r = await runClaude({
    system:
      "Tu es professeur d'informatique. Tu rédiges des QCM sans ambiguïté (une seule bonne réponse, distracteurs plausibles, pas de piège sur un détail inutile) et des cartes de révision courtes, strictement fondés sur la leçon fournie. Privilégie la compréhension et la mise en situation (« que fait cette commande ? », « quelle requête renvoie… ? ») plutôt que le par-cœur.",
    effort: "low",
    maxTokens: 8000,
    jsonSchema: QUIZ_SCHEMA,
    messages: [
      {
        role: "user",
        content: `Leçon « ${lessonTitle} » :\n\n${body}\n\nProduis 8 QCM (4 choix, « answer » = index de la bonne réponse à partir de 0, explication courte) et 8 cartes de révision.`,
      },
    ],
  });
  const json = JSON.parse(r.text.replace(/\[\d+\]/g, ""));
  return json as { quiz: { type: "qcm"; q: string; choices: string[]; answer: number; explain: string }[]; flashcards: { q: string; a: string }[] };
}

export async function gradeExercise(o: {
  title: string;
  statement: string;
  rubric?: string[];
  model?: string;
  answer: string;
  onText?: (t: string) => void;
  signal?: AbortSignal;
}) {
  return runClaude({
    system: `Tu es un ingénieur senior et formateur qui corrige le travail d'un apprenant en reconversion vers la data et le cloud/DevOps. Tu corriges avec bienveillance mais sans complaisance, comme lors d'une revue de code ou de conception en entreprise.
Ta correction comprend, en Markdown :
1. **Appréciation** : niveau atteint (à retravailler / correct / bon / très bon) et 2-3 phrases de synthèse.
2. **Grille** : chaque critère de la grille, avec ce qui est réussi et ce qui manque.
3. **Erreurs techniques** : toute inexactitude, avec la version correcte (et le lien vers la doc officielle si utile).
4. **Ce qu'un recruteur ou un lead technique remarquerait** : points forts à valoriser, signaux faibles.
5. **Version améliorée** : les éléments clés d'une réponse solide, en bref.
6. **Trois conseils prioritaires** pour progresser.`,
    effort: "high",
    maxTokens: 16000,
    onText: o.onText,
    signal: o.signal,
    messages: [
      {
        role: "user",
        content: `Exercice : ${o.title}

ÉNONCÉ :
${o.statement}
${o.rubric?.length ? "\nGRILLE DE CORRECTION :\n- " + o.rubric.join("\n- ") : ""}
${o.model ? "\nÉLÉMENTS DE CORRIGÉ (référence pour le correcteur) :\n" + o.model : ""}

RÉPONSE DE L'APPRENANT :
${o.answer}`,
      },
    ],
  });
}

export async function runVeille(o: {
  domain: string;
  since: string;
  focus?: string;
  onText?: (t: string) => void;
  onStatus?: (s: string) => void;
  signal?: AbortSignal;
}) {
  return runClaude({
    system: TEACHER_SYSTEM,
    search: true,
    maxSearches: 12,
    effort: "high",
    maxTokens: 24000,
    onText: o.onText,
    onStatus: o.onStatus,
    signal: o.signal,
    messages: [
      {
        role: "user",
        content: `Fais une veille technologique en « ${o.domain} » depuis le ${o.since}${o.focus ? ` (accent particulier : ${o.focus})` : ""}, pour un apprenant qui se forme à ce métier.
Recense, en vérifiant chaque information dans les sources officielles (notes de version, blogs officiels des éditeurs, fondations Apache/CNCF/Linux Foundation, annonces des fournisseurs cloud) : nouvelles versions majeures et ce qu'elles changent ; dépréciations et fins de support ; nouveaux services ou fonctionnalités marquants ; failles de sécurité importantes ; évolutions des certifications ; tendances du marché de l'emploi (avec la source et sa date).
Pour chaque élément : **date et source**, ce que c'est en 2 à 4 lignes, **ce que ça change pour un débutant** (faut-il s'en soucier maintenant ?).
Classe par importance, puis termine par « ## À retenir » (5 puces) et « ## À surveiller ».
Si rien de notable sur un sous-domaine, dis-le plutôt que de combler.`,
      },
    ],
  });
}

export async function checkLessonCurrency(o: {
  title: string;
  updatedAt: string;
  body: string;
  onText?: (t: string) => void;
  onStatus?: (s: string) => void;
  signal?: AbortSignal;
}) {
  return runClaude({
    system: TEACHER_SYSTEM,
    search: true,
    maxSearches: 8,
    effort: "high",
    maxTokens: 16000,
    onText: o.onText,
    onStatus: o.onStatus,
    signal: o.signal,
    messages: [
      {
        role: "user",
        content: `Voici une leçon intitulée « ${o.title} », à jour au ${o.updatedAt}. Vérifie dans la documentation officielle qu'elle est toujours exacte aujourd'hui.
Rends un rapport bref en Markdown :
## Verdict (à jour / à compléter / à corriger)
## Points à corriger (commande ou option changée, service renommé ou abandonné, version dépassée, chiffre obsolète) — avec la source
## Nouveautés utiles à ajouter
## Points confirmés
Ne signale que ce que tu as vérifié.

LEÇON :
${o.body}`,
      },
    ],
  });
}

const SYLLABUS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "icon", "modules"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    icon: { type: "string" },
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "level", "summary", "lessons"],
        properties: {
          title: { type: "string" },
          level: { type: "integer", enum: [1, 2, 3] },
          summary: { type: "string" },
          lessons: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "objectives", "outline"],
              properties: {
                title: { type: "string" },
                objectives: { type: "array", items: { type: "string" } },
                outline: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    },
  },
};

export async function generateSyllabus(o: { domain: string; details: string; onStatus?: (s: string) => void }) {
  o.onStatus?.("Conception du programme…");
  const r = await runClaude({
    system:
      "Tu es un professeur d'informatique et ingénieur senior chargé de concevoir un programme complet, du simple au complexe, pour un adulte en reconversion qui part de zéro et vise un métier (data engineer, cloud/DevOps, etc.). Le programme doit être concret, orienté pratique et aligné sur ce que demandent les recruteurs.",
    effort: "high",
    maxTokens: 16000,
    jsonSchema: SYLLABUS_SCHEMA,
    messages: [
      {
        role: "user",
        content: `Conçois le programme du domaine « ${o.domain} ». ${o.details}
Exigences : 3 niveaux (1 = fondamentaux, 2 = approfondissement, 3 = expert), 6 à 10 modules au total, 3 à 6 leçons par module, couverture complète du domaine tel qu'il se pratique aujourd'hui en entreprise. « icon » : un seul emoji. Pour chaque leçon : 2 à 4 objectifs, plan en 3 à 6 points.`,
      },
    ],
  });
  return JSON.parse(r.text.replace(/\[\d+\]/g, ""));
}
