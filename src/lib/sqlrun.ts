// Exécution de SQL dans le navigateur avec sql.js (SQLite en WebAssembly,
// ≈ 650 Ko, embarqué dans l'application : fonctionne hors connexion).
// La correction compare le résultat de la requête de l'élève à celui de la
// requête de référence, exécutée sur une base identique.
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

let SQL: Promise<SqlJsStatic> | null = null;
const engine = () => (SQL ??= initSqlJs({ locateFile: () => wasmUrl }));

export interface SqlTable {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface SqlRun {
  ok: boolean;
  tables: SqlTable[]; // un tableau par instruction SELECT
  error?: string;
  changes: number; // lignes modifiées par INSERT/UPDATE/DELETE
  ms: number;
}

type Cell = string | number | null | Uint8Array;
const norm = (v: Cell): string | number | null => (v instanceof Uint8Array ? `<${v.length} octets>` : v);

export async function openDb(setup = ""): Promise<Database> {
  const S = await engine();
  const db = new S.Database();
  if (setup.trim()) db.exec(setup);
  return db;
}

export async function runSql(setup: string, query: string, db?: Database): Promise<SqlRun> {
  const t0 = performance.now();
  const own = !db;
  const base = db ?? (await openDb(setup));
  try {
    const res = base.exec(query);
    return {
      ok: true,
      tables: res.map((r) => ({ columns: r.columns, rows: r.values.map((row) => row.map(norm)) })),
      changes: base.getRowsModified(),
      ms: Math.round(performance.now() - t0),
    };
  } catch (e) {
    return { ok: false, tables: [], error: translate((e as Error).message), changes: 0, ms: Math.round(performance.now() - t0) };
  } finally {
    if (own) base.close();
  }
}

// Schéma de la base (pour l'onglet « Tables »)
export async function describe(setup: string): Promise<{ name: string; columns: { name: string; type: string }[]; count: number }[]> {
  const db = await openDb(setup);
  try {
    const t = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const names = (t[0]?.values ?? []).map((r) => String(r[0]));
    return names.map((name) => {
      const cols = db.exec(`PRAGMA table_info("${name}")`)[0]?.values ?? [];
      const count = Number(db.exec(`SELECT COUNT(*) FROM "${name}"`)[0]?.values[0][0] ?? 0);
      return { name, columns: cols.map((c) => ({ name: String(c[1]), type: String(c[2] || "") })), count };
    });
  } finally {
    db.close();
  }
}

const same = (a: string | number | null, b: string | number | null) => {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
  if (a !== null && b !== null && !isNaN(Number(a)) && !isNaN(Number(b)) && String(a).trim() !== "" && String(b).trim() !== "")
    return Math.abs(Number(a) - Number(b)) < 1e-6 * Math.max(1, Math.abs(Number(b)));
  return false;
};

export interface SqlCheck {
  ok: boolean;
  message: string;
  user?: SqlRun;
  expected?: SqlTable;
}

// Compare la DERNIÈRE table produite par chaque requête.
export async function checkSql(setup: string, userQuery: string, solution: string, ordered = false): Promise<SqlCheck> {
  const user = await runSql(setup, userQuery);
  const ref = await runSql(setup, solution);
  const expected = ref.tables.at(-1);
  if (!user.ok) return { ok: false, message: "Votre requête contient une erreur : " + user.error, user, expected };
  if (!expected) {
    // Exercice d'écriture (INSERT/UPDATE/CREATE) : on compare l'état final des tables.
    return compareState(setup, userQuery, solution, user);
  }
  const got = user.tables.at(-1);
  if (!got) return { ok: false, message: "Votre requête ne renvoie aucun résultat (il manque un SELECT ?).", user, expected };
  if (got.columns.length !== expected.columns.length)
    return {
      ok: false,
      message: `Votre résultat a ${got.columns.length} colonne(s), ${expected.columns.length} attendue(s) (${expected.columns.join(", ")}).`,
      user,
      expected,
    };
  if (got.rows.length !== expected.rows.length)
    return { ok: false, message: `Votre résultat a ${got.rows.length} ligne(s), ${expected.rows.length} attendue(s).`, user, expected };
  const key = (r: (string | number | null)[]) => JSON.stringify(r.map((v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v)));
  const rowsEq = (a: (string | number | null)[], b: (string | number | null)[]) => a.every((v, i) => same(v, b[i]));
  if (ordered) {
    const bad = got.rows.findIndex((r, i) => !rowsEq(r, expected.rows[i]));
    if (bad >= 0) {
      const asSet = [...got.rows].sort((a, b) => key(a).localeCompare(key(b)));
      const exSet = [...expected.rows].sort((a, b) => key(a).localeCompare(key(b)));
      const sameSet = asSet.every((r, i) => rowsEq(r, exSet[i]));
      return {
        ok: false,
        message: sameSet
          ? "Les bonnes lignes sont là, mais pas dans l'ordre demandé (vérifiez ORDER BY et le sens ASC/DESC)."
          : `La ligne ${bad + 1} ne correspond pas au résultat attendu.`,
        user,
        expected,
      };
    }
  } else {
    const remaining = [...expected.rows];
    for (const r of got.rows) {
      const i = remaining.findIndex((e) => rowsEq(r, e));
      if (i === -1) return { ok: false, message: `La ligne ${JSON.stringify(r)} ne figure pas dans le résultat attendu.`, user, expected };
      remaining.splice(i, 1);
    }
  }
  return { ok: true, message: "Résultat exact. Bravo !", user, expected };
}

async function compareState(setup: string, userQuery: string, solution: string, user: SqlRun): Promise<SqlCheck> {
  const a = await openDb(setup);
  const b = await openDb(setup);
  try {
    a.exec(userQuery);
    b.exec(solution);
    const dump = (db: Database) => {
      const names = (db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]?.values ?? []).map((r) => String(r[0]));
      return names.map((n) => {
        const r = db.exec(`SELECT * FROM "${n}"`)[0];
        const cols = (db.exec(`PRAGMA table_info("${n}")`)[0]?.values ?? []).map((c) => String(c[1]).toLowerCase());
        const rows = (r?.values ?? []).map((row) => JSON.stringify(row.map(norm))).sort();
        return { n, cols, rows };
      });
    };
    const A = dump(a);
    const B = dump(b);
    for (const t of B) {
      const u = A.find((x) => x.n.toLowerCase() === t.n.toLowerCase());
      if (!u) return { ok: false, message: `La table « ${t.n} » n'existe pas après votre requête.`, user };
      if (u.cols.join() !== t.cols.join())
        return { ok: false, message: `Les colonnes de « ${t.n} » ne sont pas celles attendues (${t.cols.join(", ")}).`, user };
      if (u.rows.length !== t.rows.length)
        return { ok: false, message: `La table « ${t.n} » contient ${u.rows.length} ligne(s), ${t.rows.length} attendue(s).`, user };
      if (u.rows.join() !== t.rows.join()) return { ok: false, message: `Le contenu de « ${t.n} » ne correspond pas au résultat attendu.`, user };
    }
    return { ok: true, message: "Les tables sont exactement dans l'état attendu. Bravo !", user };
  } catch (e) {
    return { ok: false, message: translate((e as Error).message), user };
  } finally {
    a.close();
    b.close();
  }
}

// Messages d'erreur SQLite les plus fréquents, traduits et expliqués.
function translate(m: string): string {
  const rules: [RegExp, (x: RegExpMatchArray) => string][] = [
    [/no such table: (\S+)/, (x) => `la table « ${x[1]} » n'existe pas (faute de frappe ? consultez l'onglet Tables).`],
    [/no such column: (\S+)/, (x) => `la colonne « ${x[1]} » n'existe pas (faute de frappe, ou alias de table manquant).`],
    [/near "([^"]+)": syntax error/, (x) => `erreur de syntaxe près de « ${x[1]} » (virgule en trop ou manquante, mot-clé mal placé ?).`],
    [/incomplete input/, () => "requête incomplète (parenthèse ou guillemet non fermé ?)."],
    [/ambiguous column name: (\S+)/, (x) => `la colonne « ${x[1]} » existe dans plusieurs tables : précisez laquelle (ex. c.${x[1]}).`],
    [/misuse of aggregate/, () => "fonction d'agrégat mal utilisée (un filtre sur un agrégat se fait avec HAVING, pas WHERE)."],
    [/UNIQUE constraint failed: (\S+)/, (x) => `doublon refusé : ${x[1]} doit être unique.`],
    [/NOT NULL constraint failed: (\S+)/, (x) => `${x[1]} ne peut pas être vide (NOT NULL).`],
    [/FOREIGN KEY constraint failed/, () => "clé étrangère invalide : la ligne référencée n'existe pas."],
    [/(\d+) values for (\d+) columns/, (x) => `${x[1]} valeurs fournies pour ${x[2]} colonnes.`],
  ];
  for (const [re, f] of rules) {
    const x = m.match(re);
    if (x) return f(x) + `\n(message d'origine : ${m})`;
  }
  return m;
}
