import { useMemo, useState } from "react";
import { useContent, tracks } from "../lib/content";
import { useStore, setDraft, getState, updateSettings, toast } from "../lib/store";
import { askAssistant } from "../lib/ask";
import { go } from "../lib/router";
import { download } from "./Notes";
import { allCerts } from "../lib/path";
import type { Orientation as OrientationData, OrientationProfil } from "../lib/types";

// Test d'orientation : les réponses donnent des points aux métiers ; le
// résultat recommande un métier (et, si besoin, un métier d'entrée), donne
// un avis argumenté et un plan pour l'employabilité à long terme.

const CLE = "orientation";
const HISTORIQUE = "orientation:historique";

interface Resultat {
  profil: OrientationProfil;
  score: number;
  max: number;
  pct: number;
}

export function calculer(o: OrientationData, reponses: number[]): Resultat[] {
  return o.profils
    .map((profil) => {
      let score = 0;
      let max = 0;
      o.questions.forEach((q, i) => {
        max += Math.max(0, ...q.reponses.map((r) => r.points?.[profil.id] ?? 0));
        const r = q.reponses[reponses[i]];
        if (r) score += r.points?.[profil.id] ?? 0;
      });
      return { profil, score, max, pct: max ? Math.round((score / max) * 100) : 0 };
    })
    .sort((a, b) => b.pct - a.pct || b.score - a.score);
}

function lire<T>(cle: string, defaut: T): T {
  try {
    const v = getState().drafts[cle];
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}

export default function Orientation() {
  const o = useContent((c) => c.manifest?.orientation);
  useStore((s) => s.drafts[CLE]);
  const trackActuel = useStore((s) => s.settings.track);
  const enregistre = lire<{ reponses: number[]; date: string } | null>(CLE, null);
  const [reponses, setReponses] = useState<number[]>(() => enregistre?.reponses ?? []);
  const [etape, setEtape] = useState(() => (enregistre ? -1 : 0)); // -1 = résultats
  const historique = lire<{ date: string; metier: string; pct: number }[]>(HISTORIQUE, []);

  const resultats = useMemo(() => (o && etape === -1 ? calculer(o, reponses) : []), [o, etape, reponses]);
  if (!o) return <div className="page"><h1>Test d'orientation</h1><p className="muted">Contenu indisponible.</p></div>;

  const n = o.questions.length;

  function repondre(i: number) {
    const r = [...reponses];
    r[etape] = i;
    setReponses(r);
    if (etape + 1 < n) setEtape(etape + 1);
    else terminer(r);
  }

  function terminer(r: number[]) {
    const res = calculer(o!, r);
    const date = new Date().toLocaleDateString("sv-SE");
    setDraft(CLE, JSON.stringify({ reponses: r, date }));
    setDraft(HISTORIQUE, JSON.stringify([{ date, metier: res[0].profil.titre, pct: res[0].pct }, ...historique].slice(0, 10)));
    setEtape(-1);
    window.scrollTo(0, 0);
  }

  // ---------- Questionnaire ----------
  if (etape >= 0) {
    const q = o.questions[etape];
    return (
      <div className="page orientation">
        <p className="eyebrow">Test d'orientation · question {etape + 1} sur {n}</p>
        <div className="quiz-bar">
          <div style={{ width: `${(etape / n) * 100}%` }} />
        </div>
        <h1 className="orient-q">{q.q}</h1>
        <div className="choices">
          {q.reponses.map((r, i) => (
            <button key={i} className={"choice" + (reponses[etape] === i ? " chosen" : "")} onClick={() => repondre(i)}>
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
              <span>{r.texte}</span>
            </button>
          ))}
        </div>
        <div className="actions-row">
          {etape > 0 && (
            <button className="btn btn-ghost" onClick={() => setEtape(etape - 1)}>
              ← Question précédente
            </button>
          )}
          {enregistre && (
            <button className="mini-link" onClick={() => setEtape(-1)}>
              Revenir à mes derniers résultats
            </button>
          )}
        </div>
        <p className="small muted">Répondez spontanément : il n'y a ni bonne ni mauvaise réponse. Vous pourrez refaire le test autant de fois que vous le voulez.</p>
      </div>
    );
  }

  // ---------- Résultats ----------
  const [premier, second] = resultats;
  const p = premier.profil;
  const entree = p.porte_entree ? o.profils.find((x) => x.id === p.porte_entree) : undefined;
  const track = tracks().find((t) => t.id === p.parcours);
  const polyvalent = second && premier.pct - second.pct <= 5;
  const pourquoi = o.questions
    .map((q, i) => q.reponses[reponses[i]])
    .filter((r) => r && (r.points?.[p.id] ?? 0) >= 2)
    .map((r) => r!.texte);
  const conseils = o.questions.map((q, i) => q.reponses[reponses[i]]?.conseil).filter(Boolean) as string[];
  const heures = o.questions.map((q, i) => q.reponses[reponses[i]]?.valeur).find((v) => v !== undefined) ?? 8;
  const moisParcours = track ? track.steps.reduce((t, s) => t + (s.months ?? 0), 0) : 18;
  const mois = Math.max(6, Math.round((moisParcours * 9) / heures));
  const certs = p.certifications.map((id) => allCerts().find((c) => c.id === id)).filter(Boolean) as { id: string; name: string }[];

  const resume = [
    `# Mon orientation TechCampus (${enregistre?.date ?? ""})`,
    "",
    `**Métier recommandé : ${p.titre}** (${premier.pct} % de correspondance)${entree ? ` — métier d'entrée conseillé : ${entree.titre}` : ""}`,
    "",
    `Autres pistes : ${resultats.slice(1, 3).map((r) => `${r.profil.titre} (${r.pct} %)`).join(", ")}`,
    "",
    `## Avis`,
    `- Marché : ${p.marche}`,
    `- À 20 ans : ${p.avenir}`,
    `- Exposition à l'IA : ${p.risque_ia}`,
    `- Accès en reconversion : ${p.acces}`,
    `- Durée estimée jusqu'à l'employabilité : environ ${mois} mois à ${heures} h par semaine`,
    "",
    `## Plan pour optimiser mon employabilité`,
    ...p.optimiser.map((x) => `- ${x}`),
    ...conseils.map((x) => `- ${x}`),
    "",
    `## Certifications jalons`,
    ...certs.map((c) => `- ${c.name}`),
  ].join("\n");

  return (
    <div className="page orientation">
      <p className="eyebrow">Résultat du test d'orientation · {enregistre?.date && new Date(enregistre.date).toLocaleDateString("fr-FR")}</p>
      <div className="card orient-hero">
        <span className="orient-emoji">{p.emoji}</span>
        <div>
          <p className="eyebrow">Le métier qui vous correspond le mieux</p>
          <h1>{p.titre}</h1>
          <p>{p.resume}</p>
          <p className="small muted">Correspondance avec vos réponses : {premier.pct} %</p>
        </div>
      </div>

      {polyvalent && (
        <div className="alert alert-ok">
          Profil polyvalent : <strong>{second.profil.titre}</strong> vous correspond presque autant ({second.pct} %). Bonne nouvelle : le socle
          commun (Linux, Git, Python, SQL, cloud) sert aux deux ; vous pourrez trancher après les premiers modules.
        </div>
      )}

      {entree && (
        <div className="card notice">
          <strong>🚪 Par où entrer ?</strong> Le métier de {p.titre} est rarement un premier poste. Le chemin réaliste : commencer comme{" "}
          <strong>{entree.titre}</strong> ({(entree.acces.charAt(0).toLowerCase() + entree.acces.slice(1)).replace(/\.\s*$/, "")}), puis évoluer vers {p.titre} après deux à
          quatre ans d'expérience.
        </div>
      )}

      <section className="section">
        <h2>Vos autres pistes</h2>
        <div className="orient-bars">
          {resultats.map((r) => (
            <div key={r.profil.id} className={"orient-bar" + (r === premier ? " top" : "")}>
              <span className="orient-name">
                {r.profil.emoji} {r.profil.titre}
              </span>
              <span className="mini-bar">
                <span style={{ width: r.pct + "%" }} />
              </span>
              <span className="small">{r.pct} %</span>
            </div>
          ))}
        </div>
      </section>

      {pourquoi.length > 0 && (
        <section className="section card">
          <h2>Pourquoi ce métier pour vous</h2>
          <ul>
            {pourquoi.map((t, i) => (
              <li key={i}>Vous avez répondu : « {t} »</li>
            ))}
          </ul>
          <p className="small muted">Au quotidien : {p.quotidien}</p>
        </section>
      )}

      <section className="section card">
        <h2>🧭 Notre avis sur ce choix</h2>
        <dl className="orient-avis">
          <div>
            <dt>Le marché aujourd'hui</dt>
            <dd>{p.marche}</dd>
          </div>
          <div>
            <dt>Dans les 20 prochaines années</dt>
            <dd>{p.avenir}</dd>
          </div>
          <div>
            <dt>Exposition à l'automatisation par l'IA</dt>
            <dd>{p.risque_ia}</dd>
          </div>
          <div>
            <dt>Accès en reconversion</dt>
            <dd>{p.acces}</dd>
          </div>
          <div>
            <dt>Durée estimée</dt>
            <dd>
              Environ <strong>{mois} mois</strong> pour être employable à {heures} h par semaine
              {entree ? ` comme ${entree.titre}` : ""} (parcours, projets et premières certifications compris). Ordre de grandeur : la régularité compte
              plus que la vitesse.
            </dd>
          </div>
          <div>
            <dt>Évolutions possibles</dt>
            <dd>{p.evolutions}</dd>
          </div>
        </dl>
      </section>

      <section className="section card">
        <h2>🚀 Optimiser votre employabilité</h2>
        <h3>Pour ce métier</h3>
        <ol>
          {p.optimiser.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
        <h3>Spécialisations porteuses</h3>
        <p>{p.specialisations.join(" · ")}</p>
        <h3>Certifications à viser</h3>
        <ul className="cert-list">
          {certs.map((c) => (
            <li key={c.id}>
              <a href="#/certifications">{c.name}</a>
            </li>
          ))}
        </ul>
        {conseils.length > 0 && (
          <>
            <h3>Selon votre situation</h3>
            <ul>
              {conseils.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </>
        )}
        <h3>Pour rester employable sur 20 ans, quel que soit le métier</h3>
        <ul>
          {o.conseils_durables.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      <div className="actions-row">
        {track && (
          <button
            className="btn btn-big"
            onClick={() => {
              updateSettings({ track: track.id });
              go("/parcours");
            }}
          >
            {trackActuel === track.id ? "Voir ma feuille de route" : `Suivre le parcours ${track.icon} ${track.title}`}
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() =>
            askAssistant(
              "Avis sur mon orientation",
              "L'élève a passé le test d'orientation de TechCampus. Ses réponses : " +
                o.questions.map((q, i) => `${q.q} → ${q.reponses[reponses[i]]?.texte ?? "(sans réponse)"}`).join(" | ") +
                `. Résultats : ${resultats.slice(0, 4).map((r) => `${r.profil.titre} ${r.pct} %`).join(", ")}.`,
              `Donne-moi ton avis argumenté et honnête sur le métier qui ressort (${p.titre}) au regard de mes réponses : est-ce un bon choix pour moi ? Quels sont les risques ? Un autre métier te paraîtrait-il plus adapté ? Appuie-toi sur des sources datées et identifiables (France Travail, Apec, Dares, documentation officielle) pour le marché français. Termine par un plan concret, étape par étape, pour maximiser mon employabilité dans les 20 prochaines années.`,
            )
          }
        >
          🤖 Avis détaillé et sourcé de l'assistant
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setReponses([]);
            setEtape(0);
          }}
        >
          ⟲ Refaire le test
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            download("techcampus-orientation.md", resume, "text/markdown");
            toast("Plan téléchargé");
          }}
        >
          ⬇️ Télécharger mon plan
        </button>
      </div>

      {historique.length > 1 && (
        <section className="section">
          <h2>Mes tests précédents</h2>
          <ul className="small">
            {historique.map((h, i) => (
              <li key={i}>
                {new Date(h.date).toLocaleDateString("fr-FR")} — {h.metier} ({h.pct} %)
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="small muted">ℹ️ {o.avertissement}</p>
    </div>
  );
}
