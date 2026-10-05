import { useEffect, useState } from "react";
import { useContent, flatLessons, getLessonBody } from "../lib/content";
import { useRoute, go } from "../lib/router";
import { useStore } from "../lib/store";
import { plainFromMarkdown } from "../lib/markdown";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

interface Hit {
  kind: string;
  title: string;
  sub: string;
  href: string;
  excerpt: string;
  score: number;
}

const bodyCache = new Map<string, string>();

function excerpt(text: string, terms: string[]) {
  const n = norm(text);
  const i = Math.max(0, ...terms.map((t) => n.indexOf(t)).filter((x) => x >= 0).slice(0, 1));
  const start = Math.max(0, i - 80);
  return (start > 0 ? "…" : "") + text.slice(start, start + 220).replace(/\s+/g, " ") + "…";
}

export default function Recherche() {
  const { query } = useRoute();
  const packs = useContent((c) => c.packs);
  const notes = useStore((s) => s.notes);
  const [q, setQ] = useState(query.get("q") ?? "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const term = query.get("q") ?? "";
    setQ(term);
    void run(term);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get("q"), packs]);

  async function run(term: string) {
    const terms = norm(term).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) return setHits([]);
    setBusy(true);
    const out: Hit[] = [];
    const match = (s: string) => {
      const n = norm(s);
      return terms.every((t) => n.includes(t)) ? terms.reduce((k, t) => k + n.split(t).length - 1, 0) : 0;
    };
    for (const p of packs) {
      for (const { module, lesson } of flatLessons(p)) {
        const k = `${p.id}/${lesson.id}`;
        if (!bodyCache.has(k)) {
          const b = await getLessonBody(p, lesson).catch(() => null);
          bodyCache.set(k, b ? plainFromMarkdown(b.body) : "");
        }
        const body = bodyCache.get(k)!;
        const tScore = match(lesson.title) * 10;
        const bScore = match(body + " " + (lesson.objectives ?? []).join(" "));
        if (tScore || bScore)
          out.push({ kind: "Leçon", title: lesson.title, sub: `${p.icon} ${p.title} · ${module.title}`, href: `#/lecon/${p.id}/${lesson.id}`, excerpt: excerpt(body, terms), score: tScore + bScore });
      }
      for (const { lesson } of flatLessons(p))
        for (const ex of lesson.exercises ?? []) {
          const s = match(ex.title + " " + ex.statement);
          if (s) out.push({ kind: "Exercice", title: ex.title, sub: `${p.icon} ${p.title} · ${lesson.title}`, href: `#/exercice/${p.id}/${lesson.id}/${ex.id}`, excerpt: ex.statement.slice(0, 200), score: s * 2 });
        }
      for (const g of p.glossary ?? []) {
        const s = match(g.term + " " + g.def + " " + (g.en ?? ""));
        if (s) out.push({ kind: "Lexique", title: g.term, sub: p.title, href: `#/glossaire?d=${p.id}`, excerpt: g.def, score: s * 2 });
      }
    }
    for (const [k, text] of Object.entries(notes)) {
      const s = match(text);
      if (s) out.push({ kind: "Note", title: "Ma note", sub: k, href: `#/lecon/${k}`, excerpt: excerpt(text, terms), score: s });
    }
    out.sort((a, b) => b.score - a.score);
    setHits(out.slice(0, 80));
    setBusy(false);
  }

  return (
    <div className="page">
      <h1>Recherche</h1>
      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          go("/recherche?q=" + encodeURIComponent(q));
        }}
      >
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex. : GROUP BY, chmod, conteneur, Kafka, pipeline…" />
        <button className="btn">🔎</button>
      </form>
      {busy && <div className="spinner" />}
      {!busy && query.get("q") && (
        <p className="small muted">
          {hits.length} résultat{hits.length > 1 ? "s" : ""}.{" "}
          <a href="#/assistant" onClick={() => sessionStorage.setItem("tc-prefill", q)}>
            Poser la question à l'assistant →
          </a>
        </p>
      )}
      <ul className="hits">
        {hits.map((h, i) => (
          <li key={i}>
            <a href={h.href} className="card hit">
              <span className="pill pill-soft">{h.kind}</span>
              <strong>{h.title}</strong>
              <small className="muted">{h.sub}</small>
              <p className="small">{h.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
