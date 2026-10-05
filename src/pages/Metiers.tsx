import { useContent, tracks, flatLessons } from "../lib/content";
import { updateSettings, useStore } from "../lib/store";
import { go } from "../lib/router";

export default function Metiers() {
  const packs = useContent((c) => c.packs);
  const track = useStore((s) => s.settings.track);
  const ts = tracks();
  const metiers = packs.find((p) => p.id === "metiers");

  return (
    <div className="page">
      <h1>🚀 Métiers de demain</h1>
      <p className="muted">
        La donnée et le cloud sont devenus l'infrastructure de toute l'économie : banques, santé, industrie, commerce,
        administrations. L'IA générative accélère encore le besoin de données propres et de plateformes fiables. Voici
        les métiers que vise TechCampus, et comment choisir.
      </p>

      <div className="track-grid">
        {ts.map((t) => (
          <div key={t.id} className={"card track-card static" + (track === t.id ? " chosen" : "")} style={{ ["--accent" as string]: t.color }}>
            <span className="track-icon">{t.icon}</span>
            <strong>{t.title}</strong>
            <span className="small">{t.pitch}</span>
            <ul className="small">
              {t.jobs.map((j) => (
                <li key={j}>{j}</li>
              ))}
            </ul>
            <button
              className="btn btn-small"
              onClick={() => {
                updateSettings({ track: t.id });
                go("/parcours");
              }}
            >
              {track === t.id ? "Voir ma feuille de route" : "Choisir ce parcours"}
            </button>
          </div>
        ))}
      </div>

      <a className="card card-cta orient-cta" href="#/orientation" style={{ ["--accent" as string]: "var(--brand)" }}>
        <p className="eyebrow">🎯 Test d'orientation · 14 questions · 3 minutes</p>
        <h3>Quel métier est fait pour vous ?</h3>
        <p className="small muted">
          Dix métiers comparés à vos goûts et à votre situation, un avis sur le marché et l'avenir à 20 ans, l'exposition à l'IA, la
          durée réaliste de formation, et un plan concret pour optimiser votre employabilité.
        </p>
      </a>

      {metiers && (
        <section className="section card">
          <h2>📚 Pour aller plus loin</h2>
          <p className="small muted">Le domaine « {metiers.title} » détaille chaque métier, les tendances des vingt prochaines années et le marché de l'emploi en France.</p>
          <ul className="ex-list">
            {flatLessons(metiers).map(({ lesson }) => (
              <li key={lesson.id}>
                <a href={`#/lecon/metiers/${lesson.id}`}>
                  <span className="ex-icon">📄</span>
                  <span className="ex-text">
                    <strong>{lesson.title}</strong>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2>Pourquoi chaque domaine compte</h2>
        <div className="outlooks">
          {packs
            .filter((p) => p.outlook)
            .map((p) => (
              <a key={p.id} href={`#/domaine/${p.id}`} className="card outlook" style={{ ["--accent" as string]: p.color }}>
                <strong>
                  {p.icon} {p.title}
                </strong>
                <span className="small">{p.outlook}</span>
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
