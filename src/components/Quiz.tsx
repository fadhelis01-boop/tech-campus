import { useEffect, useMemo, useState } from "react";
import type { Question } from "../lib/types";
import Markdown from "./Markdown";

export interface QuizItem extends Question {
  tag?: string; // module / leçon d'origine
}

export interface QuizResult {
  score: number; // %
  answers: { item: QuizItem; correct: boolean }[];
}

function isCorrect(q: QuizItem, given: number | boolean) {
  return q.type === "vf" ? given === q.answer : given === q.answer;
}

// Mélange les propositions d'un QCM (et recalcule l'index de la bonne
// réponse) pour que la position de la bonne réponse ne s'apprenne pas.
function shuffleChoices(q: QuizItem): QuizItem {
  if (q.type !== "qcm" || !q.choices) return q;
  const order = shuffle(q.choices.map((_, i) => i));
  return { ...q, choices: order.map((i) => q.choices![i]), answer: order.indexOf(q.answer as number) };
}

export default function Quiz(props: {
  items: QuizItem[];
  mode: "entrainement" | "examen";
  timerMin?: number;
  onDone: (r: QuizResult) => void;
}) {
  const { mode } = props;
  const [items] = useState(() => props.items.map(shuffleChoices));
  const [i, setI] = useState(0);
  const [given, setGiven] = useState<(number | boolean | undefined)[]>(() => items.map(() => undefined));
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState((props.timerMin ?? 0) * 60);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!props.timerMin || finished) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [props.timerMin, finished]);

  useEffect(() => {
    if (props.timerMin && left <= 0 && !finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const q = items[i];
  const answered = given[i] !== undefined;

  function choose(v: number | boolean) {
    if (mode === "entrainement" && revealed) return;
    const g = [...given];
    g[i] = v;
    setGiven(g);
    if (mode === "entrainement") setRevealed(true);
  }

  function finish(g = given) {
    setFinished(true);
    const answers = items.map((item, k) => ({ item, correct: g[k] !== undefined && isCorrect(item, g[k]!) }));
    const score = Math.round((answers.filter((a) => a.correct).length / Math.max(1, items.length)) * 100);
    props.onDone({ score, answers });
  }

  function next() {
    setRevealed(false);
    if (i + 1 < items.length) setI(i + 1);
    else finish();
  }

  const choices = useMemo(() => (q?.type === "vf" ? ["Vrai", "Faux"] : (q?.choices ?? [])), [q]);
  if (!q || finished) return null;

  const valueOf = (k: number): number | boolean => (q.type === "vf" ? k === 0 : k);
  const correctIndex = q.type === "vf" ? (q.answer ? 0 : 1) : (q.answer as number);

  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="pill">
          Question {i + 1} / {items.length}
        </span>
        {q.tag && <span className="muted small">{q.tag}</span>}
        {props.timerMin ? (
          <span className={"pill " + (left < 60 ? "pill-warn" : "")}>
            ⏱ {Math.floor(Math.max(0, left) / 60)}:{String(Math.max(0, left) % 60).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <div className="quiz-bar">
        <div style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <h3 className="quiz-q">{q.q}</h3>
      <div className="choices">
        {choices.map((c, k) => {
          const chosen = given[i] === valueOf(k);
          let cls = "choice";
          if (mode === "entrainement" && revealed) {
            if (k === correctIndex) cls += " good";
            else if (chosen) cls += " bad";
          } else if (chosen) cls += " chosen";
          return (
            <button key={k} className={cls} onClick={() => choose(valueOf(k))} disabled={mode === "entrainement" && revealed}>
              <span className="choice-letter">{q.type === "vf" ? (k === 0 ? "V" : "F") : "ABCDEFG"[k]}</span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      {mode === "entrainement" && revealed && (
        <div className={"explain " + (isCorrect(q, given[i]!) ? "ok" : "ko")}>
          <strong>{isCorrect(q, given[i]!) ? "✔ Exact." : "✘ Inexact."}</strong> <Markdown text={q.explain} />
        </div>
      )}
      <div className="quiz-actions">
        {mode === "examen" && i > 0 && (
          <button className="btn btn-ghost" onClick={() => setI(i - 1)}>
            ← Précédente
          </button>
        )}
        <span className="grow" />
        {mode === "examen" && (
          <button className="btn btn-ghost" onClick={() => finish()}>
            Terminer
          </button>
        )}
        <button className="btn" onClick={next} disabled={!answered}>
          {i + 1 < items.length ? "Suivante →" : "Voir le résultat"}
        </button>
      </div>
    </div>
  );
}

export function QuizReview({ result }: { result: QuizResult }) {
  return (
    <div className="quiz-review">
      {result.answers.map(({ item, correct }, k) => {
        const good = item.type === "vf" ? (item.answer ? "Vrai" : "Faux") : item.choices?.[item.answer as number];
        return (
          <details key={k} className={"review-item " + (correct ? "ok" : "ko")}>
            <summary>
              {correct ? "✔" : "✘"} {item.q}
            </summary>
            <p>
              <strong>Bonne réponse :</strong> {good}
            </p>
            <Markdown text={item.explain} />
          </details>
        );
      })}
    </div>
  );
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
