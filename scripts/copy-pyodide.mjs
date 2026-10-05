// Copie le cœur de Pyodide (Python 3 en WebAssembly) dans public/pyodide :
// l'application l'héberge elle-même (même origine, fonctionne hors connexion
// une fois mis en cache). Les paquets supplémentaires (pandas…) restent
// téléchargés depuis le CDN officiel à la demande.
import { cpSync, mkdirSync, existsSync } from "node:fs";

const FILES = ["pyodide.mjs", "pyodide.js", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json", "package.json"];
mkdirSync("public/pyodide", { recursive: true });
for (const f of FILES) {
  const src = "node_modules/pyodide/" + f;
  if (!existsSync(src)) throw new Error("Fichier Pyodide manquant : " + src + " (npm install)");
  cpSync(src, "public/pyodide/" + f);
}
console.log("Pyodide copié dans public/pyodide.");
