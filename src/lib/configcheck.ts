// Vérification des fichiers de configuration écrits par l'élève
// (Dockerfile, YAML Kubernetes / GitHub Actions / Compose, Terraform, JSON…).
import * as yaml from "js-yaml";
import { lintDockerfile } from "./shell/containers";
import type { ConfigCheck, Exercise } from "./types";

export interface ConfigResult {
  syntaxError?: string;
  results: { label: string; ok: boolean; hint?: string }[];
}

// Chemin « jobs.*.steps[*].uses » → toutes les valeurs correspondantes
export function pick(doc: unknown, path: string): unknown[] {
  const parts = path.match(/[^.[\]]+|\[\*\]|\[\d+\]/g) ?? [];
  let cur: unknown[] = [doc];
  for (const p of parts) {
    const next: unknown[] = [];
    for (const v of cur) {
      if (v === null || v === undefined) continue;
      if (p === "[*]" || p === "*") {
        if (Array.isArray(v)) next.push(...v);
        else if (typeof v === "object") next.push(...Object.values(v as object));
      } else if (/^\[\d+\]$/.test(p)) {
        if (Array.isArray(v)) next.push(v[Number(p.slice(1, -1))]);
      } else if (Array.isArray(v)) {
        // « containers.image » sur une liste : on descend dans chaque élément
        for (const x of v) if (x && typeof x === "object" && p in x) next.push((x as Record<string, unknown>)[p]);
      } else if (typeof v === "object" && p in (v as object)) next.push((v as Record<string, unknown>)[p]);
    }
    cur = next;
  }
  return cur.filter((v) => v !== undefined);
}

function parse(text: string, syntax: Exercise["syntax"]): { docs: unknown[]; error?: string } {
  try {
    if (syntax === "yaml") {
      if (/^\t/m.test(text)) return { docs: [], error: "Le fichier contient des tabulations : en YAML, l'indentation se fait uniquement avec des espaces (2 par niveau)." };
      return { docs: yaml.loadAll(text).filter((d) => d !== null && d !== undefined) };
    }
    if (syntax === "json") return { docs: [JSON.parse(text)] };
  } catch (e) {
    const msg = (e as Error).message.split("\n")[0];
    return { docs: [], error: `Erreur de syntaxe ${syntax === "yaml" ? "YAML" : "JSON"} : ${msg}` };
  }
  return { docs: [] };
}

export function checkConfig(ex: Exercise, text: string): ConfigResult {
  const syntax = ex.syntax ?? "text";
  const { docs, error } = parse(text, syntax);
  if (error) return { syntaxError: error, results: (ex.checks ?? []).map((c) => ({ label: c.label, ok: false, hint: c.hint })) };
  if (syntax === "dockerfile") {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    const errs = lintDockerfile(lines, () => true).filter((e) => !e.startsWith("COPY"));
    if (errs.length) return { syntaxError: "Dockerfile invalide : " + errs.join(" ; "), results: (ex.checks ?? []).map((c) => ({ label: c.label, ok: false, hint: c.hint })) };
  }
  if (syntax === "hcl") {
    const open = (text.match(/{/g) ?? []).length;
    const close = (text.match(/}/g) ?? []).length;
    if (open !== close) return { syntaxError: `Accolades déséquilibrées : ${open} « { » pour ${close} « } ».`, results: (ex.checks ?? []).map((c) => ({ label: c.label, ok: false, hint: c.hint })) };
  }
  return { results: (ex.checks ?? []).map((c) => ({ label: c.label, ok: one(c, text, docs), hint: c.hint })) };
}

function one(c: ConfigCheck, text: string, docs: unknown[]): boolean {
  if (c.regex) {
    const found = new RegExp(c.regex, "mi").test(text);
    return c.not ? !found : found;
  }
  if (c.path) {
    const vals = docs.flatMap((d) => pick(d, c.path!));
    if (c.exists === false) return vals.length === 0;
    if (!vals.length) return false;
    if (c.equals !== undefined) return vals.some((v) => String(v) === String(c.equals));
    if (c.contains !== undefined) return vals.some((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)).toLowerCase().includes(c.contains!.toLowerCase()));
    return true;
  }
  return false;
}
