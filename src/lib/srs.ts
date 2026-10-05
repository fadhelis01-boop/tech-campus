import type { SrsCard } from "./types";

// Répétition espacée (variante simplifiée de SM-2).
// grade : 0 = à revoir, 1 = difficile, 2 = bien, 3 = facile
const DAY = 86_400_000;

export function newCard(id: string, q: string, a: string, source: string): SrsCard {
  return { id, q, a, source, ease: 2.5, interval: 0, due: Date.now(), reps: 0, lapses: 0 };
}

export function review(card: SrsCard, grade: 0 | 1 | 2 | 3, now = Date.now()): SrsCard {
  const c = { ...card };
  if (grade === 0) {
    c.lapses += 1;
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.due = now + 10 * 60_000; // revient dans 10 minutes
    return c;
  }
  c.reps += 1;
  if (c.reps === 1) c.interval = grade === 3 ? 3 : 1;
  else if (c.reps === 2) c.interval = grade === 1 ? 3 : grade === 2 ? 6 : 8;
  else c.interval = Math.round(c.interval * (grade === 1 ? 1.2 : grade === 2 ? c.ease : c.ease * 1.3));
  c.ease = Math.max(1.3, c.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
  c.interval = Math.min(c.interval, 365);
  c.due = now + c.interval * DAY;
  return c;
}

export function nextLabel(card: SrsCard, grade: 0 | 1 | 2 | 3): string {
  if (grade === 0) return "10 min";
  const d = review(card, grade).interval;
  return d < 30 ? `${d} j` : d < 365 ? `${Math.round(d / 30)} mois` : "1 an";
}

export function isDue(card: SrsCard, now = Date.now()) {
  return card.due <= now;
}
