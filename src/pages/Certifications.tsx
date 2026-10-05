import { useState } from "react";
import { useContent, getContent } from "../lib/content";
import { useStore, setCert, toast, getState } from "../lib/store";
import { allCerts, certReadiness, currentTrack, trackMilestones, packProgress } from "../lib/path";
import { download } from "./Notes";
import type { Certification, CertStatus } from "../lib/types";

// Les certifications professionnelles qui jalonnent les parcours.
// TechCampus prépare ; l'examen se passe auprès de l'éditeur (en ligne,
// surveillé, ou en centre). On suit ici son avancement et on génère le
// bloc « Certifications et compétences » du CV.

const STATUS: Record<CertStatus["status"], string> = {
  visee: "🎯 Visée",
  preparation: "📚 En préparation",
  planifiee: "🗓️ Examen planifié",
  obtenue: "🎓 Obtenue",
};

function CertCard({ c, step }: { c: Certification; step?: string }) {
  useStore((s) => s.progress);
  useStore((s) => s.profile.examBest);
  const st = useStore((s) => s.certs[c.id]);
  const r = certReadiness(c);
  return (
    <article id={"cert-" + c.id} className={"card cert-card" + (st?.status === "obtenue" ? " won" : "")}>
      <div className="cert-head">
        <span className="cert-medal" aria-hidden="true">
          {st?.status === "obtenue" ? "🎓" : "🏅"}
        </span>
        <div className="grow">
          {step && <p className="eyebrow">Jalon · {step}</p>}
          <h3>{c.name}</h3>
          <p className="small muted">
            {c.vendor} · <span className={"pill pill-" + (c.level === "Débutant" ? "ok" : c.level === "Avancé" ? "ko" : "info")}>{c.level}</span>
          </p>
        </div>
      </div>
      <p className="small">{c.why}</p>
      <dl className="cert-facts small">
        <div>
          <dt>Tarif</dt>
          <dd>{c.price}</dd>
        </div>
        {c.format && (
          <div>
            <dt>Examen</dt>
            <dd>{c.format}</dd>
          </div>
        )}
        {c.validity && (
          <div>
            <dt>Validité</dt>
            <dd>{c.validity}</dd>
          </div>
        )}
      </dl>

      <div className="cert-ready">
        <div className="progress-line small">
          <span>Préparation dans TechCampus</span>
          <span>{r.pct} %</span>
        </div>
        <div className="mini-bar big">
          <span style={{ width: r.pct + "%", background: r.pct >= 80 ? "var(--ok)" : undefined }} />
        </div>
        <ul className="cert-packs small">
          {r.details.map((d) => (
            <li key={d.pack.id}>
              <a href={`#/domaine/${d.pack.id}`}>
                {d.pack.icon} {d.pack.title}
              </a>{" "}
              <span className="muted">
                · leçons {d.lessonPct} % · examen blanc {d.exam ? d.exam + " %" : "non passé"}
              </span>{" "}
              <a className="mini-link" href={`#/examen/${d.pack.id}/blanc`}>
                Examen blanc
              </a>
            </li>
          ))}
        </ul>
        <p className="small muted">
          {r.pct >= 80
            ? "Vous semblez prêt : faites un dernier examen blanc officiel (souvent proposé par l'éditeur) puis inscrivez-vous."
            : "Visez 80 % : leçons terminées et examens blancs réussis. Complétez avec le guide officiel de l'examen (programme détaillé, questions d'exemple)."}
        </p>
      </div>

      <div className="cert-status">
        <label>
          Suivi
          <select value={st?.status ?? ""} onChange={(e) => setCert(c.id, e.target.value ? { status: e.target.value as CertStatus["status"] } : null)}>
            <option value="">— Pas encore prévue</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        {st?.status === "planifiee" && (
          <label>
            Date de l'examen
            <input type="date" value={st.examDate ?? ""} onChange={(e) => setCert(c.id, { examDate: e.target.value })} />
          </label>
        )}
        {st?.status === "obtenue" && (
          <>
            <label>
              Obtenue le
              <input type="date" value={st.obtainedAt ?? ""} onChange={(e) => setCert(c.id, { obtainedAt: e.target.value })} />
            </label>
            <label>
              Lien de vérification (Credly, page de l'éditeur…)
              <input type="url" value={st.credentialUrl ?? ""} onChange={(e) => setCert(c.id, { credentialUrl: e.target.value })} placeholder="https://www.credly.com/badges/…" />
            </label>
          </>
        )}
      </div>
      <div className="actions-row">
        <a className="btn btn-small" href={c.url} target="_blank" rel="noopener">
          Page officielle ↗
        </a>
      </div>
    </article>
  );
}

function cvText(): string {
  const s = { ...getState(), packs: getContent().packs };
  const certs = allCerts();
  const got = certs.filter((c) => s.certs[c.id]?.status === "obtenue");
  const prep = certs.filter((c) => ["preparation", "planifiee"].includes(s.certs[c.id]?.status ?? ""));
  const lines: string[] = ["## Certifications", ""];
  if (!got.length && !prep.length) lines.push("(Aucune certification renseignée pour l'instant.)");
  for (const c of got) {
    const st = s.certs[c.id];
    lines.push(`- ${c.cv}${st.obtainedAt ? ` — ${new Date(st.obtainedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}` : ""}${st.credentialUrl ? ` (vérifiable : ${st.credentialUrl})` : ""}`);
  }
  for (const c of prep) {
    const st = s.certs[c.id];
    lines.push(`- ${c.cv} — en préparation${st.examDate ? `, examen prévu en ${new Date(st.examDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}` : ""}`);
  }
  lines.push("", "## Compétences techniques mises en pratique", "");
  for (const p of s.packs) {
    const pr = packProgress(p);
    if (pr.pct < 50) continue;
    const labs = s.profile.labsPassed.filter((k) => k.startsWith(p.id + "/")).length;
    lines.push(`- ${p.title} : ${pr.done} modules de cours sur ${pr.total}${labs ? `, ${labs} exercices pratiques réussis (corrigés automatiquement)` : ""}`);
  }
  if (lines.at(-1) === "") lines.push("(Terminez au moins la moitié d'un domaine pour qu'il apparaisse ici.)");
  return lines.join("\n");
}

export default function Certifications() {
  useContent((c) => c.manifest);
  useStore((s) => s.certs);
  useStore((s) => s.settings.track);
  const [showCv, setShowCv] = useState(false);
  const track = currentTrack();
  const milestones = trackMilestones(track);
  const extra = (track?.certifications ?? []).map((id) => allCerts().find((c) => c.id === id)).filter(Boolean) as Certification[];
  const shown = new Set([...milestones.map((m) => m.cert.id), ...extra.map((c) => c.id)]);
  const others = allCerts().filter((c) => !shown.has(c.id));
  const text = showCv ? cvText() : "";

  return (
    <div className="page">
      <h1>🎓 Certifications</h1>
      <p className="muted">
        Chaque étape clé de votre parcours est validée par une <strong>vraie certification professionnelle</strong>,
        délivrée par l'éditeur ou un organisme reconnu (AWS, Microsoft, Google Cloud, Linux Foundation, HashiCorp,
        Databricks…). Elle se passe en ligne (examen surveillé par webcam) ou en centre, et donne un badge vérifiable par
        un recruteur. TechCampus vous y prépare et vous dit quand vous êtes prêt ; l'examen lui-même se passe auprès de
        l'organisme officiel.
      </p>

      <div className="card notice">
        <strong>💶 Financement</strong>
        <ul className="small">
          <li>
            En France, de nombreuses formations préparant à ces certifications (AWS, Microsoft Azure…) sont inscrites au
            Répertoire spécifique de France Compétences et finançables par le <strong>CPF</strong> : cherchez l'intitulé
            sur <a href="https://www.moncompteformation.gouv.fr/" target="_blank" rel="noopener">moncompteformation.gouv.fr</a> et
            vérifiez la fiche sur <a href="https://www.francecompetences.fr/" target="_blank" rel="noopener">francecompetences.fr</a>.
          </li>
          <li>Demandeur d'emploi : parlez de votre projet à votre conseiller France Travail (aides individuelles à la formation possibles).</li>
          <li>Les éditeurs offrent régulièrement des bons d'examen gratuits ou réduits (journées de formation Microsoft, ateliers Astronomer, promotions Linux Foundation, -50 % AWS après une première réussite).</li>
        </ul>
        <p className="small muted">Tarifs indiqués : prix publics constatés en octobre 2026, hors taxes ; ils évoluent, vérifiez toujours la page officielle.</p>
      </div>

      <section className="section card">
        <div className="section-head">
          <h2>📄 Mon bloc CV</h2>
          <button className="btn btn-small" onClick={() => setShowCv(!showCv)}>
            {showCv ? "Masquer" : "Générer"}
          </button>
        </div>
        <p className="small muted">Un texte prêt à coller dans votre CV ou votre profil LinkedIn : certifications obtenues et en cours, compétences pratiquées.</p>
        {showCv && (
          <>
            <pre className="cv-block">{text}</pre>
            <div className="actions-row">
              <button
                className="btn btn-ghost btn-small"
                onClick={() =>
                  navigator.clipboard?.writeText(text).then(
                    () => toast("Copié"),
                    () => toast("Copie impossible"),
                  )
                }
              >
                📋 Copier
              </button>
              <button className="btn btn-ghost btn-small" onClick={() => download("techcampus-cv-certifications.md", text, "text/markdown")}>
                ⬇️ Télécharger
              </button>
            </div>
          </>
        )}
      </section>

      {track && milestones.length > 0 && (
        <section className="section">
          <h2>
            Les jalons de votre parcours {track.icon} {track.title}
          </h2>
          <div className="cert-grid">
            {milestones.map((m) => (
              <CertCard key={m.cert.id} c={m.cert} step={m.step} />
            ))}
          </div>
        </section>
      )}
      {extra.length > 0 && (
        <section className="section">
          <h2>Pour aller plus loin</h2>
          <div className="cert-grid">
            {extra.map((c) => (
              <CertCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
      <section className="section">
        <h2>{track ? "Autres certifications reconnues" : "Toutes les certifications"}</h2>
        {!track && (
          <p className="small muted">
            <a href="#/parcours">Choisissez un parcours</a> pour voir les certifications ordonnées comme des jalons.
          </p>
        )}
        <div className="cert-grid">
          {others.map((c) => (
            <CertCard key={c.id} c={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
