import { useMemo, useState } from "react";
import { useStore, reviewCard, addCards, removeCard, uid, toast } from "../lib/store";
import { useContent, flatLessons } from "../lib/content";
import { isDue, nextLabel } from "../lib/srs";
import { shuffle } from "../components/Quiz";
import Markdown from "../components/Markdown";

export default function Revisions() {
  const srs = useStore((s) => s.srs);
  useContent((c) => c.packs);
  const cards = Object.values(srs);
  const due = cards.filter((c) => isDue(c));
  const [session, setSession] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [filter, setFilter] = useState("");

  const sources = useMemo(() => [...new Set(cards.map((c) => c.source))], [cards]);
  const current = session ? srs[session[pos]] : null;

  function start(ids: string[]) {
    setSession(shuffle(ids));
    setPos(0);
    setFlipped(false);
  }

  function grade(g: 0 | 1 | 2 | 3) {
    if (!current || !session) return;
    reviewCard(current.id, g);
    setFlipped(false);
    if (g === 0) setSession([...session, current.id]); // la carte revient en fin de séance
    if (pos + 1 < session.length + (g === 0 ? 1 : 0)) setPos(pos + 1);
    else {
      setSession(null);
      toast("Séance terminée. Bravo !", "xp");
    }
  }

  const packs = useContent((c) => c.packs);
  // Ajoute d'un coup les cartes de toutes les leçons déjà terminées
  const progress = useStore((s) => s.progress);
  function addFromDone() {
    const list: { id: string; q: string; a: string; source: string }[] = [];
    for (const p of packs)
      for (const { lesson } of flatLessons(p)) {
        const st = progress[`${p.id}/${lesson.id}`]?.status;
        if (st !== "termine" && st !== "acquis") continue;
        (lesson.flashcards ?? []).forEach((c, i) => list.push({ id: `${p.id}/${lesson.id}#${i}`, q: c.q, a: c.a, source: p.title }));
      }
    const n = addCards(list);
    toast(n ? `${n} cartes ajoutées` : "Toutes les cartes de vos leçons terminées sont déjà dans le paquet");
  }
  function addGlossary() {
    const n = addCards(
      packs.flatMap((p) => (p.glossary ?? []).map((g) => ({ id: `lex:${p.id}:${g.term}`, q: `Que signifie **${g.term}** ?`, a: g.def + (g.en ? `\n\n*En anglais :* ${g.en}` : ""), source: "Lexique" }))),
    );
    toast(n ? `${n} termes du lexique ajoutés` : "Déjà tous présents");
  }

  if (session && current) {
    return (
      <div className="page revisions">
        <div className="quiz-head">
          <span className="pill">
            {pos + 1} / {session.length}
          </span>
          <span className="muted small">{current.source}</span>
          <button className="mini-link" onClick={() => setSession(null)}>
            Arrêter
          </button>
        </div>
        <div className={"flashcard " + (flipped ? "flipped" : "")} onClick={() => setFlipped(true)}>
          <div className="fc-q">
            <Markdown text={current.q} />
          </div>
          {flipped ? (
            <div className="fc-a">
              <Markdown text={current.a} />
            </div>
          ) : (
            <p className="muted small center">Formulez la réponse mentalement, puis touchez la carte.</p>
          )}
        </div>
        {flipped ? (
          <div className="grades">
            <button className="grade g0" onClick={() => grade(0)}>
              À revoir<small>{nextLabel(current, 0)}</small>
            </button>
            <button className="grade g1" onClick={() => grade(1)}>
              Difficile<small>{nextLabel(current, 1)}</small>
            </button>
            <button className="grade g2" onClick={() => grade(2)}>
              Bien<small>{nextLabel(current, 2)}</small>
            </button>
            <button className="grade g3" onClick={() => grade(3)}>
              Facile<small>{nextLabel(current, 3)}</small>
            </button>
          </div>
        ) : (
          <button className="btn btn-big full" onClick={() => setFlipped(true)}>
            Voir la réponse
          </button>
        )}
      </div>
    );
  }

  const shown = cards.filter((c) => !filter || c.source === filter);

  return (
    <div className="page">
      <h1>Révisions</h1>
      <p className="muted">
        La répétition espacée fait revenir chaque notion juste avant que vous ne l'oubliiez : quelques minutes par jour
        suffisent à ancrer durablement commandes, concepts et définitions.
      </p>
      <div className="card card-cta">
        <h3>{due.length ? `${due.length} carte${due.length > 1 ? "s" : ""} à revoir aujourd'hui` : "Vous êtes à jour 🎉"}</h3>
        <div className="actions-row">
          {due.length > 0 && (
            <button className="btn btn-big" onClick={() => start(due.map((c) => c.id))}>
              Commencer la séance
            </button>
          )}
          {cards.length > 0 && (
            <button className="btn btn-ghost" onClick={() => start(shuffle(cards).slice(0, 15).map((c) => c.id))}>
              Révision libre (15 cartes)
            </button>
          )}
        </div>
      </div>

      <section className="section card">
        <h2>Alimenter le paquet</h2>
        <p className="small muted">
          Chaque leçon propose ses cartes (« Ajouter à mes révisions »). Vous pouvez aussi ajouter en une fois les cartes
          de toutes vos leçons terminées, le lexique, ou créer vos propres cartes (une commande à retenir, une erreur que
          vous faites souvent…).
        </p>
        <div className="actions-row">
          <button className="btn btn-ghost" onClick={addFromDone}>
            📚 Cartes de mes leçons terminées
          </button>
          <button className="btn btn-ghost" onClick={addGlossary}>
            📖 Tout le lexique
          </button>
        </div>
        <form
          className="add-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim() || !a.trim()) return;
            addCards([{ id: "perso:" + uid(), q, a, source: "Mes cartes" }]);
            setQ("");
            setA("");
            toast("Carte ajoutée");
          }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Question (ex. : délai de déclaration des créances ?)" />
          <textarea value={a} onChange={(e) => setA(e.target.value)} placeholder="Réponse (ex. : 2 mois à compter de la publication au BODACC, R. 622-24 C. com.)" rows={2} />
          <button className="btn">Créer la carte</button>
        </form>
      </section>

      {cards.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Mon paquet ({cards.length})</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer">
              <option value="">Toutes les sources</option>
              {sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <ul className="card-list">
            {shown.slice(0, 200).map((c) => (
              <li key={c.id}>
                <div>
                  <div className="small">{c.q.replace(/[*_]/g, "").split("\n")[0]}</div>
                  <small className="muted">
                    {c.source} · {isDue(c) ? "à revoir" : "prochaine : " + new Date(c.due).toLocaleDateString("fr-FR")}
                  </small>
                </div>
                <button className="mini-link" onClick={() => removeCard(c.id)} aria-label="Supprimer la carte">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
