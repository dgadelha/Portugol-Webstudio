import { MarkedExtension, Tokens } from "marked";

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/**
 * Blocos de código da Ajuda: ```portugol <exemplo|sintaxe|assinatura> title="..."
 *
 * `assinatura` é a declaração de uma função ou constante das bibliotecas: aparece
 * como a sintaxe, mas sem o botão de copiar, que só faz sentido para código usável.
 *
 * Gera só marcação que passa pelo sanitizador do Angular; o realce de sintaxe e o
 * botão "Tente você mesmo" são adicionados pela aba de ajuda depois da renderização.
 */
export const markedPortugol: MarkedExtension = {
  renderer: {
    code({ text, lang }: Tokens.Code) {
      const [linguagem, tipo] = (lang ?? "").split(/\s+/, 2);

      if (linguagem !== "portugol") {
        return false;
      }

      const titulo = /title="([^"]*)"/.exec(lang ?? "")?.[1];
      const classes = [
        "codigo-portugol",
        tipo === "exemplo" ? "exemplo" : "sintaxe",
        tipo === "assinatura" ? "assinatura" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        `<figure class="${classes}">` +
        (titulo ? `<figcaption>${escapeHtml(titulo)}</figcaption>` : "") +
        `<pre><code class="language-portugol">${escapeHtml(text)}</code></pre>` +
        `</figure>`
      );
    },
  },
};
