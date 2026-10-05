import { useEffect, useRef, useState } from "react";
import { useStore, saveChat, deleteChat, uid, addCards, toast, awardBadge, addXp } from "../lib/store";
import { aiConfigured, runClaude, TEACHER_SYSTEM } from "../lib/ai";
import AiOutput, { NeedKey, Sources, formatCost } from "../components/AiOutput";
import Markdown from "../components/Markdown";
import { go } from "../lib/router";
import type { Chat, ChatMessage } from "../lib/types";

const SUGGESTIONS = [
  "Explique-moi la différence entre un conteneur Docker et une machine virtuelle, avec une analogie.",
  "Quelle est la différence entre ETL et ELT, et pourquoi l'ELT s'est-il imposé avec le cloud ?",
  "Dans quel ordre apprendre Linux, Python, SQL, Git, Docker et le cloud quand on part de zéro ?",
  "Que fait exactement « git rebase » et quand vaut-il mieux l'éviter ?",
  "Data engineer ou ingénieur cloud/DevOps : quelles différences de quotidien, de compétences et de débouchés en France ?",
  "Quelle certification cloud viser en premier quand on débute, et combien de temps la préparer ?",
  "Pourquoi ma requête SQL avec GROUP BY renvoie-t-elle une erreur quand j'ajoute une colonne au SELECT ?",
  "Comment Kubernetes redémarre-t-il un pod qui plante ? Explique les probes simplement.",
];

export default function Assistant({ chatId }: { chatId?: string }) {
  const chats = useStore((s) => s.chats);
  const chat = chats.find((c) => c.id === chatId);
  const [input, setInput] = useState(() => {
    const v = sessionStorage.getItem("tc-prefill") ?? "";
    sessionStorage.removeItem("tc-prefill");
    return v;
  });
  const [deep, setDeep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat?.messages.length, live]);

  if (!aiConfigured())
    return (
      <div className="page">
        <h1>Assistant pédagogique</h1>
        <p className="muted">
          L'assistant répond à vos questions avec des sources (documentation officielle de Python, PostgreSQL, Docker,
          Kubernetes, AWS, Azure, Google Cloud, Terraform, Apache…), explique vos erreurs de code et corrige vos projets.
        </p>
        <NeedKey />
      </div>
    );

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const base: Chat = chat ?? { id: uid(), title: text.slice(0, 70), messages: [], updatedAt: Date.now() };
    const userMsg: ChatMessage = { role: "user", text, at: Date.now() };
    const withUser: Chat = { ...base, messages: [...base.messages, userMsg], updatedAt: Date.now() };
    saveChat(withUser);
    if (!chat) go("/assistant/" + withUser.id);
    setInput("");
    setBusy(true);
    setLive("");
    setError("");
    setStatus("");
    abort.current = new AbortController();
    try {
      const r = await runClaude({
        system: TEACHER_SYSTEM + (withUser.context ? `\n\nContexte : ${withUser.context}` : ""),
        messages: withUser.messages.map((m) => ({ role: m.role, content: m.text })),
        search: true,
        maxSearches: deep ? 12 : 5,
        effort: deep ? "high" : "medium",
        maxTokens: deep ? 32000 : 16000,
        onText: setLive,
        onStatus: setStatus,
        signal: abort.current.signal,
      });
      saveChat({
        ...withUser,
        messages: [...withUser.messages, { role: "assistant", text: r.text, sources: r.sources, cost: r.cost, at: Date.now() }],
        updatedAt: Date.now(),
      });
      awardBadge("assistant");
      addXp(5);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setLive("");
    }
  }

  function makeCard(q: string, a: string) {
    const brief = a.match(/\*\*En bref\*\*[\s:]*([\s\S]*?)(\n#{1,3} |\n\*\*[A-Z])/i)?.[1]?.trim() ?? a.slice(0, 600);
    addCards([{ id: "perso:" + uid(), q, a: brief.replace(/\[\d+\]/g, ""), source: "Assistant" }]);
    toast("Carte ajoutée à vos révisions");
  }

  return (
    <div className="page assistant">
      <div className="section-head">
        <h1>Assistant pédagogique</h1>
        {chat && (
          <a className="btn btn-small btn-ghost" href="#/assistant">
            + Nouvelle question
          </a>
        )}
      </div>

      {!chat && (
        <>
          <p className="muted">
            Posez n'importe quelle question : une notion à éclaircir, une erreur de code, un choix de carrière. Les
            réponses s'appuient sur une recherche dans la documentation officielle (Python, PostgreSQL, Docker,
            Kubernetes, AWS, Azure, Google Cloud, Terraform, Apache Spark/Kafka/Airflow, OWASP, ANSSI…) et citent leurs
            sources [1], [2]… Aucune question n'est « bête » : c'est en demandant qu'on progresse.
          </p>
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {chat && (
        <div className="chat">
          {chat.context && <p className="small muted">📘 {chat.context}</p>}
          {chat.messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="msg msg-user">
                {m.text}
              </div>
            ) : (
              <div key={i} className="msg msg-ai">
                <Markdown text={m.text} />
                <Sources sources={m.sources} />
                <div className="msg-tools">
                  <button className="mini-link" onClick={() => makeCard(chat.messages[i - 1]?.text ?? "", m.text)}>
                    🧠 En faire une carte
                  </button>
                  <button
                    className="mini-link"
                    onClick={() => {
                      void navigator.clipboard?.writeText(m.text);
                      toast("Réponse copiée");
                    }}
                  >
                    📋 Copier
                  </button>
                  {m.cost !== undefined && <span className="muted small">{formatCost(m.cost)}</span>}
                </div>
              </div>
            ),
          )}
          {(busy || error) && (
            <div className="msg msg-ai">
              <AiOutput text={live} busy={busy} status={status} error={error} />
              {busy && (
                <button className="mini-link" onClick={() => abort.current?.abort()}>
                  Arrêter
                </button>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void send(input);
          }}
          placeholder={chat ? "Question complémentaire…" : "Votre question…"}
          rows={3}
          disabled={busy}
        />
        <div className="composer-row">
          <label className="switch">
            <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} />
            <span>Analyse approfondie</span>
          </label>
          <span className="muted small">{deep ? "plus de recherches, ≈ 0,15–0,50 $" : "≈ 0,03–0,15 $"}</span>
          <button className="btn" disabled={busy || !input.trim()}>
            Envoyer
          </button>
        </div>
      </form>

      {!chat && chats.some((c) => c.messages.length) && (
        <section className="section">
          <h2>Historique</h2>
          <ul className="chat-list">
            {chats.filter((c) => c.messages.length).map((c) => (
              <li key={c.id}>
                <a href={`#/assistant/${c.id}`}>
                  {c.title}
                  <small className="muted"> · {new Date(c.updatedAt).toLocaleDateString("fr-FR")}</small>
                </a>
                <button className="mini-link" onClick={() => deleteChat(c.id)} aria-label="Supprimer">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
