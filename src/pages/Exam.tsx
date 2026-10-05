import { useMemo, useState } from "react";
import { useContent } from "../lib/content";
import { addXp, getProgress, updateProgress, awardBadge, getState, setState } from "../lib/store";
import Quiz, { QuizReview, shuffle, type QuizItem, type QuizResult } from "../components/Quiz";

export default function Exam({ packId, mode }: { packId: string; mode: "positionnement" | "blanc" }) {
  const pack = useContent((c) => c.packs.find((p) => p.id === packId));
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [applied, setApplied] = useState(false);

  const items = useMemo<QuizItem[]>(() => {
    if (!pack) return [];
    if (mode === "positionnement") {
      return pack.modules.flatMap((m) =>
        shuffle(m.lessons.flatMap((l) => (l.quiz ?? []).map((q) => ({ ...q, tag: m.title })))).slice(0, 3),
      );
    }
    const pool = pack.modules.flatMap((m) => m.lessons.flatMap((l) => (l.quiz ?? []).map((q) => ({ ...q, tag: l.title }))));
    return shuffle(pool).slice(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, mode, started]);

  if (!pack) return <div className="page"><h1>Domaine introuvable</h1></div>;
  const back = `#/domaine/${pack.id}`;
  const timer = mode === "blanc" ? Math.max(5, Math.round(items.length * 1.25)) : undefined;

  const byModule = result
    ? pack.modules
        .map((m) => {
          const a = result.answers.filter((x) => x.item.tag === m.title);
          return { m, n: a.length, ok: a.filter((x) => x.correct).length };
        })
        .filter((x) => x.n > 0)
    : [];
  const mastered = byModule.filter((x) => x.ok / x.n >= 0.8 && x.m.level < 3);

  function done(r: QuizResult) {
    setResult(r);
    const good = r.answers.filter((a) => a.correct).length;
    addXp(good * 5 + (mode === "blanc" ? 30 : 20), mode === "blanc" ? "Examen blanc" : "Test de positionnement");
    if (r.score === 100) awardBadge("quiz-parfait");
    if (mode === "blanc") {
      // Meilleur score à l'examen blanc : sert à estimer si l'on est prêt pour la certification
      const p = getState().profile;
      const best = Math.max(p.examBest?.[pack!.id] ?? 0, r.score);
      setState({ profile: { ...p, examBest: { ...(p.examBest ?? {}), [pack!.id]: best } } });
    }
  }

  function applyMastered() {
    for (const x of mastered)
      for (const l of x.m.lessons) {
        const k = `${pack!.id}/${l.id}`;
        if (getProgress(k).status === "nouveau") updateProgress(k, { status: "acquis" });
      }
    setApplied(true);
  }

  return (
    <div className="page" style={{ ["--accent" as string]: pack.color }}>
      <a href={back} className="back">
        ← {pack.title}
      </a>
      <h1>{mode === "positionnement" ? "🎯 Test de positionnement" : "📝 Examen blanc"}</h1>
      {!started && !result && (
        <div className="card">
          {mode === "positionnement" ? (
            <p>
              Environ 3 questions par module ({items.length} au total), sans limite de temps. À la fin, les modules que
              vous maîtrisez (80 % et plus) peuvent être marqués comme acquis : vous irez directement à l'essentiel.
              Répondez sans chercher ; « je ne sais pas » vaut mieux qu'un hasard heureux.
            </p>
          ) : (
            <p>
              {items.length} questions tirées au hasard dans tout le domaine, en {timer} minutes. Les corrections
              s'affichent à la fin, comme à un examen.
            </p>
          )}
          <button className="btn btn-big" onClick={() => setStarted(true)} disabled={!items.length}>
            Commencer
          </button>
        </div>
      )}
      {started && !result && <Quiz items={items} mode="examen" timerMin={timer} onDone={done} />}
      {result && (
        <>
          <div className={"score " + (result.score >= 70 ? "ok" : "ko")}>{result.score} %</div>
          {byModule.length > 0 && (
            <div className="card">
              <h3>Résultats par module</h3>
              <ul className="module-scores">
                {byModule.map((x) => (
                  <li key={x.m.id}>
                    <span>{x.m.title}</span>
                    <span className="mini-bar">
                      <span style={{ width: `${(x.ok / x.n) * 100}%` }} />
                    </span>
                    <span>
                      {x.ok}/{x.n}
                    </span>
                  </li>
                ))}
              </ul>
              {mode === "positionnement" && mastered.length > 0 && !applied && (
                <button className="btn" onClick={applyMastered}>
                  Marquer {mastered.length} module{mastered.length > 1 ? "s" : ""} maîtrisé{mastered.length > 1 ? "s" : ""} comme acquis
                </button>
              )}
              {applied && <p className="alert alert-ok">C'est noté. Les leçons restent accessibles pour une révision rapide.</p>}
            </div>
          )}
          <h3>Correction détaillée</h3>
          <QuizReview result={result} />
          <div className="actions-row">
            <button
              className="btn"
              onClick={() => {
                setResult(null);
                setApplied(false);
                setStarted(false);
              }}
            >
              Nouvelle série
            </button>
            <a className="btn btn-ghost" href={back}>
              Retour au domaine
            </a>
          </div>
        </>
      )}
    </div>
  );
}
