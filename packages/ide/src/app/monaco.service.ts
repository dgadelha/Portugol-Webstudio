import { inject, Service } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import { filter, take } from "rxjs/operators";

@Service()
export class MonacoService {
  private monacoLoaderService = inject(MonacoEditorLoaderService);

  private resolveReady!: () => void;

  /**
   * Resolve quando o Monaco carregou e a linguagem Portugol (com os temas) está
   * registrada. Quem usa o Monaco fora de um editor, como a Ajuda ao colorir os
   * exemplos, espera por aqui: o Monaco carrega em segundo plano e pode chegar
   * depois do conteúdo.
   */
  readonly ready = new Promise<void>(resolve => {
    this.resolveReady = resolve;
  });

  constructor() {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1),
      )
      .subscribe(() => {
        try {
          monaco.languages.register({
            id: "portugol",
            extensions: [".por"],
            aliases: ["Portugol"],
          });

          monaco.languages.setLanguageConfiguration("portugol", {
            wordPattern: /(-?\d*\.\d\w*)|([^\s!"#%&'()*+,./:;<=>?@[\\\]^`{|}~\-]+)/g,

            comments: {
              lineComment: "//",
              blockComment: ["/*", "*/"],
            },

            brackets: [
              ["{", "}"],
              ["[", "]"],
              ["(", ")"],
            ],

            onEnterRules: [
              {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: {
                  indentAction: monaco.languages.IndentAction.IndentOutdent,
                  appendText: " * ",
                },
              },
              {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  appendText: " * ",
                },
              },
              {
                // e.g.  * ...|
                beforeText: /^(\t|( {2}))* \*( ([^*]|\*(?!\/))*)?$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  appendText: "* ",
                },
              },
              {
                // e.g.  */|
                beforeText: /^(\t|( {2}))* \*\/\s*$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  removeText: 1,
                },
              },
            ],

            autoClosingPairs: [
              { open: "{", close: "}" },
              { open: "[", close: "]" },
              { open: "(", close: ")" },
              { open: '"', close: '"', notIn: ["string"] },
              { open: "'", close: "'", notIn: ["string", "comment"] },
              { open: "/**", close: " */", notIn: ["string"] },
            ],

            folding: {
              markers: {
                start: /^\s*\/\/\s*#?region\b/,
                end: /^\s*\/\/\s*#?endregion\b/,
              },
            },
          });

          // @see: https://microsoft.github.io/monaco-editor/monarch.html
          monaco.languages.setMonarchTokensProvider("portugol", {
            defaultToken: "invalid",
            tokenPostfix: ".portugol",

            keywords: [
              "faca",
              "enquanto",
              "para",
              "se",
              "senao",
              "const",
              "funcao",
              "programa",
              "escolha",
              "caso",
              "contrario",
              "pare",
              "retorne",
              "inclua",
              "biblioteca",
              "verdadeiro",
              "falso",
            ],

            typeKeywords: ["real", "inteiro", "vazio", "logico", "cadeia", "caracter"],

            // Os operadores lógicos são palavras: coloridos como as palavras
            // reservadas, como o "and" e o "or" de outras linguagens no VS Code.
            wordOperators: ["e", "ou", "nao"],

            // Os mesmos operadores do analisador (`PortugolLexico.g4`), dos mais
            // longos aos mais curtos, para "-->" não virar "--" e ">". É uma
            // expressão regular (usada como `@operadores` nas regras), não a lista
            // de palavras que o Monarch costuma chamar de `operators`
            operadores: /-->|\+\+|--|[-+*/]=|[!<=>]=|<<|>>|[-+*/%=<>^|~&]/,

            // Escapes do Portugol: \b \t \n \r \f \" \' \\, \uXXXX e octal (\101)
            escapes: /\\(?:[btnrf"'\\]|u[\dA-Fa-f]{4}|[0-3][0-7]{2}|[0-7]{1,2})/,

            // The main tokenizer for our languages
            tokenizer: {
              root: [
                [/[{}]/, "delimiter.bracket"],
                // Uma palavra seguida de "(" é uma chamada de função, a não ser que
                // seja uma palavra reservada, como em "se (", "para (" e "e ("
                [
                  /[A-Z_a-z]\w*(?=\s*\()/,
                  {
                    cases: {
                      "@typeKeywords": "keyword",
                      "@keywords": "keyword",
                      "@wordOperators": "keyword",
                      "@default": "functions",
                    },
                  },
                ],
                { include: "common" },
              ],
              common: [
                // identifiers and keywords
                [
                  /[_a-z]\w*/,
                  {
                    cases: {
                      "@typeKeywords": "keyword",
                      "@keywords": "keyword",
                      "@wordOperators": "keyword",
                      "@default": "identifier",
                    },
                  },
                ],
                [/[A-Z]\w*/, "type.identifier"], // to show class names nicely

                // whitespace
                { include: "@whitespace" },

                // delimiters and operators. "<" e ">" são sempre comparações:
                // o Portugol não tem tipos genéricos
                [/[()[\]{}]/, "@brackets"],
                [/@operadores/, "operator"],

                // numbers: o real pode ser "3.", "3.14" ou ".5", sem expoente
                [/0[Xx][\dA-Fa-f]+/, "number.hex"],
                [/\d+\.\d*|\.\d+/, "number.float"],
                [/\d+/, "number"],

                // delimiter: after number because of .\d floats
                [/[,.:;]/, "delimiter"],

                // strings
                [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
                [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

                // characters
                [/'[^'\\]'/, "string"],
                [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
                [/'/, "string.invalid"],
              ],

              // Como no analisador, o comentário termina no primeiro "*/": um "/*"
              // dentro dele não abre outro
              comment: [
                [/[^*]+/, "comment"],
                [String.raw`\*/`, "comment", "@pop"],
                [/\*/, "comment"],
              ],

              string: [
                [/[^"\\]+/, "string"],
                [/@escapes/, "string.escape"],
                [/\\./, "string.escape.invalid"],
                [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
              ],

              whitespace: [
                [/[\t\n\r ]+/, "white"],
                [/\/\*/, "comment", "@comment"],
                [/\/\/.*$/, "comment"],
              ],

              bracketCounting: [
                [/{/, "delimiter.bracket", "@bracketCounting"],
                [/}/, "delimiter.bracket", "@pop"],
                { include: "common" },
              ],
            },
          } satisfies monaco.languages.IMonarchLanguage);

          monaco.editor.defineTheme("portugol-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "functions", foreground: "F5D7A9" },
              { token: "string.escape", foreground: "D2BB85" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            // Mesmas cores da interface (`styles/_tokens.scss`), como no tema
            // "Dark Modern" do VS Code, com o amarelo do Portugol no foco.
            colors: {
              "editor.background": "#1f1f1f",
              "editorGutter.background": "#1f1f1f",
              // O cinza padrão (#858585) fica em 4,46:1 sobre este fundo.
              "editorLineNumber.foreground": "#8c8c8c",
              "editor.lineHighlightBorder": "#282828",
              "editorWidget.background": "#252526",
              "editorWidget.border": "#3c3c3c",
              "editorHoverWidget.background": "#252526",
              "editorHoverWidget.border": "#3c3c3c",
              "editorSuggestWidget.background": "#252526",
              "editorSuggestWidget.border": "#3c3c3c",
              "editorSuggestWidget.selectedBackground": "#37373d",
              "input.background": "#313131",
              "input.border": "#7a7a7a",
              "focusBorder": "#ffc200",
              "editorCursor.foreground": "#ffc200",
              "scrollbarSlider.background": "#79797966",
            },
          });

          monaco.editor.defineTheme("portugol-light", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "functions", foreground: "8A6200" },
              { token: "string.escape", foreground: "DC009E" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            // Mesmas cores da interface (`styles/_tokens.scss`), como no tema
            // "Light Modern" do VS Code. O foco usa o amarelo escurecido, que
            // passa de 3:1 sobre o branco.
            colors: {
              "editor.background": "#ffffff",
              "editorGutter.background": "#ffffff",
              "editorWidget.background": "#ffffff",
              "editorWidget.border": "#d4d4d4",
              "editorHoverWidget.background": "#ffffff",
              "editorHoverWidget.border": "#d4d4d4",
              "editorSuggestWidget.background": "#ffffff",
              "editorSuggestWidget.border": "#d4d4d4",
              "editorSuggestWidget.selectedBackground": "#e4e6f1",
              "input.border": "#8a8a8a",
              "focusBorder": "#8a6200",
            },
          });

          this.resolveReady();
        } catch (error) {
          console.error(error);
          window.location.reload();
        }
      });
  }
}
