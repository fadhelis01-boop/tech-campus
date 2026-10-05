import { useEffect } from "react";
import { useRoute, href } from "./lib/router";
import { useStore, setState, getProgress, updateProgress, addMinutes } from "./lib/store";
import { useContent, setUpdatesSeen } from "./lib/content";
import { usePwa, applyUpdate } from "./lib/pwa";
import { onBlock } from "./lib/tts";
import AudioBar from "./components/AudioBar";
import Home from "./pages/Home";
import Parcours from "./pages/Parcours";
import Domain from "./pages/Domain";
import LessonPage from "./pages/Lesson";
import Exam from "./pages/Exam";
import Revisions from "./pages/Revisions";
import Assistant from "./pages/Assistant";
import Veille from "./pages/Veille";
import Glossaire from "./pages/Glossaire";
import Recherche from "./pages/Recherche";
import Notes from "./pages/Notes";
import Reglages from "./pages/Reglages";
import Contenus from "./pages/Contenus";
import ExercisePage from "./pages/Exercise";
import Plus from "./pages/Plus";
import Profil from "./pages/Profil";
import Aide from "./pages/Aide";
import Labo from "./pages/Labo";
import Metiers from "./pages/Metiers";
import Certifications from "./pages/Certifications";
import { MENU } from "./pages/Plus";

const NAV = [
  { path: "/", icon: "🏠", label: "Accueil" },
  { path: "/parcours", icon: "🧭", label: "Parcours" },
  { path: "/labo", icon: "🧪", label: "Labo" },
  { path: "/assistant", icon: "🤖", label: "Assistant" },
  { path: "/plus", icon: "☰", label: "Plus" },
];

const SIDE_EXTRA = MENU.filter((m) => m.path !== "/labo");

// Enregistre la position audio dans la progression de la leçon
onBlock((key, i) => {
  if (!key) return;
  const p = getProgress(key);
  updateProgress(key, { audioBlock: i, block: Math.max(p.block, i), lastOpened: Date.now() });
});

function Page() {
  const { parts } = useRoute();
  const [a, b, c, d] = parts;
  switch (a) {
    case undefined:
      return <Home />;
    case "parcours":
      return <Parcours />;
    case "domaine":
      return <Domain packId={b} />;
    case "lecon":
      return <LessonPage packId={b} lessonId={c} />;
    case "examen":
      return <Exam packId={b} mode={(c as "positionnement" | "blanc") ?? "blanc"} />;
    case "exercice":
      return <ExercisePage packId={b} lessonId={c} exerciseId={d} />;
    case "revisions":
      return <Revisions />;
    case "assistant":
      return <Assistant chatId={b} />;
    case "veille":
      return <Veille />;
    case "glossaire":
      return <Glossaire />;
    case "recherche":
      return <Recherche />;
    case "notes":
      return <Notes />;
    case "reglages":
      return <Reglages />;
    case "contenus":
      return <Contenus />;
    case "plus":
      return <Plus />;
    case "profil":
      return <Profil />;
    case "aide":
      return <Aide />;
    case "labo":
      return <Labo tab={b} />;
    case "metiers":
      return <Metiers />;
    case "certifications":
      return <Certifications />;
    default:
      return (
        <div className="page">
          <h1>Page introuvable</h1>
          <a href="#/">Retour à l'accueil</a>
        </div>
      );
  }
}

function Toast() {
  const t = useStore((s) => s.toast);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setState({ toast: null }), 2600);
    return () => clearTimeout(id);
  }, [t]);
  if (!t) return null;
  return (
    <div className={`toast toast-${t.kind ?? "info"}`} role="status">
      {t.text}
    </div>
  );
}

export default function App() {
  const ready = useStore((s) => s.ready);
  const theme = useStore((s) => s.settings.theme);
  const fontScale = useStore((s) => s.settings.fontScale);
  const loading = useContent((s) => s.loading);
  const updates = useContent((s) => s.updates);
  const { updateReady } = usePwa();
  const { path } = useRoute();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme === "sombre" ? "dark" : "light");
    root.style.setProperty("--font-scale", String(fontScale));
  }, [theme, fontScale]);

  // Temps d'étude : une minute comptée par minute d'activité visible
  useEffect(() => {
    let last = Date.now();
    const onAct = () => (last = Date.now());
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) => window.addEventListener(e, onAct, { passive: true }));
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last < 120_000) addMinutes(1);
    }, 60_000);
    return () => {
      clearInterval(id);
      ["pointerdown", "keydown", "scroll", "touchstart"].forEach((e) => window.removeEventListener(e, onAct));
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const active = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Navigation principale">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden="true">&gt;_</span>
          <span>
            <strong>TechCampus</strong>
            <small>Data · Cloud · DevOps</small>
          </span>
        </a>
        <nav>
          {NAV.filter((n) => n.path !== "/plus").map((n) => (
            <a key={n.path} href={href(n.path)} className={active(n.path) ? "active" : ""}>
              <span aria-hidden="true">{n.icon}</span> {n.label}
            </a>
          ))}
          <div className="nav-sep" />
          {SIDE_EXTRA.map((n) => (
            <a key={n.path} href={href(n.path)} className={active(n.path) ? "active" : ""}>
              <span aria-hidden="true">{n.icon}</span> {n.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        {updateReady && (
          <div className="banner">
            Une nouvelle version de TechCampus est disponible.
            <button className="btn btn-small" onClick={applyUpdate}>
              Mettre à jour
            </button>
          </div>
        )}
        {updates.length > 0 && (
          <div className="banner banner-soft">
            Contenus mis à jour : {updates.join(", ")}.
            <a href="#/contenus">Voir</a>
            <button className="mini-link" onClick={() => setUpdatesSeen()} aria-label="Fermer">
              ✕
            </button>
          </div>
        )}
        {!ready || loading ? (
          <div className="page center-load">
            <div className="spinner" aria-label="Chargement" />
          </div>
        ) : (
          <Page />
        )}
      </main>

      <AudioBar />
      <Toast />

      <nav className="tabbar" aria-label="Navigation">
        {NAV.map((n) => (
          <a key={n.path} href={href(n.path)} className={active(n.path) ? "active" : ""}>
            <span className="tab-icon" aria-hidden="true">
              {n.icon}
            </span>
            <span className="tab-label">{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

