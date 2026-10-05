// Vérifie TOUS les exercices pratiques en les exécutant réellement :
//  - SQL      : la solution s'exécute ; le code de départ ne suffit pas ;
//  - Python   : la solution passe tous les tests ; le code de départ en échoue au moins un ;
//  - terminal : les commandes de référence atteignent tous les objectifs, qui ne sont pas atteints au départ ;
//  - config   : la solution remplit tous les critères ; le fichier de départ non.
// Usage : npm run content:check (après npm run content)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Shell } from "../src/lib/shell/shell";
import { checkConfig } from "../src/lib/configcheck";
import { loadPyodide } from "pyodide";
import initSqlJs from "sql.js";
import type { Exercise, Manifest, Pack } from "../src/lib/types";

const require = createRequire(import.meta.url);
const errors: string[] = [];
let checked = 0;

const manifest: Manifest = JSON.parse(readFileSync("public/content/manifest.json", "utf8"));
const only = process.argv[2]; // npm run content:check -- linux

async function main() {
  const SQL = await initSqlJs({ locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm") });
  const py = await loadPyodide();
  const loaded = new Set<string>();

  const runSql = (setup: string, q: string) => {
    const db = new SQL.Database();
    try {
      if (setup) db.exec(setup);
      const r = db.exec(q);
      const dump = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0]?.values.map((x) => String(x[0])) ?? [];
      const state = dump.map((t) => JSON.stringify(db.exec(`SELECT * FROM "${t}"`)[0]?.values ?? [])).join("|");
      return { ok: true, last: JSON.stringify(r.at(-1)?.values ?? null), cols: r.at(-1)?.columns.length ?? 0, state, rows: r.at(-1)?.values.length ?? 0 };
    } catch (e) {
      return { ok: false, err: (e as Error).message, last: "", state: "", cols: 0, rows: 0 };
    } finally {
      db.close();
    }
  };

  async function runPy(ex: Exercise, code: string) {
    await py.loadPackagesFromImports((ex.setup ?? "") + "\n" + code + "\n" + (ex.tests ?? []).map((t) => t.code ?? "").join("\n"));
    const pk = (ex.packages ?? []).filter((p) => !loaded.has(p));
    if (pk.length) {
      await py.loadPackage(pk);
      pk.forEach((p) => loaded.add(p));
    }
    let out = "";
    const lines = (ex.stdin ?? "").split("\n");
    let li = 0;
    py.setStdin({ stdin: () => (li < lines.length ? lines[li++] : null), autoEOF: true } as never);
    py.setStdout({ batched: (s: string) => (out += s + "\n") });
    py.setStderr({ batched: (s: string) => (out += s + "\n") });
    const ns = py.globals.get("dict")();
    try {
      if (ex.setup) await py.runPythonAsync(ex.setup, { globals: ns });
      await py.runPythonAsync(code, { globals: ns });
    } catch (e) {
      ns.destroy();
      return { error: String((e as Error).message).split("\n").slice(-3).join(" "), fails: ex.tests?.length ?? 0, out };
    }
    let fails = 0;
    const msgs: string[] = [];
    for (const t of ex.tests ?? []) {
      if (t.stdout !== undefined) {
        if (!out.includes(t.stdout)) {
          fails++;
          msgs.push(`${t.label} (sortie « ${t.stdout} » absente)`);
        }
        continue;
      }
      try {
        await py.runPythonAsync(t.code ?? "", { globals: ns });
      } catch (e) {
        fails++;
        msgs.push(`${t.label} : ${String((e as Error).message).split("\n").filter(Boolean).at(-1)}`);
      }
    }
    ns.destroy();
    return { fails, msgs, out };
  }

  for (const entry of manifest.packs) {
    if (only && entry.id !== only) continue;
    const pack: Pack = JSON.parse(readFileSync("public/content/" + entry.file, "utf8"));
    for (const m of pack.modules)
      for (const l of m.lessons)
        for (const ex of l.exercises ?? []) {
          const where = `${pack.id}/${l.id}/${ex.id}`;
          checked++;
          try {
            if (ex.type === "code" && ex.lang === "sql") {
              const sol = runSql(ex.setup ?? "", ex.solution ?? "");
              if (!sol.ok) errors.push(`${where} : la solution SQL échoue — ${sol.err}`);
              else if (sol.last === "null" && sol.state === runSql(ex.setup ?? "", "SELECT 1").state) errors.push(`${where} : la solution ne produit ni résultat ni changement`);
              if (ex.starter?.trim()) {
                const st = runSql(ex.setup ?? "", ex.starter);
                if (st.ok && st.last === sol.last && st.state === sol.state) errors.push(`${where} : le code de départ donne déjà le bon résultat`);
              }
            } else if (ex.type === "code") {
              const sol = await runPy(ex, ex.solution ?? "");
              if (!ex.solution) errors.push(`${where} : solution Python manquante`);
              else if ("error" in sol && sol.error) errors.push(`${where} : la solution plante — ${sol.error}`);
              else if (sol.fails) errors.push(`${where} : la solution échoue à ${sol.fails} test(s) — ${(sol as { msgs: string[] }).msgs.join(" ; ")}`);
              if (ex.starter !== undefined) {
                const st = await runPy(ex, ex.starter);
                if (!("error" in st && st.error) && st.fails === 0) errors.push(`${where} : le code de départ passe déjà tous les tests`);
              }
            } else if (ex.type === "terminal") {
              const sh = new Shell();
              if (ex.files) sh.seed(ex.files);
              if (ex.prepare?.length) sh.prepare(ex.prepare);
              const before = (ex.tasks ?? []).map((t) => sh.check(t.check));
              if (before.length && before.every(Boolean)) errors.push(`${where} : objectifs déjà atteints au départ`);
              if (!ex.commands?.length) errors.push(`${where} : commandes de référence (commands) manquantes`);
              const outs: string[] = [];
              // Comme dans l'interface : un objectif atteint en cours de route reste acquis.
              const after = (ex.tasks ?? []).map(() => false);
              for (const c of ex.commands ?? []) {
                const r = sh.exec(c);
                if (r.edit) errors.push(`${where} : la solution ne doit pas utiliser l'éditeur (« ${c} »)`);
                outs.push(`$ ${c}\n${r.out}`);
                (ex.tasks ?? []).forEach((t, i) => (after[i] = after[i] || sh.check(t.check)));
              }
              after.forEach((ok, i) => {
                if (!ok) errors.push(`${where} : objectif non atteint par la solution — « ${ex.tasks![i].label} »\n    ${outs.slice(-4).join("\n    ").slice(0, 900)}`);
              });
            } else if (ex.type === "config") {
              const sol = checkConfig(ex, ex.solution ?? "");
              if (!ex.solution) errors.push(`${where} : solution manquante`);
              if (sol.syntaxError) errors.push(`${where} : la solution a une erreur de syntaxe — ${sol.syntaxError}`);
              sol.results.forEach((r) => !r.ok && errors.push(`${where} : la solution ne remplit pas « ${r.label} »`));
              const st = checkConfig(ex, ex.starter ?? "");
              if (!st.syntaxError && st.results.every((r) => r.ok)) errors.push(`${where} : le fichier de départ remplit déjà tous les critères`);
            } else if (ex.type === "ordre") {
              if (new Set(ex.items).size !== ex.items!.length) errors.push(`${where} : éléments en double`);
            }
          } catch (e) {
            errors.push(`${where} : exception — ${(e as Error).message}`);
          }
        }
  }
  console.log(`${checked} exercices vérifiés.`);
  if (errors.length) {
    console.error(`ERREURS (${errors.length}) :\n- ` + errors.join("\n- "));
    process.exit(1);
  }
  console.log("Tous les exercices sont cohérents (solutions valides, points de départ non résolus).");
}

void main();
