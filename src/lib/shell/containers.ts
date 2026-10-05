// Docker et Kubernetes simulés : de quoi s'entraîner aux commandes et
// comprendre les concepts (image, conteneur, port, déploiement, réplicas,
// service) sans installer quoi que ce soit.
import * as yaml from "js-yaml";
import type { Vfs } from "./vfs";

type Out = { out: string; err?: boolean };

export interface Container {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited";
  ports: string[]; // "8080:80"
  env: Record<string, string>;
  created: number;
  logs: string[];
}

export interface K8sObject {
  kind: string;
  name: string;
  namespace: string;
  spec: Record<string, unknown>;
  labels: Record<string, string>;
  created: number;
}

const REGISTRY: Record<string, { size: string; logs: string[]; port?: number; serve?: string }> = {
  "hello-world": {
    size: "13kB",
    logs: [
      "",
      "Hello from Docker!",
      "This message shows that your installation appears to be working correctly.",
      "",
      "Pour produire ce message, Docker a :",
      " 1. contacté le démon Docker ;",
      " 2. téléchargé l'image « hello-world » depuis Docker Hub ;",
      " 3. créé un conteneur à partir de cette image, qui a exécuté ce programme ;",
      " 4. renvoyé la sortie vers votre terminal.",
    ],
  },
  nginx: {
    size: "192MB",
    port: 80,
    logs: ["/docker-entrypoint.sh: Configuration complete; ready for start up", "nginx: start worker processes"],
    serve: "<!DOCTYPE html>\n<html><head><title>Welcome to nginx!</title></head>\n<body><h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and working.</p></body></html>",
  },
  httpd: { size: "148MB", port: 80, logs: ["AH00094: Command line: 'httpd -D FOREGROUND'"], serve: "<html><body><h1>It works!</h1></body></html>" },
  postgres: { size: "438MB", port: 5432, logs: ["PostgreSQL init process complete; ready for start up.", "database system is ready to accept connections"] },
  mysql: { size: "586MB", port: 3306, logs: ["mysqld: ready for connections. Version: '8.4'  port: 3306"] },
  redis: { size: "117MB", port: 6379, logs: ["Ready to accept connections tcp"] },
  python: { size: "1.02GB", logs: [] },
  "python:3.12-slim": { size: "125MB", logs: [] },
  "python:3.13-slim": { size: "128MB", logs: [] },
  alpine: { size: "7.8MB", logs: [] },
  ubuntu: { size: "78MB", logs: [] },
  node: { size: "1.1GB", logs: [] },
  "apache/airflow": { size: "1.4GB", port: 8080, logs: ["Airflow webserver listening on 0.0.0.0:8080"] },
  "bitnami/kafka": { size: "590MB", port: 9092, logs: ["[KafkaServer id=1] started"] },
  grafana: { size: "460MB", port: 3000, logs: ["HTTP Server Listen addr=0.0.0.0:3000"], serve: "<html><title>Grafana</title></html>" },
  "prom/prometheus": { size: "260MB", port: 9090, logs: ["Server is ready to receive web requests."] },
};

const baseImage = (img: string) => img.split(":")[0];
const known = (img: string) => REGISTRY[img] ?? REGISTRY[baseImage(img)];
const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const ADJ = ["agile", "brave", "calme", "docile", "eager", "fervent", "gentil", "happy", "jolly", "keen"];
const NOUN = ["turing", "lovelace", "hopper", "knuth", "torvalds", "ritchie", "liskov", "hamilton", "shannon", "babbage"];

export class Docker {
  images: Record<string, { id: string; size: string; built?: boolean; steps?: string[]; expose?: number; serve?: string }> = {};
  containers: Container[] = [];

  constructor(private vfs: Vfs) {}

  hasImage(img: string) {
    const full = img.includes(":") ? img : img + ":latest";
    return !!this.images[full] || !!known(img);
  }

  private pull(img: string): Out & { ok: boolean } {
    const full = img.includes(":") ? img : img + ":latest";
    if (this.images[full]) return { ok: true, out: "" };
    const k = known(img);
    if (!k)
      return {
        ok: false,
        err: true,
        out: `Unable to find image '${full}' locally\nError response from daemon: pull access denied for ${baseImage(img)}, repository does not exist or may require 'docker login'\n→ Vérifiez le nom de l'image (faute de frappe ?) ou construisez-la d'abord avec « docker build -t ${baseImage(img)} . ».`,
      };
    this.images[full] = { id: hex(12), size: k.size };
    return { ok: true, out: `Unable to find image '${full}' locally\n${baseImage(img)}: Pulling from library/${baseImage(img)}\nStatus: Downloaded newer image for ${full}` };
  }

  find(ref: string) {
    return this.containers.find((c) => c.name === ref || c.id.startsWith(ref));
  }

  // Réponse HTTP d'un conteneur publié sur le port de l'hôte
  serve(hostPort: number): string | null {
    for (const c of this.containers) {
      if (c.status !== "running") continue;
      for (const p of c.ports) {
        const [h] = p.split(":");
        if (Number(h) === hostPort) {
          const full = c.image.includes(":") ? c.image : c.image + ":latest";
          return this.images[full]?.serve ?? known(c.image)?.serve ?? `Réponse du conteneur ${c.name} (${c.image})`;
        }
      }
    }
    return null;
  }

  run(args: string[], cwd: string): Out {
    const [sub, ...rest] = args;
    switch (sub) {
      case undefined:
      case "help":
      case "--help":
        return { out: "Commandes Docker disponibles ici : version, pull, images, run, ps, stop, start, rm, rmi, logs, exec, build, inspect, system prune, compose up/down/ps." };
      case "version":
      case "--version":
        return { out: "Docker version 28.4.0 (simulé)" };
      case "pull": {
        const img = rest.find((a) => !a.startsWith("-"));
        if (!img) return { out: "usage : docker pull <image>", err: true };
        const r = this.pull(img);
        return { out: r.out || `${img}: déjà présente localement`, err: !r.ok };
      }
      case "images":
      case "image": {
        if (sub === "image" && rest[0] !== "ls") return { out: "usage : docker image ls", err: true };
        const rows = Object.entries(this.images).map(([k, v]) => {
          const [repo, tag] = k.split(":");
          return `${repo.padEnd(22)} ${tag.padEnd(10)} ${v.id}   ${v.size}`;
        });
        return { out: ["REPOSITORY             TAG        IMAGE ID       SIZE", ...rows].join("\n") };
      }
      case "run":
        return this.cmdRun(rest);
      case "ps":
      case "container": {
        const all = rest.includes("-a") || rest.includes("--all");
        const list = this.containers.filter((c) => all || c.status === "running");
        const rows = list.map(
          (c) =>
            `${c.id.slice(0, 12)}   ${c.image.padEnd(18)} ${(c.status === "running" ? "Up" : "Exited (0)").padEnd(12)} ${c.ports.map((p) => `0.0.0.0:${p.replace(":", "->")}/tcp`).join(", ").padEnd(24)} ${c.name}`,
        );
        return { out: ["CONTAINER ID   IMAGE              STATUS       PORTS                    NAMES", ...rows].join("\n") };
      }
      case "stop":
      case "start":
      case "restart": {
        const out: string[] = [];
        for (const ref of rest.filter((a) => !a.startsWith("-"))) {
          const c = this.find(ref);
          if (!c) return { out: `Error response from daemon: No such container: ${ref}`, err: true };
          c.status = sub === "stop" ? "exited" : "running";
          out.push(ref);
        }
        return { out: out.join("\n") };
      }
      case "rm": {
        const force = rest.includes("-f");
        const out: string[] = [];
        for (const ref of rest.filter((a) => !a.startsWith("-"))) {
          const c = this.find(ref);
          if (!c) return { out: `Error response from daemon: No such container: ${ref}`, err: true };
          if (c.status === "running" && !force)
            return { out: `Error response from daemon: cannot remove container "${c.name}": container is running: stop the container before removing or force remove (-f)`, err: true };
          this.containers = this.containers.filter((x) => x !== c);
          out.push(ref);
        }
        return { out: out.join("\n") };
      }
      case "rmi": {
        const img = rest.find((a) => !a.startsWith("-"));
        if (!img) return { out: "usage : docker rmi <image>", err: true };
        const full = img.includes(":") ? img : img + ":latest";
        if (!this.images[full]) return { out: `Error response from daemon: No such image: ${full}`, err: true };
        const used = this.containers.find((c) => (c.image.includes(":") ? c.image : c.image + ":latest") === full);
        if (used) return { out: `Error response from daemon: conflict: unable to remove repository reference "${full}" - container ${used.id.slice(0, 12)} is using its referenced image`, err: true };
        delete this.images[full];
        return { out: `Untagged: ${full}\nDeleted: sha256:${hex(20)}` };
      }
      case "logs": {
        const c = this.find(rest.find((a) => !a.startsWith("-")) ?? "");
        if (!c) return { out: "Error: No such container", err: true };
        return { out: c.logs.join("\n") };
      }
      case "exec": {
        const args2 = rest.filter((a) => !a.startsWith("-"));
        const c = this.find(args2[0] ?? "");
        if (!c) return { out: "Error: No such container", err: true };
        if (c.status !== "running") return { out: `Error response from daemon: container ${c.id.slice(0, 12)} is not running`, err: true };
        const cmd = args2.slice(1).join(" ");
        if (/^env$/.test(cmd)) return { out: Object.entries(c.env).map(([k, v]) => `${k}=${v}`).join("\n") || "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin" };
        if (/hostname/.test(cmd)) return { out: c.id.slice(0, 12) };
        if (/psql/.test(cmd)) return { out: "psql (16.4)\nType \"help\" for help.\n\npostgres=# (simulation : utilisez le labo SQL pour pratiquer les requêtes)" };
        return { out: `(simulation) commande « ${cmd} » exécutée dans le conteneur ${c.name}` };
      }
      case "inspect": {
        const c = this.find(rest[0] ?? "");
        if (!c) return { out: "Error: No such object", err: true };
        return { out: JSON.stringify([{ Id: c.id, Name: "/" + c.name, Config: { Image: c.image, Env: Object.entries(c.env).map(([k, v]) => `${k}=${v}`) }, State: { Status: c.status }, HostConfig: { PortBindings: c.ports } }], null, 2) };
      }
      case "build":
        return this.cmdBuild(rest, cwd);
      case "system":
        if (rest[0] === "prune") {
          const n = this.containers.filter((c) => c.status === "exited").length;
          this.containers = this.containers.filter((c) => c.status === "running");
          return { out: `Deleted Containers: ${n}\nTotal reclaimed space: ${n * 12}MB` };
        }
        return { out: "usage : docker system prune", err: true };
      case "compose":
        return this.cmdCompose(rest, cwd);
      default:
        return { out: `docker: '${sub}' n'est pas une commande disponible dans ce simulateur. Voir « docker help ».`, err: true };
    }
  }

  private cmdRun(rest: string[]): Out {
    let detach = false;
    let name = "";
    let rm = false;
    const ports: string[] = [];
    const env: Record<string, string> = {};
    let i = 0;
    for (; i < rest.length; i++) {
      const a = rest[i];
      if (a === "-d" || a === "--detach") detach = true;
      else if (a === "--rm") rm = true;
      else if (a === "-it" || a === "-i" || a === "-t") continue;
      else if (a === "--name") name = rest[++i];
      else if (a.startsWith("--name=")) name = a.slice(7);
      else if (a === "-p" || a === "--publish") ports.push(rest[++i]);
      else if (a === "-e" || a === "--env") {
        const [k, ...v] = rest[++i].split("=");
        env[k] = v.join("=");
      } else if (a === "-v" || a === "--volume" || a === "--network") i++;
      else if (a.startsWith("-")) continue;
      else break;
    }
    const image = rest[i];
    if (!image) return { out: "docker: \"docker run\" requires at least 1 argument.\nusage : docker run [OPTIONS] IMAGE [COMMAND]", err: true };
    const cmd = rest.slice(i + 1).join(" ");
    for (const p of ports) if (!/^\d+:\d+$/.test(p)) return { out: `docker: invalid port format « ${p} » (attendu : PORT_HÔTE:PORT_CONTENEUR, ex. 8080:80)`, err: true };
    if (name && this.containers.some((c) => c.name === name))
      return { out: `docker: Error response from daemon: Conflict. The container name "/${name}" is already in use.\n→ Choisissez un autre nom ou supprimez l'ancien conteneur (docker rm -f ${name}).`, err: true };
    for (const p of ports) {
      const host = p.split(":")[0];
      if (this.containers.some((c) => c.status === "running" && c.ports.some((x) => x.split(":")[0] === host)))
        return { out: `docker: Error response from daemon: Bind for 0.0.0.0:${host} failed: port is already allocated.`, err: true };
    }
    const pulled = this.pull(image);
    if (!pulled.ok) return pulled;
    const k = known(image);
    const full = image.includes(":") ? image : image + ":latest";
    const longRunning = !!(k?.port || this.images[full]?.expose || this.images[full]?.serve) && !cmd;
    if (baseImage(image) === "postgres" && !env.POSTGRES_PASSWORD) {
      const c: Container = { id: hex(64), name: name || `${ADJ[Math.floor(Math.random() * 10)]}_${NOUN[Math.floor(Math.random() * 10)]}`, image, status: "exited", ports, env, created: Date.now(), logs: ["Error: Database is uninitialized and superuser password is not specified.", "       You must specify POSTGRES_PASSWORD to a non-empty value for the superuser."] };
      if (!rm) this.containers.push(c);
      return { out: (pulled.out ? pulled.out + "\n" : "") + c.logs.join("\n"), err: true };
    }
    const c: Container = {
      id: hex(64),
      name: name || `${ADJ[Math.floor(Math.random() * 10)]}_${NOUN[Math.floor(Math.random() * 10)]}`,
      image,
      status: longRunning ? "running" : "exited",
      ports,
      env,
      created: Date.now(),
      logs: k?.logs ? [...k.logs] : this.images[full]?.built ? ["Application démarrée"] : [],
    };
    let out = pulled.out ? pulled.out + "\n" : "";
    if (cmd) {
      const echo = cmd.match(/^echo\s+(.*)$/);
      const res = echo ? echo[1].replace(/^["']|["']$/g, "") : /python.*--version/.test(cmd) ? "Python 3.12.7" : /cat \/etc\/os-release/.test(cmd) ? 'NAME="Alpine Linux"' : `(simulation) « ${cmd} » exécuté`;
      c.logs = [res];
    }
    if (!rm || c.status === "running") this.containers.push(c);
    if (detach || c.status === "running") {
      if (!detach) out += c.logs.join("\n") + "\n(le conteneur tourne au premier plan ; dans ce simulateur il continue en arrière-plan — préférez l'option -d)\n";
      return { out: out + c.id };
    }
    return { out: out + c.logs.join("\n") };
  }

  private cmdBuild(rest: string[], cwd: string): Out {
    let tag = "";
    let file = "Dockerfile";
    let ctx = ".";
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === "-t" || rest[i] === "--tag") tag = rest[++i];
      else if (rest[i] === "-f") file = rest[++i];
      else if (!rest[i].startsWith("-")) ctx = rest[i];
    }
    const base = ctx === "." ? cwd : ctx.startsWith("/") ? ctx : cwd + "/" + ctx;
    let df: string;
    try {
      df = this.vfs.read(file.startsWith("/") ? file : base + "/" + file);
    } catch {
      return { out: `ERROR: failed to read dockerfile: open ${file}: no such file or directory\n→ Créez d'abord un fichier « Dockerfile » dans ce dossier (edit Dockerfile).`, err: true };
    }
    const lines = df
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    const errs = lintDockerfile(lines, (p) => !!this.vfs.get(p.startsWith("/") ? p : base + "/" + p));
    if (errs.length) return { out: "ERROR: échec de la construction :\n" + errs.map((e) => " - " + e).join("\n"), err: true };
    const from = lines[0].split(/\s+/)[1];
    const pulled = this.pull(from);
    if (!pulled.ok) return pulled;
    const steps = lines.map((l, i) => `#${i + 1} [${i + 1}/${lines.length}] ${l}`);
    const name = tag || "<none>";
    const full = name.includes(":") ? name : name + ":latest";
    const expose = Number(lines.find((l) => /^EXPOSE/i.test(l))?.split(/\s+/)[1]) || undefined;
    this.images[full] = { id: hex(12), size: `${80 + lines.length * 7}MB`, built: true, steps: lines, expose, serve: expose ? `Réponse de votre application (${name}) sur le port ${expose}` : undefined };
    return { out: [...steps, `#${lines.length + 1} exporting to image`, `#${lines.length + 1} naming to docker.io/library/${full} done`, tag ? "" : "⚠ Astuce : nommez vos images avec -t (ex. docker build -t mon-app:1.0 .)"].filter(Boolean).join("\n") };
  }

  private cmdCompose(rest: string[], cwd: string): Out {
    const sub = rest.find((a) => !a.startsWith("-"));
    let doc: { services?: Record<string, { image?: string; build?: unknown; ports?: string[]; environment?: Record<string, string> | string[] }> };
    let fname = "";
    for (const f of ["compose.yaml", "compose.yml", "docker-compose.yml", "docker-compose.yaml"]) {
      if (this.vfs.isFile(cwd + "/" + f)) {
        fname = f;
        break;
      }
    }
    if (!fname) return { out: "no configuration file provided: not found\n→ Créez un fichier compose.yaml dans ce dossier.", err: true };
    try {
      doc = yaml.load(this.vfs.read(cwd + "/" + fname)) as typeof doc;
    } catch (e) {
      return { out: `yaml: ${(e as Error).message.split("\n")[0]}\n→ Vérifiez l'indentation (espaces, jamais de tabulations).`, err: true };
    }
    if (!doc?.services) return { out: `${fname}: la clé « services » est absente`, err: true };
    const project = cwd.split("/").pop() || "projet";
    if (sub === "up") {
      const out: string[] = [];
      for (const [svc, def] of Object.entries(doc.services)) {
        const image = def.image ?? (def.build ? `${project}-${svc}` : "");
        if (!image) return { out: `service « ${svc} » : ni « image » ni « build »`, err: true };
        if (def.build && !this.hasImage(image)) {
          const r = this.cmdBuild(["-t", image, typeof def.build === "string" ? def.build : "."], cwd);
          if (r.err) return r;
        }
        const env = Array.isArray(def.environment) ? def.environment.map((x) => x.split("=")) : Object.entries(def.environment ?? {});
        const args = ["-d", "--name", `${project}-${svc}-1`, ...(def.ports ?? []).flatMap((p) => ["-p", String(p)]), ...env.flatMap(([k, v]) => ["-e", `${k}=${v}`]), image];
        const existing = this.find(`${project}-${svc}-1`);
        if (existing) this.containers = this.containers.filter((c) => c !== existing);
        const r = this.cmdRun(args);
        if (r.err) return r;
        out.push(` ✔ Container ${project}-${svc}-1  Started`);
      }
      return { out: out.join("\n") };
    }
    if (sub === "down") {
      const n = this.containers.filter((c) => c.name.startsWith(project + "-")).length;
      this.containers = this.containers.filter((c) => !c.name.startsWith(project + "-"));
      return { out: ` ✔ ${n} conteneur(s) arrêté(s) et supprimé(s)` };
    }
    if (sub === "ps") return this.run(["ps"], cwd);
    return { out: "usage : docker compose up -d | down | ps", err: true };
  }
}

export function lintDockerfile(lines: string[], exists: (p: string) => boolean): string[] {
  const errs: string[] = [];
  const KNOWN = ["FROM", "RUN", "CMD", "LABEL", "EXPOSE", "ENV", "ADD", "COPY", "ENTRYPOINT", "VOLUME", "USER", "WORKDIR", "ARG", "ONBUILD", "STOPSIGNAL", "HEALTHCHECK", "SHELL"];
  if (!lines.length) return ["le Dockerfile est vide"];
  if (!/^FROM\s+\S+/i.test(lines[0]) && !/^ARG\s/i.test(lines[0])) errs.push("la première instruction doit être FROM <image de base>");
  for (const l of lines) {
    const ins = l.split(/\s+/)[0].toUpperCase();
    if (!KNOWN.includes(ins)) errs.push(`instruction inconnue : ${l.split(/\s+/)[0]}`);
    if (ins !== l.split(/\s+/)[0]) errs.push(`« ${l.split(/\s+/)[0]} » : par convention, les instructions s'écrivent en MAJUSCULES`);
    if (ins === "COPY" || ins === "ADD") {
      const parts = l.split(/\s+/).slice(1).filter((p) => !p.startsWith("--"));
      for (const src of parts.slice(0, -1)) if (!src.includes("*") && src !== "." && !exists(src)) errs.push(`COPY : le fichier « ${src} » n'existe pas dans le contexte de construction`);
    }
  }
  return errs;
}

export class Kube {
  objects: K8sObject[] = [];
  constructor(
    private vfs: Vfs,
    private docker: Docker,
  ) {}

  private podsOf(d: K8sObject) {
    const n = Number((d.spec as { replicas?: number }).replicas ?? 1);
    const image = this.imageOf(d);
    const ok = image && this.docker.hasImage(image);
    const seed = d.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: n }, (_, i) => ({
      name: `${d.name}-${(seed * 7919).toString(36).slice(0, 9)}-${(seed * (i + 3) * 104729).toString(36).slice(-5)}`,
      status: ok ? "Running" : "ErrImagePull",
      ready: ok ? "1/1" : "0/1",
      image,
    }));
  }

  private imageOf(d: K8sObject): string {
    const c = ((d.spec as { template?: { spec?: { containers?: { image?: string }[] } } }).template?.spec?.containers ?? [])[0];
    return c?.image ?? "";
  }

  private age(t: number) {
    const s = Math.max(1, Math.round((Date.now() - t) / 1000));
    return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
  }

  find(kind: string, name: string) {
    return this.objects.find((o) => o.kind.toLowerCase() === kind.toLowerCase() && o.name === name);
  }

  private kindOf(word: string): string | null {
    const w = word.toLowerCase();
    const map: Record<string, string> = {
      po: "Pod", pod: "Pod", pods: "Pod",
      deploy: "Deployment", deployment: "Deployment", deployments: "Deployment",
      svc: "Service", service: "Service", services: "Service",
      cm: "ConfigMap", configmap: "ConfigMap", configmaps: "ConfigMap",
      secret: "Secret", secrets: "Secret",
      ns: "Namespace", namespace: "Namespace", namespaces: "Namespace",
      ing: "Ingress", ingress: "Ingress", ingresses: "Ingress",
      cronjob: "CronJob", cronjobs: "CronJob", job: "Job", jobs: "Job",
      no: "Node", node: "Node", nodes: "Node",
    };
    return map[w] ?? null;
  }

  apply(text: string): Out {
    let docs: unknown[];
    try {
      docs = yaml.loadAll(text).filter(Boolean);
    } catch (e) {
      return { out: `error: erreur de syntaxe YAML : ${(e as Error).message.split("\n")[0]}\n→ Indentation avec des espaces (2 par niveau), jamais de tabulations ; « - » pour les listes.`, err: true };
    }
    const out: string[] = [];
    for (const d of docs as Record<string, unknown>[]) {
      const kind = String(d.kind ?? "");
      const meta = (d.metadata ?? {}) as { name?: string; namespace?: string; labels?: Record<string, string> };
      if (!d.apiVersion) return { out: "error: le champ « apiVersion » est obligatoire (ex. apps/v1 pour un Deployment, v1 pour un Service)", err: true };
      if (!kind) return { out: "error: le champ « kind » est obligatoire", err: true };
      if (!meta.name) return { out: "error: metadata.name est obligatoire", err: true };
      if (kind === "Deployment") {
        if (d.apiVersion !== "apps/v1") return { out: `error: un Deployment utilise apiVersion: apps/v1 (et non ${d.apiVersion})`, err: true };
        const spec = (d.spec ?? {}) as { selector?: { matchLabels?: Record<string, string> }; template?: { metadata?: { labels?: Record<string, string> }; spec?: { containers?: unknown[] } } };
        const sel = spec.selector?.matchLabels;
        const tl = spec.template?.metadata?.labels;
        if (!sel) return { out: "error: spec.selector.matchLabels est obligatoire pour un Deployment", err: true };
        if (!tl || Object.entries(sel).some(([k, v]) => tl[k] !== v))
          return { out: "error: `selector` does not match template `labels` — les étiquettes de spec.selector.matchLabels doivent figurer dans spec.template.metadata.labels", err: true };
        if (!spec.template?.spec?.containers?.length) return { out: "error: spec.template.spec.containers doit contenir au moins un conteneur", err: true };
      }
      if (kind === "Service" && !((d.spec as { ports?: unknown[] })?.ports?.length)) return { out: "error: un Service doit déclarer spec.ports", err: true };
      const existing = this.find(kind, meta.name);
      const obj: K8sObject = { kind, name: meta.name, namespace: meta.namespace ?? "default", spec: (d.spec ?? (d.data ? { data: d.data } : {})) as Record<string, unknown>, labels: meta.labels ?? {}, created: existing?.created ?? Date.now() };
      this.objects = this.objects.filter((o) => o !== existing);
      this.objects.push(obj);
      out.push(`${kind === "Deployment" ? "deployment.apps" : kind.toLowerCase()}/${meta.name} ${existing ? "configured" : "created"}`);
    }
    return { out: out.join("\n") };
  }

  run(args: string[], cwd: string): Out {
    const [sub, ...rest] = args.filter((a, i, all) => !(a === "-n" || a === "--namespace" || all[i - 1] === "-n" || all[i - 1] === "--namespace"));
    switch (sub) {
      case undefined:
      case "help":
        return { out: "Commandes kubectl disponibles ici : apply -f, get, describe, delete, create deployment, scale, expose, logs, rollout status, set image, version, cluster-info." };
      case "version":
        return { out: "Client Version: v1.34.1\nServer Version: v1.34.1 (cluster simulé)" };
      case "cluster-info":
        return { out: "Kubernetes control plane is running at https://127.0.0.1:6443 (simulé)" };
      case "apply":
      case "create": {
        if (sub === "create" && rest[0] === "deployment") {
          const name = rest[1];
          const img = rest.find((a) => a.startsWith("--image="))?.slice(8);
          const rep = Number(rest.find((a) => a.startsWith("--replicas="))?.slice(11) ?? 1);
          if (!name || !img) return { out: "usage : kubectl create deployment <nom> --image=<image> [--replicas=N]", err: true };
          if (this.find("Deployment", name)) return { out: `Error from server (AlreadyExists): deployments.apps "${name}" already exists`, err: true };
          this.objects.push({ kind: "Deployment", name, namespace: "default", labels: { app: name }, created: Date.now(), spec: { replicas: rep, selector: { matchLabels: { app: name } }, template: { metadata: { labels: { app: name } }, spec: { containers: [{ name: img.split(":")[0].split("/").pop(), image: img }] } } } });
          return { out: `deployment.apps/${name} created` };
        }
        if (sub === "create" && (rest[0] === "namespace" || rest[0] === "ns")) {
          this.objects.push({ kind: "Namespace", name: rest[1], namespace: "", labels: {}, created: Date.now(), spec: {} });
          return { out: `namespace/${rest[1]} created` };
        }
        const fi = rest.indexOf("-f");
        const f = fi >= 0 ? rest[fi + 1] : rest.find((a) => a.startsWith("--filename="))?.slice(11);
        if (!f) return { out: `error: indiquez un fichier : kubectl ${sub} -f <fichier.yaml>`, err: true };
        const path = f.startsWith("/") ? f : cwd + "/" + f;
        let text: string;
        try {
          text = this.vfs.read(path);
        } catch {
          return { out: `error: the path "${f}" does not exist`, err: true };
        }
        return this.apply(text);
      }
      case "get":
        return this.cmdGet(rest);
      case "describe": {
        const kind = this.kindOf(rest[0] ?? "");
        const o = kind && this.objects.find((x) => x.kind === kind && x.name === rest[1]);
        if (kind === "Pod") return this.describePod(rest[1]);
        if (!o) return { out: `Error from server (NotFound): ${rest[0]} "${rest[1] ?? ""}" not found`, err: true };
        return { out: `Name:         ${o.name}\nNamespace:    ${o.namespace}\nKind:         ${o.kind}\nLabels:       ${Object.entries(o.labels).map(([k, v]) => `${k}=${v}`).join(",") || "<none>"}\nSpec:\n${yaml.dump(o.spec).replace(/^/gm, "  ")}` };
      }
      case "delete": {
        const fi = rest.indexOf("-f");
        if (fi >= 0) {
          let docs: Record<string, unknown>[];
          try {
            docs = yaml.loadAll(this.vfs.read(rest[fi + 1].startsWith("/") ? rest[fi + 1] : cwd + "/" + rest[fi + 1])) as Record<string, unknown>[];
          } catch {
            return { out: `error: impossible de lire ${rest[fi + 1]}`, err: true };
          }
          const out: string[] = [];
          for (const d of docs.filter(Boolean)) {
            const name = (d.metadata as { name?: string })?.name ?? "";
            this.objects = this.objects.filter((o) => !(o.kind === d.kind && o.name === name));
            out.push(`${String(d.kind).toLowerCase()} "${name}" deleted`);
          }
          return { out: out.join("\n") };
        }
        const kind = this.kindOf(rest[0] ?? "");
        if (!kind) return { out: "usage : kubectl delete <type> <nom>  ou  kubectl delete -f <fichier>", err: true };
        if (kind === "Pod") {
          const owner = this.objects.find((o) => o.kind === "Deployment" && this.podsOf(o).some((p) => p.name === rest[1]));
          if (owner) return { out: `pod "${rest[1]}" deleted\n(Le Deployment « ${owner.name} » recrée aussitôt un pod pour maintenir ${String((owner.spec as { replicas?: number }).replicas ?? 1)} réplica(s) : c'est l'auto-réparation.)` };
        }
        const o = this.find(kind, rest[1]);
        if (!o) return { out: `Error from server (NotFound): ${rest[0]} "${rest[1] ?? ""}" not found`, err: true };
        this.objects = this.objects.filter((x) => x !== o);
        return { out: `${kind.toLowerCase()}${kind === "Deployment" ? ".apps" : ""} "${o.name}" deleted` };
      }
      case "scale": {
        const target = rest.find((a) => !a.startsWith("-"))!;
        const [k, n] = target?.includes("/") ? target.split("/") : [rest[0], rest[1]];
        const rep = rest.find((a) => a.startsWith("--replicas="));
        const d = this.find(this.kindOf(k ?? "") ?? "", n ?? "");
        if (!d || !rep) return { out: "usage : kubectl scale deployment <nom> --replicas=N", err: true };
        (d.spec as { replicas?: number }).replicas = Number(rep.slice(11));
        return { out: `deployment.apps/${d.name} scaled` };
      }
      case "set": {
        if (rest[0] !== "image") return { out: "usage : kubectl set image deployment/<nom> <conteneur>=<image>", err: true };
        const [, target, assign] = rest;
        const d = this.find("Deployment", (target ?? "").split("/")[1] ?? "");
        if (!d || !assign?.includes("=")) return { out: "usage : kubectl set image deployment/<nom> <conteneur>=<image>", err: true };
        const c = ((d.spec as { template: { spec: { containers: { name: string; image: string }[] } } }).template.spec.containers ?? [])[0];
        const hist = ((d.spec as { _history?: string[] })._history ??= []);
        hist.push(c.image);
        c.image = assign.split("=")[1];
        return { out: `deployment.apps/${d.name} image updated` };
      }
      case "rollout": {
        const d = this.find("Deployment", (rest[1] ?? "").split("/").pop() ?? "");
        if (!d) return { out: "usage : kubectl rollout status|history|undo deployment/<nom>", err: true };
        const hist = ((d.spec as { _history?: string[] })._history ??= []);
        const cont = ((d.spec as { template: { spec: { containers: { image: string }[] } } }).template.spec.containers ?? [])[0];
        if (rest[0] === "history")
          return { out: ["REVISION  IMAGE", ...[...hist, cont?.image].map((img, i) => `${String(i + 1).padEnd(9)} ${img}`)].join("\n") };
        if (rest[0] === "undo") {
          const prev = hist.pop();
          if (!prev || !cont) return { out: `error: no rollout history found for deployment "${d.name}"`, err: true };
          cont.image = prev;
          return { out: `deployment.apps/${d.name} rolled back` };
        }
        const pods = this.podsOf(d);
        return pods.every((p) => p.status === "Running")
          ? { out: `deployment "${d.name}" successfully rolled out` }
          : { out: `Waiting for deployment "${d.name}" rollout to finish: 0 of ${pods.length} updated replicas are available...\n→ Les pods sont en ErrImagePull : l'image « ${this.imageOf(d)} » est introuvable.`, err: true };
      }
      case "expose": {
        const name = rest[1];
        const d = this.find("Deployment", name ?? "");
        if (!d) return { out: `Error from server (NotFound): deployments.apps "${name ?? ""}" not found`, err: true };
        const port = Number(rest.find((a) => a.startsWith("--port="))?.slice(7) ?? 80);
        const type = rest.find((a) => a.startsWith("--type="))?.slice(7) ?? "ClusterIP";
        this.objects.push({ kind: "Service", name, namespace: "default", labels: {}, created: Date.now(), spec: { type, selector: { app: name }, ports: [{ port, targetPort: port }] } });
        return { out: `service/${name} exposed` };
      }
      case "logs": {
        const pod = this.allPods().find((p) => p.name === rest[0]);
        if (!pod) return { out: `Error from server (NotFound): pods "${rest[0] ?? ""}" not found`, err: true };
        if (pod.status !== "Running") return { out: `Error from server (BadRequest): container is waiting to start: trying and failing to pull image`, err: true };
        return { out: (known(pod.image)?.logs ?? ["Application démarrée"]).join("\n") };
      }
      default:
        return { out: `error: commande « ${sub} » non disponible dans ce simulateur (voir kubectl help)`, err: true };
    }
  }

  allPods() {
    return this.objects.filter((o) => o.kind === "Deployment").flatMap((d) => this.podsOf(d).map((p) => ({ ...p, deploy: d })));
  }

  private describePod(name: string): Out {
    const p = this.allPods().find((x) => x.name === name);
    if (!p) return { out: `Error from server (NotFound): pods "${name}" not found`, err: true };
    return {
      out: `Name:         ${p.name}\nNamespace:    default\nStatus:       ${p.status === "Running" ? "Running" : "Pending"}\nContainers:\n  app:\n    Image:      ${p.image}\nEvents:\n  Type     Reason     Message\n  ----     ------     -------\n  Normal   Scheduled  Successfully assigned default/${p.name} to node-1\n${p.status === "Running" ? `  Normal   Pulled     Container image "${p.image}" pulled\n  Normal   Started    Started container app` : `  Warning  Failed     Failed to pull image "${p.image}": not found\n  Warning  Failed     Error: ErrImagePull`}`,
    };
  }

  private cmdGet(rest: string[]): Out {
    const what = (rest[0] ?? "").toLowerCase();
    const wide = rest.includes("-o") && rest[rest.indexOf("-o") + 1] === "wide";
    if (rest.includes("-o") && rest[rest.indexOf("-o") + 1] === "yaml") {
      const o = this.find(this.kindOf(what) ?? "", rest[1] ?? "");
      if (!o) return { out: "error: objet introuvable", err: true };
      return { out: yaml.dump({ apiVersion: o.kind === "Deployment" ? "apps/v1" : "v1", kind: o.kind, metadata: { name: o.name, namespace: o.namespace, labels: o.labels }, spec: o.spec }) };
    }
    const sections: string[] = [];
    const want = (k: string) => what === "all" ? ["Pod", "Deployment", "Service"].includes(k) : this.kindOf(what) === k;
    if (!what) return { out: "error: indiquez le type de ressource (pods, deployments, services, all, nodes…)", err: true };
    if (!this.kindOf(what) && what !== "all") return { out: `error: the server doesn't have a resource type "${what}"`, err: true };
    if (this.kindOf(what) === "Node") return { out: "NAME     STATUS   ROLES           AGE   VERSION\nnode-1   Ready    control-plane   12d   v1.34.1" };
    if (this.kindOf(what) === "Namespace")
      return { out: ["NAME              STATUS   AGE", "default           Active   12d", "kube-system       Active   12d", ...this.objects.filter((o) => o.kind === "Namespace").map((o) => `${o.name.padEnd(17)} Active   ${this.age(o.created)}`)].join("\n") };
    if (want("Pod")) {
      const pods = this.allPods();
      sections.push(pods.length ? ["NAME                                READY   STATUS         RESTARTS   AGE" + (wide ? "   IMAGE" : ""), ...pods.map((p) => `${p.name.padEnd(35)} ${p.ready.padEnd(7)} ${p.status.padEnd(14)} 0          ${this.age(p.deploy.created)}${wide ? "   " + p.image : ""}`)].join("\n") : "No resources found in default namespace.");
    }
    if (want("Deployment")) {
      const ds = this.objects.filter((o) => o.kind === "Deployment");
      sections.push(ds.length ? ["NAME              READY   UP-TO-DATE   AVAILABLE   AGE", ...ds.map((d) => {
        const pods = this.podsOf(d);
        const ready = pods.filter((p) => p.status === "Running").length;
        return `${d.name.padEnd(17)} ${`${ready}/${pods.length}`.padEnd(7)} ${String(pods.length).padEnd(12)} ${String(ready).padEnd(11)} ${this.age(d.created)}`;
      })].join("\n") : what === "all" ? "" : "No resources found in default namespace.");
    }
    if (want("Service")) {
      const ss = this.objects.filter((o) => o.kind === "Service");
      sections.push(["NAME              TYPE        CLUSTER-IP      PORT(S)        AGE", "kubernetes        ClusterIP   10.96.0.1       443/TCP        12d", ...ss.map((s, i) => {
        const sp = s.spec as { type?: string; ports?: { port: number; nodePort?: number }[] };
        return `${s.name.padEnd(17)} ${(sp.type ?? "ClusterIP").padEnd(11)} ${`10.96.${12 + i}.${40 + i}`.padEnd(15)} ${(sp.ports ?? []).map((p) => `${p.port}${sp.type === "NodePort" || sp.type === "LoadBalancer" ? ":" + (p.nodePort ?? 30080 + i) : ""}/TCP`).join(",").padEnd(14)} ${this.age(s.created)}`;
      })].join("\n"));
    }
    for (const k of ["ConfigMap", "Secret", "Ingress", "CronJob", "Job"]) {
      if (want(k)) {
        const xs = this.objects.filter((o) => o.kind === k);
        sections.push(xs.length ? ["NAME              AGE", ...xs.map((x) => `${x.name.padEnd(17)} ${this.age(x.created)}`)].join("\n") : "No resources found in default namespace.");
      }
    }
    return { out: sections.filter(Boolean).join("\n\n") };
  }
}
