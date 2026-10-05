// Tests du terminal simulé : npm run test:engines
import { Shell } from "../src/lib/shell/shell";

let fails = 0;
const sh = new Shell();
function t(cmd: string, expect?: RegExp, err = false) {
  const r = sh.exec(cmd);
  const okErr = !!r.err === err;
  const okOut = !expect || expect.test(r.out);
  if (!okErr || !okOut) {
    fails++;
    console.log(`ÉCHEC: ${cmd}\n  err=${r.err} out=${JSON.stringify(r.out).slice(0, 300)}`);
  }
}
t("pwd", /^\/home\/apprenant$/);
t("mkdir -p projet/data && cd projet && pwd", /projet$/);
t("echo 'nom,age' > data/a.csv && echo \"bob,31\" >> data/a.csv && cat data/a.csv", /nom,age\nbob,31/);
t("ls data", /a.csv/);
t("cat data/a.csv | wc -l", /^2$/);
t("grep -c bob data/a.csv", /^1$/);
t("cut -d, -f1 data/a.csv | sort", /bob\nnom/);
t("ls *.txt", /impossible/, true);
t("touch x.txt y.txt && ls *.txt", /x.txt  y.txt|x.txt\s+y.txt/);
t("cd /nope", /Aucun/, true);
t("lss", /commande introuvable.*ls/, true);
t("X=42; echo $X", /^42$/);
t("export NOM=Ada && echo \"Bonjour $NOM\"", /Bonjour Ada/);
t("grep -i failed /var/log/syslog | wc -l", /^3$/);
t("grep Failed /var/log/syslog | cut -d' ' -f12 | sort | uniq -c", /3 203.0.113.7|203/);
// git
t("git status", /pas un dépôt|ni ceci/, true);
t("git init", /initialisé/);
t("git add .", /^(|Rien à ajouter\.)$/);
t("git commit -m 'init'", /qui vous êtes/, true);
t("git config --global user.name 'Ada' && git config --global user.email ada@ex.com", /^$/);
t("git commit -m 'Premier commit'", /Premier commit/);
t("git status", /propre/);
t("git switch -c feature", /nouvelle branche/);
t("echo 'v2' > x.txt && git commit -am 'feat'", /feat/);
t("git switch main", /main/);
t("echo 'main' > x.txt && git commit -am 'main change'", /main change/);
t("git merge feature", /CONFLIT/, true);
t("cat x.txt", /<<<<<<< HEAD\nmain\n=======\nv2\n>>>>>>> feature/);
t("echo 'resolu' > x.txt && git add x.txt && git commit -m 'merge'", /merge/);
t("git log --oneline", /merge/);
t("git remote add origin https://github.com/ada/projet.git && git push -u origin main", /new branch/);
// docker
t("docker run hello-world", /Hello from Docker/);
t("docker run -d --name web -p 8080:80 nginx", /^[\s\S]*[0-9a-f]{64}$/);
t("curl localhost:8080", /Welcome to nginx/);
t("docker ps", /web/);
t("docker rm web", /running/, true);
t("docker stop web && docker rm web", /web/);
t("curl localhost:8080", /refusée/, true);
t("docker run -d nginxx", /pull access denied/, true);
t("printf 'FROM python:3.12-slim\nWORKDIR /app\nCOPY app.py .\nCMD [\"python\",\"app.py\"]\n' > Dockerfile && docker build -t monapp .", /app.py/, true);
t("echo 'print(1)' > app.py && docker build -t monapp .", /naming to/);
// kubectl
sh.vfs.write("/home/apprenant/projet/dep.yaml", `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27
`);
t("kubectl apply -f dep.yaml", /deployment.apps\/web created/);
t("kubectl get pods", /Running/);
t("kubectl scale deployment web --replicas=5 && kubectl get deploy", /5\/5/);
t("kubectl get pods | grep -c web", /^5$/);
console.log(sh.check({ type: "k8s", kind: "Deployment", name: "web", replicas: 5 }) ? "check k8s OK" : (fails++, "check k8s KO"));
console.log(sh.check({ type: "git", repo: "projet", commits: 4, merged: "feature", remote: "main" }) ? "check git OK" : (fails++, "check git KO"));
t("terraform init", /No configuration files/, true);
t("echo 'resource \"aws_s3_bucket\" \"logs\" {}' > main.tf && terraform init && terraform apply", /1 added/);
console.log(fails ? `${fails} échec(s)` : "Tous les tests du terminal passent.");
process.exit(fails ? 1 : 0);
