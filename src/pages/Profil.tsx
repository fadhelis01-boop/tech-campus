import { useStore, rankOf, RANKS, BADGES } from "../lib/store";
import { useContent, flatLessons } from "../lib/content";

export default function Profil() {
  const s = useStore((x) => x);
  const packs = useContent((c) => c.packs);
  const rank = rankOf(s.profile.xp);
  const totalMin = Object.values(s.profile.days).reduce((a, b) => a + b, 0);

  // Calendrier des 12 dernières semaines
  const days = Array.from({ length: 84 }, (_, k) => {
    const d = new Date(Date.now() - (83 - k) * 86_400_000).toLocaleDateString("sv-SE");
    return { d, m: s.profile.days[d] ?? 0 };
  });

  return (
    <div className="page">
      <h1>🏅 Progrès & badges</h1>
      <div className="card">
        <p className="eyebrow">Grade actuel</p>
        <h2>{rank.title}</h2>
        <div className="rank-bar big">
          <div style={{ width: rank.pct + "%" }} />
        </div>
        <p className="small muted">
          {s.profile.xp} XP{rank.next && <> · prochain grade « {rank.next.title} » à {rank.next.xp} XP</>}
        </p>
        <ol className="ranks small">
          {RANKS.map((r, i) => (
            <li key={r.title} className={i <= rank.index ? "reached" : ""}>
              {r.title} <span className="muted">({r.xp} XP)</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card stats-row">
        <div><strong>{Math.round(totalMin / 60)} h {totalMin % 60} min</strong><small>temps d'étude</small></div>
        <div><strong>{s.profile.streak}</strong><small>jours d'affilée</small></div>
        <div><strong>{s.profile.cardsReviewed}</strong><small>cartes révisées</small></div>
        <div><strong>{s.profile.exercisesDone}</strong><small>exercices</small></div>
      </div>

      <section className="section card">
        <h2>Assiduité (12 semaines)</h2>
        <div className="heatmap">
          {days.map((x) => (
            <span key={x.d} title={`${x.d} : ${x.m} min`} className={"hm l" + (x.m === 0 ? 0 : x.m < 10 ? 1 : x.m < 25 ? 2 : x.m < 45 ? 3 : 4)} />
          ))}
        </div>
      </section>

      <section className="section card">
        <h2>Par domaine</h2>
        <ul className="module-scores">
          {packs.map((p) => {
            const ls = flatLessons(p);
            const done = ls.filter(({ lesson }) => ["termine", "acquis"].includes(s.progress[`${p.id}/${lesson.id}`]?.status ?? "")).length;
            return (
              <li key={p.id}>
                <span>{p.icon} {p.title}</span>
                <span className="mini-bar"><span style={{ width: `${ls.length ? (done / ls.length) * 100 : 0}%` }} /></span>
                <span>{done}/{ls.length}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section">
        <h2>Badges</h2>
        <div className="badges">
          {Object.entries(BADGES).map(([id, b]) => (
            <div key={id} className={"badge " + (s.profile.badges.includes(id) ? "won" : "")} title={b.desc}>
              <span>{b.icon}</span>
              <strong>{b.label}</strong>
              <small>{b.desc}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
