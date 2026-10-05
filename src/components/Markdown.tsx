import { forwardRef, useMemo } from "react";
import { renderMarkdown } from "../lib/markdown";
import { go } from "../lib/router";
import { toast } from "../lib/store";

// Ouvre un extrait de code d'une leçon dans le labo correspondant.
export function openInLab(lang: string, code: string) {
  sessionStorage.setItem("tc-lab", JSON.stringify({ lang, code }));
  go("/labo/" + (lang === "bash" ? "terminal" : lang));
}

const Markdown = forwardRef<HTMLDivElement, { text: string; className?: string }>(({ text, className }, ref) => {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return (
    <div
      ref={ref}
      className={"prose " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".code-btn");
        if (!btn) return;
        e.stopPropagation();
        const code = btn.closest(".code-block")?.querySelector("code")?.textContent ?? "";
        if (btn.dataset.act === "copy") {
          navigator.clipboard?.writeText(code).then(
            () => toast("Code copié"),
            () => toast("Copie impossible sur cet appareil"),
          );
        } else if (btn.dataset.act === "try") openInLab(btn.dataset.lang ?? "python", code.replace(/\n$/, ""));
      }}
    />
  );
});

export default Markdown;
