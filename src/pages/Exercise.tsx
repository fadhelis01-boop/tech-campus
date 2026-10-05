import { useEffect, useRef, useState } from "react";
import { useContent, findLesson } from "../lib/content";
import { useStore, setNote, addXp, setState, getState, saveReport, uid, awardBadge } from "../lib/store";
import { aiConfigured, gradeExercise } from "../lib/ai";
import { askAssistant } from "../lib/ask";
import Markdown from "../components/Markdown";
import AiOutput, { NeedKey } from "../components/AiOutput";
import CalcQuiz from "../components/CalcQuiz";
import CodeLab from "../components/CodeLab";
import TerminalView from "../components/TerminalView";
import ConfigLab from "../components/ConfigLab";
import OrderQuiz from "../components/OrderQuiz";
import type { Exercise } from "../lib/types";

export const TYPE_LABEL: Record<string, string> = {
  code: "Labo de code",
  terminal: "Labo terminal",
  config: "Atelier de configuration",
  calcul: "Exercice chiffré",
  ordre: "Remettre dans l'ordre",
  projet: "Projet / cas pratique",
};

export const TYPE_ICON: Record<string, string> = {
  code: "🧪",
  terminal: "⌨️",
  config: "🧩",
  calcul: "🔢",
  ordre: "🔀",
  projet: "🛠️",
};

export function exerciseLabel(ex: Exercise) {
  if (ex.type === "code") return ex.lang === "sql" ? "Labo SQL" : "Labo Python";
  return TYPE_LABEL[ex.type] ?? ex.type;
}

function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [on]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <div className={"timer " + (left < 300 ? "warn" : "")}>
      ⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      <button className="mini-link" onClick={() => setOn(!on)}>
        {on ? "Pause" : left === minutes * 60 ? "Démarrer" : "Reprendre"}
      </button>
      <button
        className="mini-link"
        onClick={() => {
          setOn(false);
          setLeft(minutes * 60);
        }}
      >
        Réinitialiser
      </button>
    </div>
  );
}

export default function ExercisePage({ packId, lessonId, exerciseId }: { packId: string; lessonId: string; exerciseId: string }) {
  useContent((c) => c.packs);
  const found = findLesson(packId, lessonId);
  const ex = found?.lesson.exercises?.find((e) => e.id === exerciseId);
  const key = `${packId}/${lessonId}/${exerciseId}`;
  const draft = useStore((s) => s.notes["ex:" + key] ?? "");
  const passed = useStore((s) => s.profile.labsPassed.includes(key));
  const [hints, setHints] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const [grade, setGrade] = useState<{ text: string; busy: boolean; error?: string; cost?: number } | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const abort = useRef<AbortController | null>(null);

  if (!found || !ex) return <div className="page"><h1>Exercice introuvable</h1><a href="#/parcours">Retour</a></div>;
  const { pack, lesson } = found;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const all = lesson.exercises ?? [];
  const idx = all.findIndex((e) => e.id === ex.id);
  const next = all[idx + 1];
  const auto = ex.type !== "projet";

  function markDone() {
    const p = getState().profile;
    if (p.labsPassed.includes(key)) return;
    setState({ profile: { ...p, exercisesDone: p.exercisesDone + 1, labsPassed: [...p.labsPassed, key] } });
    addXp(ex!.type === "projet" ? 120 : 80, "Exercice réussi");
    awardBadge("premier-exercice");
    if (ex!.type === "terminal") awardBadge("terminal");
    if (ex!.type === "code" && ex!.lang === "python") awardBadge("python");
    if (ex!.type === "code" && ex!.lang === "sql") awardBadge("sql");
    if (ex!.type === "config") awardBadge("config");
  }

  const ctx = `L'élève fait l'exercice « ${ex.title} » (leçon « ${lesson.title} », domaine ${pack.title}).\nÉnoncé :\n${ex.statement}`;

  function askAboutCode(code: string, problem: string) {
    askAssistant(
      `Aide : ${ex!.title}`,
      ctx,
      `Voici mon ${ex!.type === "config" ? "fichier " + (ex!.filename ?? "") : ex!.lang === "sql" ? "requête SQL" : "code Python"} :\n\n\`\`\`${ex!.type === "config" ? ex!.syntax ?? "" : ex!.lang}\n${code}\n\`\`\`\n\nProblème constaté :\n${problem}\n\nExplique-moi simplement ce qui ne va pas et mets-moi sur la piste, SANS me donner la solution complète.`,
    );
  }

  async function correct() {
    if (draft.trim().length < 40) return alert("Rédigez d'abord votre réponse (au moins quelques lignes).");
    setGrade({ text: "", busy: true });
    abort.current = new AbortController();
    try {
      const r = await gradeExercise({
        title: ex!.title,
        statement: ex!.statement,
        rubric: ex!.rubric,
        model: ex!.model,
        answer: draft,
        onText: (t) => setGrade((g) => ({ ...(g ?? { busy: true }), text: t })),
        signal: abort.current.signal,
      });
      setGrade({ text: r.text, busy: false, cost: r.cost });
      saveReport({ id: uid(), kind: "correction", title: `Correction : ${ex!.title}`, text: r.text, at: Date.now() });
      markDone();
    } catch (e) {
      setGrade({ text: "", busy: false, error: (e as Error).message });
    }
  }

  return (
    <div className="page exercise" style={{ ["--accent" as string]: pack.color }}>
      <a className="back" href={`#/lecon/${pack.id}/${lesson.id}`}>
        ← {lesson.title}
      </a>
      <p className="eyebrow">
        {TYPE_ICON[ex.type]} {exerciseLabel(ex)}
        {passed && <span className="pill pill-ok">✓ Réussi</span>}
      </p>
      <h1>{ex.title}</h1>
      {ex.timerMin ? <Timer minutes={ex.timerMin} /> : null}

      <section className="card">
        <h2>Énoncé</h2>
        <Markdown text={ex.statement} />
      </section>

      {ex.hints?.length ? (
        <section className="card hints-card">
          <h2>💡 Coups de pouce</h2>
          {ex.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="hint">
              <Markdown text={`**${i + 1}.** ${h}`} />
            </div>
          ))}
          {hints < ex.hints.length && (
            <button className="btn btn-ghost btn-small" onClick={() => setHints(hints + 1)}>
              Afficher un indice ({hints + 1}/{ex.hints.length})
            </button>
          )}
        </section>
      ) : null}

      <section className="card lab-card">
        {ex.type === "code" && (
          <CodeLab
            lang={ex.lang ?? "python"}
            storageKey={"code:" + key}
            starter={ex.starter}
            setup={ex.setup}
            tests={ex.tests}
            solution={ex.solution}
            ordered={ex.ordered}
            packages={ex.packages}
            stdin={ex.stdin}
            onPass={markDone}
            onAskAi={askAboutCode}
          />
        )}
        {ex.type === "terminal" && (
          <TerminalView
            storageKey={"term:" + key}
            files={ex.files}
            prepare={ex.prepare}
            tasks={ex.tasks}
            onAllDone={markDone}
            onAskAi={(t) =>
              askAssistant(`Aide : ${ex.title}`, ctx, `Je suis bloqué dans le terminal. Voici mes dernières commandes et leurs résultats :\n\n\`\`\`\n${t}\n\`\`\`\n\nObjectifs : ${(ex.tasks ?? []).map((x) => x.label).join(" ; ")}\n\nExplique-moi ce qui se passe et quelle direction prendre, sans me donner toutes les commandes d'un coup.`)
            }
          />
        )}
        {ex.type === "config" && <ConfigLab ex={ex} storageKey={"cfg:" + key} onPass={markDone} onAskAi={askAboutCode} />}
        {ex.type === "calcul" && ex.questions?.length ? <CalcQuiz questions={ex.questions} onAllSolved={markDone} /> : null}
        {ex.type === "ordre" && ex.items?.length ? <OrderQuiz items={ex.items} onSolved={markDone} /> : null}
        {ex.type === "projet" && (
          <>
            <h2>Votre réponse</h2>
            <textarea
              className="copy"
              rows={14}
              value={draft}
              onChange={(e) => setNote("ex:" + key, e.target.value)}
              placeholder="Rédigez ici (enregistrement automatique) : schéma en mots, choix techniques et leurs raisons, étapes, risques…"
            />
            <p className="small muted">{words} mots</p>
          </>
        )}
      </section>

      {(ex.model || ex.solution || ex.type === "projet") && (
        <section className="card">
          <h2>{auto ? "Corrigé commenté" : "Correction"}</h2>
          <p className="small muted">
            {auto
              ? "Cherchez vraiment avant d'ouvrir le corrigé : c'est en butant sur un problème qu'on apprend le plus. Même réussi, lisez-le : il montre souvent une façon plus élégante de faire."
              : "Comparez votre réponse au corrigé, ou faites-la corriger par l'assistant."}
          </p>
          <div className="actions-row">
            {!auto && aiConfigured() && (
              <button className="btn" onClick={correct} disabled={grade?.busy}>
                🧑‍🏫 Faire corriger ma réponse (≈ 0,05 à 0,20 $)
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setShowModel(!showModel)}>
              {showModel ? "Masquer le corrigé" : "📗 Voir le corrigé"}
            </button>
          </div>
          {!auto && !aiConfigured() && (
            <details>
              <summary className="small">Correction personnalisée par l'IA</summary>
              <NeedKey />
            </details>
          )}
          {grade && <AiOutput text={grade.text} busy={grade.busy} error={grade.error} cost={grade.cost} status="Correction en cours…" />}
          {showModel && (
            <div className="model-answer">
              {ex.solution && <Markdown text={"**Solution de référence**\n\n```" + (ex.type === "config" ? ex.syntax ?? "" : ex.lang ?? "") + "\n" + ex.solution.trim() + "\n```"} />}
              {ex.model && <Markdown text={ex.model} />}
            </div>
          )}
          {ex.rubric?.length ? (
            <div className="rubric">
              <h3>Grille d'auto-évaluation</h3>
              {ex.rubric.map((r, i) => (
                <label key={i} className="check">
                  <input type="checkbox" checked={!!checks[i]} onChange={(e) => setChecks({ ...checks, [i]: e.target.checked })} />
                  <span>{r}</span>
                </label>
              ))}
              <p className="small">
                {Object.values(checks).filter(Boolean).length} / {ex.rubric.length} critères remplis
              </p>
              {!grade && !passed && (
                <button className="btn btn-ghost btn-small" onClick={markDone}>
                  J'ai terminé cet exercice
                </button>
              )}
            </div>
          ) : null}
        </section>
      )}

      <nav className="prev-next">
        <a href={`#/lecon/${pack.id}/${lesson.id}`}>← Retour à la leçon</a>
        {next ? (
          <a href={`#/exercice/${pack.id}/${lesson.id}/${next.id}`} className="next">
            <span>{next.title}</span> →
          </a>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
