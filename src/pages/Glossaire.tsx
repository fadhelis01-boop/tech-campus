import { useState } from "react";
import { useContent } from "../lib/content";
import { useRoute } from "../lib/router";
import { addCards, toast } from "../lib/store";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Glossaire() {
  const { query } = useRoute();
  const packs = useContent((c) => c.packs);
  const [d, setD] = useState(query.get("d") ?? "");
  const [q, setQ] = useState("");

  const entries = packs
    .filter((p) => !d || p.id === d)
    .flatMap((p) => (p.glossary ?? []).map((g) => ({ ...g, pack: p.title, packId: p.id })))
    .filter((g) => !q || norm(g.term + " " + g.def + " " + (g.en ?? "")).includes(norm(q)))
    .sort((a, b) => a.term.localeCompare(b.term, "fr"));

  // dédoublonnage par terme
  const seen = new Set<string>();
  const unique = entries.filter((e) => (seen.has(norm(e.term)) ? false : (seen.add(norm(e.term)), true)));
  const letters = [...new Set(unique.map((e) => norm(e.term)[0]?.toUpperCase()))];

  return (
    <div className="page">
      <h1>📖 Lexique</h1>
      <p className="muted small">
        Le vocabulaire technique est en grande partie anglais : chaque terme est donné avec son équivalent anglais, celui
        que vous lirez dans la documentation et les offres d'emploi.
      </p>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un terme (français ou anglais)…" aria-label="Chercher un terme" />
        <select value={d} onChange={(e) => setD(e.target.value)} aria-label="Domaine">
          <option value="">Tous les domaines</option>
          {packs
            .filter((p) => p.glossary?.length)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
        </select>
      </div>
      <p className="small muted">{unique.length} entrées</p>
      {letters.map((L) => (
        <section key={L} className="section">
          <h2 className="letter">{L}</h2>
          <dl className="glossary">
            {unique
              .filter((e) => norm(e.term)[0]?.toUpperCase() === L)
              .map((e) => (
                <div key={e.term} className="gl-item">
                  <dt>
                    {e.term} {e.en && e.en.toLowerCase() !== e.term.toLowerCase() ? <span className="en">{e.en}</span> : null}
                  </dt>
                  <dd>
                    {e.def} <small className="muted">· {e.pack}</small>{" "}
                    <button
                      className="mini-link"
                      onClick={() => {
                        const n = addCards([{ id: `lex:${e.packId}:${e.term}`, q: `Que signifie **${e.term}** ?`, a: e.def + (e.en ? `\n\n*En anglais :* ${e.en}` : ""), source: "Lexique" }]);
                        toast(n ? "Carte ajoutée" : "Déjà dans vos révisions");
                      }}
                    >
                      + carte
                    </button>
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
