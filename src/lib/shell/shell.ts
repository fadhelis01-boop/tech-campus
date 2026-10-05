// Terminal Linux simulé (bash simplifié) : fichiers, tubes « | »,
// redirections « > » « >> », enchaînements « && » « ; », variables,
// motifs « * », plus Git, Docker et kubectl simulés.
// Tout tourne dans le navigateur : on peut tout casser sans risque.
import { Vfs, HOME, normalize, parentOf, baseName, globToRe, type FNode } from "./vfs";
import { Git, type Repo, type GitConfig } from "./git";
import { Docker, Kube, type Container, type K8sObject } from "./containers";
import type { TerminalCheck } from "../types";

export interface ExecResult {
  out: string;
  err?: boolean;
  clear?: boolean;
  edit?: string; // chemin à ouvrir dans l'éditeur intégré
}

export interface ShellSnapshot {
  root: FNode;
  cwd: string;
  env: Record<string, string>;
  history: string[];
  outputs: string[];
  repos: Record<string, Repo>;
  gitConfig: GitConfig;
  images: Docker["images"];
  containers: Container[];
  k8s: K8sObject[];
}

type Cmd = (args: string[], stdin: string) => ExecResult;

const HELP: Record<string, string> = {
  pwd: "pwd — affiche le dossier courant (print working directory)",
  ls: "ls [-l] [-a] [chemin] — liste le contenu d'un dossier ; -l : détails ; -a : fichiers cachés",
  cd: "cd <dossier> — change de dossier ; « cd .. » remonte ; « cd ~ » ou « cd » revient au dossier personnel",
  mkdir: "mkdir [-p] <dossier> — crée un dossier ; -p crée aussi les dossiers parents",
  touch: "touch <fichier> — crée un fichier vide (ou met à jour sa date)",
  cat: "cat <fichier> — affiche le contenu d'un fichier",
  echo: "echo <texte> — affiche un texte ; « echo texte > f » écrit dans f ; « >> » ajoute à la fin",
  rm: "rm [-r] [-f] <chemin> — supprime (définitivement !) ; -r pour un dossier",
  rmdir: "rmdir <dossier> — supprime un dossier vide",
  cp: "cp [-r] <source> <destination> — copie",
  mv: "mv <source> <destination> — déplace ou renomme",
  head: "head [-n N] <fichier> — les N premières lignes (10 par défaut)",
  tail: "tail [-n N] <fichier> — les N dernières lignes",
  wc: "wc [-l|-w|-c] <fichier> — compte lignes, mots, caractères",
  grep: "grep [-i] [-n] [-c] [-v] [-r] <motif> <fichier> — cherche les lignes contenant un motif",
  sort: "sort [-r] [-n] [-u] — trie les lignes",
  uniq: "uniq [-c] — supprime les doublons consécutifs (-c : les compte)",
  cut: "cut -d<séparateur> -f<n° de colonne> — extrait des colonnes",
  find: "find <dossier> -name <motif> [-type f|d] — cherche des fichiers",
  chmod: "chmod <droits> <fichier> — change les permissions (ex. 755, +x, u+x)",
  tree: "tree [dossier] — affiche l'arborescence",
  history: "history — commandes déjà tapées",
  export: "export NOM=valeur — définit une variable d'environnement",
  env: "env — liste les variables d'environnement",
  whoami: "whoami — nom de l'utilisateur courant",
  edit: "edit <fichier> (ou nano, vim) — ouvre l'éditeur intégré",
  curl: "curl <url> — requête HTTP (ici : uniquement vers localhost et les conteneurs simulés)",
  git: "git <commande> — gestion de versions (git help)",
  docker: "docker <commande> — conteneurs (docker help)",
  kubectl: "kubectl <commande> — Kubernetes (kubectl help)",
  clear: "clear — efface l'écran",
};

export class Shell {
  vfs: Vfs;
  cwd = HOME;
  env: Record<string, string> = { HOME, USER: "apprenant", SHELL: "/bin/bash", PATH: "/usr/local/bin:/usr/bin:/bin", LANG: "fr_FR.UTF-8" };
  history: string[] = [];
  outputs: string[] = [];
  git: Git;
  docker: Docker;
  kube: Kube;
  private cmds: Record<string, Cmd>;

  constructor(snap?: ShellSnapshot) {
    this.vfs = new Vfs(snap?.root);
    this.git = new Git(this.vfs);
    this.docker = new Docker(this.vfs);
    this.kube = new Kube(this.vfs, this.docker);
    if (snap) {
      this.cwd = snap.cwd;
      this.env = snap.env;
      this.history = snap.history;
      this.outputs = snap.outputs ?? [];
      this.git.repos = snap.repos;
      this.git.config = snap.gitConfig;
      this.docker.images = snap.images;
      this.docker.containers = snap.containers;
      this.kube.objects = snap.k8s;
    }
    this.cmds = this.buildCommands();
  }

  snapshot(): ShellSnapshot {
    return JSON.parse(
      JSON.stringify({
        root: this.vfs.root,
        cwd: this.cwd,
        env: this.env,
        history: this.history.slice(-300),
        outputs: this.outputs.slice(-100),
        repos: this.git.repos,
        gitConfig: this.git.config,
        images: this.docker.images,
        containers: this.docker.containers,
        k8s: this.kube.objects,
      }),
    );
  }

  seed(files: Record<string, string>) {
    for (const [p, content] of Object.entries(files)) {
      const abs = normalize(p, HOME);
      if (p.endsWith("/")) {
        this.vfs.mkdirp(abs);
        continue;
      }
      this.vfs.mkdirp(parentOf(abs));
      this.vfs.write(abs, content);
    }
  }

  // Prépare une situation (dépôt avec historique, conflit…) sans que ces
  // commandes comptent comme tapées par l'élève.
  prepare(cmds: string[]) {
    for (const c of cmds) {
      const r = this.exec(c);
      if (r.err) console.warn(`Préparation : « ${c} » → ${r.out}`);
    }
    this.history = [];
    this.outputs = [];
    this.cwd = HOME;
  }

  prompt() {
    const p = this.cwd === HOME ? "~" : this.cwd.startsWith(HOME + "/") ? "~" + this.cwd.slice(HOME.length) : this.cwd;
    const repo = this.git.findRepo(this.cwd);
    return { user: "apprenant@techcampus", path: p, branch: repo ? repo.head : "" };
  }

  abs(p: string) {
    return normalize(p, this.cwd, HOME);
  }

  completions(partial: string): string[] {
    const words = partial.split(/\s+/);
    const last = words.at(-1) ?? "";
    if (words.length === 1) return Object.keys(this.cmds).filter((c) => c.startsWith(last));
    const dirPart = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
    const base = this.abs(dirPart || ".");
    return this.vfs
      .list(base)
      .filter((n) => n.startsWith(last.slice(dirPart.length)))
      .map((n) => dirPart + n + (this.vfs.isDir(base + "/" + n) ? "/" : ""));
  }

  // ---------- Exécution d'une ligne ----------
  exec(line: string): ExecResult {
    const trimmed = line.trim();
    if (!trimmed) return { out: "" };
    this.history.push(trimmed);
    let res: ExecResult;
    try {
      res = this.runList(trimmed);
    } catch (e) {
      res = { out: "bash: " + (e as Error).message, err: true };
    }
    if (res.out) this.outputs.push(res.out.slice(0, 4000));
    return res;
  }

  private runList(line: string): ExecResult {
    const parts = splitOps(line);
    const outs: string[] = [];
    let lastErr = false;
    let edit: string | undefined;
    let clear = false;
    for (let i = 0; i < parts.length; i++) {
      const { cmd, op } = parts[i];
      const prevOp = i > 0 ? parts[i - 1].op : ";";
      if (prevOp === "&&" && lastErr) continue;
      if (prevOp === "||" && !lastErr) continue;
      const r = this.runPipeline(cmd);
      if (r.out) outs.push(r.out);
      lastErr = !!r.err;
      edit = r.edit ?? edit;
      clear = clear || !!r.clear;
      void op;
    }
    return { out: outs.join("\n"), err: lastErr, edit, clear };
  }

  private runPipeline(cmdline: string): ExecResult {
    const stages = splitPipes(cmdline);
    let stdin = "";
    let res: ExecResult = { out: "" };
    for (let i = 0; i < stages.length; i++) {
      const tokens = this.expand(tokenize(stages[i], this.env));
      // Redirections
      let outFile = "";
      let append = false;
      let inFile = "";
      let devnullErr = false;
      const args: string[] = [];
      for (let k = 0; k < tokens.length; k++) {
        const t = tokens[k];
        if (t === ">" || t === ">>") {
          outFile = tokens[++k] ?? "";
          append = t === ">>";
          if (!outFile) return { out: "erreur de syntaxe près du symbole inattendu « newline » (nom de fichier manquant après >)", err: true };
        } else if (t === "<") inFile = tokens[++k] ?? "";
        else if (t === "2>/dev/null" || t === "2>") {
          devnullErr = true;
          if (t === "2>") k++;
        } else args.push(t);
      }
      if (inFile) stdin = this.vfs.read(this.abs(inFile));
      // Affectation de variable (NOM=valeur)
      if (args.length === 1 && /^[A-Za-z_]\w*=/.test(args[0])) {
        const [k, ...v] = args[0].split("=");
        this.env[k] = v.join("=");
        res = { out: "" };
        continue;
      }
      let name = args[0];
      let rest = args.slice(1);
      if (name === "sudo") {
        name = rest[0];
        rest = rest.slice(1);
      }
      const fn = this.cmds[name];
      if (!fn) {
        const sugg = Object.keys(this.cmds).find((c) => levenshtein(c, name) <= 1);
        res = { out: `${name} : commande introuvable${sugg ? ` — vouliez-vous dire « ${sugg} » ?` : " (tapez « help » pour la liste des commandes)"}`, err: true };
      } else res = fn(rest, stdin);
      if (devnullErr && res.err) res = { ...res, out: "" };
      if (outFile && !res.err) {
        const path = outFile === "/dev/null" ? "" : this.abs(outFile);
        if (path) {
          const text = res.out ? (res.out.endsWith("\n") ? res.out : res.out + "\n") : "";
          this.vfs.write(path, text, append);
        }
        res = { ...res, out: "" };
      }
      // Comme dans un vrai shell, la sortie transmise par « | » se termine par un saut de ligne
      stdin = res.out ? (res.out.endsWith("\n") ? res.out : res.out + "\n") : "";
      if (res.err && i < stages.length - 1 && !res.out) return res;
    }
    return res;
  }

  private expand(tokens: { v: string; q: boolean }[]): string[] {
    const out: string[] = [];
    for (const t of tokens) {
      if (!t.q && /[*?]/.test(t.v) && !/^[<>|&;]/.test(t.v)) {
        const dirPart = t.v.includes("/") ? t.v.slice(0, t.v.lastIndexOf("/") + 1) : "";
        const re = globToRe(t.v.slice(dirPart.length));
        const matches = this.vfs
          .list(this.abs(dirPart || "."))
          .filter((n) => !n.startsWith(".") && re.test(n))
          .map((n) => dirPart + n);
        if (matches.length) {
          out.push(...matches);
          continue;
        }
      }
      out.push(t.v);
    }
    return out.map((v) => (v === "~" || v.startsWith("~/") ? HOME + v.slice(1) : v));
  }

  // Remplacement des variables, appelé par le découpeur
  private buildCommands(): Record<string, Cmd> {
    const S = this;
    const readArgOrStdin = (files: string[], stdin: string): string => (files.length ? files.map((f) => S.vfs.read(S.abs(f))).join("") : stdin);
    const flags = (args: string[]) => {
      const f = new Set<string>();
      const rest: string[] = [];
      for (const a of args) {
        if (/^-[a-zA-Z]+$/.test(a)) for (const c of a.slice(1)) f.add(c);
        else rest.push(a);
      }
      return { f, rest };
    };
    const modeStr = (n: FNode) => {
      const m = n.m;
      const r = (x: number) => (x & 4 ? "r" : "-") + (x & 2 ? "w" : "-") + (x & 1 ? "x" : "-");
      return (n.t === "d" ? "d" : "-") + r((m >> 6) & 7) + r((m >> 3) & 7) + r(m & 7);
    };
    const lines = (s: string) => {
      const l = s.split("\n");
      if (l.at(-1) === "") l.pop();
      return l;
    };
    const ok = (out: string): ExecResult => ({ out });
    const ko = (out: string): ExecResult => ({ out, err: true });

    return {
      help: () =>
        ok(
          "Commandes disponibles (tapez « man <commande> » pour le détail) :\n" +
            Object.keys(HELP)
              .map((k) => "  " + k)
              .join("\n") +
            "\nAussi : ip, ping, ps, df, free, uname, date, hostname, which, apt, python3, ssh, systemctl, man, true, false.\nRaccourcis : ↑/↓ historique, Tab complétion, Ctrl+L effacer.",
        ),
      man: (a) => (a[0] && HELP[a[0]] ? ok(HELP[a[0]]) : ko(`Aucune entrée de manuel pour ${a[0] ?? ""}`)),
      pwd: () => ok(S.cwd),
      whoami: () => ok("apprenant"),
      hostname: () => ok("techcampus"),
      uname: (a) => ok(a.includes("-a") ? "Linux techcampus 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux" : "Linux"),
      date: () => ok(new Date().toString()),
      true: () => ok(""),
      false: () => ({ out: "", err: true }),
      clear: () => ({ out: "", clear: true }),
      history: () => ok(S.history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join("\n")),
      echo: (a) => {
        const n = a[0] === "-n";
        const e = a[0] === "-e";
        const txt = a.slice(n || e ? 1 : 0).join(" ");
        return ok(e ? txt.replace(/\\n/g, "\n").replace(/\\t/g, "\t") : txt);
      },
      printf: (a) => ok((a[0] ?? "").replace(/\\n/g, "\n").replace(/%s/g, () => a.splice(1, 1)[0] ?? "")),
      export: (a) => {
        for (const x of a) {
          const [k, ...v] = x.split("=");
          if (v.length) S.env[k] = v.join("=");
        }
        return ok("");
      },
      env: () => ok(Object.entries(S.env).map(([k, v]) => `${k}=${v}`).join("\n")),
      printenv: (a) => ok(a[0] ? S.env[a[0]] ?? "" : Object.entries(S.env).map(([k, v]) => `${k}=${v}`).join("\n")),
      unset: (a) => {
        a.forEach((k) => delete S.env[k]);
        return ok("");
      },
      which: (a) => (S.cmds[a[0]] ? ok(`/usr/bin/${a[0]}`) : ko("")),
      cd: (a) => {
        const target = a[0] === undefined ? HOME : a[0] === "-" ? S.env.OLDPWD ?? S.cwd : S.abs(a[0]);
        const n = S.vfs.get(target);
        if (!n) return ko(`cd: ${a[0]}: Aucun fichier ou dossier de ce nom`);
        if (n.t !== "d") return ko(`cd: ${a[0]}: N'est pas un dossier`);
        S.env.OLDPWD = S.cwd;
        S.cwd = target;
        return ok("");
      },
      ls: (args) => {
        const { f, rest } = flags(args);
        const targets = rest.length ? rest : ["."];
        const out: string[] = [];
        for (const t of targets) {
          const p = S.abs(t);
          const n = S.vfs.get(p);
          if (!n) return ko(`ls: impossible d'accéder à '${t}': Aucun fichier ou dossier de ce nom`);
          const entries = n.t === "f" ? [[baseName(p), n] as const] : Object.entries(n.c).sort(([x], [y]) => x.localeCompare(y));
          const shown = entries.filter(([k]) => f.has("a") || !k.startsWith("."));
          if (targets.length > 1) out.push(t + ":");
          if (f.has("l")) {
            out.push(`total ${shown.length * 4}`);
            for (const [k, v] of shown) {
              const size = v.t === "f" ? v.d.length : 4096;
              out.push(`${modeStr(v)} 1 apprenant apprenant ${String(size).padStart(6)} oct.  5 09:00 ${k}${v.t === "d" ? "/" : ""}`);
            }
          } else out.push(shown.map(([k, v]) => (v.t === "d" ? k + "/" : k)).join("  "));
        }
        return ok(out.join("\n"));
      },
      tree: (a) => {
        const start = S.abs(a[0] ?? ".");
        const n = S.vfs.get(start);
        if (!n || n.t !== "d") return ko(`${a[0] ?? "."} [erreur à l'ouverture du dossier]`);
        const out = [a[0] ?? "."];
        let nd = 0, nf = 0;
        const rec = (node: FNode, prefix: string) => {
          if (node.t !== "d") return;
          const ks = Object.keys(node.c).filter((k) => !k.startsWith(".")).sort();
          ks.forEach((k, i) => {
            const last = i === ks.length - 1;
            const child = node.c[k];
            out.push(prefix + (last ? "└── " : "├── ") + k);
            if (child.t === "d") {
              nd++;
              rec(child, prefix + (last ? "    " : "│   "));
            } else nf++;
          });
        };
        rec(n, "");
        out.push("", `${nd} dossier(s), ${nf} fichier(s)`);
        return ok(out.join("\n"));
      },
      mkdir: (args) => {
        const { f, rest } = flags(args);
        if (!rest.length) return ko("mkdir: opérande manquant");
        for (const d of rest) {
          const p = S.abs(d);
          if (S.vfs.get(p)) {
            if (f.has("p")) continue;
            return ko(`mkdir: impossible de créer le dossier « ${d} »: Le fichier existe`);
          }
          if (!f.has("p") && !S.vfs.isDir(parentOf(p))) return ko(`mkdir: impossible de créer le dossier « ${d} »: Aucun fichier ou dossier de ce nom (utilisez -p pour créer les parents)`);
          S.vfs.mkdirp(p);
        }
        return ok("");
      },
      touch: (a) => {
        if (!a.length) return ko("touch: opérande de fichier manquant");
        for (const x of a) {
          const p = S.abs(x);
          if (!S.vfs.get(p)) S.vfs.write(p, "");
        }
        return ok("");
      },
      cat: (a, stdin) => {
        const { f, rest } = flags(a);
        try {
          const txt = readArgOrStdin(rest, stdin);
          return ok(f.has("n") ? lines(txt).map((l, i) => `${String(i + 1).padStart(6)}\t${l}`).join("\n") : txt.replace(/\n$/, ""));
        } catch (e) {
          return ko("cat: " + (e as Error).message);
        }
      },
      rm: (args) => {
        const { f, rest } = flags(args);
        if (!rest.length) return ko("rm: opérande manquant");
        for (const x of rest) {
          const p = S.abs(x);
          const n = S.vfs.get(p);
          if (!n) {
            if (f.has("f")) continue;
            return ko(`rm: impossible de supprimer '${x}': Aucun fichier ou dossier de ce nom`);
          }
          if (p === "/" || p === HOME) return ko(`rm: refus de supprimer « ${x} » (protection du simulateur — dans la vraie vie, cette commande serait catastrophique !)`);
          if (n.t === "d" && !f.has("r") && !f.has("R")) return ko(`rm: impossible de supprimer '${x}': est un dossier (utilisez rm -r)`);
          S.vfs.remove(p);
          for (const k of Object.keys(S.git.repos)) if (k === p || k.startsWith(p + "/")) delete S.git.repos[k];
        }
        return ok("");
      },
      rmdir: (a) => {
        for (const x of a) {
          const n = S.vfs.get(S.abs(x));
          if (!n || n.t !== "d") return ko(`rmdir: '${x}': Aucun dossier de ce nom`);
          if (Object.keys(n.c).length) return ko(`rmdir: impossible de supprimer '${x}': Le dossier n'est pas vide`);
          S.vfs.remove(S.abs(x));
        }
        return ok("");
      },
      cp: (args) => {
        const { f, rest } = flags(args);
        if (rest.length < 2) return ko("cp: opérande manquant");
        const dest = S.abs(rest.at(-1)!);
        for (const src of rest.slice(0, -1)) {
          const sp = S.abs(src);
          const n = S.vfs.get(sp);
          if (!n) return ko(`cp: impossible d'évaluer '${src}': Aucun fichier ou dossier de ce nom`);
          if (n.t === "d" && !f.has("r") && !f.has("R")) return ko(`cp: -r non spécifié ; omission du dossier '${src}'`);
          const target = S.vfs.isDir(dest) ? dest + "/" + baseName(sp) : dest;
          const parent = S.vfs.get(parentOf(target));
          if (!parent || parent.t !== "d") return ko(`cp: impossible de créer '${rest.at(-1)}': dossier introuvable`);
          parent.c[baseName(target)] = S.vfs.clone(n);
        }
        return ok("");
      },
      mv: (args) => {
        const { rest } = flags(args);
        if (rest.length < 2) return ko("mv: opérande manquant");
        const dest = S.abs(rest.at(-1)!);
        for (const src of rest.slice(0, -1)) {
          const sp = S.abs(src);
          const n = S.vfs.get(sp);
          if (!n) return ko(`mv: impossible d'évaluer '${src}': Aucun fichier ou dossier de ce nom`);
          const target = S.vfs.isDir(dest) ? dest + "/" + baseName(sp) : dest;
          const parent = S.vfs.get(parentOf(target));
          if (!parent || parent.t !== "d") return ko(`mv: impossible de déplacer vers '${rest.at(-1)}': dossier introuvable`);
          parent.c[baseName(target)] = n;
          S.vfs.remove(sp);
        }
        return ok("");
      },
      head: (args, stdin) => {
        let n = 10;
        const files: string[] = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "-n") n = Number(args[++i]);
          else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1));
          else files.push(args[i]);
        }
        try {
          return ok(lines(readArgOrStdin(files, stdin)).slice(0, n).join("\n"));
        } catch (e) {
          return ko("head: " + (e as Error).message);
        }
      },
      tail: (args, stdin) => {
        let n = 10;
        const files: string[] = [];
        for (let i = 0; i < args.length; i++) {
          if (args[i] === "-n") n = Number(args[++i]);
          else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1));
          else if (args[i] === "-f") continue;
          else files.push(args[i]);
        }
        try {
          return ok(lines(readArgOrStdin(files, stdin)).slice(-n).join("\n"));
        } catch (e) {
          return ko("tail: " + (e as Error).message);
        }
      },
      wc: (args, stdin) => {
        const { f, rest } = flags(args);
        try {
          const txt = readArgOrStdin(rest, stdin);
          const l = (txt.match(/\n/g) ?? []).length;
          const w = txt.split(/\s+/).filter(Boolean).length;
          const c = new TextEncoder().encode(txt).length;
          const name = rest.length === 1 ? " " + rest[0] : "";
          if (f.has("l")) return ok(l + name);
          if (f.has("w")) return ok(w + name);
          if (f.has("c")) return ok(c + name);
          return ok(`${l} ${w} ${c}${name}`);
        } catch (e) {
          return ko("wc: " + (e as Error).message);
        }
      },
      grep: (args, stdin) => {
        const { f, rest } = flags(args.filter((a) => a !== "-E"));
        const [pat, ...files] = rest;
        if (pat === undefined) return ko("usage : grep [-i] [-n] [-c] [-v] [-r] MOTIF [FICHIER]...");
        let re: RegExp;
        try {
          re = new RegExp(pat, f.has("i") ? "i" : "");
        } catch {
          re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), f.has("i") ? "i" : "");
        }
        const src: [string, string][] = [];
        try {
          if (f.has("r")) {
            for (const d of files.length ? files : ["."]) {
              const base = S.abs(d);
              for (const [rel, content] of Object.entries(S.vfs.walkFiles(base))) src.push([(d === "." ? "" : d.replace(/\/$/, "") + "/") + rel, content]);
            }
          } else if (files.length) for (const x of files) src.push([x, S.vfs.read(S.abs(x))]);
          else src.push(["", stdin]);
        } catch (e) {
          return ko("grep: " + (e as Error).message);
        }
        const out: string[] = [];
        let count = 0;
        for (const [name, content] of src) {
          let c = 0;
          lines(content).forEach((l, i) => {
            if (re.test(l) !== f.has("v")) {
              c++;
              if (!f.has("c") && !f.has("l")) out.push(`${src.length > 1 && name ? name + ":" : ""}${f.has("n") ? i + 1 + ":" : ""}${l}`);
            }
          });
          if (f.has("c")) out.push(`${src.length > 1 ? name + ":" : ""}${c}`);
          if (f.has("l") && c) out.push(name);
          count += c;
        }
        return { out: out.join("\n"), err: count === 0 && !f.has("c") };
      },
      sort: (args, stdin) => {
        const { f, rest } = flags(args);
        try {
          let l = lines(readArgOrStdin(rest, stdin));
          l = f.has("n") ? l.sort((a, b) => parseFloat(a) - parseFloat(b)) : l.sort((a, b) => a.localeCompare(b));
          if (f.has("r")) l.reverse();
          if (f.has("u")) l = [...new Set(l)];
          return ok(l.join("\n"));
        } catch (e) {
          return ko("sort: " + (e as Error).message);
        }
      },
      uniq: (args, stdin) => {
        const { f, rest } = flags(args);
        const l = lines(readArgOrStdin(rest, stdin));
        const out: [string, number][] = [];
        for (const x of l) {
          if (out.length && out.at(-1)![0] === x) out.at(-1)![1]++;
          else out.push([x, 1]);
        }
        return ok(out.map(([x, n]) => (f.has("c") ? `${String(n).padStart(7)} ${x}` : x)).join("\n"));
      },
      cut: (args, stdin) => {
        let d = "\t";
        let fields: number[] = [];
        const files: string[] = [];
        for (let i = 0; i < args.length; i++) {
          const a = args[i];
          if (a.startsWith("-d")) d = a.length > 2 ? a.slice(2) : args[++i];
          else if (a.startsWith("-f")) {
            const spec = a.length > 2 ? a.slice(2) : args[++i];
            fields = spec.split(",").flatMap((s) => {
              const [x, y] = s.split("-").map(Number);
              return y ? Array.from({ length: y - x + 1 }, (_, k) => x + k) : [x];
            });
          } else files.push(a);
        }
        if (!fields.length) return ko("cut: vous devez indiquer une liste de champs (-f)");
        try {
          return ok(lines(readArgOrStdin(files, stdin)).map((l) => fields.map((n) => l.split(d)[n - 1] ?? "").join(d)).join("\n"));
        } catch (e) {
          return ko("cut: " + (e as Error).message);
        }
      },
      tr: (args, stdin) => {
        const [a, b] = args;
        if (a === "a-z" && b === "A-Z") return ok(stdin.toUpperCase().replace(/\n$/, ""));
        if (a === "A-Z" && b === "a-z") return ok(stdin.toLowerCase().replace(/\n$/, ""));
        if (a === "-d") return ok(stdin.split(b ?? "").join("").replace(/\n$/, ""));
        return ok(stdin.split(a ?? "").join(b ?? "").replace(/\n$/, ""));
      },
      find: (args) => {
        const start = args[0] && !args[0].startsWith("-") ? args[0] : ".";
        const ni = args.indexOf("-name");
        const ti = args.indexOf("-type");
        const re = ni >= 0 ? globToRe(args[ni + 1] ?? "*") : null;
        const type = ti >= 0 ? args[ti + 1] : "";
        const base = S.abs(start);
        const root = S.vfs.get(base);
        if (!root) return ko(`find: '${start}': Aucun fichier ou dossier de ce nom`);
        const out: string[] = [];
        const rec = (p: string, n: FNode) => {
          const name = baseName(p) || p;
          if ((!re || re.test(name)) && (!type || (type === "f" ? n.t === "f" : n.t === "d"))) out.push(p);
          if (n.t === "d") for (const [k, v] of Object.entries(n.c).sort()) rec(p + "/" + k, v);
        };
        if (root.t === "d") {
          if ((!re || re.test(baseName(base))) && type !== "f") out.push(start);
          for (const [k, v] of Object.entries(root.c).sort()) rec((start === "/" ? "" : start.replace(/\/$/, "")) + "/" + k, v);
        } else rec(start, root);
        return ok(out.join("\n"));
      },
      chmod: (args) => {
        const [mode, ...files] = args.filter((a) => a !== "-R");
        if (!mode || !files.length) return ko("chmod: opérande manquant (ex. chmod +x script.sh ou chmod 644 fichier)");
        for (const x of files) {
          const n = S.vfs.get(S.abs(x));
          if (!n) return ko(`chmod: impossible d'accéder à '${x}': Aucun fichier ou dossier de ce nom`);
          if (/^[0-7]{3,4}$/.test(mode)) n.m = parseInt(mode.slice(-3), 8);
          else {
            const m = mode.match(/^([ugoa]*)([+-=])([rwx]+)$/);
            if (!m) return ko(`chmod: mode non valide : « ${mode} »`);
            const who = m[1] || "a";
            let bits = 0;
            if (m[3].includes("r")) bits |= 4;
            if (m[3].includes("w")) bits |= 2;
            if (m[3].includes("x")) bits |= 1;
            let mask = 0;
            if (who.includes("u") || who.includes("a")) mask |= bits << 6;
            if (who.includes("g") || who.includes("a")) mask |= bits << 3;
            if (who.includes("o") || who.includes("a")) mask |= bits;
            n.m = m[2] === "+" ? n.m | mask : m[2] === "-" ? n.m & ~mask : mask;
          }
        }
        return ok("");
      },
      stat: (a) => {
        const n = S.vfs.get(S.abs(a[0] ?? ""));
        if (!n) return ko(`stat: impossible d'évaluer '${a[0] ?? ""}'`);
        return ok(`  Fichier : ${a[0]}\n   Taille : ${n.t === "f" ? n.d.length : 4096}\nAccès : (0${(n.m & 0o777).toString(8)}/${modeStr(n)})  UID : (1000/apprenant)`);
      },
      du: (a) => {
        const p = S.abs(a.find((x) => !x.startsWith("-")) ?? ".");
        const total = Object.values(S.vfs.walkFiles(p, false)).reduce((t, c) => t + c.length, 0);
        return ok(`${Math.max(4, Math.ceil(total / 1024))}K\t${a.find((x) => !x.startsWith("-")) ?? "."}`);
      },
      df: () => ok("Sys. de fichiers  Taille Utilisé Dispo Uti% Monté sur\n/dev/sda1           40G     12G   26G  32% /\ntmpfs              2,0G       0  2,0G   0% /dev/shm"),
      free: () => ok("               total       utilisé      libre\nMem:           3,8Gi       1,2Gi       2,1Gi\nÉchange:       2,0Gi          0B       2,0Gi"),
      ps: () => ok("    PID TTY          TIME CMD\n   1201 pts/0    00:00:00 bash\n   1333 pts/0    00:00:00 ps"),
      top: () => ok("(top est interactif : non disponible ici. Essayez « ps » ou « free ».)"),
      kill: (a) => (a.length ? ok("") : ko("kill: usage : kill PID")),
      ip: () => ok("1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 192.168.1.42/24 brd 192.168.1.255 scope global eth0"),
      ifconfig: () => ok("eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255"),
      ping: (a) => {
        const host = a.find((x) => !x.startsWith("-") && !/^\d+$/.test(x));
        if (!host) return ko("ping: usage : ping <hôte>");
        const ip = host === "localhost" ? "127.0.0.1" : /^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : "93.184.215.14";
        return ok(`PING ${host} (${ip}) 56(84) octets de données.\n64 octets de ${ip}: icmp_seq=1 ttl=56 temps=12.4 ms\n64 octets de ${ip}: icmp_seq=2 ttl=56 temps=11.9 ms\n--- statistiques ping ${host} ---\n2 paquets transmis, 2 reçus, 0 % paquets perdus`);
      },
      nslookup: (a) => ok(`Server:  1.1.1.1\nNon-authoritative answer:\nName:    ${a[0] ?? "example.com"}\nAddress: 93.184.215.14`),
      dig: (a) => ok(`;; ANSWER SECTION:\n${a.find((x) => !x.startsWith("+")) ?? "example.com"}.  300  IN  A  93.184.215.14`),
      curl: (a) => {
        const url = a.find((x) => !x.startsWith("-"));
        if (!url) return ko("curl: aucune URL indiquée");
        const m = url.match(/^(?:https?:\/\/)?(localhost|127\.0\.0\.1)(?::(\d+))?/);
        if (!m) return ko(`curl: (6) Accès Internet désactivé dans ce simulateur (seuls localhost et les conteneurs simulés répondent).`);
        const port = Number(m[2] ?? 80);
        const res = S.docker.serve(port);
        if (res) return ok(a.includes("-I") ? "HTTP/1.1 200 OK\nServer: simulé\nContent-Type: text/html" : res);
        return ko(`curl: (7) Failed to connect to localhost port ${port}: Connexion refusée\n→ Aucun service n'écoute sur ce port. Un conteneur est-il lancé avec « -p ${port}:<port du conteneur> » ?`);
      },
      wget: (a) => S.cmds.curl(a, ""),
      ssh: (a) => ok(`(simulation) ssh ${a.join(" ")}\nLa connexion SSH à une vraie machine n'est pas possible ici. Retenez la forme : ssh utilisateur@hote -i ~/.ssh/ma_cle`),
      "ssh-keygen": () => {
        S.vfs.mkdirp(HOME + "/.ssh");
        S.vfs.write(HOME + "/.ssh/id_ed25519", "-----BEGIN OPENSSH PRIVATE KEY-----\n(clé privée simulée — ne JAMAIS la partager)\n-----END OPENSSH PRIVATE KEY-----\n");
        S.vfs.write(HOME + "/.ssh/id_ed25519.pub", "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAISimule apprenant@techcampus\n");
        S.vfs.get(HOME + "/.ssh/id_ed25519")!.m = 0o600;
        return ok("Generating public/private ed25519 key pair.\nYour identification has been saved in /home/apprenant/.ssh/id_ed25519\nYour public key has been saved in /home/apprenant/.ssh/id_ed25519.pub");
      },
      apt: (a) => (a[0] === "install" && a[1] ? ok(`(simulation) Lecture des listes de paquets... Fait\nLe paquet ${a.slice(1).filter((x) => !x.startsWith("-")).join(" ")} a été installé.`) : a[0] === "update" ? ok("(simulation) Lecture des listes de paquets... Fait") : ko("usage : apt update | apt install <paquet>")),
      "apt-get": (a) => S.cmds.apt(a, ""),
      systemctl: (a) => ok(a[0] === "status" ? `● ${a[1] ?? "service"}.service\n     Active: active (running)` : `(simulation) systemctl ${a.join(" ")} : OK`),
      python3: () => ko("Pour programmer en Python, utilisez le Labo Python (menu Labo) : il exécute du vrai Python dans votre navigateur."),
      python: () => ko("Pour programmer en Python, utilisez le Labo Python (menu Labo) : il exécute du vrai Python dans votre navigateur."),
      bash: (a) => {
        if (!a[0]) return ok("");
        return S.runScript(a[0]);
      },
      sh: (a) => S.cmds.bash(a, ""),
      source: (a) => S.cmds.bash(a, ""),
      edit: (a) => (a[0] ? { out: "", edit: S.abs(a[0]) } : ko("usage : edit <fichier>")),
      nano: (a) => S.cmds.edit(a, ""),
      vim: (a) => S.cmds.edit(a, ""),
      vi: (a) => S.cmds.edit(a, ""),
      code: (a) => S.cmds.edit(a, ""),
      git: (a) => S.git.run(a, S.cwd),
      docker: (a) => S.docker.run(a, S.cwd),
      kubectl: (a) => S.kube.run(a, S.cwd),
      k: (a) => S.kube.run(a, S.cwd),
      terraform: (a) => S.terraform(a),
      aws: (a) => ok(a[0] === "--version" ? "aws-cli/2.31.0 (simulé)" : `(simulation) aws ${a.join(" ")}\nLe compte AWS n'est pas réel ici : voir la leçon correspondante pour l'effet de cette commande.`),
      az: (a) => ok(`(simulation) az ${a.join(" ")}`),
      gcloud: (a) => ok(`(simulation) gcloud ${a.join(" ")}`),
    };
  }

  runScript(path: string): ExecResult {
    let text: string;
    try {
      text = this.vfs.read(this.abs(path));
    } catch (e) {
      return { out: "bash: " + (e as Error).message, err: true };
    }
    const outs: string[] = [];
    let err = false;
    for (const raw of text.split("\n")) {
      const l = raw.trim();
      if (!l || l.startsWith("#")) continue;
      if (/^(set -e|set -euo pipefail)$/.test(l)) continue;
      const r = this.runList(l);
      if (r.out) outs.push(r.out);
      if (r.err) {
        err = true;
        if (/set -e/.test(text)) break;
      }
    }
    return { out: outs.join("\n"), err };
  }

  private terraform(a: string[]): ExecResult {
    const files = this.vfs.list(this.cwd).filter((f) => f.endsWith(".tf"));
    if (a[0] === "version" || a[0] === "-version") return { out: "Terraform v1.13.3 (simulé)" };
    if (!files.length) return { out: "Error: No configuration files\n→ Créez un fichier main.tf dans ce dossier.", err: true };
    const code = files.map((f) => this.vfs.read(this.cwd + "/" + f)).join("\n");
    const resources = [...code.matchAll(/resource\s+"([\w-]+)"\s+"([\w-]+)"/g)].map((m) => `${m[1]}.${m[2]}`);
    const inited = this.vfs.isDir(this.cwd + "/.terraform");
    switch (a[0]) {
      case "init":
        this.vfs.mkdirp(this.cwd + "/.terraform");
        return { out: "Initializing the backend...\nInitializing provider plugins...\n\nTerraform has been successfully initialized!" };
      case "fmt":
        return { out: files.join("\n") };
      case "validate": {
        const open = (code.match(/{/g) ?? []).length;
        const close = (code.match(/}/g) ?? []).length;
        if (open !== close) return { out: `Error: Argument or block definition required\n→ Accolades déséquilibrées ({ : ${open}, } : ${close}).`, err: true };
        return { out: "Success! The configuration is valid." };
      }
      case "plan":
      case "apply": {
        if (!inited) return { out: "Error: Inconsistent dependency lock file\n→ Lancez d'abord « terraform init ».", err: true };
        const state = this.vfs.isFile(this.cwd + "/terraform.tfstate") ? this.vfs.read(this.cwd + "/terraform.tfstate").split("\n").filter(Boolean) : [];
        const toAdd = resources.filter((r) => !state.includes(r));
        const toDel = state.filter((r) => !resources.includes(r));
        const plan = [...toAdd.map((r) => `  # ${r} will be created\n  + resource ${r}`), ...toDel.map((r) => `  # ${r} will be destroyed\n  - resource ${r}`)];
        const summary = `Plan: ${toAdd.length} to add, 0 to change, ${toDel.length} to destroy.`;
        if (a[0] === "plan") return { out: plan.length ? plan.join("\n") + "\n\n" + summary : "No changes. Your infrastructure matches the configuration." };
        this.vfs.write(this.cwd + "/terraform.tfstate", resources.join("\n") + "\n");
        return { out: (plan.length ? plan.join("\n") + "\n\n" : "") + `Apply complete! Resources: ${toAdd.length} added, 0 changed, ${toDel.length} destroyed.` };
      }
      case "destroy": {
        const state = this.vfs.isFile(this.cwd + "/terraform.tfstate") ? this.vfs.read(this.cwd + "/terraform.tfstate").split("\n").filter(Boolean) : [];
        this.vfs.write(this.cwd + "/terraform.tfstate", "");
        return { out: `Destroy complete! Resources: ${state.length} destroyed.` };
      }
      default:
        return { out: "Commandes : init, fmt, validate, plan, apply, destroy", err: !!a[0] };
    }
  }

  // ---------- Vérification des objectifs d'un exercice ----------
  check(c: TerminalCheck): boolean {
    const abs = (p: string) => normalize(p, HOME);
    switch (c.type) {
      case "exists": {
        const n = this.vfs.get(abs(c.path));
        return !!n && (!c.kind || (c.kind === "dir" ? n.t === "d" : n.t === "f"));
      }
      case "absent":
        return !this.vfs.get(abs(c.path));
      case "content": {
        const n = this.vfs.get(abs(c.path));
        if (!n || n.t !== "f") return false;
        if (c.includes !== undefined && !n.d.includes(c.includes)) return false;
        if (c.regex && !new RegExp(c.regex, "m").test(n.d)) return false;
        return true;
      }
      case "cwd":
        return this.cwd === abs(c.path);
      case "ran":
        return this.history.some((h) => new RegExp(c.regex).test(h));
      case "output":
        return this.outputs.some((o) => new RegExp(c.regex, "m").test(o));
      case "exec": {
        const n = this.vfs.get(abs(c.path));
        return !!n && (n.m & 0o100) !== 0;
      }
      case "git": {
        const r = this.git.repos[abs(c.repo)];
        if (!r) return false;
        if (c.commits !== undefined) {
          const head = r.branches[r.head];
          let n = 0;
          const seen = new Set<string>();
          const st = head ? [head] : [];
          while (st.length) {
            const id = st.pop()!;
            if (seen.has(id)) continue;
            seen.add(id);
            n++;
            st.push(...r.commits[id].parents);
          }
          if (n < c.commits) return false;
        }
        if (c.branch && !(c.branch in r.branches)) return false;
        if (c.current && r.head !== c.current) return false;
        if (c.tracked && !(c.tracked in (this.git.headCommit(r)?.tree ?? {}))) return false;
        if (c.notTracked && c.notTracked in (this.git.headCommit(r)?.tree ?? {})) return false;
        if (c.clean) {
          const s = this.git.status(r);
          if (s.staged.length || s.unstaged.length || s.untracked.length) return false;
        }
        if (c.merged) {
          const other = r.branches[c.merged];
          if (!other || !this.git.isAncestor(r, other, r.branches[r.head])) return false;
        }
        if (c.remote && !Object.keys(r.remoteBranches).some((b) => b === c.remote || b.endsWith("/" + c.remote))) return false;
        return true;
      }
      case "docker": {
        if (c.running && !this.docker.containers.some((x) => x.status === "running" && (x.image === c.running || x.image.split(":")[0] === c.running || x.name === c.running))) return false;
        if (c.stopped && this.docker.containers.some((x) => x.status === "running" && (x.image === c.stopped || x.name === c.stopped))) return false;
        if (c.image && !Object.keys(this.docker.images).some((k) => k === c.image || k === c.image + ":latest")) return false;
        return true;
      }
      case "k8s": {
        const o = this.kube.find(c.kind, c.name);
        if (c.absent) return !o;
        if (!o) return false;
        if (c.replicas !== undefined && Number((o.spec as { replicas?: number }).replicas ?? 1) !== c.replicas) return false;
        return true;
      }
    }
    return false;
  }
}

// ---------- Analyse de la ligne de commande ----------

// Découpe sur && || ; en respectant les guillemets
function splitOps(line: string): { cmd: string; op: string }[] {
  const out: { cmd: string; op: string }[] = [];
  let cur = "";
  let q: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) q = null;
      cur += c;
      continue;
    }
    if (c === "'" || c === '"') {
      q = c;
      cur += c;
      continue;
    }
    if ((c === "&" && line[i + 1] === "&") || (c === "|" && line[i + 1] === "|")) {
      out.push({ cmd: cur, op: c + c });
      cur = "";
      i++;
      continue;
    }
    if (c === ";") {
      out.push({ cmd: cur, op: ";" });
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push({ cmd: cur, op: "" });
  return out.filter((x) => x.cmd.trim());
}

function splitPipes(cmd: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q: string | null = null;
  for (const c of cmd) {
    if (q) {
      if (c === q) q = null;
      cur += c;
    } else if (c === "'" || c === '"') {
      q = c;
      cur += c;
    } else if (c === "|") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

let ENV_REF: Record<string, string> = {};
export function tokenize(s: string, env: Record<string, string> = ENV_REF): { v: string; q: boolean }[] {
  const out: { v: string; q: boolean }[] = [];
  let cur = "";
  let quoted = false;
  let has = false;
  const push = () => {
    if (has) out.push({ v: cur, q: quoted });
    cur = "";
    quoted = false;
    has = false;
  };
  const vars = (str: string) => str.replace(/\$\{?(\w+)\}?/g, (_m, k) => env[k] ?? "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'") {
      const j = s.indexOf("'", i + 1);
      if (j < 0) throw new Error("guillemet simple non fermé");
      cur += s.slice(i + 1, j);
      quoted = true;
      has = true;
      i = j;
    } else if (c === '"') {
      const j = s.indexOf('"', i + 1);
      if (j < 0) throw new Error("guillemet double non fermé");
      cur += vars(s.slice(i + 1, j));
      quoted = true;
      has = true;
      i = j;
    } else if (c === "\\" && i + 1 < s.length) {
      cur += s[++i];
      has = true;
    } else if (/\s/.test(c)) push();
    else if (c === ">" || c === "<") {
      if (cur === "2" && c === ">") {
        cur = "";
        has = false;
        if (s.slice(i + 1).trimStart().startsWith("/dev/null")) {
          out.push({ v: "2>/dev/null", q: false });
          i = s.indexOf("/dev/null", i) + "/dev/null".length - 1;
          continue;
        }
        out.push({ v: "2>", q: false });
        continue;
      }
      push();
      if (c === ">" && s[i + 1] === ">") {
        out.push({ v: ">>", q: false });
        i++;
      } else out.push({ v: c, q: false });
    } else if (c === "$") {
      const m = s.slice(i).match(/^\$\{?(\w+)\}?/);
      if (m) {
        cur += env[m[1]] ?? "";
        has = true;
        i += m[0].length - 1;
      } else {
        cur += c;
        has = true;
      }
    } else {
      cur += c;
      has = true;
    }
  }
  push();
  return out;
}

export function bindEnv(env: Record<string, string>) {
  ENV_REF = env;
}

function levenshtein(a: string, b: string) {
  if (!a || !b) return 99;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
