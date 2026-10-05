import { useEffect, useState } from "react";
import { go } from "../lib/router";
import { useContent } from "../lib/content";
import { getState, setDraft, useStore } from "../lib/store";
import { askAssistant } from "../lib/ask";
import CodeLab from "../components/CodeLab";
import TerminalView from "../components/TerminalView";

// Labo libre : expérimenter sans consigne. Les extraits de code des leçons
// (bouton « ▶ Essayer ») s'ouvrent ici.

const TABS = [
  { id: "python", icon: "🐍", label: "Python", sub: "Le vrai Python 3, dans votre navigateur" },
  { id: "sql", icon: "🗄️", label: "SQL", sub: "SQLite, avec des bases d'exemple" },
  { id: "terminal", icon: "⌨️", label: "Terminal", sub: "Linux, Git, Docker, kubectl simulés" },
];

const PY_START = `# Bienvenue dans le labo Python !
# Modifiez ce code puis cliquez sur « Exécuter » (ou Ctrl+Entrée).

prenom = "Ada"
langages = ["Python", "SQL", "Bash"]

print(f"Bonjour {prenom} !")
for i, langage in enumerate(langages, start=1):
    print(i, langage)
`;

const SQL_START = `-- Bienvenue dans le labo SQL !
-- Choisissez une base ci-dessus, consultez ses tables, puis écrivez vos requêtes.
SELECT nom, ville
FROM clients
ORDER BY nom;
`;

export default function Labo({ tab }: { tab?: string }) {
  const current = TABS.some((t) => t.id === tab) ? tab! : "python";
  const datasets = useContent((c) => c.manifest?.datasets ?? {});
  const [ds, setDs] = useState(() => sessionStorage.getItem("tc-labo-ds") ?? "boutique");
  const [pandas, setPandas] = useState(false);
  const [snippet, setSnippet] = useState<string | null>(null);
  useStore((s) => s.drafts["labo:" + current]);

  // Code venu d'une leçon (bouton « Essayer »)
  useEffect(() => {
    const raw = sessionStorage.getItem("tc-lab");
    if (!raw) return;
    sessionStorage.removeItem("tc-lab");
    try {
      const { lang, code } = JSON.parse(raw) as { lang: string; code: string };
      if (lang === "bash") setSnippet(code);
      else {
        const key = "labo:" + (lang === "sql" ? "sql" : "python");
        setDraft(key, code);
        if (lang === "python" && /\bimport pandas\b|\bpd\./.test(code)) setPandas(true);
      }
    } catch {
      /* ignoré */
    }
  }, [current]);

  const setup = datasets[ds]?.sql ?? "";
  const hasPandas = pandas || /\bimport pandas\b/.test(getState().drafts["labo:python"] ?? "");

  return (
    <div className="page labo">
      <h1>🧪 Labo</h1>
      <p className="muted small">
        Un espace pour expérimenter librement : rien ne peut casser, tout est enregistré sur votre appareil. Les extraits
        de code des leçons s'ouvrent ici avec le bouton « ▶ Essayer ».
      </p>
      <div className="seg" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === current} className={t.id === current ? "active" : ""} onClick={() => go("/labo/" + t.id)}>
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      <p className="small muted">{TABS.find((t) => t.id === current)!.sub}</p>

      {current === "python" && (
        <section className="card lab-card">
          <label className="switch small">
            <input type="checkbox" checked={hasPandas} onChange={(e) => setPandas(e.target.checked)} />
            <span>Charger pandas (bibliothèque d'analyse de données, ≈ 15 Mo au premier usage)</span>
          </label>
          <CodeLab
            lang="python"
            storageKey="labo:python"
            starter={PY_START}
            packages={hasPandas ? ["pandas"] : []}
            onAskAi={(code, problem) =>
              askAssistant("Labo Python", "L'élève expérimente dans le labo Python libre.", `Voici mon code :\n\n\`\`\`python\n${code}\n\`\`\`\n\nProblème :\n${problem}\n\nExplique-moi l'erreur simplement et mets-moi sur la piste.`)
            }
          />
        </section>
      )}

      {current === "sql" && (
        <section className="card lab-card">
          <label>
            Base de données
            <select
              value={ds}
              onChange={(e) => {
                setDs(e.target.value);
                sessionStorage.setItem("tc-labo-ds", e.target.value);
              }}
            >
              {Object.entries(datasets).map(([k, d]) => (
                <option key={k} value={k}>
                  {d.title} — {d.description}
                </option>
              ))}
              <option value="">Base vide (créez vos propres tables)</option>
            </select>
          </label>
          <CodeLab
            lang="sql"
            storageKey="labo:sql"
            starter={SQL_START}
            setup={setup}
            onAskAi={(code, problem) =>
              askAssistant("Labo SQL", `L'élève expérimente dans le labo SQL (SQLite) sur la base « ${datasets[ds]?.title ?? "vide"} ».`, `Voici ma requête :\n\n\`\`\`sql\n${code}\n\`\`\`\n\nProblème :\n${problem}\n\nExplique-moi l'erreur simplement et mets-moi sur la piste.`)
            }
          />
          <p className="small muted">La base est recréée à chaque exécution : vos INSERT et UPDATE ne sont pas conservés d'une exécution à l'autre (écrivez-les dans la même requête que le SELECT pour en voir l'effet).</p>
        </section>
      )}

      {current === "terminal" && (
        <section className="card lab-card">
          {snippet && (
            <div className="snippet">
              <strong>Commandes de la leçon</strong> <span className="small muted">(tapez-les vous-même : c'est ainsi qu'on les retient)</span>
              <pre>{snippet}</pre>
              <button className="mini-link" onClick={() => setSnippet(null)}>
                Masquer
              </button>
            </div>
          )}
          <TerminalView
            storageKey="labo:terminal"
            files={{
              "bienvenue.txt": "Bienvenue dans le terminal libre de TechCampus.\nEssayez : ls, cat bienvenue.txt, mkdir projet, git init, docker run hello-world…\n",
              "donnees/ventes.csv": "date,produit,quantite\n2026-10-01,clavier,3\n2026-10-01,souris,5\n2026-10-02,clavier,1\n2026-10-03,ecran,2\n",
            }}
            onAskAi={(t) => askAssistant("Labo terminal", "L'élève expérimente dans le terminal simulé.", `Voici mes dernières commandes :\n\n\`\`\`\n${t}\n\`\`\`\n\nQue se passe-t-il ? Explique-moi simplement.`)}
          />
        </section>
      )}
    </div>
  );
}
