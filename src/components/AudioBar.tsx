import { useTts, pause, resume, skip, stop, setRate } from "../lib/tts";
import { updateSettings } from "../lib/store";

const RATES = [0.8, 0.9, 1, 1.15, 1.3, 1.5];

export default function AudioBar() {
  const s = useTts((x) => x);
  if (!s.key) return null;
  const pct = s.blocks.length ? Math.round(((s.index + 1) / s.blocks.length) * 100) : 0;
  const cycleRate = () => {
    const i = RATES.indexOf(s.rate);
    const r = RATES[(i + 1) % RATES.length];
    setRate(r);
    updateSettings({ ttsRate: r });
  };
  return (
    <div className="audiobar" role="region" aria-label="Lecture audio">
      <div className="audiobar-progress" style={{ width: pct + "%" }} />
      <a className="audiobar-title" href={s.href} title="Revenir à la leçon">
        <small>{s.playing ? "Lecture en cours" : "En pause"} · {s.index + 1}/{s.blocks.length}</small>
        <span>{s.title}</span>
      </a>
      <div className="audiobar-controls">
        <button className="icon-btn" onClick={() => skip(-1)} aria-label="Paragraphe précédent">
          ⏮
        </button>
        {s.playing ? (
          <button className="icon-btn big" onClick={pause} aria-label="Pause">
            ⏸
          </button>
        ) : (
          <button className="icon-btn big" onClick={resume} aria-label="Reprendre">
            ▶
          </button>
        )}
        <button className="icon-btn" onClick={() => skip(1)} aria-label="Paragraphe suivant">
          ⏭
        </button>
        <button className="icon-btn rate" onClick={cycleRate} aria-label="Vitesse de lecture">
          ×{s.rate}
        </button>
        <button className="icon-btn" onClick={stop} aria-label="Fermer le lecteur">
          ✕
        </button>
      </div>
    </div>
  );
}
