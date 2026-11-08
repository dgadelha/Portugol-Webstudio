import { DOCUMENT } from "@angular/common";
import { inject, Service } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Marked, Tokens } from "marked";

import { settings } from "../settings";
import { MonacoService } from "./monaco.service";
import { SettingsService } from "./settings.service";
import { escapeHtml, NEW_TAB_HINT, wrapTables } from "./shared/markdown";
import { Theme, ThemeService } from "./theme.service";

/**
 * O Markdown já convertido em HTML, ainda sem passar pelo DOMPurify, e os blocos de Portugol
 * que ele tem: no lugar de cada um, um marcador, trocado depois pelo código colorido.
 */
type Parsed = { html: string; codes: Map<string, string> };

/**
 * O enunciado dos exercícios: Markdown sem HTML nenhum, com fórmulas do KaTeX entre `$` (na
 * linha) ou `$$` (em bloco), e os blocos ```portugol coloridos como no editor. O KaTeX e o
 * DOMPurify só são baixados quando um enunciado aparece pela primeira vez.
 */
@Service()
export class ExerciseMarkdownService {
  private sanitizer = inject(DomSanitizer);
  private document = inject(DOCUMENT);
  private monacoService = inject(MonacoService);
  private settingsService = inject(SettingsService);

  /**
   * O tema atual. As cores do código vêm das classes do tema do Monaco (`mtk1`…), que mudam
   * de um tema para outro: quem mostra um enunciado lê o tema daqui e o renderiza de novo
   * quando ele muda.
   */
  readonly theme = toSignal(inject(ThemeService).theme$, {
    initialValue: (this.document.body.dataset["theme"] as Theme | undefined) ?? "dark",
  });

  private renderer?: ReturnType<ExerciseMarkdownService["createRenderer"]>;

  /**
   * Os enunciados já renderizados, por tema: o mesmo enunciado aparece na prévia do diálogo e
   * na aba, e o KaTeX é a parte cara.
   */
  private readonly rendered = new Map<string, Promise<SafeHtml>>();

  /**
   * O HTML de um enunciado, no tema dado. Sem `cache`, não guarda o resultado: a prévia da
   * criação de exercício renderiza uma versão nova a cada tecla, e guardar todas só gastaria
   * memória.
   */
  render(markdown: string, theme: Theme, { cache = true } = {}): Promise<SafeHtml> {
    const key = `${theme}\n${markdown}`;

    if (!cache) {
      return this.rendered.get(key) ?? this.renderNow(markdown, theme);
    }

    let html = this.rendered.get(key);

    if (!html) {
      html = this.renderNow(markdown, theme);
      html.catch(() => this.rendered.delete(key));
      this.rendered.set(key, html);
    }

    return html;
  }

  /**
   * O que o enunciado tem e o exercício não mostra: HTML (vira texto) e imagens (somem). Os
   * blocos de código e as fórmulas não contam.
   */
  async unsupported(markdown: string) {
    const { find } = await this.loadRenderer();

    return find(markdown);
  }

  private loadRenderer() {
    this.renderer ??= this.createRenderer().catch((error: unknown) => {
      this.renderer = undefined;
      throw error;
    });

    return this.renderer;
  }

  private async renderNow(markdown: string, theme: Theme) {
    const { parse, sanitize } = await this.loadRenderer();
    const parsed = parse(markdown);
    const html = parsed.codes.size > 0 ? await this.colorize(parsed, theme) : parsed.html;

    // O HTML do KaTeX usa `style`, que o sanitizador do Angular tiraria: o DOMPurify limpa
    // o resultado (o código colorido inclusive), e o Angular confia nele
    return this.sanitizer.bypassSecurityTrustHtml(sanitize(html));
  }

  /**
   * Troca cada marcador pelo código colorido pelo Monaco, nas cores do tema do editor. O
   * Monaco colore de forma assíncrona, e o Marked não espera: por isso os marcadores. Se o
   * Monaco não carregar, o código fica sem cores.
   */
  private async colorize({ html, codes }: Parsed, theme: Theme) {
    let colored: Map<string, string>;

    try {
      await this.monacoService.ready;
      monaco.editor.setTheme(`portugol-${theme}`);

      // A mesma largura de tabulação do editor, como na Ajuda
      const tabSize = this.settingsService.get(settings.editorTabSize);
      const entries = await Promise.all(
        [...codes].map(
          async ([marker, code]) => [marker, await monaco.editor.colorize(code, "portugol", { tabSize })] as const,
        ),
      );

      colored = new Map(entries);
    } catch {
      colored = new Map([...codes].map(([marker, code]) => [marker, escapeHtml(code)]));
    }

    let result = html;

    for (const [marker, code] of colored) {
      result = result.replace(marker, () => code);
    }

    return result;
  }

  private async createRenderer() {
    const [{ default: katex }, { default: createDOMPurify }] = await Promise.all([
      import("katex"),
      import("dompurify"),
    ]);

    this.loadStyle();

    const formula = (tex: string, displayMode: boolean) =>
      katex.renderToString(tex, { displayMode, output: "htmlAndMathml", throwOnError: false });

    // Um marcador que o texto do enunciado não tem como prever: um marcador escrito no
    // enunciado não vira o código de outro bloco
    const nonce = Math.random().toString(36).slice(2, 10);
    // Os blocos do Markdown que está sendo convertido agora (o `parse` é síncrono)
    let codes = new Map<string, string>();

    const marked = new Marked({
      gfm: true,
      hooks: {
        // Cada tabela numa caixa que rola de lado, como na Ajuda: numa tela estreita, só a
        // tabela rola, sem quebrar as palavras nem fazer o enunciado rolar de lado. Um
        // `<table>` escrito no enunciado chega aqui escapado
        postprocess: wrapTables,
      },
      renderer: {
        // O Marked não tem opção para desligar o HTML: cada trecho de HTML vira texto
        html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
        // Um bloco ```portugol fica com um marcador no lugar do código, que depois vem
        // colorido. Os outros blocos (entradas, saídas) continuam texto
        code: ({ text, lang }: Tokens.Code) => {
          if (lang?.trim() !== "portugol") {
            return false;
          }

          const marker = `@@pws-codigo-${nonce}-${codes.size}@@`;

          codes.set(marker, text);

          return `<pre class="codigo-portugol"><code>${marker}</code></pre>\n`;
        },
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
          // Só no começo de uma linha: com um `$$` em qualquer lugar, o Marked cortava o parágrafo
          // em cada um, e um texto com muitos deles levava segundos. O Marked passa o texto sem o
          // primeiro caractere, e um `$$` logo no começo já é tentado pelo tokenizer: basta
          // procurar depois de uma quebra de linha. O conteúdo não tem `$$`, para a busca parar no
          // primeiro que fecha
          start: (src: string) => {
            const match = /\n\$\$/.exec(src);

            return match ? match.index + 1 : undefined;
          },
          tokenizer: (src: string) => {
            const match = /^\$\$((?:(?!\$\$)[\s\S])+?)\$\$(?:\n|$)/.exec(src);

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

        const hint = node.ownerDocument.createElement("span");

        hint.className = "visually-hidden";
        hint.textContent = NEW_TAB_HINT;
        node.append(hint);
      }

      // Só imagens que vêm com o IDE: uma imagem de fora saberia quem abriu o exercício
      if (node.tagName === "IMG" && /^(?:[a-z][\w+.-]*:|\/\/)/i.test(node.getAttribute("src") ?? "")) {
        node.remove();
      }
    });

    return {
      find: (markdown: string) => {
        const found = { html: false, images: false };

        // Sem extensões assíncronas, o `walkTokens` não devolve promessas para esperar
        void marked.walkTokens(marked.lexer(markdown), token => {
          found.html ||= token.type === "html";
          found.images ||= token.type === "image";
        });

        return found;
      },
      parse: (markdown: string): Parsed => {
        codes = new Map();

        return { html: marked.parse(markdown, { async: false }), codes };
      },
      sanitize: (html: string) =>
        purify.sanitize(html, {
          USE_PROFILES: { html: true, mathMl: true },
          // O KaTeX desenha alguns símbolos em SVG (a raiz, os colchetes das matrizes, o
          // `\underbrace`): só as tags e os atributos que ele usa, sem o perfil SVG inteiro, que
          // deixaria passar `image` e `style`. O HTML do enunciado já virou texto, então só o
          // KaTeX gera SVG aqui.
          ADD_TAGS: ["svg", "path", "line"],
          ADD_ATTR: ["viewbox", "preserveaspectratio", "d", "x1", "y1", "x2", "y2", "stroke-width"],
          // O DOMPurify tira o `semantics` e o `annotation` do MathML, mas deixa o texto: o TeX da
          // fórmula ficaria dentro do `math`, e o leitor de tela leria a fórmula e depois o TeX
          ADD_FORBID_CONTENTS: ["annotation", "annotation-xml"],
        }),
    };
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
