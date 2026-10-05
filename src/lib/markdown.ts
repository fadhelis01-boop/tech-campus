import { marked } from "marked";
import DOMPurify from "dompurify";

// Blocs pédagogiques utilisables dans les leçons :
//   :::analogie Pour comprendre      → une image de la vie courante
//   :::metier En entreprise          → l'usage concret, en poste
//   :::piege / :::futur / :::retenir / :::astuce / :::attention / :::exemple / :::definition / :::methode
//   :::                              → fin du bloc
export const CALLOUTS: Record<string, { icon: string; label: string }> = {
  analogie: { icon: "🧸", label: "Pour comprendre" },
  definition: { icon: "📖", label: "Définition" },
  retenir: { icon: "📌", label: "À retenir" },
  astuce: { icon: "💡", label: "Astuce" },
  attention: { icon: "⚠️", label: "Attention" },
  exemple: { icon: "🧩", label: "Exemple" },
  methode: { icon: "🧭", label: "Méthode" },
  metier: { icon: "💼", label: "En entreprise" },
  piege: { icon: "🪤", label: "Piège classique" },
  futur: { icon: "🚀", label: "Tendance" },
  commande: { icon: "⌨️", label: "À taper" },
  defi: { icon: "🏁", label: "Mini-défi" },
};

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function preprocess(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let open = false;
  for (const line of lines) {
    const m = line.match(/^:::\s*([a-z]+)\s*(.*)$/);
    if (m && CALLOUTS[m[1]]) {
      if (open) out.push("", "</div>", "");
      const c = CALLOUTS[m[1]];
      const title = m[2].trim();
      out.push(
        "",
        `<div class="callout callout-${m[1]}"><div class="callout-title"><span aria-hidden="true">${c.icon}</span> ${escapeHtml(title || c.label)}</div>`,
        "",
      );
      open = true;
    } else if (/^:::\s*$/.test(line) && open) {
      out.push("", "</div>", "");
      open = false;
    } else out.push(line);
  }
  if (open) out.push("", "</div>", "");
  return out.join("\n");
}

// Blocs de code : bouton « Copier » partout, « Essayer » pour Python et SQL
// (le code s'ouvre dans le labo), « Terminal » pour bash.
function decorateCode(html: string) {
  return html.replace(/<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g, (_m, lang: string, code: string) => {
    const runnable = ["python", "py", "sql", "bash", "sh", "shell"].includes(lang);
    const target = lang === "py" ? "python" : ["sh", "shell"].includes(lang) ? "bash" : lang;
    const tryBtn = runnable
      ? `<button type="button" class="code-btn code-try" data-act="try" data-lang="${target}">${target === "bash" ? "⌨️ Terminal" : "▶ Essayer"}</button>`
      : "";
    return `<div class="code-block"><div class="code-head"><span>${lang}</span><span class="code-btns"><button type="button" class="code-btn" data-act="copy">Copier</button>${tryBtn}</span></div><pre><code class="language-${lang}">${code}</code></pre></div>`;
  });
}

export function renderMarkdown(md: string): string {
  const html = marked.parse(preprocess(md), { async: false }) as string;
  const clean = DOMPurify.sanitize(decorateCode(html), { ADD_ATTR: ["target"] });
  return clean;
}

// Texte « lisible à voix haute » : quelques sigles et symboles développés.
const SPOKEN: [RegExp, string][] = [
  [/\bk8s\b/gi, "Kubernetes"],
  [/\bCI\/CD\b/g, "CI CD"],
  [/\bvs\.?\s/g, "versus "],
  [/\be\.g\.\s/g, "par exemple "],
  [/\bcf\.\s/g, "voir "],
  [/\bex\.\s/g, "par exemple "],
  [/≈/g, " environ "],
  [/→/g, ", donc "],
  [/⇒/g, ", donc "],
  [/≠/g, " différent de "],
  [/≤/g, " inférieur ou égal à "],
  [/≥/g, " supérieur ou égal à "],
  [/(\d)[   ](\d{3})/g, "$1$2"],
  [/(\d)[   ](\d{3})/g, "$1$2"],
  [/ × /g, " fois "],
  [/ = /g, " égale "],
  [/€/g, " euros"],
  [/ %/g, " pour cent"],
  [/✔|✘|✓/g, ""],
  [/[*_`#>|]/g, " "],
];


export function spokenText(s: string) {
  let t = s;
  for (const [re, rep] of SPOKEN) t = t.replace(re, rep);
  return t.replace(/\s+/g, " ").trim();
}

// Découpe le rendu HTML en blocs lisibles (paragraphes, titres, items).
export function collectBlocks(root: HTMLElement): HTMLElement[] {
  // Les tableaux (écritures comptables, bilans, comparatifs) sont lus ligne
  // par ligne, chaque cellule précédée de l'intitulé de sa colonne.
  const sel = "h1,h2,h3,h4,p,li,.callout-title,blockquote,tbody tr,pre";
  const els = Array.from(root.querySelectorAll<HTMLElement>(sel));
  return els.filter((el) => {
    if (el.tagName === "LI" && el.querySelector(":scope > p")) return false; // ses <p> seront lus
    if (el.tagName === "BLOCKQUOTE" && el.querySelector("p")) return false;
    if (el.tagName === "P" && el.closest("td,th")) return false;
    return (el.textContent ?? "").trim().length > 0;
  });
}

export function blockText(el: HTMLElement) {
  if (el.tagName === "TR") {
    const table = el.closest("table");
    const heads = Array.from(table?.querySelectorAll("thead th") ?? []).map((h) => (h.textContent ?? "").trim());
    const cells = Array.from(el.children).map((c) => (c.textContent ?? "").trim());
    const parts = cells
      .map((c, i) => {
        if (!c) return "";
        const h = heads[i];
        // Première colonne : on la lit telle quelle (c'est l'intitulé de la ligne)
        if (i === 0 || !h) return c;
        return `${h} : ${c}`;
      })
      .filter(Boolean);
    return parts.join(" ; ") + ".";
  }
  if (el.tagName === "PRE") {
    // Le code se lit à l'écran : on n'énonce que les commandes très courtes.
    const code = (el.textContent ?? "").trim();
    const n = code.split("\n").length;
    const lang = el.querySelector("code")?.className.replace("language-", "") ?? "";
    if (n === 1 && code.length <= 60) return `Commande : ${code.replace(/-/g, " tiret ").replace(/\//g, " slash ").replace(/\|/g, " pipe ").replace(/\./g, " point ")}.`;
    return `Exemple de code ${lang ? "en " + lang + " " : ""}de ${n} lignes, à lire à l'écran.`;
  }
  if (el.tagName === "LI") {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("ul,ol").forEach((n) => n.remove());
    return clone.textContent ?? "";
  }
  return el.textContent ?? "";
}

export function plainFromMarkdown(md: string) {
  return md
    .replace(/^:::.*$/gm, "")
    .replace(/[#*_>`|]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
