import { useState } from "react";
import { useStore, rankOf, today, getProgress, updateSettings } from "../lib/store";
import { useContent, findLesson, flatLessons, tracks } from "../lib/content";
import { isDue } from "../lib/srs";
import { isIos, isStandalone, usePwa, promptInstall } from "../lib/pwa";
import { go } from "../lib/router";
import { currentTrack, nextLesson, trackProgress, nextMilestone, certReadiness } from "../lib/path";

function greeting(name: string) {
  const h = new Date().getHours();
  const g = h < 6 ? "Bonsoir" : h < 18 ? "Bonjour" : "Bonsoir";
  return name ? `${g}, ${name}` : g;
}

// Premier lancement : choisir son objectif en deux clics.
function Welcome() {
  const ts = tracks();
  const [name, setName] = useState("");
  return (
    <div className="page welcome">
      <div className="welcome-hero">
        <div className="welcome-mark" aria-hidden="true">
          &gt;_
        </div>
        <h1>Bienvenue sur TechCampus</h1>
        <p className="lead">
          De zéro à data engineer ou ingénieur cloud/DevOps : des cours écrits et audio, des exercices pratiques corrigés
          automatiquement (Python, SQL, terminal Linux, Git, Docker, Kubernetes…), et un assistant qui répond à vos
          questions avec ses sources.
        </p>
      </div>
      <section className="card">
        <label>
          Comment souhaitez-vous qu'on vous appelle ? <span className="muted small">(facultatif)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre prénom" autoComplete="given-name" />
        </label>
      </section>
      <h2>Quel métier visez-vous ?</h2>
      <div className="track-grid">
        {ts.map((t) => (
          <button
            key={t.id}
            className="card track-card"
            style={{ ["--accent" as string]: t.color }}
            onClick={() => {
              updateSettings({ track: t.id, name: name.trim() });
              go("/parcours");
            }}
          >
            <span className="track-icon">{t.icon}</span>
            <strong>{t.title}</strong>
            <span className="small muted">{t.pitch}</span>
            <span className="small">{t.jobs.slice(0, 4).join(" · ")}</span>
          </button>
        ))}
      </div>
      <p className="center">
        <button
          className="btn btn-ghost"
          onClick={() => {
            updateSettings({ name: name.trim(), track: "indecis" });
            go("/orientation");
          }}
        >
          🎯 Je ne sais pas encore : faire le test d'orientation (3 minutes)
        </button>
      </p>
      <p className="small muted center">Vous pourrez changer d'objectif à tout moment dans les Réglages.</p>
    </div>
  );
}

export default function Home() {
  const s = useStore((x) => x);
  const packs = useContent((c) => c.packs);
  const { canInstall } = usePwa();
  const [q, setQ] = useState("");

  if (!s.settings.track && !Object.keys(s.progress).length && tracks().length) return <Welcome />;

  const rank = rankOf(s.profile.xp);
  const minutesToday = s.profile.days[today()] ?? 0;
  const goalPct = Math.min(100, Math.round((minutesToday / s.settings.dailyGoal) * 100));
  const due = Object.values(s.srs).filter((c) => isDue(c)).length;
  const last = s.lastLesson ? findLesson(...(s.lastLesson.split("/") as [string, string])) : null;
  const lastProg = last ? getProgress(s.lastLesson) : null;
  const next = nextLesson(s.lastLesson);
  const track = currentTrack();
  const tp = track ? trackProgress(track) : null;
  const ms = nextMilestone();

  const total = packs.reduce((n, p) => n + flatLessons(p).length, 0);
  const done = Object.values(s.progress).filter((p) => p.status === "termine" || p.status === "acquis").length;

  const week = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(Date.now() - (6 - k) * 86_400_000);
    const key = d.toLocaleDateString("sv-SE");
    return { key, label: d.toLocaleDateString("fr-FR", { weekday: "narrow" }), min: s.profile.days[key] ?? 0 };
  });

  return (
    <div className="page home">
      <header className="hero">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{greeting(s.settings.name)}</h1>
          <p className="muted">
            {rank.title} · {s.profile.xp} XP
            {s.profile.streak > 0 && <> · 🔥 {s.profile.streak} jour{s.profile.streak > 1 ? "s" : ""}</>}
          </p>
          <div className="rank-bar" title={rank.next ? `Prochain grade : ${rank.next.title}` : "Grade maximal"}>
            <div style={{ width: rank.pct + "%" }} />
          </div>
        </div>
        <div className="goal-ring" style={{ ["--p" as string]: goalPct }} aria-label={`Objectif du jour : ${goalPct} %`}>
          <span>
            {minutesToday}
            <small>/{s.settings.dailyGoal} min</small>
          </span>
        </div>
      </header>

      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go("/recherche?q=" + encodeURIComponent(q.trim()));
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une notion, une commande, un exercice…" aria-label="Rechercher" />
        <button className="btn" aria-label="Lancer la recherche">
          🔎
        </button>
      </form>

      {!isStandalone() && (canInstall || isIos()) && (
        <div className="card notice">
          <strong>📲 Installez TechCampus</strong> pour l'utiliser comme une application, même hors connexion.
          {canInstall ? (
            <button className="btn btn-small" onClick={promptInstall}>
              Installer
            </button>
          ) : (
            <p className="small">Sur iPhone/iPad : bouton Partager ⬆️ puis « Sur l'écran d'accueil ».</p>
          )}
        </div>
      )}

      <div className="grid-2">
        {last && lastProg && lastProg.status !== "termine" && lastProg.status !== "acquis" ? (
          <a className="card card-cta" href={`#/lecon/${last.pack.id}/${last.lesson.id}`} style={{ ["--accent" as string]: last.pack.color }}>
            <p className="eyebrow">▶ Reprendre là où vous vous êtes arrêté</p>
            <h3>{last.lesson.title}</h3>
            <p className="muted small">
              {last.pack.icon} {last.pack.title} · {last.module.title}
            </p>
          </a>
        ) : next ? (
          <a className="card card-cta" href={`#/lecon/${next.pack.id}/${next.lesson.id}`} style={{ ["--accent" as string]: next.pack.color }}>
            <p className="eyebrow">✨ Prochaine leçon de votre parcours</p>
            <h3>{next.lesson.title}</h3>
            <p className="muted small">
              {next.pack.icon} {next.pack.title} · {next.module.title}
            </p>
          </a>
        ) : null}

        <a className="card card-cta" href="#/revisions" style={{ ["--accent" as string]: "#7c3aed" }}>
          <p className="eyebrow">🧠 Révisions espacées</p>
          <h3>{due ? `${due} carte${due > 1 ? "s" : ""} à revoir` : "Rien à revoir pour l'instant"}</h3>
          <p className="muted small">{Object.keys(s.srs).length} cartes dans votre paquet</p>
        </a>
      </div>

      {track && tp && (
        <a className="card track-progress" href="#/parcours" style={{ ["--accent" as string]: track.color }}>
          <div className="section-head">
            <span>
              <span className="eyebrow">Mon parcours</span>
              <strong>
                {track.icon} {track.title}
              </strong>
            </span>
            <span className="big-pct">{tp.pct} %</span>
          </div>
          <div className="steps-mini">
            {tp.steps.map((st, i) => (
              <span key={i} className={"step-dot " + (st.pct === 100 ? "done" : st.done > 0 ? "doing" : "")} title={`${st.title} : ${st.pct} %`} />
            ))}
          </div>
        </a>
      )}

      {ms && (
        <a className="card milestone-home" href="#/certifications">
          <span className="ms-icon">🏅</span>
          <span className="grow">
            <span className="eyebrow">Prochain jalon de certification</span>
            <strong>{ms.cert.name}</strong>
            <span className="small muted">{ms.cert.vendor} · {ms.cert.price}</span>
          </span>
          <span className="big-pct">{certReadiness(ms.cert).pct} %</span>
        </a>
      )}

      <section className="section">
        <h2>Accès rapides</h2>
        <div className="quick">
          <a href="#/labo/python" className="quick-item">
            <span>🐍</span>Labo Python
          </a>
          <a href="#/labo/sql" className="quick-item">
            <span>🗄️</span>Labo SQL
          </a>
          <a href="#/labo/terminal" className="quick-item">
            <span>⌨️</span>Terminal
          </a>
          <a href="#/assistant" className="quick-item">
            <span>🤖</span>Poser une question
          </a>
          <a href="#/domaine/methode" className="quick-item">
            <span>🧭</span>Méthode & astuces
          </a>
          <a href="#/orientation" className="quick-item">
            <span>🎯</span>Test d'orientation
          </a>
          <a href="#/metiers" className="quick-item">
            <span>🚀</span>Métiers de demain
          </a>
          <a href="#/glossaire" className="quick-item">
            <span>📖</span>Lexique
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Votre progression</h2>
          <a href="#/profil" className="small">
            Détails →
          </a>
        </div>
        <div className="card stats-row">
          <div>
            <strong>{done}</strong>
            <small>leçons sur {total}</small>
          </div>
          <div>
            <strong>{s.profile.labsPassed.length}</strong>
            <small>exercices pratiques réussis</small>
          </div>
          <div className="week">
            {week.map((d) => (
              <div key={d.key} className="week-day" title={`${d.key} : ${d.min} min`}>
                <div className="week-bar" style={{ height: Math.min(100, (d.min / Math.max(1, s.settings.dailyGoal)) * 100) + "%" }} />
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
