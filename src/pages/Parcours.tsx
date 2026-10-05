import { useContent, flatLessons, hasContent, tracks } from "../lib/content";
import { getProgress, useStore, updateSettings } from "../lib/store";
import { trackProgress, certById, certReadiness } from "../lib/path";
import type { Pack } from "../lib/types";

export function packStats(p: Pack) {
  const ls = flatLessons(p);
  const done = ls.filter(({ lesson }) => ["termine", "acquis"].includes(getProgress(`${p.id}/${lesson.id}`).status)).length;
  const written = ls.filter(({ lesson }) => hasContent(lesson)).length;
  const labs = ls.reduce((n, { lesson }) => n + (lesson.exercises?.length ?? 0), 0);
  return { total: ls.length, done, written, labs, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
}

export function PackCard({ p, compact }: { p: Pack; compact?: boolean }) {
  useStore((s) => s.progress);
  const st = packStats(p);
  return (
    <a href={`#/domaine/${p.id}`} className={"card pack-card" + (compact ? " compact" : "")} style={{ ["--accent" as string]: p.color }}>
      <div className="pack-icon">{p.icon}</div>
      <div className="pack-body">
        <h3>{p.title}</h3>
        {!compact && <p className="muted small">{p.description}</p>}
        <div className="pack-meta">
          <span>
            {st.done}/{st.total} leçons
          </span>
          {st.labs > 0 && <span>🧪 {st.labs} exercices</span>}
          {p.origin !== "officiel" && <span className="pill pill-soft">{p.origin}</span>}
          {st.written < st.total && (
            <span className="pill pill-soft" title="Les autres leçons se rédigent avec l'assistant IA">
              ✍️ {st.written} rédigées
            </span>
          )}
        </div>
        <div className="mini-bar">
          <span style={{ width: st.pct + "%" }} />
        </div>
      </div>
    </a>
  );
}

const BRANCH_ORDER = ["Méthode & carrière", "Socle", "Data", "Cloud & DevOps", "Sécurité & IA", "Autres domaines"];

export default function Parcours() {
  const packs = useContent((c) => c.packs);
  const trackId = useStore((s) => s.settings.track);
  useStore((s) => s.progress);
  const certs = useStore((s) => s.certs);
  const ts = tracks();
  const track = ts.find((t) => t.id === trackId);
  const tp = track ? trackProgress(track) : null;
  const branches = [...new Set(packs.map((p) => p.branch))].sort((a, b) => (BRANCH_ORDER.indexOf(a) + 1 || 99) - (BRANCH_ORDER.indexOf(b) + 1 || 99));

  return (
    <div className="page">
      <h1>🧭 Parcours</h1>
      {ts.length > 0 && (
        <div className="seg seg-wrap" role="tablist" aria-label="Parcours métier">
          {ts.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === trackId} className={t.id === trackId ? "active" : ""} onClick={() => updateSettings({ track: t.id })}>
              {t.icon} {t.title}
            </button>
          ))}
        </div>
      )}

      {track && tp ? (
        <>
          <div className="card track-head" style={{ ["--accent" as string]: track.color }}>
            <p className="eyebrow">Feuille de route</p>
            <h2>
              {track.icon} {track.title}
            </h2>
            <p>{track.pitch}</p>
            <p className="small muted">Métiers visés : {track.jobs.join(" · ")}</p>
            <div className="progress-line">
              <span>
                {tp.done} / {tp.total} leçons
              </span>
              <span>{tp.pct} %</span>
            </div>
            <div className="mini-bar big">
              <span style={{ width: tp.pct + "%" }} />
            </div>
          </div>

          <ol className="roadmap">
            {tp.steps.map((s, i) => (
              <li key={i} className={s.pct === 100 ? "done" : s.done > 0 ? "doing" : ""}>
                <div className="roadmap-marker" aria-hidden="true">
                  {s.pct === 100 ? "✓" : i + 1}
                </div>
                <div className="roadmap-body">
                  <h3>
                    {s.title} {s.months ? <span className="pill pill-soft">≈ {s.months} mois</span> : null}
                  </h3>
                  {s.note && <p className="small muted">{s.note}</p>}
                  {s.milestones?.length ? (
                    <div className="milestones">
                      {s.milestones.map((id) => {
                        const c = certById(id);
                        if (!c) return null;
                        const st = certs[id]?.status;
                        return (
                          <a key={id} href="#/certifications" className={"milestone" + (st === "obtenue" ? " won" : "")}>
                            <span className="ms-icon">{st === "obtenue" ? "🎓" : "🏅"}</span>
                            <span className="grow">
                              <span className="small muted">Jalon de certification{st ? " · " + ({ visee: "visée", preparation: "en préparation", planifiee: "examen planifié", obtenue: "obtenue" } as Record<string, string>)[st] : ""}</span>
                              <strong>{c.name}</strong>
                            </span>
                            <span className="small">{st === "obtenue" ? "✓" : `prêt à ${certReadiness(c).pct} %`}</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="pack-grid">
                    {s.packList.map((p) => (
                      <PackCard key={p.id} p={p} compact />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {track.projects?.length ? (
            <section className="section card">
              <h2>🛠️ Projets de portfolio à réaliser</h2>
              <p className="small muted">
                Ce sont eux qui convaincront un recruteur : publiez-les sur GitHub avec un README soigné (voir Méthode &
                astuces).
              </p>
              <ol>
                {track.projects.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </section>
          ) : null}

          <a className="card card-cta" href="#/certifications" style={{ ["--accent" as string]: "var(--gold)" }}>
            <p className="eyebrow">🎓 Certifications</p>
            <h3>Suivre mes certifications et générer mon bloc CV</h3>
            <p className="small muted">Tarifs, format d'examen, financement CPF, état de préparation, liens officiels.</p>
          </a>
        </>
      ) : (
        <div className="card notice">
          <strong>Choisissez un parcours ci-dessus</strong> pour obtenir une feuille de route ordonnée, ou{" "}
          <a href="#/metiers">découvrez d'abord les métiers</a>.
        </div>
      )}

      <h2 className="section">Tous les domaines</h2>
      {branches.map((b) => (
        <section key={b} className="section">
          <h3 className="branch-title">{b}</h3>
          <div className="pack-grid">
            {packs
              .filter((p) => p.branch === b)
              .map((p) => (
                <PackCard key={p.id} p={p} />
              ))}
          </div>
        </section>
      ))}
      <section className="section">
        <a className="card add-domain" href="#/contenus">
          ➕ <strong>Ajouter un domaine</strong> (Rust, Go, FinOps, Snowflake, cybersécurité offensive…) — import d'un
          fichier ou création assistée par l'IA, sans programmation.
        </a>
      </section>
    </div>
  );
}
