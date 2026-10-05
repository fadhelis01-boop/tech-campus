import { useEffect, useMemo, useRef, useState } from "react";
import { Shell, type ShellSnapshot } from "../lib/shell/shell";
import { setDraft, getState } from "../lib/store";
import CodeEditor from "./CodeEditor";
import type { TerminalTask } from "../lib/types";

// Terminal simulé interactif : historique (↑/↓), complétion (Tab),
// éditeur intégré (edit / nano), objectifs vérifiés en direct.
// L'état complet (fichiers, dépôts Git, conteneurs…) est enregistré :
// on reprend exactement où on s'était arrêté.

interface Line {
  kind: "cmd" | "out" | "err" | "info";
  text: string;
  prompt?: string;
}

const MOBILE_KEYS = ["Tab", "↑", "↓", "|", ">", "-", "/", "~", "*", ".", "&&", "$", '"', "'"];

export default function TerminalView(props: {
  storageKey: string;
  files?: Record<string, string>;
  prepare?: string[];
  tasks?: TerminalTask[];
  intro?: string;
  onAllDone?: () => void;
  onAskAi?: (transcript: string) => void;
}) {
  const [nonce, setNonce] = useState(0);
  const shell = useMemo(() => {
    const raw = getState().drafts[props.storageKey];
    if (raw) {
      try {
        return new Shell(JSON.parse(raw) as ShellSnapshot);
      } catch {
        /* état illisible : on repart de zéro */
      }
    }
    const s = new Shell();
    if (props.files) s.seed(props.files);
    if (props.prepare?.length) s.prepare(props.prepare);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.storageKey, nonce]);

  const [lines, setLines] = useState<Line[]>(() => [
    { kind: "info", text: props.intro ?? "Terminal Linux simulé — tapez « help » pour la liste des commandes. Rien de ce que vous faites ici ne peut abîmer votre appareil." },
    ...(shell.history.length ? [{ kind: "info" as const, text: `↺ Session reprise (${shell.history.length} commande(s) déjà tapée(s)). « reset » ci-dessous pour repartir de zéro.` }] : []),
  ]);
  const [input, setInput] = useState("");
  const [hIdx, setHIdx] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ path: string; text: string } | null>(null);
  // Un objectif atteint reste coché (« aller dans Documents » reste acquis même si l'on en ressort).
  const doneKey = props.storageKey + ":done";
  const [done, setDone] = useState<boolean[]>(() => {
    let saved: boolean[] = [];
    try {
      saved = JSON.parse(getState().drafts[doneKey] ?? "[]");
    } catch {
      /* ignoré */
    }
    return (props.tasks ?? []).map((t, i) => !!saved[i] || shell.check(t.check));
  });
  const doneRef = useRef(done);
  const [showHint, setShowHint] = useState<number | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  const reported = useRef(done.length > 0 && done.every(Boolean));

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  function persist() {
    setDraft(props.storageKey, JSON.stringify(shell.snapshot()));
    const d = (props.tasks ?? []).map((t, i) => doneRef.current[i] || shell.check(t.check));
    doneRef.current = d;
    setDraft(doneKey, JSON.stringify(d));
    setDone(d);
    if (d.length && d.every(Boolean) && !reported.current) {
      reported.current = true;
      props.onAllDone?.();
    }
  }

  function promptText() {
    const p = shell.prompt();
    return `${p.user}:${p.path}${p.branch ? ` (${p.branch})` : ""}$`;
  }

  function submit(cmd: string) {
    const pr = promptText();
    const r = shell.exec(cmd);
    if (r.clear) {
      setLines([]);
    } else {
      setLines((l) => [...l, { kind: "cmd", text: cmd, prompt: pr }, ...(r.out ? [{ kind: r.err ? ("err" as const) : ("out" as const), text: r.out }] : [])]);
    }
    if (r.edit) {
      let text = "";
      try {
        text = shell.vfs.read(r.edit);
      } catch {
        /* nouveau fichier */
      }
      setEditing({ path: r.edit, text });
    }
    setInput("");
    setHIdx(null);
    persist();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      historyMove(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyMove(1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((l) => [...l, { kind: "cmd", text: input + "^C", prompt: promptText() }]);
      setInput("");
    }
  }

  function historyMove(dir: number) {
    const h = shell.history;
    if (!h.length) return;
    const cur = hIdx ?? h.length;
    const next = Math.max(0, Math.min(h.length, cur + dir));
    setHIdx(next);
    setInput(next === h.length ? "" : h[next]);
  }

  function complete() {
    const opts = shell.completions(input);
    if (!opts.length) return;
    const words = input.split(/\s+/);
    if (opts.length === 1) {
      words[words.length - 1] = opts[0];
      setInput(words.join(" ") + (opts[0].endsWith("/") ? "" : " "));
    } else {
      // préfixe commun + liste des possibilités
      let pre = opts[0];
      for (const o of opts) while (!o.startsWith(pre)) pre = pre.slice(0, -1);
      words[words.length - 1] = pre;
      setInput(words.join(" "));
      setLines((l) => [...l, { kind: "cmd", text: input, prompt: promptText() }, { kind: "out", text: opts.join("  ") }]);
    }
  }

  function mobileKey(k: string) {
    if (k === "Tab") complete();
    else if (k === "↑") historyMove(-1);
    else if (k === "↓") historyMove(1);
    else setInput((v) => v + (k === "&&" ? " && " : k));
    inp.current?.focus();
  }

  function reset() {
    if (!confirm("Effacer cette session (fichiers, dépôts, conteneurs) et repartir de zéro ?")) return;
    setDraft(props.storageKey, null);
    setNonce((n) => n + 1);
    setLines([{ kind: "info", text: "Nouvelle session : tout a été remis à zéro." }]);
    setDraft(doneKey, null);
    doneRef.current = (props.tasks ?? []).map(() => false);
    setDone(doneRef.current);
    reported.current = false;
  }

  const transcript = () =>
    lines
      .slice(-40)
      .map((l) => (l.kind === "cmd" ? `${l.prompt} ${l.text}` : l.text))
      .join("\n");

  return (
    <div className="terminal-lab">
      {props.tasks?.length ? (
        <ol className="tasks">
          {props.tasks.map((t, i) => (
            <li key={i} className={done[i] ? "ok" : ""}>
              <span className="task-check" aria-label={done[i] ? "fait" : "à faire"}>
                {done[i] ? "✔" : i + 1}
              </span>
              <span className="task-label">
                {t.label}
                {t.hint && !done[i] && (
                  <button className="mini-link" onClick={() => setShowHint(showHint === i ? null : i)}>
                    {showHint === i ? "masquer l'indice" : "indice"}
                  </button>
                )}
                {showHint === i && !done[i] && <span className="task-hint">💡 {t.hint}</span>}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      {props.tasks?.length && done.every(Boolean) ? <div className="alert alert-ok">🎉 Tous les objectifs sont atteints. Bravo !</div> : null}

      <div className="terminal" ref={screen} onClick={() => !window.getSelection()?.toString() && inp.current?.focus()}>
        {lines.map((l, i) =>
          l.kind === "cmd" ? (
            <div key={i} className="t-line">
              <span className="t-prompt">{l.prompt}</span> {l.text}
            </div>
          ) : (
            <pre key={i} className={"t-" + l.kind}>
              {l.text}
            </pre>
          ),
        )}
        <div className="t-line t-input-line">
          <label htmlFor={"t-in-" + props.storageKey} className="t-prompt">
            {promptText()}
          </label>
          <input
            id={"t-in-" + props.storageKey}
            ref={inp}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            aria-label="Commande"
          />
        </div>
      </div>
      <div className="key-bar">
        {MOBILE_KEYS.map((k) => (
          <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => mobileKey(k)}>
            {k}
          </button>
        ))}
        <button type="button" className="key-enter" onMouseDown={(e) => e.preventDefault()} onClick={() => submit(input)}>
          ⏎
        </button>
      </div>
      <div className="actions-row">
        <button className="mini-link" onClick={reset}>
          ⟲ Repartir de zéro
        </button>
        {props.onAskAi && (
          <button className="mini-link" onClick={() => props.onAskAi!(transcript())}>
            🤖 Je suis bloqué : demander à l'assistant
          </button>
        )}
      </div>

      {editing && (
        <div className="modal" role="dialog" aria-label={"Édition de " + editing.path}>
          <div className="modal-box">
            <h3>✎ {editing.path.replace("/home/apprenant", "~")}</h3>
            <CodeEditor
              value={editing.text}
              onChange={(v) => setEditing({ ...editing, text: v })}
              lang={/\.ya?ml$/.test(editing.path) ? "yaml" : /\.py$/.test(editing.path) ? "python" : /Dockerfile$/.test(editing.path) ? "dockerfile" : /\.tf$/.test(editing.path) ? "hcl" : "text"}
              minRows={10}
            />
            <div className="actions-row">
              <button
                className="btn"
                onClick={() => {
                  try {
                    shell.vfs.write(editing.path, editing.text.endsWith("\n") || !editing.text ? editing.text : editing.text + "\n");
                    setLines((l) => [...l, { kind: "info", text: `Fichier enregistré : ${editing.path.replace("/home/apprenant", "~")}` }]);
                  } catch (e) {
                    setLines((l) => [...l, { kind: "err", text: (e as Error).message }]);
                  }
                  setEditing(null);
                  persist();
                  setTimeout(() => inp.current?.focus(), 50);
                }}
              >
                Enregistrer
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
