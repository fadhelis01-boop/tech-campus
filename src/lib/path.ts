import { getContent, flatLessons, tracks } from "./content";
import { getState } from "./store";
import type { Certification, Lesson, Module, Pack, Track } from "./types";

// Calcul de la progression dans un parcours métier et de la « prochaine
// leçon » à proposer : c'est ce qui permet de reprendre sans réfléchir.

export const isDone = (packId: string, lessonId: string) => {
  const st = getState().progress[`${packId}/${lessonId}`]?.status;
  return st === "termine" || st === "acquis";
};

export function packProgress(p: Pack) {
  const ls = flatLessons(p);
  const done = ls.filter(({ lesson }) => isDone(p.id, lesson.id)).length;
  return { total: ls.length, done, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
}

export function currentTrack(): Track | undefined {
  const id = getState().settings.track;
  return tracks().find((t) => t.id === id);
}

export function trackProgress(t: Track) {
  const packs = getContent().packs;
  let total = 0;
  let done = 0;
  const steps = t.steps.map((s) => {
    const ps = s.packs.map((id) => packs.find((p) => p.id === id)).filter(Boolean) as Pack[];
    const st = ps.reduce(
      (acc, p) => {
        const x = packProgress(p);
        return { total: acc.total + x.total, done: acc.done + x.done };
      },
      { total: 0, done: 0 },
    );
    total += st.total;
    done += st.done;
    return { ...s, packList: ps, ...st, pct: st.total ? Math.round((st.done / st.total) * 100) : 0 };
  });
  return { steps, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

// Prochaine leçon : dans l'ordre du parcours choisi (ou de l'ordre des domaines).
export function nextLesson(exclude = ""): { pack: Pack; module: Module; lesson: Lesson } | null {
  const packs = getContent().packs;
  const t = currentTrack();
  const order: Pack[] = t
    ? (t.steps.flatMap((s) => s.packs).map((id) => packs.find((p) => p.id === id)).filter(Boolean) as Pack[])
    : [...packs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  for (const p of order) {
    for (const { module, lesson } of flatLessons(p)) {
      if (`${p.id}/${lesson.id}` === exclude) continue;
      if (!isDone(p.id, lesson.id)) return { pack: p, module, lesson };
    }
  }
  return null;
}

// ---------- Certifications ----------
export function allCerts(): Certification[] {
  return getContent().manifest?.certifications ?? [];
}

export const certById = (id: string) => allCerts().find((c) => c.id === id);

// Estimation « prêt pour l'examen » : 70 % leçons terminées, 30 % meilleur
// examen blanc, sur les domaines qui préparent la certification.
export function certReadiness(c: Certification) {
  const packs = getContent().packs;
  const best = getState().profile.examBest ?? {};
  const details = c.validates
    .map((id) => packs.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => {
      const pr = packProgress(p!);
      const exam = best[p!.id] ?? 0;
      return { pack: p!, lessonPct: pr.pct, exam, score: Math.round(pr.pct * 0.7 + exam * 0.3) };
    });
  const pct = details.length ? Math.round(details.reduce((t, d) => t + d.score, 0) / details.length) : 0;
  return { pct, details };
}

// Jalons du parcours choisi, dans l'ordre des étapes
export function trackMilestones(t: Track | undefined): { cert: Certification; step: string }[] {
  if (!t) return [];
  const out: { cert: Certification; step: string }[] = [];
  for (const s of t.steps)
    for (const id of s.milestones ?? []) {
      const c = certById(id);
      if (c && !out.some((x) => x.cert.id === id)) out.push({ cert: c, step: s.title });
    }
  return out;
}

export function nextMilestone() {
  const certs = getState().certs;
  return trackMilestones(currentTrack()).find((m) => certs[m.cert.id]?.status !== "obtenue") ?? null;
}
