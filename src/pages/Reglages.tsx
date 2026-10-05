import { useEffect, useRef, useState } from "react";
import { useStore, updateSettings, exportBackup, importBackup, resetAll, toast } from "../lib/store";
import { MODELS, runClaude } from "../lib/ai";
import { frenchVoices, previewVoice, useTts } from "../lib/tts";
import { download } from "./Notes";
import { tracks } from "../lib/content";

export default function Reglages() {
  const s = useStore((x) => x.settings);
  useTts((t) => t.supported);
  const [key, setKey] = useState(s.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [test, setTest] = useState("");
  const [voices, setVoices] = useState(frenchVoices());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setVoices(frenchVoices()), 800);
    return () => clearInterval(id);
  }, []);

  async function testKey() {
    updateSettings({ apiKey: key.trim() });
    setTest("Test en cours…");
    try {
      const r = await runClaude({
        system: "Réponds en une phrase.",
        messages: [{ role: "user", content: "En une phrase : que fait la commande « git status » ?" }],
        effort: "low",
        maxTokens: 2000,
      });
      setTest("✔ Clé valide. Réponse : " + r.text);
    } catch (e) {
      setTest("✘ " + (e as Error).message);
    }
  }

  function onImport(file: File, mode: "remplacer" | "fusionner") {
    file.text().then((t) => {
      try {
        importBackup(t, mode);
        toast("Sauvegarde restaurée");
      } catch (e) {
        alert((e as Error).message);
      }
    });
  }

  return (
    <div className="page settings">
      <h1>⚙️ Réglages</h1>

      <section className="card form">
        <h2>Profil</h2>
        <label>
          Prénom (pour l'accueil)
          <input value={s.name} onChange={(e) => updateSettings({ name: e.target.value })} />
        </label>
        <label>
          Métier visé
          <select value={s.track} onChange={(e) => updateSettings({ track: e.target.value })}>
            <option value="">Je ne sais pas encore</option>
            {tracks().map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Objectif quotidien : {s.dailyGoal} minutes
          <input type="range" min={5} max={90} step={5} value={s.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })} />
        </label>
      </section>

      <section className="card form">
        <h2>Affichage</h2>
        <label>
          Thème
          <select value={s.theme} onChange={(e) => updateSettings({ theme: e.target.value as typeof s.theme })}>
            <option value="auto">Automatique (selon l'appareil)</option>
            <option value="clair">Clair</option>
            <option value="sombre">Sombre</option>
          </select>
        </label>
        <label>
          Taille du texte : {Math.round(s.fontScale * 100)} %
          <input type="range" min={0.85} max={1.4} step={0.05} value={s.fontScale} onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })} />
        </label>
      </section>

      <section className="card form">
        <h2>Lecture audio</h2>
        {!("speechSynthesis" in window) ? (
          <p className="alert alert-error">La synthèse vocale n'est pas disponible dans ce navigateur.</p>
        ) : (
          <>
            <label>
              Voix
              <select value={s.ttsVoice} onChange={(e) => updateSettings({ ttsVoice: e.target.value })}>
                <option value="">Automatique (meilleure voix française disponible)</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Vitesse : ×{s.ttsRate}
              <input type="range" min={0.7} max={1.6} step={0.05} value={s.ttsRate} onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })} />
            </label>
            <button className="btn btn-ghost" onClick={() => previewVoice(s.ttsVoice, s.ttsRate)}>
              🔊 Essayer
            </button>
            <p className="small muted">
              Conseil : sur iPhone, installez des voix « améliorées » ou « premium » (Réglages → Accessibilité → Contenu
              énoncé → Voix → Français) ; sur Windows, les voix « Natural » d'Edge sont les plus agréables. La lecture
              s'interrompt si l'écran de l'iPhone se verrouille : laissez l'écran allumé pendant l'écoute.
            </p>
          </>
        )}
      </section>

      <section className="card form">
        <h2>Assistant IA (Claude)</h2>
        <p className="small muted">
          L'assistant répond aux questions avec des sources, explique vos erreurs de code, corrige vos projets, rédige
          les leçons des domaines que vous ajoutez et fait la veille technologique. Tout le reste de l'application
          (cours, audio, labos, quiz) fonctionne sans lui.
          Il fonctionne avec votre clé d'API personnelle (à créer sur <a href="https://console.anthropic.com/" target="_blank" rel="noopener">console.anthropic.com</a>,
          rubrique API Keys ; facturation à l'usage). La clé reste sur cet appareil et n'est envoyée qu'à l'API
          d'Anthropic. Fixez une limite de dépense mensuelle dans la console.
        </p>
        <label>
          Clé d'API
          <div className="row">
            <input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
            <button className="btn btn-ghost btn-small" onClick={() => setShowKey(!showKey)} type="button">
              {showKey ? "Masquer" : "Afficher"}
            </button>
          </div>
        </label>
        <div className="actions-row">
          <button className="btn" onClick={testKey} disabled={!key.trim()}>
            Enregistrer et tester
          </button>
          {s.apiKey && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                updateSettings({ apiKey: "" });
                setKey("");
              }}
            >
              Effacer la clé
            </button>
          )}
        </div>
        {test && <p className="small">{test}</p>}
        <label>
          Modèle
          <select value={s.model} onChange={(e) => updateSettings({ model: e.target.value })}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="switch">
          <input type="checkbox" checked={s.communitySources} onChange={(e) => updateSettings({ communitySources: e.target.checked })} />
          <span>Élargir la recherche à quelques sources communautaires reconnues (Real Python, Martin Fowler, roadmap.sh, blogs d'ingénierie…) en plus des documentations officielles</span>
        </label>
      </section>

      <section className="card form">
        <h2>Sauvegarde et changement d'appareil</h2>
        <p className="small muted">
          Vos progrès, notes, cartes et conversations sont stockés sur cet appareil. Pour passer du PC à l'iPhone (ou
          l'inverse) : exportez ici, puis importez le fichier sur l'autre appareil (« fusionner » conserve le meilleur des
          deux). Pensez à exporter régulièrement.
        </p>
        <div className="actions-row">
          <button className="btn" onClick={() => download(`techcampus-sauvegarde-${new Date().toLocaleDateString("sv-SE")}.json`, exportBackup(), "application/json")}>
            ⬇️ Exporter ma progression
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            ⬆️ Importer une sauvegarde
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const mode = confirm("Fusionner avec la progression actuelle ?\n\nOK = fusionner (recommandé)\nAnnuler = remplacer entièrement") ? "fusionner" : "remplacer";
              onImport(f, mode);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="card form danger">
        <h2>Réinitialisation</h2>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm("Effacer toute la progression, les notes, les cartes et les conversations ? (La clé d'API est conservée.)")) resetAll();
          }}
        >
          Tout remettre à zéro
        </button>
      </section>
    </div>
  );
}
