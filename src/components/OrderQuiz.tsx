import { useMemo, useState } from "react";
import { shuffle } from "./Quiz";

// Remettre des étapes dans l'ordre (cycle de vie d'un pipeline, étapes
// d'un déploiement…). Boutons ↑/↓ : utilisable au doigt comme au clavier.
export default function OrderQuiz(props: { items: string[]; onSolved?: () => void }) {
  const initial = useMemo(() => {
    let s = shuffle(props.items);
    for (let k = 0; k < 5 && s.every((x, i) => x === props.items[i]); k++) s = shuffle(props.items);
    return s;
  }, [props.items]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const ok = order.every((x, i) => x === props.items[i]);

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
    setChecked(false);
  }

  return (
    <div className="order-quiz">
      <ol>
        {order.map((x, i) => (
          <li key={x} className={checked ? (x === props.items[i] ? "ok" : "ko") : ""}>
            <span className="order-text">{x}</span>
            <span className="order-btns">
              <button className="mini-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">
                ↑
              </button>
              <button className="mini-btn" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Descendre">
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="actions-row">
        <button
          className="btn btn-ok"
          onClick={() => {
            setChecked(true);
            if (ok) props.onSolved?.();
          }}
        >
          ✓ Vérifier l'ordre
        </button>
        {checked && (ok ? <span className="ok-text">🎉 Parfait !</span> : <span className="ko-text">{order.filter((x, i) => x === props.items[i]).length} / {order.length} bien placées</span>)}
      </div>
    </div>
  );
}
