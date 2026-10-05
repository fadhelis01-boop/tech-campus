import { useState } from "react";
import { useContent, tracks, flatLessons } from "../lib/content";
import { updateSettings, useStore } from "../lib/store";
import { go } from "../lib/router";

// Mini-questionnaire d'orientation : chaque réponse penche vers la data
// ou vers le cloud/DevOps. Ce n'est qu'une indication : les deux voies
// partagent un large socle commun (Linux, Git, Python, SQL, cloud).
const QUESTIONS: { q: string; a: [string, string] }[] = [
  { q: "Ce qui vous attire le plus…", a: ["Faire parler des données, construire des chiffres fiables pour décider", "Construire et faire tourner des systèmes solides, automatisés, qui tiennent la charge"] },
  { q: "Un problème idéal…", a: ["Pourquoi les ventes de ce rapport ne collent-elles pas avec la comptabilité ?", "Pourquoi le site est-il devenu lent depuis la dernière mise en production ?"] },
  { q: "Votre outil préféré, a priori…", a: ["SQL et Python : interroger, transformer, modéliser", "Le terminal, Docker, Kubernetes : déployer, automatiser"] },
  { q: "Vos interlocuteurs…", a: ["Analystes, data scientists, métiers (finance, marketing)", "Développeurs, équipes d'exploitation, sécurité"] },
  { q: "Les astreintes (être joignable la nuit en cas de panne)…", a: ["Je préfère les éviter autant que possible", "Ça ne me dérange pas, j'aime réparer dans l'urgence"] },
];

export default function Metiers() {
  const packs = useContent((c) => c.packs);
  const track = useStore((s) => s.settings.track);
  const [answers, setAnswers] = useState<(0 | 1 | null)[]>(QUESTIONS.map(() => null));
  const ts = tracks();
  const metiers = packs.find((p) => p.id === "metiers");
  const complete = answers.every((a) => a !== null);
  const dataScore = answers.filter((a) => a === 0).length;
  const suggestion = complete ? (dataScore >= 3 ? "data-engineer" : "cloud-devops") : null;
  const sugTrack = ts.find((t) => t.id === suggestion);

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

      <section className="section card">
        <h2>🧭 Petit test d'orientation</h2>
        <p className="small muted">Cinq questions, sans bonne ni mauvaise réponse. Choisissez ce qui vous ressemble le plus.</p>
        {QUESTIONS.map((q, i) => (
          <fieldset key={i} className="orient">
            <legend>{q.q}</legend>
            {q.a.map((a, k) => (
              <label key={k} className={"choice" + (answers[i] === k ? " selected" : "")}>
                <input
                  type="radio"
                  name={"o" + i}
                  checked={answers[i] === k}
                  onChange={() => {
                    const n = [...answers];
                    n[i] = k as 0 | 1;
                    setAnswers(n);
                  }}
                />
                <span>{a}</span>
              </label>
            ))}
          </fieldset>
        ))}
        {sugTrack && (
          <div className="alert alert-ok">
            <strong>
              Votre profil penche vers : {sugTrack.icon} {sugTrack.title}
            </strong>{" "}
            ({dataScore}/5 réponses « data »). Rassurez-vous : les six premiers mois sont communs aux deux parcours (Linux,
            Git, Python, SQL, réseaux, cloud), et beaucoup de professionnels passent de l'un à l'autre.
            <div className="actions-row">
              <button
                className="btn btn-small"
                onClick={() => {
                  updateSettings({ track: sugTrack.id });
                  go("/parcours");
                }}
              >
                Suivre ce parcours
              </button>
            </div>
          </div>
        )}
      </section>

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
