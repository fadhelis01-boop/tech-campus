// Git simulé : assez fidèle pour apprendre (index, commits, branches,
// fusion avec conflits, dépôt distant), sans prétendre tout reproduire.
import { Vfs, globToRe } from "./vfs";

export interface Commit {
  id: string;
  msg: string;
  parents: string[];
  tree: Record<string, string>;
  author: string;
  date: number;
}

export interface Repo {
  path: string;
  commits: Record<string, Commit>;
  branches: Record<string, string | null>; // branche -> commit
  head: string; // branche courante
  index: Record<string, string>;
  remotes: Record<string, string>;
  remoteBranches: Record<string, string>; // "origin/main" -> commit
  merging?: { other: string; branch: string };
}

export interface GitConfig {
  name?: string;
  email?: string;
}

type Out = { out: string; err?: boolean };

const shortId = () => Math.random().toString(16).slice(2, 9) + Math.random().toString(16).slice(2, 4);

export class Git {
  repos: Record<string, Repo> = {};
  config: GitConfig = {};

  constructor(private vfs: Vfs) {}

  findRepo(cwd: string): Repo | null {
    let p = cwd;
    for (;;) {
      if (this.repos[p]) return this.repos[p];
      if (p === "/") return null;
      p = p.slice(0, p.lastIndexOf("/")) || "/";
    }
  }

  headCommit(r: Repo): Commit | null {
    const id = r.branches[r.head];
    return id ? r.commits[id] : null;
  }

  ignored(r: Repo, rel: string): boolean {
    let gi = "";
    try {
      gi = this.vfs.read(r.path + "/.gitignore");
    } catch {
      return false;
    }
    return gi
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .some((pat) => {
        const p = pat.replace(/\/$/, "");
        const re = globToRe(p);
        return rel.split("/").some((seg, i, all) => re.test(seg) || re.test(all.slice(0, i + 1).join("/")));
      });
  }

  worktree(r: Repo): Record<string, string> {
    const all = this.vfs.walkFiles(r.path);
    for (const k of Object.keys(all)) if (this.ignored(r, k) && !(k in r.index)) delete all[k];
    return all;
  }

  status(r: Repo) {
    const head = this.headCommit(r)?.tree ?? {};
    const wt = this.worktree(r);
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    const keys = new Set([...Object.keys(head), ...Object.keys(r.index)]);
    for (const k of keys) {
      if (head[k] !== r.index[k]) staged.push((k in head ? (k in r.index ? "modifié :    " : "supprimé :   ") : "nouveau :    ") + k);
    }
    for (const k of Object.keys(r.index)) {
      if (!(k in wt)) unstaged.push("supprimé :   " + k);
      else if (wt[k] !== r.index[k]) unstaged.push("modifié :    " + k);
    }
    for (const k of Object.keys(wt)) if (!(k in r.index)) untracked.push(k);
    return { staged, unstaged, untracked };
  }

  isAncestor(r: Repo, anc: string, id: string | null): boolean {
    const seen = new Set<string>();
    const stack = id ? [id] : [];
    while (stack.length) {
      const c = stack.pop()!;
      if (c === anc) return true;
      if (seen.has(c)) continue;
      seen.add(c);
      stack.push(...(r.commits[c]?.parents ?? []));
    }
    return false;
  }

  mergeBase(r: Repo, a: string, b: string): string | null {
    const anc = new Set<string>();
    const st = [a];
    while (st.length) {
      const c = st.pop()!;
      if (anc.has(c)) continue;
      anc.add(c);
      st.push(...(r.commits[c]?.parents ?? []));
    }
    const q = [b];
    const seen = new Set<string>();
    while (q.length) {
      const c = q.shift()!;
      if (anc.has(c)) return c;
      if (seen.has(c)) continue;
      seen.add(c);
      q.push(...(r.commits[c]?.parents ?? []));
    }
    return null;
  }

  checkoutTree(r: Repo, tree: Record<string, string>) {
    const cur = this.headCommit(r)?.tree ?? {};
    for (const k of Object.keys(cur)) if (!(k in tree)) this.vfs.remove(r.path + "/" + k);
    for (const [k, v] of Object.entries(tree)) {
      const full = r.path + "/" + k;
      this.vfs.mkdirp(full.slice(0, full.lastIndexOf("/")));
      this.vfs.write(full, v);
    }
    r.index = { ...tree };
  }

  log(r: Repo, oneline: boolean, all: boolean): string {
    const start = all ? Object.values(r.branches).filter(Boolean) as string[] : [r.branches[r.head]].filter(Boolean) as string[];
    if (!start.length) return `fatal: votre branche « ${r.head} » n'a encore aucun commit`;
    const seen = new Set<string>();
    const list: Commit[] = [];
    const st = [...start];
    while (st.length) {
      const id = st.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      list.push(r.commits[id]);
      st.push(...r.commits[id].parents);
    }
    list.sort((a, b) => b.date - a.date);
    const deco = (id: string) => {
      const names = Object.entries(r.branches)
        .filter(([, c]) => c === id)
        .map(([b]) => (b === r.head ? `HEAD -> ${b}` : b));
      for (const [rb, c] of Object.entries(r.remoteBranches)) if (c === id) names.push(rb);
      return names.length ? ` (${names.join(", ")})` : "";
    };
    if (oneline) return list.map((c) => `${c.id.slice(0, 7)}${deco(c.id)} ${c.msg}`).join("\n");
    return list
      .map(
        (c) =>
          `commit ${c.id}${deco(c.id)}\n${c.parents.length > 1 ? `Merge: ${c.parents.map((p) => p.slice(0, 7)).join(" ")}\n` : ""}Author: ${c.author}\nDate:   ${new Date(c.date).toLocaleString("fr-FR")}\n\n    ${c.msg}\n`,
      )
      .join("\n");
  }

  run(args: string[], cwd: string): Out {
    const [sub, ...rest] = args;
    if (!sub || sub === "help" || sub === "--help")
      return {
        out: "Commandes Git disponibles ici : init, config, status, add, commit, log, diff, branch, checkout, switch, merge, restore, rm, mv, remote, push, pull, clone, show.",
      };
    if (sub === "--version") return { out: "git version 2.51.0 (simulé)" };
    if (sub === "config") return this.cmdConfig(rest);
    if (sub === "init") return this.cmdInit(cwd, rest);
    if (sub === "clone") return this.cmdClone(cwd, rest);
    const r = this.findRepo(cwd);
    if (!r) return { out: "fatal: ni ceci ni aucun de ses dossiers parents n'est un dépôt git (.git)\n→ Lancez « git init » pour créer un dépôt, ou placez-vous (cd) dans un dossier qui en contient un.", err: true };
    switch (sub) {
      case "status":
        return this.cmdStatus(r, rest);
      case "add":
        return this.cmdAdd(r, cwd, rest);
      case "commit":
        return this.cmdCommit(r, rest);
      case "log":
        return { out: this.log(r, rest.includes("--oneline"), rest.includes("--all")) };
      case "diff":
        return this.cmdDiff(r, rest);
      case "branch":
        return this.cmdBranch(r, rest);
      case "checkout":
      case "switch":
        return this.cmdSwitch(r, sub, rest);
      case "merge":
        return this.cmdMerge(r, rest);
      case "restore":
        return this.cmdRestore(r, cwd, rest);
      case "rm":
        return this.cmdRm(r, cwd, rest);
      case "mv":
        return this.cmdMv(r, cwd, rest);
      case "remote":
        return this.cmdRemote(r, rest);
      case "push":
        return this.cmdPush(r, rest);
      case "pull":
      case "fetch":
        return { out: Object.keys(r.remotes).length ? "Déjà à jour. (simulation : le dépôt distant ne reçoit pas d'autres contributions)" : "fatal: aucun dépôt distant configuré (git remote add origin <url>)", err: !Object.keys(r.remotes).length };
      case "show": {
        const c = this.headCommit(r);
        return c ? { out: `commit ${c.id}\nAuthor: ${c.author}\n\n    ${c.msg}\n\nFichiers : ${Object.keys(c.tree).join(", ")}` } : { out: "fatal: aucun commit", err: true };
      }
      default:
        return { out: `git: « ${sub} » n'est pas une commande disponible dans ce simulateur. Voir « git help ».`, err: true };
    }
  }

  private rel(r: Repo, cwd: string, p: string): string {
    const abs = p.startsWith("/") ? p : (cwd === "/" ? "" : cwd) + "/" + p;
    const parts: string[] = [];
    for (const s of abs.split("/")) {
      if (!s || s === ".") continue;
      if (s === "..") parts.pop();
      else parts.push(s);
    }
    const full = "/" + parts.join("/");
    if (full === r.path) return "";
    return full.startsWith(r.path + "/") ? full.slice(r.path.length + 1) : "\u0000";
  }

  private cmdConfig(rest: string[]): Out {
    const args = rest.filter((a) => !a.startsWith("--global") && a !== "--local");
    if (args[0] === "--list" || args[0] === "-l")
      return { out: [this.config.name && `user.name=${this.config.name}`, this.config.email && `user.email=${this.config.email}`].filter(Boolean).join("\n") };
    const [key, ...val] = args;
    const v = val.join(" ");
    if (key === "user.name") {
      if (!v) return { out: this.config.name ?? "" };
      this.config.name = v;
      return { out: "" };
    }
    if (key === "user.email") {
      if (!v) return { out: this.config.email ?? "" };
      this.config.email = v;
      return { out: "" };
    }
    if (key === "init.defaultBranch" || key === "core.editor" || key === "pull.rebase") return { out: "" };
    return { out: `Clé de configuration non gérée dans ce simulateur : ${key ?? ""}`, err: !key };
  }

  private cmdInit(cwd: string, rest: string[]): Out {
    const target = rest.find((a) => !a.startsWith("-"));
    const path = target ? (target.startsWith("/") ? target : (cwd === "/" ? "" : cwd) + "/" + target) : cwd;
    this.vfs.mkdirp(path);
    if (this.repos[path]) return { out: `Dépôt Git existant réinitialisé dans ${path}/.git/` };
    this.vfs.mkdirp(path + "/.git");
    this.repos[path] = { path, commits: {}, branches: { main: null }, head: "main", index: {}, remotes: {}, remoteBranches: {} };
    return { out: `Dépôt Git vide initialisé dans ${path}/.git/` };
  }

  private cmdClone(cwd: string, rest: string[]): Out {
    const url = rest.find((a) => !a.startsWith("-"));
    if (!url) return { out: "usage : git clone <url> [dossier]", err: true };
    const name = rest.filter((a) => !a.startsWith("-"))[1] ?? url.split("/").pop()!.replace(/\.git$/, "");
    const path = (cwd === "/" ? "" : cwd) + "/" + name;
    if (this.vfs.get(path)) return { out: `fatal: le dossier de destination « ${name} » existe déjà`, err: true };
    this.vfs.mkdirp(path + "/.git");
    const tree = {
      "README.md": `# ${name}\n\nProjet d'exemple cloné depuis ${url}.\n`,
      "main.py": 'print("Bonjour depuis le projet cloné")\n',
    };
    const id = shortId() + shortId() + shortId();
    const r: Repo = {
      path,
      commits: { [id]: { id, msg: "Premier commit", parents: [], tree, author: "Équipe <equipe@example.com>", date: Date.now() - 86_400_000 } },
      branches: { main: id },
      head: "main",
      index: { ...tree },
      remotes: { origin: url },
      remoteBranches: { "origin/main": id },
    };
    this.repos[path] = r;
    for (const [k, v] of Object.entries(tree)) this.vfs.write(path + "/" + k, v);
    return { out: `Clonage dans '${name}'...\nRéception d'objets: 100% (4/4), fait.` };
  }

  private cmdStatus(r: Repo, rest: string[]): Out {
    const s = this.status(r);
    if (rest.includes("-s") || rest.includes("--short")) {
      return {
        out: [
          ...s.staged.map((x) => (x.startsWith("nouveau") ? "A  " : x.startsWith("supprimé") ? "D  " : "M  ") + x.split(/:\s+/)[1]),
          ...s.unstaged.map((x) => (x.startsWith("supprimé") ? " D " : " M ") + x.split(/:\s+/)[1]),
          ...s.untracked.map((x) => "?? " + x),
        ].join("\n"),
      };
    }
    const lines = [`Sur la branche ${r.head}`];
    if (!this.headCommit(r)) lines.push("", "Aucun commit");
    if (r.merging) lines.push("", `Fusion en cours avec « ${r.merging.branch} » : corrigez les conflits puis « git add » et « git commit ».`);
    if (s.staged.length) lines.push("", "Modifications qui seront validées :", '  (utilisez "git restore --staged <fichier>..." pour désindexer)', ...s.staged.map((x) => "\t" + x));
    if (s.unstaged.length) lines.push("", "Modifications qui ne seront pas validées :", '  (utilisez "git add <fichier>..." pour mettre à jour ce qui sera validé)', ...s.unstaged.map((x) => "\t" + x));
    if (s.untracked.length) lines.push("", "Fichiers non suivis :", '  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)', ...s.untracked.map((x) => "\t" + x));
    if (!s.staged.length && !s.unstaged.length && !s.untracked.length) lines.push(this.headCommit(r) ? "rien à valider, la copie de travail est propre" : "rien à valider (créez/copiez des fichiers et utilisez \"git add\" pour les suivre)");
    return { out: lines.join("\n") };
  }

  private cmdAdd(r: Repo, cwd: string, rest: string[]): Out {
    const targets = rest.filter((a) => !a.startsWith("-") || a === "-A");
    if (!targets.length) return { out: "Rien d'indiqué, rien d'ajouté.\nVouliez-vous dire « git add . » ?", err: true };
    const wt = this.worktree(r);
    const all = targets.includes("-A") || targets.includes("--all");
    let n = 0;
    for (const t of all ? ["."] : targets) {
      const rel = this.rel(r, cwd, t);
      if (rel === "\u0000") return { out: `fatal: ${t} est en dehors du dépôt`, err: true };
      const re = /[*?]/.test(rel) ? globToRe(rel) : null;
      const match = (k: string) => (re ? re.test(k) : rel === "" || k === rel || k.startsWith(rel + "/"));
      const keys = new Set([...Object.keys(wt), ...Object.keys(r.index)].filter(match));
      if (!keys.size) return { out: `fatal: le chemin « ${t} » ne correspond à aucun fichier`, err: true };
      for (const k of keys) {
        if (k in wt) {
          if (this.ignored(r, k) && !(k in r.index)) continue;
          r.index[k] = wt[k];
        } else delete r.index[k];
        n++;
      }
    }
    return { out: n ? "" : "Rien à ajouter." };
  }

  private cmdCommit(r: Repo, rest: string[]): Out {
    let msg = "";
    const all = rest.includes("-a") || rest.includes("-am");
    const mi = rest.findIndex((a) => a === "-m" || a === "-am");
    if (mi >= 0) msg = rest[mi + 1] ?? "";
    if (mi < 0 || !msg)
      return { out: "Abandon : message de commit vide.\n→ Dans ce simulateur, écrivez le message directement : git commit -m \"Votre message\"", err: true };
    if (!this.config.name || !this.config.email)
      return {
        out: '*** Veuillez me dire qui vous êtes.\n\nLancez\n\n  git config --global user.email "vous@exemple.com"\n  git config --global user.name "Votre Nom"\n\npour définir l\'identité par défaut de votre compte.',
        err: true,
      };
    if (all) {
      const wt = this.worktree(r);
      for (const k of Object.keys(r.index)) {
        if (k in wt) r.index[k] = wt[k];
        else delete r.index[k];
      }
    }
    const conflict = Object.entries(r.index).find(([, v]) => v.includes("<<<<<<< "));
    if (conflict) return { out: `error: le fichier « ${conflict[0]} » contient encore des marqueurs de conflit (<<<<<<<). Corrigez-le puis « git add ».`, err: true };
    const head = this.headCommit(r);
    const same = head && JSON.stringify(sortObj(head.tree)) === JSON.stringify(sortObj(r.index));
    if ((same && !r.merging) || (!head && !Object.keys(r.index).length)) {
      return { out: `Sur la branche ${r.head}\nrien à valider${Object.keys(this.status(r).untracked).length ? " (utilisez « git add » d'abord)" : ""}`, err: true };
    }
    const id = shortId() + shortId() + shortId() + shortId();
    const parents = [head?.id, r.merging?.other].filter(Boolean) as string[];
    r.commits[id] = { id, msg, parents, tree: { ...r.index }, author: `${this.config.name} <${this.config.email}>`, date: Date.now() + Object.keys(r.commits).length };
    r.branches[r.head] = id;
    const wasMerge = !!r.merging;
    delete r.merging;
    const files = Object.keys(r.index).length;
    return { out: `[${r.head}${head ? "" : " (commit racine)"} ${id.slice(0, 7)}] ${msg}${wasMerge ? "\n(commit de fusion)" : ""}\n ${files} fichier(s) suivi(s) dans cet instantané` };
  }

  private cmdDiff(r: Repo, rest: string[]): Out {
    const staged = rest.includes("--staged") || rest.includes("--cached");
    const head = this.headCommit(r)?.tree ?? {};
    const a = staged ? head : r.index;
    const b = staged ? r.index : this.worktree(r);
    const out: string[] = [];
    const keys = [...new Set([...Object.keys(a), ...(staged ? Object.keys(b) : Object.keys(a))])].sort();
    for (const k of keys) {
      if (a[k] === b[k]) continue;
      out.push(`diff --git a/${k} b/${k}`, `--- ${k in a ? "a/" + k : "/dev/null"}`, `+++ ${k in b ? "b/" + k : "/dev/null"}`);
      out.push(...lineDiff(a[k] ?? "", b[k] ?? ""));
    }
    return { out: out.join("\n") };
  }

  private cmdBranch(r: Repo, rest: string[]): Out {
    const del = rest.findIndex((a) => a === "-d" || a === "-D");
    if (del >= 0) {
      const b = rest[del + 1];
      if (!b || !(b in r.branches)) return { out: `error: branche « ${b ?? ""} » introuvable.`, err: true };
      if (b === r.head) return { out: `error: impossible de supprimer la branche « ${b} » : vous êtes dessus.`, err: true };
      if (rest[del] === "-d" && r.branches[b] && !this.isAncestor(r, r.branches[b]!, r.branches[r.head]))
        return { out: `error: la branche « ${b} » n'est pas totalement fusionnée.\nSi vous êtes sûr de vouloir la supprimer, lancez « git branch -D ${b} ».`, err: true };
      delete r.branches[b];
      return { out: `Branche ${b} supprimée.` };
    }
    const name = rest.find((a) => !a.startsWith("-"));
    if (!name) {
      const lines = Object.keys(r.branches).map((b) => (b === r.head ? "* " : "  ") + b);
      if (rest.includes("-a")) lines.push(...Object.keys(r.remoteBranches).map((b) => "  remotes/" + b));
      return { out: lines.join("\n") };
    }
    if (!this.headCommit(r)) return { out: "fatal: impossible de créer une branche avant le premier commit.", err: true };
    if (name in r.branches) return { out: `fatal: une branche nommée « ${name} » existe déjà.`, err: true };
    if (!/^[\w./-]+$/.test(name)) return { out: `fatal: « ${name} » n'est pas un nom de branche valide.`, err: true };
    r.branches[name] = r.branches[r.head];
    return { out: "" };
  }

  private cmdSwitch(r: Repo, sub: string, rest: string[]): Out {
    const create = rest.includes("-b") || rest.includes("-c") || rest.includes("--create");
    const name = rest.find((a) => !a.startsWith("-"));
    if (!name) return { out: `usage : git ${sub} ${sub === "switch" ? "[-c]" : "[-b]"} <branche>`, err: true };
    if (sub === "checkout" && !create && !(name in r.branches)) {
      // git checkout -- fichier : restaure un fichier
      if (name in r.index) {
        this.vfs.write(r.path + "/" + name, r.index[name]);
        return { out: `1 chemin mis à jour depuis l'index` };
      }
    }
    if (create) {
      if (name in r.branches) return { out: `fatal: une branche nommée « ${name} » existe déjà.`, err: true };
      r.branches[name] = r.branches[r.head];
      r.head = name;
      return { out: `Basculement sur la nouvelle branche '${name}'` };
    }
    if (!(name in r.branches)) {
      const remote = `origin/${name}`;
      if (r.remoteBranches[remote]) {
        r.branches[name] = r.remoteBranches[remote];
      } else return { out: `error: la branche « ${name} » n'existe pas.${sub === "switch" ? ` Pour la créer : git switch -c ${name}` : ` Pour la créer : git checkout -b ${name}`}`, err: true };
    }
    if (name === r.head) return { out: `Déjà sur '${name}'` };
    const s = this.status(r);
    if (s.staged.length || s.unstaged.length)
      return {
        out: "error: vos modifications locales seraient écrasées par le basculement.\nValidez-les (git commit) ou annulez-les (git restore) avant de changer de branche.",
        err: true,
      };
    const target = r.branches[name];
    this.checkoutTree(r, target ? r.commits[target].tree : {});
    r.head = name;
    return { out: `Basculement sur la branche '${name}'` };
  }

  private cmdMerge(r: Repo, rest: string[]): Out {
    if (rest.includes("--abort")) {
      if (!r.merging) return { out: "fatal: aucune fusion en cours.", err: true };
      this.checkoutTree(r, this.headCommit(r)?.tree ?? {});
      delete r.merging;
      return { out: "Fusion annulée." };
    }
    const name = rest.find((a) => !a.startsWith("-"));
    if (!name) return { out: "usage : git merge <branche>", err: true };
    const other = r.branches[name] ?? r.remoteBranches[name];
    if (!other) return { out: `merge: ${name} - ne correspond à aucune branche connue`, err: true };
    const cur = r.branches[r.head];
    if (!cur) return { out: "fatal: aucun commit sur la branche courante", err: true };
    if (this.isAncestor(r, other, cur)) return { out: "Déjà à jour." };
    const s = this.status(r);
    if (s.staged.length || s.unstaged.length) return { out: "error: validez ou annulez vos modifications avant de fusionner.", err: true };
    if (this.isAncestor(r, cur, other) && !rest.includes("--no-ff")) {
      this.checkoutTree(r, r.commits[other].tree);
      r.branches[r.head] = other;
      return { out: `Mise à jour ${cur.slice(0, 7)}..${other.slice(0, 7)}\nFast-forward (avance rapide)\n ${Object.keys(r.commits[other].tree).length} fichier(s) dans l'arbre` };
    }
    const base = this.mergeBase(r, cur, other);
    const B = base ? r.commits[base].tree : {};
    const O = r.commits[cur].tree;
    const T = r.commits[other].tree;
    const result: Record<string, string> = {};
    const conflicts: string[] = [];
    for (const k of new Set([...Object.keys(B), ...Object.keys(O), ...Object.keys(T)])) {
      const b = B[k], o = O[k], t = T[k];
      if (o === t) {
        if (o !== undefined) result[k] = o;
      } else if (o === b) {
        if (t !== undefined) result[k] = t;
      } else if (t === b) {
        if (o !== undefined) result[k] = o;
      } else {
        conflicts.push(k);
        result[k] = `<<<<<<< HEAD\n${o ?? ""}${o && !o.endsWith("\n") ? "\n" : ""}=======\n${t ?? ""}${t && !t.endsWith("\n") ? "\n" : ""}>>>>>>> ${name}\n`;
      }
    }
    this.checkoutTree(r, result);
    // Un fichier en conflit garde sa version HEAD dans l'index tant qu'il n'est pas résolu
    for (const k of conflicts) {
      if (O[k] === undefined) delete r.index[k];
      else r.index[k] = O[k];
    }
    r.merging = { other, branch: name };
    if (conflicts.length) {
      return {
        out: conflicts.map((k) => `CONFLIT (contenu) : conflit de fusion dans ${k}`).join("\n") + "\nLa fusion automatique a échoué ; réglez les conflits (éditez le fichier), puis « git add » et « git commit ».",
        err: true,
      };
    }
    r.index = { ...result };
    return this.cmdCommit(r, ["-m", `Merge branch '${name}'`]);
  }

  private cmdRestore(r: Repo, cwd: string, rest: string[]): Out {
    const staged = rest.includes("--staged") || rest.includes("-S");
    const files = rest.filter((a) => !a.startsWith("-"));
    if (!files.length) return { out: "fatal: indiquez le fichier à restaurer (git restore <fichier>)", err: true };
    const head = this.headCommit(r)?.tree ?? {};
    for (const f of files) {
      const k = this.rel(r, cwd, f);
      if (staged) {
        if (k in head) r.index[k] = head[k];
        else delete r.index[k];
      } else {
        if (!(k in r.index)) return { out: `error: le chemin « ${f} » n'est pas suivi par Git`, err: true };
        this.vfs.write(r.path + "/" + k, r.index[k]);
      }
    }
    return { out: "" };
  }

  private cmdRm(r: Repo, cwd: string, rest: string[]): Out {
    const cached = rest.includes("--cached");
    for (const f of rest.filter((a) => !a.startsWith("-"))) {
      const k = this.rel(r, cwd, f);
      if (!(k in r.index)) return { out: `fatal: le chemin « ${f} » ne correspond à aucun fichier suivi`, err: true };
      delete r.index[k];
      if (!cached) this.vfs.remove(r.path + "/" + k);
    }
    return { out: rest.filter((a) => !a.startsWith("-")).map((f) => `rm '${f}'`).join("\n") };
  }

  private cmdMv(r: Repo, cwd: string, rest: string[]): Out {
    const [a, b] = rest.filter((x) => !x.startsWith("-"));
    const ka = this.rel(r, cwd, a ?? "");
    const kb = this.rel(r, cwd, b ?? "");
    if (!(ka in r.index)) return { out: `fatal: « ${a} » n'est pas suivi par Git`, err: true };
    const content = this.vfs.read(r.path + "/" + ka);
    this.vfs.write(r.path + "/" + kb, content);
    this.vfs.remove(r.path + "/" + ka);
    r.index[kb] = r.index[ka];
    delete r.index[ka];
    return { out: "" };
  }

  private cmdRemote(r: Repo, rest: string[]): Out {
    if (!rest.length) return { out: Object.keys(r.remotes).join("\n") };
    if (rest[0] === "-v") return { out: Object.entries(r.remotes).map(([n, u]) => `${n}\t${u} (fetch)\n${n}\t${u} (push)`).join("\n") };
    if (rest[0] === "add") {
      const [, n, u] = rest;
      if (!n || !u) return { out: "usage : git remote add <nom> <url>", err: true };
      if (r.remotes[n]) return { out: `error: le dépôt distant ${n} existe déjà.`, err: true };
      r.remotes[n] = u;
      return { out: "" };
    }
    if (rest[0] === "remove" || rest[0] === "rm") {
      delete r.remotes[rest[1]];
      return { out: "" };
    }
    return { out: "usage : git remote [-v | add <nom> <url> | remove <nom>]", err: true };
  }

  private cmdPush(r: Repo, rest: string[]): Out {
    const args = rest.filter((a) => !a.startsWith("-"));
    const remote = args[0] ?? Object.keys(r.remotes)[0];
    if (!remote || !r.remotes[remote]) return { out: "fatal: aucune destination de push configurée.\n→ git remote add origin <url> puis git push -u origin main", err: true };
    const branch = args[1] ?? r.head;
    const id = r.branches[branch];
    if (!id) return { out: `error: src refspec ${branch} ne correspond à aucun commit (faites d'abord un commit).`, err: true };
    const prev = r.remoteBranches[`${remote}/${branch}`];
    r.remoteBranches[`${remote}/${branch}`] = id;
    return {
      out: `Énumération des objets: fait.\nÉcriture des objets: 100%, fait.\nTo ${r.remotes[remote]}\n   ${prev ? prev.slice(0, 7) + ".." + id.slice(0, 7) : "* [new branch]     "} ${branch} -> ${branch}${rest.includes("-u") || rest.includes("--set-upstream") ? `\nLa branche '${branch}' est paramétrée pour suivre '${remote}/${branch}'.` : ""}`,
    };
  }
}

function sortObj(o: Record<string, string>) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
}

// Diff ligne à ligne (plus longue sous-séquence commune) — suffisant pour des fichiers courts.
export function lineDiff(a: string, b: string): string[] {
  const A = a.split("\n");
  const B = b.split("\n");
  if (A.at(-1) === "") A.pop();
  if (B.at(-1) === "") B.pop();
  const n = A.length, m = B.length;
  if (n * m > 250_000) return ["@@ fichier trop long pour afficher le détail @@"];
  const L = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: string[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) {
      out.push(" " + A[i]);
      i++;
      j++;
    } else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) out.push("+" + B[j++]);
    else out.push("-" + A[i++]);
  }
  return out;
}
