import { saveChat, uid } from "./store";
import { go } from "./router";

// Ouvre l'assistant sur une nouvelle discussion, avec un contexte (leçon,
// exercice, code de l'élève) et une question pré-remplie que l'élève peut
// relire et modifier avant de l'envoyer.
export function askAssistant(title: string, context: string, question: string) {
  const id = uid();
  saveChat({ id, title, messages: [], context, updatedAt: Date.now() });
  sessionStorage.setItem("tc-prefill", question);
  go("/assistant/" + id);
}
