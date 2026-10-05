import { useSyncExternalStore } from "react";
import { spokenText } from "./markdown";

// Lecture audio des cours par la synthèse vocale de l'appareil
// (Web Speech API : disponible sur iPhone/iPad, Mac, Windows, Android).
// Le texte est lu bloc par bloc, ce qui permet de reprendre exactement
// au paragraphe où l'on s'est arrêté.

export interface TtsState {
  supported: boolean;
  key: string; // leçon chargée
  title: string;
  href: string;
  blocks: string[];
  index: number;
  playing: boolean;
  rate: number;
  voiceName: string;
}

let st: TtsState = {
  supported: typeof window !== "undefined" && "speechSynthesis" in window,
  key: "",
  title: "",
  href: "",
  blocks: [],
  index: 0,
  playing: false,
  rate: 1,
  voiceName: "",
};
const listeners = new Set<() => void>();
const set = (p: Partial<TtsState>) => {
  st = { ...st, ...p };
  listeners.forEach((l) => l());
};
export const useTts = <T,>(sel: (s: TtsState) => T) =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(st),
  );
export const getTts = () => st;

let generation = 0;
let onBlockCb: ((key: string, i: number) => void) | null = null;
export function onBlock(cb: (key: string, i: number) => void) {
  onBlockCb = cb;
}

// ---------- Voix ----------
let voicesCache: SpeechSynthesisVoice[] = [];
export function frenchVoices(): SpeechSynthesisVoice[] {
  if (!st.supported) return [];
  const v = speechSynthesis.getVoices().filter((x) => x.lang.toLowerCase().startsWith("fr"));
  if (v.length) voicesCache = v;
  return voicesCache;
}
if (st.supported) {
  speechSynthesis.onvoiceschanged = () => {
    frenchVoices();
    listeners.forEach((l) => l());
  };
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = frenchVoices();
  if (st.voiceName) {
    const v = voices.find((x) => x.name === st.voiceName);
    if (v) return v;
  }
  const pref = [/natural|neural|online/i, /premium|enhanced|amélioré/i, /amélie|thomas|audrey|marie|denise|henri/i, /google/i];
  for (const re of pref) {
    const v = voices.find((x) => re.test(x.name) && x.lang.toLowerCase() === "fr-fr");
    if (v) return v;
  }
  return voices.find((x) => x.lang.toLowerCase() === "fr-fr") ?? voices[0];
}

// Découpe en morceaux ≤ 220 caractères (contourne la coupure des longues
// phrases sur Chrome et Safari).
function chunks(text: string): string[] {
  const sentences = text.match(/[^.!?;:]+[.!?;:]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > 220 && cur) {
      out.push(cur);
      cur = "";
    }
    if (s.length > 220) {
      for (const part of s.split(/,\s*/)) {
        if ((cur + part).length > 220 && cur) {
          out.push(cur);
          cur = "";
        }
        cur += part + ", ";
      }
    } else cur += s;
  }
  if (cur.trim()) out.push(cur);
  return out.map((c) => c.trim()).filter(Boolean);
}

function speakFrom(i: number) {
  if (!st.supported) return;
  const gen = ++generation;
  speechSynthesis.cancel();
  if (i >= st.blocks.length) {
    set({ playing: false, index: Math.max(0, st.blocks.length - 1) });
    onBlockCb?.(st.key, st.blocks.length); // fin de la leçon
    return;
  }
  set({ index: i, playing: true });
  onBlockCb?.(st.key, i);
  const parts = chunks(spokenText(st.blocks[i]));
  const voice = pickVoice();
  let p = 0;
  const next = () => {
    if (gen !== generation) return;
    if (p >= parts.length) return speakFrom(i + 1);
    const u = new SpeechSynthesisUtterance(parts[p++]);
    u.lang = "fr-FR";
    if (voice) u.voice = voice;
    u.rate = st.rate;
    u.onend = () => setTimeout(next, 60);
    u.onerror = (e) => {
      if (gen !== generation) return;
      if (e.error === "interrupted" || e.error === "canceled") return;
      setTimeout(next, 60);
    };
    speechSynthesis.speak(u);
  };
  // Safari : un léger délai après cancel() évite que la file soit ignorée.
  setTimeout(next, 80);
  updateMediaSession();
}

export function loadAndPlay(opts: { key: string; title: string; href: string; blocks: string[]; start: number }) {
  set({ key: opts.key, title: opts.title, href: opts.href, blocks: opts.blocks });
  speakFrom(Math.max(0, Math.min(opts.start, opts.blocks.length - 1)));
}

export function updateBlocks(key: string, blocks: string[]) {
  if (st.key === key) set({ blocks });
}

export function pause() {
  generation++;
  if (st.supported) speechSynthesis.cancel();
  set({ playing: false });
}

export function resume() {
  speakFrom(st.index);
}

export function stop() {
  pause();
  set({ key: "", title: "", href: "", blocks: [], index: 0 });
}

export function skip(delta: number) {
  speakFrom(Math.max(0, Math.min(st.blocks.length - 1, st.index + delta)));
}

export function jumpTo(i: number) {
  speakFrom(i);
}

export function setRate(rate: number) {
  set({ rate });
  if (st.playing) speakFrom(st.index);
}

export function setVoice(name: string) {
  set({ voiceName: name });
  if (st.playing) speakFrom(st.index);
}

export function previewVoice(name: string, rate: number) {
  if (!st.supported) return;
  pause();
  const u = new SpeechSynthesisUtterance(
    "Bonjour. Article 1104 du Code civil : les contrats doivent être négociés, formés et exécutés de bonne foi.",
  );
  const v = frenchVoices().find((x) => x.name === name);
  if (v) u.voice = v;
  u.lang = "fr-FR";
  u.rate = rate;
  speechSynthesis.speak(u);
}

function updateMediaSession() {
  try {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: st.title, artist: "TechCampus" });
    navigator.mediaSession.setActionHandler("play", () => resume());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => skip(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => skip(-1));
  } catch {
    /* non supporté */
  }
}
