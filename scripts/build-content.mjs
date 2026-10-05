// Compile les sources de contenu en packs JSON servis par l'application.
//
//   content-src/<domaine>.yaml   métadonnées, modules, quiz, cartes, exercices
//   content-src/<domaine>.md     le texte des leçons, une section par leçon :
//                                <!-- @lecon identifiant-de-la-lecon -->
//   content-src/_parcours.yaml   les parcours métiers (feuilles de route)
//   content-src/_changelog.yaml  journal des mises à jour
//
// Sortie : public/content/packs/<id>/pack.json, une leçon .md par fichier,
// et public/content/manifest.json.
// Usage : npm run content   (puis npm run content:check pour exécuter les exercices)
import { readdirSync, writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const SRC = "content-src";
const OUT = "public/content";
const errors = [];
const warn = [];

// La typographie française met une espace avant « : » — ce qui, en YAML,
// casse les valeurs non guillemetées (« explain: Le résultat : 3 »).
// On guillemette automatiquement ces valeurs de texte, sans toucher au reste.
const TEXT_KEYS = /^(\s*(?:- )?)([A-Za-z_][\w-]*)(:\s+)(.*)$/; // toute clé simple
const quote = (v) => '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const risky = (v) => /:\s|\s#|^[@`%]/.test(v) || /:$/.test(v);
function autoQuote(src) {
  let inBlock = -1;
  return src
    .split(/\r?\n/)
    .map((line) => {
      const indent = line.match(/^\s*/)[0].length;
      if (inBlock >= 0) {
        if (line.trim() === "" || indent > inBlock) return line;
        inBlock = -1;
      }
      if (/:\s*[|>][-+]?\s*$/.test(line)) {
        inBlock = indent + (line.trimStart().startsWith("- ") ? 2 : 0);
        return line;
      }
      const m = line.match(TEXT_KEYS);
      if (m) {
        const v = m[4];
        if (!v || /^["'{[|>&*!]/.test(v) || !risky(v)) return line;
        return m[1] + m[2] + m[3] + quote(v);
      }
      const li = line.match(/^(\s*- )(.*)$/);
      if (li) {
        const v = li[2];
        if (!v || /^["'{[|>&*!]/.test(v) || /^[\w.-]+:(\s|$)/.test(v) || !risky(v)) return line;
        return li[1] + quote(v);
      }
      return line;
    })
    .join("\n");
}

const load = (f) => yaml.load(autoQuote(readFileSync(path.join(SRC, f), "utf8")));

function splitLessons(md) {
  const out = {};
  const parts = md.replace(/\r\n/g, "\n").split(/^<!--\s*@lecon\s+([\w-]+)\s*-->\s*$/m);
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1].trim() + "\n";
  return out;
}

const manifest = {
  version: "",
  updatedAt: new Date().toISOString().slice(0, 10),
  packs: [],
  tracks: existsSync(path.join(SRC, "_parcours.yaml")) ? load("_parcours.yaml") : [],
  changelog: existsSync(path.join(SRC, "_changelog.yaml")) ? load("_changelog.yaml") : [],
  datasets: existsSync(path.join(SRC, "_datasets.yaml")) ? load("_datasets.yaml") : {},
  certifications: existsSync(path.join(SRC, "_certifications.yaml")) ? load("_certifications.yaml") : [],
};

let lessonCount = 0;
let exerciseCount = 0;
let quizCount = 0;
const files = readdirSync(SRC).filter((f) => f.endsWith(".yaml") && !f.startsWith("_"));
const allPackIds = new Set();

for (const f of files) {
  let pack;
  try {
    pack = load(f);
  } catch (e) {
    errors.push(`${f} : YAML invalide — ${e.message.split("\n")[0]}`);
    continue;
  }
  const id = pack.id;
  allPackIds.add(id);
  const mdFile = path.join(SRC, f.replace(/\.yaml$/, ".md"));
  const bodies = existsSync(mdFile) ? splitLessons(readFileSync(mdFile, "utf8")) : {};
  const dir = path.join(OUT, "packs", id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const ids = new Set();
  for (const m of pack.modules ?? []) {
    if (![1, 2, 3].includes(m.level)) errors.push(`${id}/${m.id} : niveau invalide`);
    for (const l of m.lessons ?? []) {
      lessonCount++;
      if (ids.has(l.id)) errors.push(`${id} : id de leçon en double ${l.id}`);
      ids.add(l.id);
      if (bodies[l.id]) {
        writeFileSync(path.join(dir, l.id + ".md"), bodies[l.id]);
        l.src = `packs/${id}/${l.id}.md`;
        const words = bodies[l.id].split(/\s+/).length;
        if (!l.duration) l.duration = Math.max(5, Math.round(words / 160) + 3);
        delete bodies[l.id];
      } else if (!l.body && !l.outline) warn.push(`${id}/${l.id} : ni texte ni plan`);
      for (const [i, q] of (l.quiz ?? []).entries()) {
        quizCount++;
        if (q.type === "qcm" && (!Array.isArray(q.choices) || typeof q.answer !== "number" || q.answer >= q.choices.length))
          errors.push(`${id}/${l.id} q${i + 1} : réponse QCM invalide`);
        if (q.type === "vf" && typeof q.answer !== "boolean") errors.push(`${id}/${l.id} q${i + 1} : réponse V/F invalide`);
        if (!q.explain) errors.push(`${id}/${l.id} q${i + 1} : explication manquante`);
      }
      const exIds = new Set();
      for (const ex of l.exercises ?? []) {
        exerciseCount++;
        // setup: "@boutique" → jeu de données partagé (content-src/_datasets.yaml)
        if (typeof ex.setup === "string" && ex.setup.startsWith("@")) {
          const ds = manifest.datasets[ex.setup.slice(1).trim()];
          if (!ds) errors.push(`${id}/${l.id}/${ex.id} : jeu de données inconnu ${ex.setup}`);
          else ex.setup = ds.sql;
        }
        if (exIds.has(ex.id)) errors.push(`${id}/${l.id} : id d'exercice en double ${ex.id}`);
        exIds.add(ex.id);
        if (!ex.title || !ex.statement) errors.push(`${id}/${l.id}/${ex.id} : titre ou énoncé manquant`);
        const need = { code: ["lang"], terminal: ["tasks"], config: ["checks", "syntax"], calcul: ["questions"], ordre: ["items"], projet: ["model"] }[ex.type];
        if (!need) errors.push(`${id}/${l.id}/${ex.id} : type inconnu ${ex.type}`);
        for (const k of need ?? []) if (!ex[k]) errors.push(`${id}/${l.id}/${ex.id} : champ « ${k} » requis pour le type ${ex.type}`);
        if (ex.type === "code" && ex.lang === "python" && !ex.tests?.length) errors.push(`${id}/${l.id}/${ex.id} : tests Python manquants`);
        if (ex.type === "code" && ex.lang === "sql" && !ex.solution) errors.push(`${id}/${l.id}/${ex.id} : solution SQL manquante`);
        for (const [k, q] of (ex.questions ?? []).entries())
          if (typeof q.answer !== "number" || !q.explain) errors.push(`${id}/${l.id}/${ex.id} question ${k + 1} invalide`);
      }
    }
  }
  for (const orphan of Object.keys(bodies)) errors.push(`${id} : texte de leçon sans entrée dans le YAML (${orphan})`);
  writeFileSync(path.join(dir, "pack.json"), JSON.stringify(pack));
  manifest.packs.push({ id, file: `packs/${id}/pack.json`, version: pack.version, title: pack.title });
}

// Packs JSON déposés directement dans public/content/packs (sans source) : conservés.
for (const d of existsSync(path.join(OUT, "packs")) ? readdirSync(path.join(OUT, "packs")) : []) {
  const f = path.join(OUT, "packs", d, "pack.json");
  if (!existsSync(f) || manifest.packs.some((p) => p.id === d)) continue;
  try {
    const pack = JSON.parse(readFileSync(f, "utf8"));
    if (!pack.id || !pack.title || !Array.isArray(pack.modules)) throw new Error("champs id/title/modules requis");
    manifest.packs.push({ id: pack.id, file: `packs/${d}/pack.json`, version: pack.version ?? "1.0.0", title: pack.title });
    allPackIds.add(pack.id);
  } catch (e) {
    errors.push(`${f} : ${e.message}`);
  }
}

const certIds = new Set(manifest.certifications.map((c) => c.id));
for (const c of manifest.certifications) {
  for (const k of ["id", "name", "vendor", "url", "price", "why", "cv"]) if (!c[k]) errors.push(`certification ${c.id ?? "?"} : champ « ${k} » manquant`);
  for (const p of c.validates ?? []) if (!allPackIds.has(p)) errors.push(`certification ${c.id} : domaine inconnu ${p}`);
}
for (const t of manifest.tracks) {
  for (const s of t.steps ?? []) {
    for (const p of s.packs ?? []) if (!allPackIds.has(p)) errors.push(`parcours ${t.id} : domaine inconnu ${p}`);
    for (const m of s.milestones ?? []) if (!certIds.has(m)) errors.push(`parcours ${t.id} : certification inconnue ${m}`);
  }
  for (const m of t.certifications ?? []) if (!certIds.has(m)) errors.push(`parcours ${t.id} : certification inconnue ${m}`);
}

manifest.packs.sort((a, b) => a.id.localeCompare(b.id));
manifest.version = manifest.packs.map((p) => p.version).sort().at(-1) ?? "1.0.0";
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));

console.log(`${manifest.packs.length} domaines · ${lessonCount} leçons · ${quizCount} questions · ${exerciseCount} exercices pratiques.`);
if (warn.length) console.log("Avertissements :\n- " + warn.join("\n- "));
if (errors.length) {
  console.error("ERREURS :\n- " + errors.join("\n- "));
  process.exit(1);
}
