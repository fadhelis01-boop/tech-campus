import { useEffect, useRef, useState } from "react";
import { useContent, findLesson, getLessonBody, saveGeneratedLesson, deleteGeneratedLesson, flatLessons } from "../lib/content";
import {
  useStore,
  getProgress,
  updateProgress,
  setState,
  completeLesson,
  addXp,
  addCards,
  setNote,
  awardBadge,
  saveChat,
  saveReport,
  uid,
  toast,
} from "../lib/store";
import { collectBlocks, blockText } from "../lib/markdown";
import { useTts, loadAndPlay, pause, jumpTo, updateBlocks, setRate, setVoice } from "../lib/tts";
import { aiConfigured, generateLesson, generateQuiz, checkLessonCurrency } from "../lib/ai";
import { dbGet, dbSet, dbDel } from "../lib/db";
import Markdown from "../components/Markdown";
import Quiz, { QuizReview, shuffle, type QuizResult } from "../components/Quiz";
import { TYPE_ICON, exerciseLabel } from "./Exercise";
import AiOutput, { NeedKey } from "../components/AiOutput";
import { go } from "../lib/router";
import type { Flashcard, Question } from "../lib/types";

const LEVEL = ["", "Fondamentaux", "Approfondissement", "Expert"];

export default function LessonPage({ packId, lessonId }: { packId: string; lessonId: string }) {
  useContent((c) => c.packs);
  const found = findLesson(packId, lessonId);
  const key = `${packId}/${lessonId}`;
  const progress = useStore((s) => s.progress[key]) ?? { status: "nouveau", block: 0 };
  const note = useStore((s) => s.notes[key] ?? "");
  const labsPassed = useStore((s) => s.profile.labsPassed);
  const ttsKey = useTts((t) => t.key);
  const ttsIndex = useTts((t) => t.index);
  const ttsPlaying = useTts((t) => t.playing);
  const ttsSupported = useTts((t) => t.supported);
  const rate = useStore((s) => s.settings.ttsRate);
  const voice = useStore((s) => s.settings.ttsVoice);

  const [body, setBody] = useState<string | null | undefined>(undefined);
  const [generated, setGenerated] = useState(false);
  const [genText, setGenText] = useState("");
  const [genBusy, setGenBusy] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [genError, setGenError] = useState("");
  const [extra, setExtra] = useState<{ quiz: Question[]; flashcards: Flashcard[] } | null>(null);
  const [quizRun, setQuizRun] = useState<{ items: Question[] } | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [check, setCheck] = useState<{ text: string; busy: boolean; status: string; sources?: { url: string; title: string }[]; cost?: number; error?: string } | null>(null);
  const [showResume, setShowResume] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLElement[]>([]);
  const abort = useRef<AbortController | null>(null);

  // Chargement du contenu
  useEffect(() => {
    if (!found) return;
    let alive = true;
    setBody(undefined);
    setQuizResult(null);
    setQuizRun(null);
    setCheck(null);
    getLessonBody(found.pack, found.lesson).then((r) => {
      if (!alive) return;
      setBody(r?.body ?? null);
      setGenerated(!!r?.generated);
    });
    dbGet<{ quiz: Question[]; flashcards: Flashcard[] }>(`genq:${key}`).then((x) => alive && setExtra(x ?? null));
    const p = getProgress(key);
    setShowResume(p.block > 2 && p.status !== "termine");
    setState({ lastLesson: key });
    updateProgress(key, { lastOpened: Date.now() });
    return () => {
      alive = false;
      abort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, !!found]);

  // Indexation des blocs + suivi de lecture
  useEffect(() => {
    if (!body || !ref.current) return;
    const blocks = collectBlocks(ref.current);
    blocksRef.current = blocks;
    blocks.forEach((b, i) => (b.dataset.b = String(i)));
    updateBlocks(key, blocks.map(blockText));
    let lastSaved = -1;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.b));
        if (!visible.length) return;
        const top = Math.min(...visible);
        if (top !== lastSaved && top > 0) {
          lastSaved = top;
          updateProgress(key, { block: top });
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [body, key]);

  // Surlignage du paragraphe lu
  useEffect(() => {
    blocksRef.current.forEach((b) => b.classList.remove("speaking"));
    if (ttsKey !== key) return;
    const el = blocksRef.current[ttsIndex];
    if (el) {
      el.classList.add("speaking");
      if (ttsPlaying) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [ttsIndex, ttsKey, key, ttsPlaying, body]);

  if (!found) return <div className="page"><h1>Leçon introuvable</h1><a href="#/parcours">Retour</a></div>;
  const { pack, module, lesson } = found;
  const all = flatLessons(pack);
  const idx = all.findIndex((x) => x.lesson.id === lesson.id);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const quiz = lesson.quiz?.length ? lesson.quiz : (extra?.quiz ?? []);
  const cards = lesson.flashcards?.length ? lesson.flashcards : (extra?.flashcards ?? []);
  const level = lesson.level ?? module.level;

  function listen(from: number) {
    const blocks = blocksRef.current.map(blockText);
    if (!blocks.length) return;
    pause();
    setRate(rate);
    setVoice(voice);
    loadAndPlay({ key, title: lesson.title, href: `#/lecon/${pack.id}/${lesson.id}`, blocks, start: from });
    setShowResume(false);
  }

  function scrollToBlock(i: number) {
    blocksRef.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setShowResume(false);
  }

  async function generate() {
    setGenBusy(true);
    setGenError("");
    setGenText("");
    abort.current = new AbortController();
    try {
      const r = await generateLesson({
        packTitle: pack.title,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        level,
        outline: lesson.outline,
        objectives: lesson.objectives,
        onText: setGenText,
        onStatus: setGenStatus,
        signal: abort.current.signal,
      });
      const stamp = `\n\n---\n*Leçon rédigée par l'assistant IA le ${new Date().toLocaleDateString("fr-FR")} à partir des sources officielles consultées${
        r.sources.length ? " :\n" + r.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join("\n") : "."
      }*`;
      const full = r.text + stamp;
      await saveGeneratedLesson(pack.id, lesson.id, full);
      setBody(full);
      setGenerated(true);
      setGenStatus("Création du quiz et des cartes…");
      try {
        const q = await generateQuiz(lesson.title, r.text);
        await dbSet(`genq:${key}`, q);
        setExtra(q);
      } catch {
        /* le quiz est facultatif */
      }
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenBusy(false);
    }
  }

  async function regenerate() {
    if (!confirm("Supprimer la version générée et en rédiger une nouvelle ?")) return;
    await deleteGeneratedLesson(pack.id, lesson.id);
    await dbDel(`genq:${key}`);
    setExtra(null);
    setBody(null);
    setGenerated(false);
  }

  async function runCheck() {
    if (!body) return;
    setCheck({ text: "", busy: true, status: "Vérification sur les sources officielles…" });
    abort.current = new AbortController();
    try {
      const r = await checkLessonCurrency({
        title: lesson.title,
        updatedAt: lesson.updatedAt ?? pack.updatedAt,
        body,
        onText: (t) => setCheck((c) => ({ ...(c ?? { busy: true, status: "" }), text: t })),
        onStatus: (s) => setCheck((c) => ({ ...(c ?? { busy: true, text: "" }), status: s })),
        signal: abort.current.signal,
      });
      setCheck({ text: r.text, busy: false, status: "", sources: r.sources, cost: r.cost });
      saveReport({ id: uid(), kind: "actualite", title: `Actualité : ${lesson.title}`, text: r.text, sources: r.sources, at: Date.now() });
    } catch (e) {
      setCheck({ text: "", busy: false, status: "", error: (e as Error).message });
    }
  }

  function askAbout() {
    if (!aiConfigured()) return go("/assistant");
    const id = uid();
    saveChat({
      id,
      title: `À propos : ${lesson.title}`,
      messages: [],
      context: `L'utilisateur étudie la leçon « ${lesson.title} » (${pack.title} › ${module.title}).`,
      updatedAt: Date.now(),
    });
    go("/assistant/" + id);
  }

  function onQuizDone(r: QuizResult) {
    setQuizResult(r);
    setQuizRun(null);
    const good = r.answers.filter((a) => a.correct).length;
    if (good) addXp(good * 10, `${good} bonne${good > 1 ? "s" : ""} réponse${good > 1 ? "s" : ""}`);
    updateProgress(key, { quizBest: Math.max(progress.quizBest ?? 0, r.score) });
    if (r.score === 100 && r.answers.length >= 4) awardBadge("quiz-parfait");
    if (r.score >= 70) completeLesson(key);
  }

  function addFlashcards() {
    const n = addCards(cards.map((c, i) => ({ id: `${key}#${i}`, q: c.q, a: c.a, source: pack.title })));
    toast(n ? `${n} carte${n > 1 ? "s" : ""} ajoutée${n > 1 ? "s" : ""} à vos révisions` : "Ces cartes sont déjà dans vos révisions");
  }

  const listeningHere = ttsKey === key;

  return (
    <article className="page lesson" style={{ ["--accent" as string]: pack.color }}>
      <nav className="crumbs">
        <a href={`#/domaine/${pack.id}`}>
          {pack.icon} {pack.title}
        </a>
        <span>›</span>
        <span>{module.title}</span>
      </nav>
      <header className="lesson-head">
        <h1>{lesson.title}</h1>
        <div className="lesson-tags">
          <span className="pill">{LEVEL[level]}</span>
          {lesson.duration ? <span className="pill pill-soft">⏱ {lesson.duration} min</span> : null}
          <span className="pill pill-soft">À jour au {new Date(lesson.updatedAt ?? pack.updatedAt).toLocaleDateString("fr-FR")}</span>
          {progress.status === "termine" && <span className="pill pill-ok">✓ Terminée</span>}
          {generated && <span className="pill pill-warn">Rédigée par l'IA — à vérifier</span>}
        </div>
        {lesson.objectives?.length ? (
          <div className="objectives">
            <strong>Objectifs</strong>
            <ul>
              {lesson.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      {body && (
        <div className="lesson-toolbar">
          {ttsSupported &&
            (listeningHere && ttsPlaying ? (
              <button className="btn" onClick={pause}>
                ⏸ Pause
              </button>
            ) : (
              <button className="btn" onClick={() => listen(listeningHere ? ttsIndex : (progress.audioBlock ?? 0) > 0 ? progress.audioBlock! : 0)}>
                🎧 {(progress.audioBlock ?? 0) > 0 || listeningHere ? "Reprendre l'écoute" : "Écouter la leçon"}
              </button>
            ))}
          {ttsSupported && ((progress.audioBlock ?? 0) > 0 || listeningHere) && (
            <button className="btn btn-ghost" onClick={() => listen(0)}>
              ⟲ Écouter depuis le début
            </button>
          )}
          <button className="btn btn-ghost" onClick={askAbout}>
            🤖 Poser une question
          </button>
          {aiConfigured() && (
            <button className="btn btn-ghost" onClick={runCheck} disabled={check?.busy}>
              📡 Vérifier l'actualité
            </button>
          )}
        </div>
      )}

      {showResume && body && (
        <div className="card resume">
          <span>Vous vous étiez arrêté au paragraphe {progress.block + 1}.</span>
          <div className="actions-row">
            <button className="btn btn-small" onClick={() => scrollToBlock(progress.block)}>
              Reprendre la lecture
            </button>
            <button
              className="btn btn-small btn-ghost"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                updateProgress(key, { block: 0, audioBlock: 0 });
                setShowResume(false);
              }}
            >
              Recommencer depuis le début
            </button>
          </div>
        </div>
      )}

      {check && (
        <div className="card">
          <h3>Vérification de l'actualité de la leçon</h3>
          <AiOutput {...check} />
        </div>
      )}

      {body === undefined && <div className="spinner" />}

      {body === null && (
        <div className="card generate">
          <h3>Cette leçon n'est pas encore rédigée</h3>
          <p className="muted">
            Le programme est fixé ; le contenu se rédige à la demande par l'assistant, qui vérifie les versions et les
            commandes dans la documentation officielle. Une fois rédigée, la leçon est conservée sur votre appareil,
            lisible et écoutable hors connexion.
          </p>
          {lesson.outline?.length ? (
            <>
              <strong>Plan prévu</strong>
              <ol>
                {lesson.outline.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ol>
            </>
          ) : null}
          {!aiConfigured() ? (
            <NeedKey />
          ) : genBusy || genText ? (
            <>
              <AiOutput text={genText} busy={genBusy} status={genStatus} error={genError} />
              {genBusy && (
                <button className="btn btn-ghost" onClick={() => abort.current?.abort()}>
                  Arrêter
                </button>
              )}
            </>
          ) : (
            <>
              {genError && <div className="alert alert-error">{genError}</div>}
              <button className="btn" onClick={generate}>
                ✍️ Rédiger cette leçon (≈ 0,15 à 0,40 $)
              </button>
            </>
          )}
        </div>
      )}

      {body && (
        <div
          onClick={(e) => {
            if (!listeningHere) return;
            const t = e.target as HTMLElement;
            if (t.closest("a")) return;
            const b = t.closest<HTMLElement>("[data-b]");
            if (b) jumpTo(Number(b.dataset.b));
          }}
        >
          <Markdown ref={ref} text={body} className="lesson-body" />
        </div>
      )}

      {body && generated && (
        <p className="small muted">
          <button className="mini-link" onClick={regenerate}>
            Régénérer cette leçon
          </button>
        </p>
      )}

      {lesson.docs?.length ? (
        <section className="section card">
          <h2>📚 Documentation officielle</h2>
          <p className="small muted">Savoir lire la doc est la compétence n° 1 d'un professionnel : prenez l'habitude d'y jeter un œil.</p>
          <ul className="refs">
            {lesson.docs.map((d, i) => (
              <li key={i}>
                <a href={d.url} target="_blank" rel="noopener">
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {body && quiz.length > 0 && (
        <section className="section card">
          <h2>🎯 Testez-vous</h2>
          {quizRun ? (
            <Quiz items={quizRun.items} mode="entrainement" onDone={onQuizDone} />
          ) : quizResult ? (
            <>
              <div className={"score " + (quizResult.score >= 70 ? "ok" : "ko")}>
                {quizResult.score} %{" "}
                <small>{quizResult.score >= 70 ? "— leçon validée" : "— relisez les points manqués puis réessayez"}</small>
              </div>
              <QuizReview result={quizResult} />
              <button className="btn" onClick={() => setQuizRun({ items: shuffle(quiz) })}>
                Recommencer
              </button>
            </>
          ) : (
            <>
              <p className="muted">
                {quiz.length} questions. 70 % de bonnes réponses valident la leçon.
                {progress.quizBest !== undefined && <> Meilleur score : {progress.quizBest} %.</>}
              </p>
              <button className="btn" onClick={() => setQuizRun({ items: shuffle(quiz) })}>
                Commencer le quiz
              </button>
            </>
          )}
        </section>
      )}

      {body && cards.length > 0 && (
        <section className="section card">
          <h2>🧠 Cartes de révision</h2>
          <p className="muted">
            {cards.length} cartes à mémoriser, revues ensuite au bon moment (répétition espacée).
          </p>
          <details>
            <summary>Aperçu</summary>
            <ul className="small">
              {cards.map((c, i) => (
                <li key={i}>
                  <strong>{c.q}</strong> — {c.a}
                </li>
              ))}
            </ul>
          </details>
          <button className="btn" onClick={addFlashcards}>
            Ajouter à mes révisions
          </button>
        </section>
      )}

      {lesson.exercises?.length ? (
        <section className="section card practice">
          <h2>🧪 Pratiquer</h2>
          <p className="small muted">On n'apprend vraiment qu'en faisant : chaque exercice se corrige automatiquement, directement ici.</p>
          <ul className="ex-list">
            {lesson.exercises.map((ex) => {
              const ok = labsPassed.includes(`${pack.id}/${lesson.id}/${ex.id}`);
              return (
                <li key={ex.id} className={ok ? "done" : ""}>
                  <a href={`#/exercice/${pack.id}/${lesson.id}/${ex.id}`}>
                    <span className="ex-icon" aria-hidden="true">
                      {ok ? "✅" : TYPE_ICON[ex.type]}
                    </span>
                    <span className="ex-text">
                      <strong>{ex.title}</strong>
                      <span className="muted small">
                        {exerciseLabel(ex)}
                        {ex.timerMin ? ` · ${ex.timerMin} min` : ""}
                        {ok ? " · réussi" : ""}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {body && (
        <section className="section card">
          <h2>🗒️ Mes notes</h2>
          <textarea
            className="notes"
            value={note}
            onChange={(e) => setNote(key, e.target.value)}
            placeholder="Vos remarques, exemples tirés de votre pratique, points à approfondir… (enregistrement automatique)"
            rows={4}
          />
        </section>
      )}

      {body && progress.status !== "termine" && (
        <div className="center">
          <button className="btn btn-big" onClick={() => completeLesson(key)}>
            ✓ Marquer la leçon comme terminée
          </button>
        </div>
      )}

      <nav className="prev-next">
        {prev ? (
          <a href={`#/lecon/${pack.id}/${prev.lesson.id}`}>
            ← <span>{prev.lesson.title}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`#/lecon/${pack.id}/${next.lesson.id}`} className="next">
            <span>{next.lesson.title}</span> →
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
