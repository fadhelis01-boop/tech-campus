import { useEffect, useRef } from "react";

// Éditeur de code léger : numéros de ligne, indentation automatique,
// Tab / Maj+Tab, Ctrl+Entrée pour exécuter, et une barre de touches
// spéciales pour téléphone et tablette (où « : », « [ », « | »… sont
// pénibles à trouver sur le clavier virtuel).

const KEYS: Record<string, string[]> = {
  python: ["⇥", ":", "(", ")", "[", "]", "{", "}", '"', "'", "=", "_", "#", ".", ",", "+", "-", "*", "/", "<", ">", "!"],
  sql: ["*", ",", "(", ")", "'", "=", "<", ">", ";", ".", "_", "%"],
  yaml: ["⇥", ":", "-", '"', "#", "[", "]", "{", "}", "|", ".", "/", "$", "_"],
  dockerfile: ["⇥", "/", ".", "-", '"', "[", "]", ",", ":", "=", "$", "&"],
  hcl: ["⇥", "{", "}", "=", '"', "[", "]", ".", "_", "-", "#", "$"],
  json: ["{", "}", "[", "]", ":", ",", '"'],
  text: ["⇥", "-", ".", "/", ":", "=", "#", "$", "|", ">"],
  ini: ["[", "]", "=", "#", ".", "_"],
};

export default function CodeEditor(props: {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  lang?: string;
  minRows?: number;
  label?: string;
  readOnly?: boolean;
}) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const indentUnit = props.lang === "python" ? "    " : "  ";
  const lines = props.value.split("\n").length;
  const rows = Math.max(props.minRows ?? 8, Math.min(lines + 1, 28));

  useEffect(() => {
    const t = ta.current;
    const g = gutter.current;
    if (!t || !g) return;
    const sync = () => (g.scrollTop = t.scrollTop);
    t.addEventListener("scroll", sync);
    return () => t.removeEventListener("scroll", sync);
  }, []);

  function apply(next: string, selStart: number, selEnd = selStart) {
    props.onChange(next);
    requestAnimationFrame(() => {
      const t = ta.current;
      if (!t) return;
      t.selectionStart = selStart;
      t.selectionEnd = selEnd;
    });
  }

  function insert(text: string) {
    const t = ta.current;
    if (!t) return;
    const { selectionStart: s, selectionEnd: e, value: v } = t;
    if (text === "⇥") text = indentUnit;
    apply(v.slice(0, s) + text + v.slice(e), s + text.length);
    t.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value: v } = t;
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      props.onRun?.();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      if (s !== en || e.shiftKey) {
        // (dés)indente toutes les lignes sélectionnées
        const end = v.indexOf("\n", en - 1) === -1 ? v.length : v.indexOf("\n", en - 1);
        const block = v.slice(lineStart, end);
        const changed = block
          .split("\n")
          .map((l) => (e.shiftKey ? l.replace(new RegExp("^ {1," + indentUnit.length + "}"), "") : indentUnit + l))
          .join("\n");
        apply(v.slice(0, lineStart) + changed + v.slice(end), lineStart, lineStart + changed.length);
      } else apply(v.slice(0, s) + indentUnit + v.slice(en), s + indentUnit.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const line = v.slice(lineStart, s);
      let indent = line.match(/^\s*/)![0];
      if (props.lang === "python" && /:\s*(#.*)?$/.test(line)) indent += indentUnit;
      if (props.lang === "yaml" && /:\s*$/.test(line)) indent += indentUnit;
      if (props.lang === "hcl" && /{\s*$/.test(line)) indent += indentUnit;
      const ins = "\n" + indent;
      apply(v.slice(0, s) + ins + v.slice(en), s + ins.length);
      return;
    }
    if (e.key === "Backspace" && s === en && s > 0) {
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (before.length && /^ +$/.test(before) && before.length % indentUnit.length === 0) {
        e.preventDefault();
        apply(v.slice(0, s - indentUnit.length) + v.slice(s), s - indentUnit.length);
      }
    }
  }

  return (
    <div className="code-editor">
      <div className="code-wrap">
        <div className="code-gutter" ref={gutter} aria-hidden="true">
          {Array.from({ length: Math.max(lines, rows) }, (_, i) => (
            <div key={i}>{i < lines ? i + 1 : ""}</div>
          ))}
        </div>
        <textarea
          ref={ta}
          className="code-input"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          readOnly={props.readOnly}
          aria-label={props.label ?? "Éditeur de code"}
          wrap="off"
        />
      </div>
      {!props.readOnly && (
        <div className="key-bar" aria-label="Touches spéciales">
          {(KEYS[props.lang ?? "text"] ?? KEYS.text).map((k) => (
            <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(k)}>
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
