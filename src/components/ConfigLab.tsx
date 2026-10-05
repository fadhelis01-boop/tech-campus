import { useState } from "react";
import CodeEditor from "./CodeEditor";
import { checkConfig, type ConfigResult } from "../lib/configcheck";
import { useStore, setDraft } from "../lib/store";
import type { Exercise } from "../lib/types";

// Atelier de configuration : l'élève écrit un Dockerfile, un manifeste
// Kubernetes, un workflow GitHub Actions, du Terraform… ; chaque critère
// est vérifié automatiquement (syntaxe puis contenu).
export default function ConfigLab(props: { ex: Exercise; storageKey: string; onPass?: () => void; onAskAi?: (text: string, problem: string) => void }) {
  const { ex } = props;
  const saved = useStore((s) => s.drafts[props.storageKey]);
  const text = saved ?? ex.starter ?? "";
  const [res, setRes] = useState<ConfigResult | null>(null);

  function verify() {
    const r = checkConfig(ex, text);
    setRes(r);
    if (!r.syntaxError && r.results.every((x) => x.ok)) props.onPass?.();
  }

  const failed = res ? [res.syntaxError, ...res.results.filter((r) => !r.ok).map((r) => "Critère non rempli : " + r.label)].filter(Boolean).join("\n") : "";

  return (
    <div className="lab">
      <div className="file-tab">📄 {ex.filename ?? "fichier"}</div>
      <CodeEditor
        value={text}
        onChange={(v) => setDraft(props.storageKey, v === (ex.starter ?? "") ? null : v)}
        onRun={verify}
        lang={ex.syntax ?? "text"}
        minRows={12}
        label={"Contenu de " + (ex.filename ?? "fichier")}
      />
      <div className="actions-row lab-actions">
        <button className="btn btn-ok" onClick={verify}>
          ✓ Vérifier
        </button>
        <button className="btn btn-ghost" onClick={() => confirm("Revenir au contenu de départ ?") && setDraft(props.storageKey, null)}>
          ⟲ Réinitialiser
        </button>
        <span className="small muted kbd-hint">Ctrl+Entrée : vérifier</span>
      </div>
      {res && (
        <div className="lab-output">
          {res.syntaxError && <div className="alert alert-error">{res.syntaxError}</div>}
          <ul className="tests">
            {res.results.map((r, i) => (
              <li key={i} className={r.ok ? "ok" : "ko"}>
                {r.ok ? "✔" : "✘"} {r.label}
                {!r.ok && r.hint && <div className="small">💡 {r.hint}</div>}
              </li>
            ))}
          </ul>
          {!res.syntaxError && res.results.every((r) => r.ok) && <div className="alert alert-ok">🎉 Tous les critères sont remplis. Bravo !</div>}
          {failed && props.onAskAi && (
            <button className="btn btn-ghost btn-small" onClick={() => props.onAskAi!(text, failed)}>
              🤖 Expliquer ce qui ne va pas (assistant)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
