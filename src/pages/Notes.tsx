import { useStore } from "../lib/store";
import { useContent, findLesson } from "../lib/content";

export function download(name: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: type + ";charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

export default function Notes() {
  const notes = useStore((s) => s.notes);
  useContent((c) => c.packs);
  const entries = Object.entries(notes).map(([k, text]) => {
    const [p, l] = k.split("/");
    return { k, text, f: findLesson(p, l) };
  });

  function exportMd() {
    const md = entries
      .map((e) => `## ${e.f?.lesson.title ?? e.k}\n*${e.f ? e.f.pack.title + " › " + e.f.module.title : ""}*\n\n${e.text}\n`)
      .join("\n");
    download(`techcampus-notes-${new Date().toLocaleDateString("sv-SE")}.md`, `# Mes notes TechCampus\n\n${md}`, "text/markdown");
  }

  return (
    <div className="page">
      <div className="section-head">
        <h1>🗒️ Mes notes</h1>
        {entries.length > 0 && (
          <button className="btn btn-ghost btn-small" onClick={exportMd}>
            Exporter (Markdown)
          </button>
        )}
      </div>
      {!entries.length && <p className="muted">Vos notes de leçon apparaîtront ici. Elles s'écrivent en bas de chaque leçon.</p>}
      {entries.map((e) => (
        <a key={e.k} href={`#/lecon/${e.k}`} className="card note-card">
          <strong>{e.f?.lesson.title ?? e.k}</strong>
          <small className="muted">{e.f ? `${e.f.pack.icon} ${e.f.pack.title}` : ""}</small>
          <p className="pre-wrap">{e.text}</p>
        </a>
      ))}
    </div>
  );
}
