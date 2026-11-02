import { inject, Service } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import type { AjudaAssinatura, ItemCompletar } from "@portugol-webstudio/parser";
import { filter, take } from "rxjs/operators";
import { WorkerService } from "./worker.service";

@Service()
export class MonacoService {
  private monacoLoaderService = inject(MonacoEditorLoaderService);
  private workerService = inject(WorkerService);

  private resolveReady!: () => void;

  /**
   * Só existe depois que o Monaco carrega.
   */
  private completionKinds!: Record<ItemCompletar["tipo"], monaco.languages.CompletionItemKind>;

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

            // Comentários que criam um bloco recolhível: `// regiao` (ou `// região`) até
            // `// fimregiao` (ou `// fim regiao`), além dos `// region` e `// endregion` do VS Code.
            folding: {
              markers: {
                start: /^\s*\/\/\s*#?(?:region|regi[aã]o)(?![\p{L}\p{N}_])/u,
                end: /^\s*\/\/\s*#?(?:endregion|fim\s*regi[aã]o)(?![\p{L}\p{N}_])/u,
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

          this.registerLanguageFeatures();

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

  /**
   * As sugestões e a ajuda de assinatura, como as do VS Code. Elas vêm do worker, que tem o
   * analisador; valem para todo editor `portugol` (as abas de código e o criador de exercícios).
   */
  private registerLanguageFeatures() {
    this.completionKinds = {
      variável: monaco.languages.CompletionItemKind.Variable,
      constante: monaco.languages.CompletionItemKind.Constant,
      função: monaco.languages.CompletionItemKind.Function,
      biblioteca: monaco.languages.CompletionItemKind.Module,
      palavra: monaco.languages.CompletionItemKind.Keyword,
      trecho: monaco.languages.CompletionItemKind.Snippet,
    };

    monaco.languages.registerCompletionItemProvider("portugol", {
      triggerCharacters: ["."],
      provideCompletionItems: async (model, position, _context, token) => {
        const items = await this.workerService
          .complete(model.getValue(), this.toPosition(position), this.toSignal(token))
          .catch((): ItemCompletar[] => []);

        return { suggestions: items.map(item => this.toCompletionItem(item, position)) };
      },
    });

    monaco.languages.registerSignatureHelpProvider("portugol", {
      signatureHelpTriggerCharacters: ["(", ","],
      // O `)` fecha uma chamada de dentro e volta para a de fora, ou fecha a ajuda.
      signatureHelpRetriggerCharacters: [",", ")"],
      provideSignatureHelp: async (model, position, token) => {
        const help = await this.workerService
          .signatureHelp(model.getValue(), this.toPosition(position), this.toSignal(token))
          .catch(() => null);

        return help ? { value: this.toSignatureHelp(help), dispose: () => {} } : null;
      },
    });
  }

  private toPosition(position: monaco.Position) {
    return { linha: position.lineNumber, coluna: position.column };
  }

  /**
   * O pedido é cancelado quando a pessoa continua digitando antes da resposta.
   */
  private toSignal(token: monaco.CancellationToken) {
    const controller = new AbortController();

    token.onCancellationRequested(() => {
      controller.abort();
    });

    return controller.signal;
  }

  private toCompletionItem(item: ItemCompletar, position: monaco.Position): monaco.languages.CompletionItem {
    const { linha, início, fim } = item.intervalo;

    return {
      // O leitor de tela lê o rótulo, o detalhe dele e a descrição: "idade, inteiro".
      label: { label: item.rótulo, detail: item.detalheDoRótulo, description: item.descrição },
      kind: this.completionKinds[item.tipo],
      detail: item.detalhe,
      documentation: item.documentação ? { value: item.documentação } : undefined,
      insertText: item.inserir,
      insertTextRules: item.trecho ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      sortText: item.ordem,
      range: {
        insert: new monaco.Range(linha, início, linha, position.column),
        replace: new monaco.Range(linha, início, linha, fim),
      },
      command:
        item.comando === "ajudaDeAssinatura"
          ? { id: "editor.action.triggerParameterHints", title: "Mostrar os parâmetros" }
          : undefined,
    };
  }

  private toSignatureHelp(help: AjudaAssinatura): monaco.languages.SignatureHelp {
    return {
      signatures: [
        {
          label: help.rótulo,
          documentation: help.documentação ? { value: help.documentação } : undefined,
          parameters: help.parâmetros.map(parameter => {
            return {
              label: parameter.rótulo,
              documentation: parameter.documentação ? { value: parameter.documentação } : undefined,
            };
          }),
        },
      ],
      activeSignature: 0,
      activeParameter: help.parâmetroAtivo,
    };
  }
}
