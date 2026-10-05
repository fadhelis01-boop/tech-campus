import { useState } from "react";
import type { CalcQuestion } from "../lib/types";
import Markdown from "./Markdown";

// « 1 234,5 », « 1234.5 », « 12 % » → nombre
export function parseAmount(v: string): number | null {
  const t = v.replace(/[\s  %€$]/g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return isFinite(n) ? n : null;
}

// Exercice chiffré : réponses numériques corrigées automatiquement.
export default function CalcQuiz(props: { questions: CalcQuestion[]; onAllSolved: () => void }) {
  const { questions } = props;
  const [values, setValues] = useState<string[]>(() => questions.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [reveal, setReveal] = useState(false);

  const isOk = (i: number) => {
    const v = parseAmount(values[i]);
    return v !== null && Math.abs(v - questions[i].answer) <= (questions[i].tolerance ?? 0.01);
  };

  function verify() {
    setChecked(true);
    if (questions.every((_, i) => isOk(i))) props.onAllSolved();
  }

  return (
    <div className="calc">
      {questions.map((q, i) => (
        <div key={i} className={"calc-q " + (checked ? (isOk(i) ? "ok" : "ko") : "")}>
          <Markdown text={`**${i + 1}.** ${q.q}`} />
          <div className="row">
            <input
              inputMode="decimal"
              value={values[i]}
              onChange={(e) => {
                const v = [...values];
                v[i] = e.target.value;
                setValues(v);
                setChecked(false);
              }}
              placeholder="Votre réponse"
              aria-label={`Réponse ${i + 1}`}
            />
            {q.unit && <span className="muted">{q.unit}</span>}
            {checked && <span>{isOk(i) ? "✔" : "✘"}</span>}
          </div>
          {(reveal || (checked && isOk(i))) && (
            <div className="explain">
              <strong>Réponse : {q.answer.toLocaleString("fr-FR")} {q.unit ?? ""}</strong>
              <Markdown text={q.explain} />
            </div>
          )}
        </div>
      ))}
      <div className="actions-row">
        <button className="btn" onClick={verify}>
          Vérifier mes réponses
        </button>
        <button className="btn btn-ghost" onClick={() => setReveal(!reveal)}>
          {reveal ? "Masquer les corrigés" : "Voir tous les corrigés"}
        </button>
      </div>
    </div>
  );
}
