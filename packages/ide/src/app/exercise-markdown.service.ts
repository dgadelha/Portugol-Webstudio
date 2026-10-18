import { DOCUMENT } from "@angular/common";
import { inject, Service } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Marked, Tokens } from "marked";

import { escapeHtml } from "./tab-help/marked-portugol";

/**
 * O enunciado dos exercícios: Markdown sem HTML nenhum, com fórmulas do KaTeX entre `$` (na
 * linha) ou `$$` (em bloco). O KaTeX e o DOMPurify só são baixados quando um enunciado
 * aparece pela primeira vez.
 */
@Service()
export class ExerciseMarkdownService {
  private sanitizer = inject(DomSanitizer);
  private document = inject(DOCUMENT);

  private renderer?: Promise<(markdown: string) => string>;

  /**
   * Os enunciados já renderizados: o mesmo enunciado aparece na prévia do diálogo e na aba, e
   * o KaTeX é a parte cara.
   */
  private readonly rendered = new Map<string, Promise<SafeHtml>>();

  render(markdown: string): Promise<SafeHtml> {
    let html = this.rendered.get(markdown);

    if (!html) {
      html = this.renderNow(markdown);
      html.catch(() => this.rendered.delete(markdown));
      this.rendered.set(markdown, html);
    }

    return html;
  }

  private async renderNow(markdown: string) {
    this.renderer ??= this.createRenderer().catch((error: unknown) => {
      this.renderer = undefined;
      throw error;
    });

    const render = await this.renderer;

    // O HTML do KaTeX usa `style`, que o sanitizador do Angular tiraria: o DOMPurify limpa
    // o resultado, e o Angular confia nele
    return this.sanitizer.bypassSecurityTrustHtml(render(markdown));
  }

  private async createRenderer() {
    const [{ default: katex }, { default: createDOMPurify }] = await Promise.all([
      import("katex"),
      import("dompurify"),
    ]);

    this.loadStyle();

    const formula = (tex: string, displayMode: boolean) =>
      katex.renderToString(tex, { displayMode, output: "htmlAndMathml", throwOnError: false });

    const marked = new Marked({
      gfm: true,
      renderer: {
        // O Marked não tem opção para desligar o HTML: cada trecho de HTML vira texto
        html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
      },
      // O título do exercício é um h2, e os exemplos vêm em h3 e h4: um `#` no enunciado vira
      // h3, para não ficar acima do título
      walkTokens: token => {
        if (token.type === "heading") {
          const heading = token as Tokens.Heading;

          heading.depth = Math.min(heading.depth + 2, 6);
        }
      },
      extensions: [
        {
          name: "formulaEmBloco",
          level: "block",
          start: (src: string) => src.indexOf("$$"),
          tokenizer: (src: string) => {
            const match = /^\$\$([\s\S]+?)\$\$(?:\n|$)/.exec(src);

            return match ? { type: "formulaEmBloco", raw: match[0], text: match[1].trim() } : undefined;
          },
          renderer: token => formula(token.text as string, true),
        },
        {
          name: "formula",
          level: "inline",
          start: (src: string) => src.indexOf("$"),
          tokenizer: (src: string) => {
            // Como no Pandoc: depois do `$` que abre não vem espaço; antes do que fecha não vem
            // espaço, e depois dele não vem número. Assim "R$ 5,00 e R$ 10,00" não é fórmula.
            const match = /^\$(?!\s)((?:\\.|[^\\$\n])+?)(?<!\s)\$(?!\d)/.exec(src);

            return match ? { type: "formula", raw: match[0], text: match[1] } : undefined;
          },
          renderer: token => formula(token.text as string, false),
        },
      ],
    });

    const purify = createDOMPurify();

    purify.addHook("afterSanitizeAttributes", node => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }

      // Só imagens que vêm com o IDE: uma imagem de fora saberia quem abriu o exercício
      if (node.tagName === "IMG" && /^(?:[a-z][\w+.-]*:|\/\/)/i.test(node.getAttribute("src") ?? "")) {
        node.remove();
      }
    });

    return (markdown: string) =>
      purify.sanitize(marked.parse(markdown, { async: false }), {
        USE_PROFILES: { html: true, mathMl: true },
        // O DOMPurify tira o `semantics` e o `annotation` do MathML, mas deixa o texto: o TeX da
        // fórmula ficaria dentro do `math`, e o leitor de tela leria a fórmula e depois o TeX
        ADD_FORBID_CONTENTS: ["annotation", "annotation-xml"],
      });
  }

  /**
   * O CSS do KaTeX é um pacote à parte (`katex` no `angular.json`): só quem abre um exercício
   * o baixa.
   */
  private loadStyle() {
    const link = this.document.createElement("link");

    link.rel = "stylesheet";
    link.href = "katex.css";
    this.document.head.append(link);
  }
}
