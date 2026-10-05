import { useSyncExternalStore } from "react";
import { dbDel, dbGet, dbKeys, dbSet } from "./db";
import type { Lesson, Manifest, Module, Pack, Track } from "./types";

// Les domaines officiels sont servis depuis /content (mis à jour avec
// l'application). Les domaines importés ou générés par l'IA sont stockés
// sur l'appareil (IndexedDB). Les deux sont fusionnés ici.

interface ContentState {
  loading: boolean;
  packs: Pack[];
  manifest: Manifest | null;
  error: string;
  updates: string[]; // titres des domaines mis à jour depuis la dernière visite
}

let cs: ContentState = { loading: true, packs: [], manifest: null, error: "", updates: [] };
const listeners = new Set<() => void>();
const set = (p: Partial<ContentState>) => {
  cs = { ...cs, ...p };
  listeners.forEach((l) => l());
};

export function useContent<T>(sel: (s: ContentState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(cs),
  );
}

export const getContent = () => cs;

export function setUpdatesSeen() {
  set({ updates: [] });
}

const base = () => new URL("content/", document.baseURI).toString();

async function fetchJson<T>(url: string, fresh = false): Promise<T> {
  const r = await fetch(url, { cache: fresh ? "no-cache" : "default" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

function normalize(p: Pack, origin: Pack["origin"]): Pack {
  return {
    ...p,
    origin,
    modules: (p.modules ?? []).map((m) => ({
      ...m,
      lessons: (m.lessons ?? []).map((l) => ({ ...l, level: l.level ?? m.level })),
    })),
  };
}

export async function loadContent(fresh = false) {
  set({ loading: true, error: "" });
  const packs: Pack[] = [];
  let manifest: Manifest | null = null;
  try {
    manifest = await fetchJson<Manifest>(base() + "manifest.json", fresh);
    const results = await Promise.allSettled(
      manifest.packs.map((e) => fetchJson<Pack>(base() + e.file, fresh)),
    );
    results.forEach((r) => {
      if (r.status === "fulfilled") packs.push(normalize(r.value, "officiel"));
    });
  } catch (e) {
    set({ error: "Contenus officiels indisponibles hors connexion (pas encore mis en cache)." });
  }
  // Packs locaux (importés / générés). Un pack local de même id et de
  // version supérieure remplace la version officielle.
  for (const k of await dbKeys("pack:")) {
    const p = await dbGet<Pack>(k);
    if (!p) continue;
    const i = packs.findIndex((x) => x.id === p.id);
    if (i === -1) packs.push(p);
    else if (compareVersions(p.version, packs[i].version) > 0) packs[i] = p;
  }
  packs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));

  // Détection des mises à jour depuis la dernière visite
  const seen = (await dbGet<Record<string, string>>("seenVersions")) ?? {};
  const updates = Object.keys(seen).length
    ? packs.filter((p) => seen[p.id] && compareVersions(p.version, seen[p.id]) > 0).map((p) => p.title)
    : [];
  await dbSet("seenVersions", Object.fromEntries(packs.map((p) => [p.id, p.version])));
  set({ loading: false, packs, manifest, updates });
}

export function compareVersions(a = "0", b = "0") {
  const pa = a.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

// ---------- Validation d'un pack importé ----------
export function validatePack(raw: unknown): { pack?: Pack; errors: string[] } {
  const errors: string[] = [];
  const p = raw as Pack;
  if (!p || typeof p !== "object") return { errors: ["Le fichier n'est pas un objet JSON."] };
  if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errors.push("« id » manquant ou invalide (minuscules, chiffres, tirets).");
  if (!p.title) errors.push("« title » manquant.");
  if (!p.version) errors.push("« version » manquante.");
  if (!Array.isArray(p.modules) || !p.modules.length) errors.push("« modules » doit être une liste non vide.");
  const ids = new Set<string>();
  (p.modules ?? []).forEach((m, mi) => {
    if (!m.id || !m.title) errors.push(`Module n°${mi + 1} : id/title manquant.`);
    if (![1, 2, 3].includes(m.level)) errors.push(`Module « ${m.title} » : level doit valoir 1, 2 ou 3.`);
    (m.lessons ?? []).forEach((l) => {
      if (!l.id || !l.title) errors.push(`Module « ${m.title} » : une leçon sans id/title.`);
      if (ids.has(l.id)) errors.push(`Identifiant de leçon en double : ${l.id}`);
      ids.add(l.id);
      (l.quiz ?? []).forEach((q, qi) => {
        if (q.type === "qcm" && (typeof q.answer !== "number" || !q.choices || q.answer >= q.choices.length))
          errors.push(`« ${l.title} », question ${qi + 1} : réponse hors des choix.`);
        if (q.type === "vf" && typeof q.answer !== "boolean")
          errors.push(`« ${l.title} », question ${qi + 1} : réponse vrai/faux attendue.`);
      });
    });
  });
  if (errors.length) return { errors };
  const defaults = {
    branch: "Autres domaines",
    icon: "📘",
    color: "#5b6b8c",
    description: "",
    updatedAt: new Date().toLocaleDateString("sv-SE"),
  };
  return { pack: Object.assign({}, defaults, p), errors };
}

export async function installLocalPack(pack: Pack, origin: "importé" | "généré") {
  const p = normalize(pack, origin);
  await dbSet("pack:" + p.id, p);
  await loadContent();
  return p;
}

export async function removeLocalPack(id: string) {
  await dbDel("pack:" + id);
  await loadContent();
}

export async function getLocalPack(id: string) {
  return dbGet<Pack>("pack:" + id);
}

// ---------- Corps des leçons ----------
const genKey = (packId: string, lessonId: string) => `gen:${packId}/${lessonId}`;

export async function getLessonBody(pack: Pack, lesson: Lesson): Promise<{ body: string; generated: boolean } | null> {
  if (lesson.body) return { body: lesson.body, generated: false };
  if (lesson.src) {
    const r = await fetch(base() + lesson.src);
    if (r.ok) return { body: await r.text(), generated: false };
  }
  const g = await dbGet<string>(genKey(pack.id, lesson.id));
  return g ? { body: g, generated: true } : null;
}

export async function saveGeneratedLesson(packId: string, lessonId: string, body: string) {
  await dbSet(genKey(packId, lessonId), body);
}

export async function deleteGeneratedLesson(packId: string, lessonId: string) {
  await dbDel(genKey(packId, lessonId));
}

// ---------- Pré-chargement hors connexion ----------
export async function cacheAllForOffline(onProgress?: (done: number, total: number) => void) {
  const urls: string[] = [base() + "manifest.json"];
  for (const e of cs.manifest?.packs ?? []) urls.push(base() + e.file);
  for (const p of cs.packs)
    for (const m of p.modules) for (const l of m.lessons) if (l.src) urls.push(base() + l.src);
  // Python dans le navigateur, pour pouvoir faire les labos hors connexion
  const py = new URL("pyodide/", document.baseURI).toString();
  for (const f of ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) urls.push(py + f);
  let done = 0;
  for (const u of urls) {
    try {
      await fetch(u, { cache: "reload" });
    } catch {
      /* hors ligne */
    }
    onProgress?.(++done, urls.length);
  }
  return urls.length;
}

// ---------- Accès pratiques ----------
export function findLesson(packId: string, lessonId: string) {
  const pack = cs.packs.find((p) => p.id === packId);
  if (!pack) return null;
  for (const m of pack.modules) {
    const i = m.lessons.findIndex((l) => l.id === lessonId);
    if (i >= 0) return { pack, module: m, lesson: m.lessons[i] };
  }
  return null;
}

export function flatLessons(pack: Pack): { module: Module; lesson: Lesson }[] {
  return pack.modules.flatMap((m) => m.lessons.map((lesson) => ({ module: m, lesson })));
}

export function tracks(): Track[] {
  return cs.manifest?.tracks ?? [];
}

export function hasContent(l: Lesson) {
  return !!(l.body || l.src);
}

