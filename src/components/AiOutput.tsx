import Markdown from "./Markdown";

export function Sources({ sources }: { sources?: { url: string; title: string }[] }) {
  if (!sources?.length) return null;
  return (
    <details className="sources" open>
      <summary>Sources ({sources.length})</summary>
      <ol>
        {sources.map((s, i) => (
          <li key={s.url + i}>
            <a href={s.url} target="_blank" rel="noopener">
              {s.title}
            </a>
            <small>{hostOf(s.url)}</small>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function formatCost(c?: number) {
  if (c === undefined) return "";
  return c < 0.01 ? "< 0,01 $" : `≈ ${c.toFixed(2).replace(".", ",")} $`;
}

export default function AiOutput(props: {
  text: string;
  status?: string;
  busy?: boolean;
  sources?: { url: string; title: string }[];
  cost?: number;
  error?: string;
}) {
  return (
    <div className="ai-output">
      {props.busy && (
        <div className="ai-status">
          <span className="dot-pulse" /> {props.status || "Réflexion…"}
        </div>
      )}
      {props.error && <div className="alert alert-error">{props.error}</div>}
      {props.text && <Markdown text={props.text} />}
      <Sources sources={props.sources} />
      {props.cost !== undefined && !props.busy && <div className="muted small">Coût de la requête : {formatCost(props.cost)}</div>}
    </div>
  );
}

export function NeedKey() {
  return (
    <div className="card notice">
      <strong>Assistant IA non configuré.</strong>
      <p>
        Cette fonction utilise Claude, avec votre propre clé d'API Anthropic (payée à l'usage, quelques centimes par
        question). Les cours, quiz, cartes, exercices et l'audio fonctionnent sans clé.
      </p>
      <a className="btn" href="#/reglages">
        Configurer la clé
      </a>
    </div>
  );
}
