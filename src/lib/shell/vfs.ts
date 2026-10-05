// Système de fichiers virtuel (en mémoire, sérialisable) du terminal simulé.

export type FNode = { t: "d"; c: Record<string, FNode>; m: number } | { t: "f"; d: string; m: number };

export const HOME = "/home/apprenant";

export function dir(m = 0o755): FNode {
  return { t: "d", c: {}, m };
}

export function file(d = "", m = 0o644): FNode {
  return { t: "f", d, m };
}

export function normalize(path: string, cwd: string, home = HOME): string {
  let p = path;
  if (p === "~" || p.startsWith("~/")) p = home + p.slice(1);
  if (!p.startsWith("/")) p = (cwd === "/" ? "" : cwd) + "/" + p;
  const out: string[] = [];
  for (const part of p.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return "/" + out.join("/");
}

export const parentOf = (p: string) => (p === "/" ? "/" : p.slice(0, p.lastIndexOf("/")) || "/");
export const baseName = (p: string) => p.slice(p.lastIndexOf("/") + 1);

export class Vfs {
  root: FNode;
  constructor(root?: FNode) {
    this.root = root ?? Vfs.skeleton();
  }

  static skeleton(): FNode {
    const r = dir();
    const v = new Vfs(r);
    for (const d of ["/bin", "/etc", "/tmp", "/var/log", "/usr/bin", HOME]) v.mkdirp(d);
    v.write("/etc/hostname", "techcampus\n");
    v.write("/etc/os-release", 'NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\n');
    v.write(
      "/var/log/syslog",
      [
        "Oct  5 08:00:01 techcampus CRON[812]: (root) CMD (run-parts /etc/cron.hourly)",
        "Oct  5 08:02:13 techcampus sshd[901]: Accepted publickey for apprenant from 10.0.0.12 port 51122",
        "Oct  5 08:05:47 techcampus kernel: [ 1234.5678] eth0: link up",
        "Oct  5 08:10:02 techcampus sshd[955]: Failed password for root from 203.0.113.7 port 40022",
        "Oct  5 08:10:05 techcampus sshd[955]: Failed password for root from 203.0.113.7 port 40024",
        "Oct  5 08:12:30 techcampus nginx[1002]: 192.168.1.20 - GET /index.html 200",
        "Oct  5 08:15:00 techcampus systemd[1]: Started Daily apt upgrade.",
        "Oct  5 08:20:44 techcampus sshd[990]: Failed password for admin from 203.0.113.7 port 40100",
        "",
      ].join("\n"),
    );
    return r;
  }

  get(path: string): FNode | null {
    if (path === "/") return this.root;
    let n: FNode = this.root;
    for (const part of path.split("/").filter(Boolean)) {
      if (n.t !== "d") return null;
      const next: FNode | undefined = n.c[part];
      if (!next) return null;
      n = next;
    }
    return n;
  }

  isDir(p: string) {
    return this.get(p)?.t === "d";
  }
  isFile(p: string) {
    return this.get(p)?.t === "f";
  }

  mkdirp(path: string) {
    let n = this.root;
    for (const part of path.split("/").filter(Boolean)) {
      if (n.t !== "d") throw new Error(`${path} : n'est pas un dossier`);
      n = n.c[part] ??= dir();
    }
    if (n.t !== "d") throw new Error(`${path} : un fichier porte déjà ce nom`);
    return n;
  }

  write(path: string, data: string, append = false) {
    const parent = this.get(parentOf(path));
    if (!parent || parent.t !== "d") throw new Error(`${parentOf(path)} : dossier introuvable`);
    const name = baseName(path);
    const cur = parent.c[name];
    if (cur?.t === "d") throw new Error(`${path} : est un dossier`);
    if (cur?.t === "f") cur.d = append ? cur.d + data : data;
    else parent.c[name] = file(data);
  }

  read(path: string): string {
    const n = this.get(path);
    if (!n) throw new Error(`${path} : aucun fichier ou dossier de ce nom`);
    if (n.t === "d") throw new Error(`${path} : est un dossier`);
    return n.d;
  }

  remove(path: string) {
    const parent = this.get(parentOf(path));
    if (parent?.t === "d") delete parent.c[baseName(path)];
  }

  list(path: string): string[] {
    const n = this.get(path);
    return n?.t === "d" ? Object.keys(n.c).sort((a, b) => a.localeCompare(b)) : [];
  }

  clone(n: FNode): FNode {
    return JSON.parse(JSON.stringify(n));
  }

  // Tous les fichiers sous un dossier (chemins relatifs), en ignorant .git
  walkFiles(base: string, skipGit = true): Record<string, string> {
    const out: Record<string, string> = {};
    const rec = (p: string, n: FNode) => {
      if (n.t === "f") {
        out[p.slice(base.length + (base === "/" ? 0 : 1))] = n.d;
        return;
      }
      for (const [k, v] of Object.entries(n.c)) {
        if (skipGit && k === ".git") continue;
        rec((p === "/" ? "" : p) + "/" + k, v);
      }
    };
    const start = this.get(base);
    if (start) rec(base, start);
    return out;
  }
}

// Motifs simples (« *.txt », « data_?.csv ») → expression régulière
export function globToRe(g: string) {
  return new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
}
