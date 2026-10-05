import { useRef, useState } from "react";
import { useContent } from "../lib/content";
import { useRoute } from "../lib/router";
import { useStore, saveReport, deleteReport, uid } from "../lib/store";
import { aiConfigured, runVeille } from "../lib/ai";
import AiOutput, { NeedKey, Sources } from "../components/AiOutput";
import Markdown from "../components/Markdown";

const PERIODS = [
  { m: 1, label: "Dernier mois" },
  { m: 3, label: "3 derniers mois" },
  { m: 6, label: "6 derniers mois" },
  { m: 12, label: "12 derniers mois" },
  { m: 24, label: "2 dernières années" },
];

export default function Veille() {
  const { query } = useRoute();
  const packs = useContent((c) => c.packs).filter((p) => p.branch !== "Méthode & carrière");
  const reports = useStore((s) => s.reports).filter((r) => r.kind !== "correction");
  const [domain, setDomain] = useState(() => packs.find((p) => p.id === query.get("d"))?.title ?? "data engineering (outils, formats, plateformes)");
  const [months, setMonths] = useState(3);
  const [focus, setFocus] = useState("");
  const [run, setRun] = useState<{ text: string; busy: boolean; status: string; error?: string; sources?: { url: string; title: string }[]; cost?: number } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  async function start() {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const sinceStr = since.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    setRun({ text: "", busy: true, status: "Recherche des nouveautés…" });
    abort.current = new AbortController();
    try {
      const r = await runVeille({
        domain,
        since: sinceStr,
        focus,
        onText: (t) => setRun((x) => ({ ...(x ?? { busy: true, status: "" }), text: t })),
        onStatus: (s) => setRun((x) => ({ ...(x ?? { busy: true, text: "" }), status: s })),
        signal: abort.current.signal,
      });
      setRun({ text: r.text, busy: false, status: "", sources: r.sources, cost: r.cost });
      saveReport({ id: uid(), kind: "veille", title: `Veille ${domain} depuis le ${sinceStr}`, text: r.text, sources: r.sources, at: Date.now() });
    } catch (e) {
      setRun({ text: "", busy: false, status: "", error: (e as Error).message });
    }
  }

  return (
    <div className="page">
      <h1>📡 Veille technologique</h1>
      <p className="muted">
        L'informatique bouge vite : la veille fait partie du métier. L'assistant parcourt les notes de version et les
        annonces officielles (fondations Apache, CNCF, fournisseurs cloud, éditeurs) et vous dit ce qui a changé et si
        ça vous concerne déjà. Chaque rapport est conservé ci-dessous et consultable hors connexion.
      </p>
      {!aiConfigured() ? (
        <NeedKey />
      ) : (
        <div className="card form">
          <label>
            Domaine
            <select value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option>data engineering (outils, formats, plateformes)</option>
              <option>cloud et DevOps (AWS, Azure, GCP, Kubernetes, IaC, CI/CD)</option>
              <option>intelligence artificielle appliquée à la data</option>
              <option>cybersécurité (failles majeures, bonnes pratiques)</option>
              <option>marché de l'emploi tech en France (métiers, salaires, compétences demandées)</option>
              {packs.map((p) => (
                <option key={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <label>
            Période
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {PERIODS.map((p) => (
                <option key={p.m} value={p.m}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Accent particulier (facultatif)
            <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="ex. : Apache Iceberg, Kubernetes 1.34, certification AWS…" />
          </label>
          <button className="btn" onClick={start} disabled={run?.busy}>
            Lancer la veille (≈ 0,30 à 0,80 $)
          </button>
        </div>
      )}
      {run && (
        <div className="card">
          <AiOutput {...run} />
          {run.busy && (
            <button className="mini-link" onClick={() => abort.current?.abort()}>
              Arrêter
            </button>
          )}
        </div>
      )}

      {reports.length > 0 && (
        <section className="section">
          <h2>Rapports enregistrés</h2>
          <ul className="report-list">
            {reports.map((r) => (
              <li key={r.id} className="card">
                <div className="section-head">
                  <button className="link-btn" onClick={() => setOpen(open === r.id ? null : r.id)}>
                    {r.kind === "actualite" ? "🔎" : "📡"} {r.title}
                  </button>
                  <span className="muted small">{new Date(r.at).toLocaleDateString("fr-FR")}</span>
                </div>
                {open === r.id && (
                  <>
                    <Markdown text={r.text} />
                    <Sources sources={r.sources} />
                    <button className="mini-link" onClick={() => deleteReport(r.id)}>
                      Supprimer ce rapport
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
