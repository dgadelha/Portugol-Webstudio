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
    /**
     * Uma imagem com a densidade no nome, como `inicio@2x.webp`, vai só no `srcset`, com ela: o
     * navegador a mostra no tamanho de verdade da tela capturada, nítida em telas de alta
     * densidade. Com um `src` junto, ele valeria como a imagem de 1x, e as telas comuns a
     * mostrariam com o dobro do tamanho. Sem a densidade no nome, a imagem segue o padrão.
     */
    image({ href, title, text }: Tokens.Image) {
      const densidade = /@(\d+(?:\.\d+)?)x\.\w+$/.exec(href)?.[1];

      if (!densidade) {
        return false;
      }

      return (
        `<img srcset="${escapeHtml(href)} ${densidade}x" alt="${escapeHtml(text)}"` +
        (title ? ` title="${escapeHtml(title)}"` : "") +
        `>`
      );
    },
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
