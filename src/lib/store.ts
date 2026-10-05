import { useSyncExternalStore } from "react";
import { dbGet, dbSet } from "./db";
import { newCard, review } from "./srs";
import type { CertStatus, Chat, LessonProgress, Profile, SavedReport, Settings, SrsCard } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  model: "claude-opus-5-5",
  communitySources: true,
  ttsVoice: "",
  ttsRate: 1,
  theme: "auto",
  fontScale: 1,
  dailyGoal: 30,
  name: "",
  track: "",
};

const DEFAULT_PROFILE: Profile = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: "",
  days: {},
  badges: [],
  exercisesDone: 0,
  cardsReviewed: 0,
  labsPassed: [],
};

export interface State {
  ready: boolean;
  settings: Settings;
  profile: Profile;
  progress: Record<string, LessonProgress>;
  srs: Record<string, SrsCard>;
  notes: Record<string, string>;
  drafts: Record<string, string>; // brouillons de code, état des terminaux (reprise)
  certs: Record<string, CertStatus>; // suivi des certifications professionnelles
  chats: Chat[];
  reports: SavedReport[];
  lastLesson: string; // "pack/lesson"
  toast: { text: string; kind?: "xp" | "info" | "badge" } | null;
}

const PERSISTED = ["settings", "profile", "progress", "srs", "notes", "drafts", "certs", "chats", "reports", "lastLesson"] as const;
type PersistedKey = (typeof PERSISTED)[number];

let state: State = {
  ready: false,
  settings: DEFAULT_SETTINGS,
  profile: DEFAULT_PROFILE,
  progress: {},
  srs: {},
  notes: {},
  drafts: {},
  certs: {},
  chats: [],
  reports: [],
  lastLesson: "",
  toast: null,
};

const listeners = new Set<() => void>();
const dirty = new Set<PersistedKey>();
let saveTimer: number | undefined;

function emit() {
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  for (const k of Object.keys(patch)) if ((PERSISTED as readonly string[]).includes(k)) dirty.add(k as PersistedKey);
  if (dirty.size) {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(flush, 250);
  }
  emit();
}

export async function flush() {
  const keys = [...dirty];
  dirty.clear();
  await Promise.all(keys.map((k) => dbSet(k, state[k])));
}

window.addEventListener("pagehide", () => void flush());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") void flush();
});

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
  );
}

export async function loadState() {
  const loaded: Partial<State> = {};
  for (const k of PERSISTED) {
    const v = await dbGet(k);
    if (v !== undefined) (loaded as Record<string, unknown>)[k] = v;
  }
  state = {
    ...state,
    ...loaded,
    settings: { ...DEFAULT_SETTINGS, ...(loaded.settings ?? {}) },
    profile: { ...DEFAULT_PROFILE, ...(loaded.profile ?? {}) },
    ready: true,
  };
  emit();
}

// ---------- Réglages ----------
export function updateSettings(patch: Partial<Settings>) {
  setState({ settings: { ...state.settings, ...patch } });
}

// ---------- Progression ----------
export const lessonKey = (packId: string, lessonId: string) => `${packId}/${lessonId}`;

export function getProgress(key: string): LessonProgress {
  return state.progress[key] ?? { status: "nouveau", block: 0 };
}

export function updateProgress(key: string, patch: Partial<LessonProgress>) {
  const cur = getProgress(key);
  const next = { ...cur, ...patch };
  if (next.status === "nouveau" && (patch.block ?? 0) > 0) next.status = "en-cours";
  setState({ progress: { ...state.progress, [key]: next } });
}

export function completeLesson(key: string) {
  const cur = getProgress(key);
  if (cur.status !== "termine") {
    updateProgress(key, { status: "termine", completedAt: Date.now() });
    addXp(50, "Leçon terminée");
  }
}

// ---------- Gamification ----------
export const RANKS: { xp: number; title: string }[] = [
  { xp: 0, title: "Stagiaire" },
  { xp: 300, title: "Profil junior" },
  { xp: 900, title: "Profil confirmé" },
  { xp: 2000, title: "Profil senior" },
  { xp: 3500, title: "Lead technique" },
  { xp: 5500, title: "Architecte" },
  { xp: 8500, title: "Expert principal" },
  { xp: 12500, title: "Légende du terminal" },
];

export function rankOf(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const cur = RANKS[i];
  const next = RANKS[i + 1];
  const pct = next ? Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
  return { index: i, title: cur.title, next, pct };
}

export const BADGES: Record<string, { label: string; icon: string; desc: string }> = {
  "premiere-lecon": { label: "Hello, World!", icon: "👋", desc: "Première leçon terminée" },
  "serie-7": { label: "Daily stand-up", icon: "🔥", desc: "7 jours d'affilée" },
  "serie-30": { label: "Disponibilité 99,9 %", icon: "🏆", desc: "30 jours d'affilée" },
  "quiz-parfait": { label: "Zéro bug", icon: "🎯", desc: "Un quiz à 100 %" },
  "cartes-100": { label: "Cache chaud", icon: "🧠", desc: "100 cartes révisées" },
  "premier-exercice": { label: "Premier commit", icon: "✅", desc: "Premier exercice pratique réussi" },
  "dix-lecons": { label: "Build réussi", icon: "📚", desc: "10 leçons terminées" },
  "cinquante-lecons": { label: "Mise en production", icon: "🚀", desc: "50 leçons terminées" },
  "assistant": { label: "Pair programming", icon: "🤖", desc: "Première question à l'assistant" },
  "terminal": { label: "Maître du shell", icon: "⌨️", desc: "Premier labo terminal réussi" },
  "python": { label: "Pythoniste", icon: "🐍", desc: "Premier labo Python réussi" },
  "sql": { label: "SELECT * FROM succès", icon: "🗄️", desc: "Premier labo SQL réussi" },
  "config": { label: "Infra as Code", icon: "🧩", desc: "Premier fichier de configuration validé" },
  "labs-10": { label: "Labo assidu", icon: "🧪", desc: "10 exercices pratiques réussis" },
  "certifie": { label: "Certifié·e", icon: "🎓", desc: "Une première certification professionnelle obtenue" },
  "labs-50": { label: "Mains dans le cambouis", icon: "🛠️", desc: "50 exercices pratiques réussis" },
};

export const today = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-JJ, heure locale

function touchDay(p: Profile): Profile {
  const d = today();
  if (p.lastActiveDay === d) return p;
  const y = new Date(Date.now() - 86_400_000).toLocaleDateString("sv-SE");
  const streak = p.lastActiveDay === y ? p.streak + 1 : 1;
  return { ...p, lastActiveDay: d, streak, bestStreak: Math.max(p.bestStreak, streak) };
}

export function addXp(n: number, reason?: string) {
  let p = touchDay(state.profile);
  p = { ...p, xp: p.xp + n };
  setState({ profile: p, toast: reason ? { text: `+${n} XP · ${reason}`, kind: "xp" } : state.toast });
  checkBadges();
}

export function addMinutes(min: number) {
  if (min <= 0) return;
  const p = touchDay(state.profile);
  const d = today();
  setState({ profile: { ...p, days: { ...p.days, [d]: (p.days[d] ?? 0) + min } } });
}

export function awardBadge(id: string) {
  if (state.profile.badges.includes(id) || !BADGES[id]) return;
  setState({
    profile: { ...state.profile, badges: [...state.profile.badges, id] },
    toast: { text: `${BADGES[id].icon} Badge : ${BADGES[id].label}`, kind: "badge" },
  });
}

function checkBadges() {
  const p = state.profile;
  const done = Object.values(state.progress).filter((x) => x.status === "termine").length;
  if (done >= 1) awardBadge("premiere-lecon");
  if (done >= 10) awardBadge("dix-lecons");
  if (done >= 50) awardBadge("cinquante-lecons");
  if (p.streak >= 7) awardBadge("serie-7");
  if (p.streak >= 30) awardBadge("serie-30");
  if (p.cardsReviewed >= 100) awardBadge("cartes-100");
  if (p.exercisesDone >= 1) awardBadge("premier-exercice");
  if ((p.labsPassed ?? []).length >= 10) awardBadge("labs-10");
  if ((p.labsPassed ?? []).length >= 50) awardBadge("labs-50");
}

export function toast(text: string, kind: "xp" | "info" | "badge" = "info") {
  setState({ toast: { text, kind } });
}

// ---------- Cartes de révision ----------
export function addCards(cards: { id: string; q: string; a: string; source: string }[]) {
  const srs = { ...state.srs };
  let added = 0;
  for (const c of cards) {
    if (!srs[c.id]) {
      srs[c.id] = newCard(c.id, c.q, c.a, c.source);
      added++;
    }
  }
  if (added) setState({ srs });
  return added;
}

export function reviewCard(id: string, grade: 0 | 1 | 2 | 3) {
  const c = state.srs[id];
  if (!c) return;
  setState({
    srs: { ...state.srs, [id]: review(c, grade) },
    profile: { ...touchDay(state.profile), cardsReviewed: state.profile.cardsReviewed + 1 },
  });
  addXp(2);
}

export function removeCard(id: string) {
  const srs = { ...state.srs };
  delete srs[id];
  setState({ srs });
}

// ---------- Notes ----------
export function setNote(key: string, text: string) {
  const notes = { ...state.notes };
  if (text.trim()) notes[key] = text;
  else delete notes[key];
  setState({ notes });
}

// ---------- Brouillons (code, terminal) ----------
export function setDraft(key: string, value: string | null) {
  const drafts = { ...state.drafts };
  if (value === null) delete drafts[key];
  else drafts[key] = value;
  setState({ drafts });
}

// ---------- Certifications ----------
export function setCert(id: string, patch: Partial<CertStatus> | null) {
  const certs = { ...state.certs };
  const was = certs[id]?.status;
  if (patch === null) delete certs[id];
  else certs[id] = { ...(certs[id] ?? { status: "visee" }), ...patch } as CertStatus;
  setState({ certs });
  if (patch?.status === "obtenue" && was !== "obtenue") {
    addXp(300, "Certification obtenue 🎓");
    awardBadge("certifie");
  }
}

// ---------- Discussions & rapports ----------
export function saveChat(chat: Chat) {
  const others = state.chats.filter((c) => c.id !== chat.id);
  setState({ chats: [chat, ...others].slice(0, 200) });
}

export function deleteChat(id: string) {
  setState({ chats: state.chats.filter((c) => c.id !== id) });
}

export function saveReport(r: SavedReport) {
  setState({ reports: [r, ...state.reports.filter((x) => x.id !== r.id)].slice(0, 300) });
}

export function deleteReport(id: string) {
  setState({ reports: state.reports.filter((r) => r.id !== id) });
}

// ---------- Sauvegarde / restauration (changement d'appareil) ----------
export function exportBackup(): string {
  const data: Record<string, unknown> = { app: "techcampus", format: 1, exportedAt: new Date().toISOString() };
  for (const k of PERSISTED) data[k] = state[k];
  // La clé d'API ne quitte jamais l'appareil.
  data.settings = { ...state.settings, apiKey: "" };
  return JSON.stringify(data, null, 1);
}

export function importBackup(json: string, mode: "remplacer" | "fusionner") {
  const data = JSON.parse(json);
  if (data.app !== "techcampus") throw new Error("Ce fichier n'est pas une sauvegarde TechCampus.");
  const apiKey = state.settings.apiKey;
  if (mode === "remplacer") {
    const patch: Partial<State> = {};
    for (const k of PERSISTED) if (data[k] !== undefined) (patch as Record<string, unknown>)[k] = data[k];
    patch.settings = { ...DEFAULT_SETTINGS, ...(data.settings ?? {}), apiKey };
    setState(patch);
  } else {
    // Fusion : on garde, pour chaque leçon/carte, l'état le plus avancé.
    const progress = { ...state.progress };
    for (const [k, v] of Object.entries((data.progress ?? {}) as Record<string, LessonProgress>)) {
      const cur = progress[k];
      const rank = (s?: LessonProgress) => (!s ? -1 : ["nouveau", "en-cours", "acquis", "termine"].indexOf(s.status));
      if (!cur || rank(v) > rank(cur) || (rank(v) === rank(cur) && (v.lastOpened ?? 0) > (cur.lastOpened ?? 0))) progress[k] = v;
    }
    const srs = { ...state.srs };
    for (const [k, v] of Object.entries((data.srs ?? {}) as Record<string, SrsCard>)) {
      if (!srs[k] || v.reps > srs[k].reps) srs[k] = v;
    }
    const notes = { ...(data.notes ?? {}), ...state.notes };
    const drafts = { ...(data.drafts ?? {}), ...state.drafts };
    const certs = { ...(data.certs ?? {}), ...state.certs };
    const chats = [...state.chats, ...((data.chats ?? []) as Chat[]).filter((c) => !state.chats.some((x) => x.id === c.id))];
    const reports = [
      ...state.reports,
      ...((data.reports ?? []) as SavedReport[]).filter((r) => !state.reports.some((x) => x.id === r.id)),
    ];
    const dp = (data.profile ?? DEFAULT_PROFILE) as Profile;
    const days = { ...dp.days };
    for (const [d, m] of Object.entries(state.profile.days)) days[d] = Math.max(m, days[d] ?? 0);
    const profile: Profile = {
      ...state.profile,
      xp: Math.max(state.profile.xp, dp.xp),
      bestStreak: Math.max(state.profile.bestStreak, dp.bestStreak),
      badges: [...new Set([...state.profile.badges, ...dp.badges])],
      exercisesDone: Math.max(state.profile.exercisesDone, dp.exercisesDone),
      labsPassed: [...new Set([...(state.profile.labsPassed ?? []), ...(dp.labsPassed ?? [])])],
      cardsReviewed: Math.max(state.profile.cardsReviewed, dp.cardsReviewed),
      days,
    };
    setState({ progress, srs, notes, drafts, certs, chats, reports, profile });
  }
}

export function resetAll() {
  const apiKey = state.settings.apiKey;
  setState({
    settings: { ...DEFAULT_SETTINGS, apiKey },
    profile: DEFAULT_PROFILE,
    progress: {},
    srs: {},
    notes: {},
    drafts: {},
  certs: {},
    chats: [],
    reports: [],
    lastLesson: "",
  });
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
