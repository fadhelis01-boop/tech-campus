import { useRef, useState } from "react";
import { useContent, loadContent, validatePack, installLocalPack, removeLocalPack, cacheAllForOffline, flatLessons, hasContent } from "../lib/content";
import { checkForAppUpdate, applyUpdate, usePwa } from "../lib/pwa";
import { aiConfigured, generateSyllabus } from "../lib/ai";
import { toast } from "../lib/store";
import { download } from "./Notes";
import { NeedKey } from "../components/AiOutput";
import type { Pack } from "../lib/types";

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

export const APP_VERSION = "1.0.0";

export const TEMPLATE: Pack = {
  id: "mon-domaine",
  version: "1.0.0",
  title: "Mon domaine",
  branch: "Autres domaines",
  icon: "🧱",
  color: "#4f46e5",
  description: "Une phrase qui présente le domaine.",
  updatedAt: "2026-10-01",
  outlook: "Pourquoi ce domaine compte pour les métiers de demain.",
  modules: [
    {
      id: "m1",
      title: "Premier module",
      level: 1,
      summary: "Ce que couvre le module.",
      lessons: [
        {
          id: "lecon-1",
          title: "Leçon rédigée",
          duration: 15,
          objectives: ["Comprendre…", "Savoir faire…"],
          body: "Introduction…\n\n## Première partie\n\nTexte…\n\n:::analogie Pour comprendre\nUne image de la vie courante.\n:::\n\n```python\nprint(\"Bonjour\")\n```\n\n## À retenir\n\n- Point 1\n- Point 2",
          docs: [{ title: "Documentation officielle", url: "https://docs.python.org/fr/3/" }],
          quiz: [
            { type: "qcm", q: "Question ?", choices: ["A", "B", "C", "D"], answer: 0, explain: "Explication." },
            { type: "vf", q: "Affirmation.", answer: true, explain: "Explication." },
          ],
          flashcards: [{ q: "Question", a: "Réponse" }],
          exercises: [
            {
              id: "ex-python",
              type: "code",
              lang: "python",
              title: "Exercice Python",
              statement: "Écrivez une fonction `double(x)` qui renvoie le double de x.",
              starter: "def double(x):\n    pass\n",
              solution: "def double(x):\n    return 2 * x\n",
              tests: [{ label: "double(4) vaut 8", code: "assert double(4) == 8" }],
            },
            {
              id: "ex-terminal",
              type: "terminal",
              title: "Exercice terminal",
              statement: "Créez un dossier `projet`.",
              tasks: [{ label: "Le dossier ~/projet existe", check: { type: "exists", path: "projet", kind: "dir" }, hint: "mkdir projet" }],
            },
          ],
        },
        {
          id: "lecon-2",
          title: "Leçon à faire rédiger par l'assistant IA",
          objectives: ["…"],
          outline: ["Point 1", "Point 2", "Point 3"],
        },
      ],
    },
  ],
  glossary: [{ term: "Terme", def: "Définition.", en: "Term" }],
};

export default function Contenus() {
  const packs = useContent((c) => c.packs);
  const manifest = useContent((c) => c.manifest);
  const error = useContent((c) => c.error);
  const { updateReady } = usePwa();
  const [busy, setBusy] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [details, setDetails] = useState("");
  const [branch, setBranch] = useState("Autres domaines");
  const fileRef = useRef<HTMLInputElement>(null);

  async function checkUpdates() {
    setBusy("Recherche de mises à jour…");
    const app = await checkForAppUpdate().catch(() => false);
    await loadContent(true);
    setBusy("");
    toast(app ? "Nouvelle version de l'application téléchargée" : "Contenus à jour");
  }

  async function offline() {
    await cacheAllForOffline((d, t) => setBusy(`Téléchargement ${d}/${t}…`));
    setBusy("");
    toast("Tous les cours sont disponibles hors connexion");
  }

  async function importRaw(text: string) {
    setErrors([]);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return setErrors(["Le fichier n'est pas un JSON valide."]);
    }
    const { pack, errors } = validatePack(raw);
    if (!pack) return setErrors(errors);
    const existing = packs.find((p) => p.id === pack.id);
    if (existing && !confirm(`Le domaine « ${existing.title} » (v${existing.version}) existe déjà. Le remplacer par la version ${pack.version} ?`)) return;
    await installLocalPack(pack, "importé");
    toast(`Domaine « ${pack.title} » installé`);
  }

  async function importUrl() {
    if (!url.trim()) return;
    setBusy("Téléchargement…");
    try {
      const r = await fetch(url.trim());
      if (!r.ok) throw new Error(String(r.status));
      await importRaw(await r.text());
    } catch (e) {
      setErrors(["Téléchargement impossible : " + (e as Error).message + " (le serveur doit autoriser l'accès, CORS)."]);
    }
    setBusy("");
  }

  async function createWithAi() {
    if (!domain.trim()) return;
    setErrors([]);
    try {
      const s = await generateSyllabus({ domain, details, onStatus: setBusy });
      const id = slug(domain) || "domaine";
      const pack: Pack = {
        id,
        version: "1.0.0",
        title: s.title || domain,
        branch,
        icon: s.icon || "📘",
        color: "#" + Math.floor(0x404040 + Math.random() * 0x7f7f7f).toString(16).padStart(6, "0"),
        description: s.description,
        updatedAt: new Date().toLocaleDateString("sv-SE"),
        modules: (s.modules as { title: string; level: 1 | 2 | 3; summary: string; lessons: { title: string; objectives: string[]; outline: string[] }[] }[]).map((m, mi) => ({
          id: `m${mi + 1}`,
          title: m.title,
          level: m.level,
          summary: m.summary,
          lessons: m.lessons.map((l, li) => ({ id: `${id}-${mi + 1}-${li + 1}`, title: l.title, objectives: l.objectives, outline: l.outline })),
        })),
      };
      await installLocalPack(pack, "généré");
      toast(`Programme « ${pack.title} » créé`);
      location.hash = "#/domaine/" + id;
    } catch (e) {
      setErrors([(e as Error).message]);
    }
    setBusy("");
  }

  return (
    <div className="page">
      <h1>📦 Contenus & mises à jour</h1>

      <section className="card">
        <h2>Mises à jour</h2>
        <p className="small">
          Application v{APP_VERSION} · contenus v{manifest?.version ?? "—"}
          {manifest?.updatedAt && <> du {new Date(manifest.updatedAt).toLocaleDateString("fr-FR")}</>}
        </p>
        {error && <p className="alert alert-error">{error}</p>}
        <div className="actions-row">
          <button className="btn" onClick={checkUpdates} disabled={!!busy}>
            🔄 Vérifier les mises à jour
          </button>
          {updateReady && (
            <button className="btn" onClick={applyUpdate}>
              Installer la nouvelle version
            </button>
          )}
          <button className="btn btn-ghost" onClick={offline} disabled={!!busy}>
            📥 Tout rendre disponible hors connexion
          </button>
        </div>
        {busy && <p className="small muted">{busy}</p>}
        {manifest?.changelog?.length ? (
          <details>
            <summary>Journal des mises à jour</summary>
            <ul className="small">
              {manifest.changelog.map((c, i) => (
                <li key={i}>
                  <strong>{new Date(c.date).toLocaleDateString("fr-FR")}</strong> — {c.text}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <p className="small muted">
          Les cours officiels sont datés : pour l'actualité postérieure, utilisez la Veille et le bouton « Vérifier
          l'actualité » de chaque leçon.
        </p>
      </section>

      <section className="section">
        <h2>Domaines installés ({packs.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Domaine</th>
              <th>Version</th>
              <th>Rédigé</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {packs.map((p) => {
              const ls = flatLessons(p);
              return (
                <tr key={p.id}>
                  <td>
                    {p.icon} {p.title}
                    <br />
                    <small className="muted">
                      {p.branch} · {p.origin} · à jour au {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </small>
                  </td>
                  <td>{p.version}</td>
                  <td>
                    {ls.filter((x) => hasContent(x.lesson)).length}/{ls.length}
                  </td>
                  <td className="nowrap">
                    <button className="mini-link" onClick={() => download(`${p.id}-${p.version}.json`, JSON.stringify({ ...p, origin: undefined }, null, 2), "application/json")}>
                      Exporter
                    </button>
                    {p.origin !== "officiel" && (
                      <button
                        className="mini-link danger"
                        onClick={() => confirm(`Supprimer « ${p.title} » de cet appareil ?`) && void removeLocalPack(p.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card form">
        <h2>➕ Ajouter un domaine</h2>
        <p className="small muted">
          Trois façons, sans programmation : (1) faire concevoir le programme par l'assistant IA, les leçons se rédigeant
          ensuite à la demande ; (2) importer un fichier de domaine (format décrit dans l'aide) ; (3) pour une
          installation pour tous les appareils, déposer le fichier dans <code>public/content/packs</code> et l'ajouter au
          manifeste.
        </p>

        <h3>1. Créer avec l'assistant</h3>
        {!aiConfigured() ? (
          <NeedKey />
        ) : (
          <>
            <label>
              Domaine
              <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ex. : Rust, Go pour le cloud, FinOps, Snowflake, Ingénierie de plateforme…" />
            </label>
            <label>
              Précisions (facultatif)
              <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="ex. : orienté préparation à la certification, ou usage en data engineering" />
            </label>
            <label>
              Rubrique
              <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option>Socle</option>
                <option>Data</option>
                <option>Cloud & DevOps</option>
                <option>Sécurité & IA</option>
                <option>Méthode & carrière</option>
                <option>Autres domaines</option>
              </select>
            </label>
            <button className="btn" onClick={createWithAi} disabled={!!busy || !domain.trim()}>
              Concevoir le programme (≈ 0,10 $)
            </button>
          </>
        )}

        <h3>2. Importer un fichier</h3>
        <div className="actions-row">
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            Choisir un fichier .json
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void f.text().then(importRaw);
              e.target.value = "";
            }}
          />
          <button className="btn btn-ghost" onClick={() => download("modele-domaine.json", JSON.stringify(TEMPLATE, null, 2), "application/json")}>
            Télécharger le modèle
          </button>
        </div>
        <div className="row">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="… ou l'adresse web d'un fichier de domaine" />
          <button className="btn btn-ghost" onClick={importUrl}>
            Importer
          </button>
        </div>
        {errors.length > 0 && (
          <ul className="alert alert-error small">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
