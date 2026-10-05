import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import { runPython, stopPython, type PyResult } from "../lib/python";
import { runSql, checkSql, describe, type SqlRun, type SqlCheck, type SqlTable } from "../lib/sqlrun";
import { useStore, setDraft } from "../lib/store";
import type { CodeTest } from "../lib/types";

// Laboratoire de code : Python (Pyodide) ou SQL (SQLite), avec tests
// automatiques. Le brouillon est enregistré au fil de la frappe : on
// retrouve son code en revenant, même après avoir fermé l'application.

export interface CodeLabProps {
  lang: "python" | "sql";
  storageKey: string;
  starter?: string;
  setup?: string;
  tests?: CodeTest[];
  solution?: string;
  ordered?: boolean;
  packages?: string[];
  stdin?: string;
  onPass?: () => void;
  onAskAi?: (code: string, problem: string) => void;
}

export function ResultTable({ t, max = 200 }: { t: SqlTable; max?: number }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {t.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.slice(0, max).map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j} className={v === null ? "null" : typeof v === "number" ? "num" : ""}>
                  {v === null ? "NULL" : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">
        {t.rows.length} ligne{t.rows.length > 1 ? "s" : ""}
        {t.rows.length > max ? ` (${max} affichées)` : ""}
      </p>
    </div>
  );
}

export default function CodeLab(p: CodeLabProps) {
  const saved = useStore((s) => s.drafts[p.storageKey]);
  const code = saved ?? p.starter ?? "";
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [py, setPy] = useState<PyResult | null>(null);
  const [sql, setSql] = useState<SqlRun | null>(null);
  const [check, setCheck] = useState<SqlCheck | null>(null);
  const [schema, setSchema] = useState<Awaited<ReturnType<typeof describe>> | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [stdin, setStdin] = useState(p.stdin ?? "");
  const usesInput = p.lang === "python" && /\binput\s*\(/.test(code);

  useEffect(() => {
    if (p.lang === "sql" && p.setup) describe(p.setup).then(setSchema).catch(() => setSchema([]));
    setPy(null);
    setSql(null);
    setCheck(null);
  }, [p.lang, p.setup, p.storageKey]);

  const setCode = (v: string) => setDraft(p.storageKey, v === (p.starter ?? "") ? null : v);

  async function run(verify: boolean) {
    setBusy(true);
    setCheck(null);
    try {
      if (p.lang === "python") {
        const r = await runPython({ code, setup: p.setup, tests: verify ? p.tests : [], packages: p.packages, stdin, onStatus: setStatus });
        setPy(r);
        if (verify && r.ok && r.tests.length && r.tests.every((t) => t.ok)) p.onPass?.();
      } else {
        if (verify && p.solution) {
          const c = await checkSql(p.setup ?? "", code, p.solution, p.ordered);
          setCheck(c);
          setSql(c.user ?? null);
          if (c.ok) p.onPass?.();
        } else setSql(await runSql(p.setup ?? "", code));
      }
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  const canVerify = p.lang === "python" ? !!p.tests?.length : !!p.solution;
  const problem =
    p.lang === "python"
      ? py?.error ?? (py?.tests.filter((t) => !t.ok).map((t) => `Test échoué : ${t.label} — ${t.message ?? ""}`).join("\n") || "")
      : sql?.error ?? (check && !check.ok ? check.message : "");

  return (
    <div className="lab">
      {p.lang === "sql" && schema && schema.length > 0 && (
        <div className="lab-schema">
          <button className="mini-link" onClick={() => setShowSchema(!showSchema)}>
            🗂️ {showSchema ? "Masquer" : "Voir"} les tables ({schema.map((t) => t.name).join(", ")})
          </button>
          {showSchema && (
            <div className="schema-grid">
              {schema.map((t) => (
                <div key={t.name} className="schema-table">
                  <strong>{t.name}</strong> <span className="muted small">({t.count} lignes)</span>
                  <ul>
                    {t.columns.map((c) => (
                      <li key={c.name}>
                        <code>{c.name}</code> <span className="muted small">{c.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CodeEditor value={code} onChange={setCode} onRun={() => run(false)} lang={p.lang} label={p.lang === "python" ? "Code Python" : "Requête SQL"} />

      {usesInput && (
        <label className="stdin">
          <span className="small muted">Entrées pour input() (une par ligne)</span>
          <textarea rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} />
        </label>
      )}

      <div className="actions-row lab-actions">
        <button className="btn" onClick={() => run(false)} disabled={busy}>
          ▶ Exécuter
        </button>
        {canVerify && (
          <button className="btn btn-ok" onClick={() => run(true)} disabled={busy}>
            ✓ Vérifier
          </button>
        )}
        {busy && p.lang === "python" && (
          <button className="btn btn-ghost" onClick={() => stopPython()}>
            ■ Arrêter
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (confirm("Revenir au code de départ ? Votre version sera effacée.")) setDraft(p.storageKey, null);
          }}
        >
          ⟲ Réinitialiser
        </button>
        <span className="small muted kbd-hint">Ctrl+Entrée : exécuter</span>
      </div>

      {(busy || status) && (
        <div className="lab-status">
          <span className="spinner small-spinner" /> {status || "Exécution…"}
        </div>
      )}

      {p.lang === "python" && py && (
        <div className="lab-output">
          <div className="console" aria-live="polite">
            {py.stdout && <pre>{py.stdout}</pre>}
            {py.error && <pre className="console-err">{py.error}</pre>}
            {!py.stdout && !py.error && <pre className="muted">(aucune sortie — utilisez print() pour afficher)</pre>}
          </div>
          {py.tests.length > 0 && (
            <ul className="tests">
              {py.tests.map((t, i) => (
                <li key={i} className={t.ok ? "ok" : "ko"}>
                  {t.ok ? "✔" : "✘"} {t.label}
                  {!t.ok && t.message && <div className="small">{t.message}</div>}
                </li>
              ))}
            </ul>
          )}
          {py.tests.length > 0 && py.tests.every((t) => t.ok) && <div className="alert alert-ok">🎉 Tous les tests passent. Exercice réussi !</div>}
          <p className="small muted">Exécuté en {py.ms} ms</p>
        </div>
      )}

      {p.lang === "sql" && sql && (
        <div className="lab-output">
          {check && <div className={"alert " + (check.ok ? "alert-ok" : "alert-error")}>{check.ok ? "🎉 " : ""}{check.message}</div>}
          {sql.error && !check && <pre className="console-err">{sql.error}</pre>}
          {sql.ok && sql.tables.length === 0 && <p className="small muted">Requête exécutée{sql.changes ? ` : ${sql.changes} ligne(s) modifiée(s)` : ""} (aucun tableau à afficher).</p>}
          {sql.tables.map((t, i) => (
            <ResultTable key={i} t={t} />
          ))}
          {check && !check.ok && check.expected && (
            <>
              <button className="mini-link" onClick={() => setShowExpected(!showExpected)}>
                {showExpected ? "Masquer" : "Comparer avec"} le résultat attendu
              </button>
              {showExpected && <ResultTable t={check.expected} max={20} />}
            </>
          )}
        </div>
      )}

      {problem && p.onAskAi && (
        <button className="btn btn-ghost btn-small" onClick={() => p.onAskAi!(code, problem)}>
          🤖 Expliquer mon erreur (assistant)
        </button>
      )}
    </div>
  );
}
