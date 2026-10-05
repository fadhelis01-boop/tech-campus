import { useContent, flatLessons, hasContent } from "../lib/content";
import { allCerts } from "../lib/path";
import { getProgress, updateProgress, useStore } from "../lib/store";
import { packStats } from "./Parcours";

const LEVELS = ["", "Niveau 1 · Fondamentaux", "Niveau 2 · Approfondissement", "Niveau 3 · Expert"];
const STATUS_ICON: Record<string, string> = { nouveau: "○", "en-cours": "◐", termine: "●", acquis: "✓" };

export default function Domain({ packId }: { packId: string }) {
  const pack = useContent((c) => c.packs.find((p) => p.id === packId));
  useStore((s) => s.progress);
  if (!pack) return <div className="page"><h1>Domaine introuvable</h1><a href="#/parcours">Retour</a></div>;
  const st = packStats(pack);
  const quizCount = flatLessons(pack).reduce((n, { lesson }) => n + (lesson.quiz?.length ?? 0), 0);
  const isMethodo = pack.branch === "Méthode & carrière";
  const labs = flatLessons(pack).reduce((n, { lesson }) => n + (lesson.exercises?.length ?? 0), 0);

  return (
    <div className="page" style={{ ["--accent" as string]: pack.color }}>
      <a href="#/parcours" className="back">← Parcours</a>
      <header className="domain-head">
        <div className="pack-icon big">{pack.icon}</div>
        <div>
          <p className="eyebrow">{pack.branch}</p>
          <h1>{pack.title}</h1>
          <p className="muted">{pack.description}</p>
          {pack.outlook && <p className="small outlook-line">🚀 {pack.outlook}</p>}
          <p className="small muted">
            À jour au {new Date(pack.updatedAt).toLocaleDateString("fr-FR")} · version {pack.version}
            {pack.origin !== "officiel" && <> · {pack.origin}</>}
          </p>
        </div>
      </header>

      <div className="card progress-card">
        <div className="progress-line">
          <span>
            {st.done} / {st.total} leçons
          </span>
          <span>{st.pct} %</span>
        </div>
        <div className="mini-bar big">
          <span style={{ width: st.pct + "%" }} />
        </div>
        <div className="actions-row">
          {quizCount >= 6 && !isMethodo && (
            <a className="btn btn-ghost" href={`#/examen/${pack.id}/positionnement`}>
              🎯 Test de positionnement
            </a>
          )}
          {quizCount >= 6 && (
            <a className="btn btn-ghost" href={`#/examen/${pack.id}/blanc`}>
              📝 Examen blanc
            </a>
          )}
          {labs > 0 && <span className="pill pill-soft">🧪 {labs} exercices pratiques</span>}
        </div>
        {allCerts().some((c) => c.validates.includes(pack.id)) && (
          <p className="small">
            🎓 Prépare à :{" "}
            {allCerts()
              .filter((c) => c.validates.includes(pack.id))
              .map((c, i) => (
                <span key={c.id}>
                  {i > 0 && " · "}
                  <a href="#/certifications">{c.name}</a>
                </span>
              ))}
          </p>
        )}
        <div className="actions-row">
          {(pack.glossary?.length ?? 0) > 0 && (
            <a className="btn btn-ghost" href={`#/glossaire?d=${pack.id}`}>
              📖 Lexique
            </a>
          )}
          {!isMethodo && (
            <a className="btn btn-ghost" href={`#/veille?d=${pack.id}`}>
              📡 Veille du domaine
            </a>
          )}
        </div>
      </div>

      {[1, 2, 3].map((lvl) => {
        const mods = pack.modules.filter((m) => m.level === lvl);
        if (!mods.length) return null;
        return (
          <section key={lvl} className="section">
            <h2 className="level-title">{LEVELS[lvl]}</h2>
            {mods.map((m) => (
              <div key={m.id} className="card module">
                <h3>{m.title}</h3>
                <p className="muted small">{m.summary}</p>
                <ul className="lesson-list">
                  {m.lessons.map((l) => {
                    const key = `${pack.id}/${l.id}`;
                    const p = getProgress(key);
                    return (
                      <li key={l.id} className={"lesson-row st-" + p.status}>
                        <a href={`#/lecon/${pack.id}/${l.id}`}>
                          <span className="st-icon" aria-label={p.status}>
                            {STATUS_ICON[p.status]}
                          </span>
                          <span className="lesson-title">{l.title}</span>
                          <span className="lesson-meta">
                            {!hasContent(l) && <span className="pill pill-soft" title="Leçon générée à la demande par l'assistant IA">IA</span>}
                            {(l.exercises?.length ?? 0) > 0 && <span title={`${l.exercises!.length} exercice(s) pratique(s)`}>🧪 {l.exercises!.length}</span>}
                            {l.duration ? <span>{l.duration} min</span> : null}
                          </span>
                        </a>
                        {p.status === "nouveau" && (
                          <button
                            className="mini-link"
                            title="Je maîtrise déjà cette leçon"
                            onClick={() => updateProgress(key, { status: "acquis" })}
                          >
                            déjà acquis
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      {pack.changelog?.length ? (
        <section className="section">
          <h2>Historique des mises à jour</h2>
          <ul className="small">
            {pack.changelog.map((c, i) => (
              <li key={i}>
                <strong>{new Date(c.date).toLocaleDateString("fr-FR")}</strong> — {c.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
