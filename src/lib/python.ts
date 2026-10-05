// Exécution de Python dans le navigateur avec Pyodide (CPython compilé en
// WebAssembly), dans un Web Worker : la page reste fluide et une boucle
// infinie peut être interrompue (le worker est alors recréé).
// Le cœur de Pyodide (≈ 13 Mo) est hébergé par l'application elle-même
// (dossier pyodide/, copié depuis le paquet npm) et mis en cache par le
// service worker : Python fonctionne hors connexion après le premier
// lancement. Les paquets supplémentaires (pandas…) viennent du CDN officiel.

export const PYODIDE_VERSION = "314.0.7";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export interface PyTestResult {
  label: string;
  ok: boolean;
  message?: string;
}

export interface PyResult {
  ok: boolean; // le code s'est exécuté sans erreur
  stdout: string;
  error?: string; // trace Python lisible
  tests: PyTestResult[];
  ms: number;
}

const workerSrc = (local: string) => `
import { loadPyodide } from ${JSON.stringify(local + "pyodide.mjs")};
let py = null;
let loaded = new Set();
async function ensure(packages) {
  if (!py) py = await loadPyodide({ indexURL: ${JSON.stringify(local)}, packageBaseUrl: ${JSON.stringify(CDN)} });
  const need = (packages || []).filter((p) => !loaded.has(p));
  if (need.length) {
    postMessage({ kind: "status", text: "Chargement de " + need.join(", ") + "…" });
    await py.loadPackage(need);
    need.forEach((p) => loaded.add(p));
  }
}
self.onmessage = async (e) => {
  const { id, code, setup, tests, packages, stdin } = e.data;
  let out = "";
  const t0 = performance.now();
  try {
    await ensure(packages);
    // Charge automatiquement les paquets importés par le code (pandas, bcrypt…)
    try {
      await py.loadPackagesFromImports((setup || "") + "\\n" + code, { messageCallback: (m) => postMessage({ kind: "status", text: m }) });
    } catch (e) { /* paquet inconnu : l'erreur d'import s'affichera à l'exécution */ }
    const lines = (stdin || "").split("\\n");
    let li = 0;
    py.setStdin({ stdin: () => (li < lines.length ? lines[li++] : null), autoEOF: true });
    py.setStdout({ batched: (s) => { out += s + "\\n"; } });
    py.setStderr({ batched: (s) => { out += s + "\\n"; } });
    const ns = py.globals.get("dict")();
    let error = null;
    try {
      if (setup) await py.runPythonAsync(setup, { globals: ns });
      await py.runPythonAsync(code, { globals: ns });
    } catch (err) {
      error = cleanTrace(String(err && err.message || err));
    }
    const results = [];
    if (!error) {
      for (const t of tests || []) {
        if (t.stdout !== undefined && t.stdout !== null) {
          const ok = out.includes(t.stdout);
          results.push({ label: t.label, ok, message: ok ? "" : "La sortie attendue « " + t.stdout + " » n'apparaît pas." });
          continue;
        }
        try {
          await py.runPythonAsync(t.code, { globals: ns });
          results.push({ label: t.label, ok: true });
        } catch (err) {
          const msg = cleanTrace(String(err && err.message || err));
          const last = msg.trim().split("\\n").pop();
          results.push({ label: t.label, ok: false, message: last.replace(/^AssertionError:?\\s*/, "") || "Test non vérifié." });
        }
      }
    }
    ns.destroy();
    postMessage({ kind: "done", id, result: { ok: !error, stdout: out, error, tests: results, ms: Math.round(performance.now() - t0) } });
  } catch (err) {
    postMessage({ kind: "done", id, result: { ok: false, stdout: out, error: "Python n'a pas pu démarrer : " + (err && err.message || err) + "\\n(Une connexion Internet est nécessaire au tout premier lancement.)", tests: [], ms: 0 } });
  }
};
function cleanTrace(t) {
  // On retire les lignes internes de Pyodide pour ne garder que l'utile.
  const lines = t.split("\\n");
  const keep = [];
  let skip = false;
  for (const l of lines) {
    if (/File "\\/lib\\/python|_pyodide|pyodide\\/|File "<exec>", line \\d+, in run/.test(l)) { skip = true; continue; }
    if (skip && /^\\s{4}/.test(l)) continue;
    skip = false;
    keep.push(l.replace('File "<exec>"', "Votre code"));
  }
  return keep.join("\\n").trim();
}
self.postMessage({ kind: "ready" });
`;

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (r: PyResult) => void>();
let statusCb: ((s: string) => void) | null = null;
let warm = false;

function getWorker() {
  if (worker) return worker;
  const local = new URL("pyodide/", document.baseURI).toString();
  const url = URL.createObjectURL(new Blob([workerSrc(local)], { type: "text/javascript" }));
  worker = new Worker(url, { type: "module" });
  // Échec de chargement (fichiers absents, réseau…) : on le dit au lieu d'attendre indéfiniment.
  worker.onerror = (e) => {
    e.preventDefault?.();
    const msg = "Python n'a pas pu démarrer : " + (e.message || "chargement impossible") + ". Vérifiez votre connexion pour le tout premier lancement, puis réessayez.";
    for (const [id, cb] of pending) {
      cb({ ok: false, stdout: "", error: msg, tests: [], ms: 0 });
      pending.delete(id);
    }
    worker?.terminate();
    worker = null;
  };
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.kind === "status") statusCb?.(m.text);
    if (m.kind === "done") {
      warm = true;
      pending.get(m.id)?.(m.result);
      pending.delete(m.id);
    }
  };
  return worker;
}

export function pythonWarm() {
  return warm;
}

export function runPython(o: {
  code: string;
  setup?: string;
  tests?: { label: string; code?: string; stdout?: string }[];
  packages?: string[];
  stdin?: string;
  timeoutMs?: number;
  onStatus?: (s: string) => void;
}): Promise<PyResult> {
  const w = getWorker();
  const id = ++seq;
  statusCb = o.onStatus ?? null;
  o.onStatus?.(warm ? "Exécution…" : "Démarrage de Python (première fois : quelques secondes)…");
  return new Promise((resolve) => {
    // Premier lancement : le téléchargement de Pyodide peut être long.
    const limit = o.timeoutMs ?? (warm ? 15_000 : 120_000);
    const timer = setTimeout(() => {
      pending.delete(id);
      worker?.terminate();
      worker = null;
      warm = false;
      resolve({
        ok: false,
        stdout: "",
        error: `Exécution interrompue au bout de ${Math.round(limit / 1000)} s. Boucle infinie (vérifiez la condition d'arrêt de vos « while ») ou code trop lent pour ce volume de données (boucles imbriquées ?).`,
        tests: [],
        ms: limit,
      });
    }, limit);
    pending.set(id, (r) => {
      clearTimeout(timer);
      resolve(r);
    });
    w.postMessage({ id, code: o.code, setup: o.setup, tests: o.tests, packages: o.packages, stdin: o.stdin });
  });
}

export function stopPython() {
  worker?.terminate();
  worker = null;
  warm = false;
  for (const [id, cb] of pending) {
    cb({ ok: false, stdout: "", error: "Exécution arrêtée.", tests: [], ms: 0 });
    pending.delete(id);
  }
}
