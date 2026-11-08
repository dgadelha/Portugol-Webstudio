import { LiveAnnouncer } from "@angular/cdk/a11y";
import { inject, Service } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import {
  type AjudaAssinatura,
  chamadaDoValor,
  comValorAtual,
  type InformaçãoDoNome,
  type Intervalo,
  type ItemCompletar,
} from "@portugol-webstudio/parser";
import type { DebugPause, DebugVariable } from "@portugol-webstudio/runner";
import { LocalStorageService } from "ngx-webstorage";
import { filter, take } from "rxjs/operators";
import { settings } from "../settings";
import { hoverDeclarationText } from "./debug-variables/debug-values";
import { SettingsService } from "./settings.service";
import { WorkerService } from "./worker.service";

/**
 * A depuração de um editor, para a informação mostrar o valor das variáveis: a pausa e a chamada
 * escolhida na aba Variáveis (um índice em `pause.frames`).
 */
export type DebugHoverState = { pause: DebugPause; frame: number };

/**
 * O `monaco.editor` com as funções que faltam nos tipos do `ngx-monaco-editor`, que são de um
 * Monaco antigo.
 */
type MonacoEditorApi = typeof monaco.editor & {
  registerLinkOpener(opener: { open(resource: monaco.Uri): boolean }): monaco.IDisposable;
  registerEditorOpener(opener: {
    openCodeEditor(source: monaco.editor.ICodeEditor, resource: monaco.Uri): boolean;
  }): monaco.IDisposable;
  addEditorAction(descriptor: monaco.editor.IActionDescriptor): monaco.IDisposable;
  addKeybindingRule(rule: { keybinding: number; command: string }): monaco.IDisposable;
};

/**
 * A parte do serviço de menu de contexto do Monaco (interno, sem tipo público) que
 * `hideCommandPalette` usa.
 */
type ContextMenuService = {
  showContextMenu(delegate: { getActions(): ReadonlyArray<{ id: string }> }): void;
};

@Service()
export class MonacoService {
  private monacoLoaderService = inject(MonacoEditorLoaderService);
  private workerService = inject(WorkerService);
  private localStorage = inject(LocalStorageService);
  private settingsService = inject(SettingsService);
  private announcer = inject(LiveAnnouncer);

  private resolveReady!: () => void;

  /**
   * A depuração de cada editor de código, pelo modelo dele: `null` sem o programa pausado.
   */
  private readonly debugStates = new WeakMap<monaco.editor.ITextModel, () => DebugHoverState | null>();

  /**
   * Só existe depois que o Monaco carrega.
   */
  private completionKinds!: Record<ItemCompletar["tipo"], monaco.languages.CompletionItemKind>;

  /**
   * Se o menu de contexto já deixa de fora a "Paleta de Comandos" (ver `hideCommandPalette`).
   */
  private commandPaletteHidden = false;

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
              // A seleção das listas (sugestões, Visualizar, Ir para a linha) é a da interface
              // (`bg-active`, com o texto escuro): o branco que o tema `vs` usa no item escolhido
              // é para o fundo azul dele, e no fundo claro some.
              "list.activeSelectionBackground": "#e4e6f1",
              "list.activeSelectionForeground": "#1f1f1f",
              "list.activeSelectionIconForeground": "#1f1f1f",
              "list.focusHighlightForeground": "#005fb8",
              "editorSuggestWidget.selectedForeground": "#1f1f1f",
              "editorSuggestWidget.selectedIconForeground": "#1f1f1f",
              "editorSuggestWidget.focusHighlightForeground": "#005fb8",
              "peekViewResult.selectionForeground": "#1f1f1f",
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
   * Liga a informação do modelo à depuração do editor dele, ou desliga, com `null`.
   */
  setDebugState(model: monaco.editor.ITextModel, state: (() => DebugHoverState | null) | null) {
    if (state) {
      this.debugStates.set(model, state);
    } else {
      this.debugStates.delete(model);
    }
  }

  /**
   * As sugestões, a ajuda de assinatura, a informação ao parar o mouse e a ida para a definição,
   * como as do VS Code. Elas vêm do worker, que tem o analisador; valem para todo editor
   * `portugol` (as abas de código e o criador de exercícios).
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
        if (this.helpTopic(model.uri)) {
          return { suggestions: [] };
        }

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
        if (this.helpTopic(model.uri)) {
          return null;
        }

        const help = await this.workerService
          .signatureHelp(model.getValue(), this.toPosition(position), this.toSignal(token))
          .catch(() => null);

        return help ? { value: this.toSignatureHelp(help), dispose: () => {} } : null;
      },
    });

    monaco.languages.registerHoverProvider("portugol", {
      provideHover: async (model, position, token) => {
        // O texto da Ajuda, no Peek, é só para ler.
        if (this.helpTopic(model.uri)) {
          return null;
        }

        // A pausa de agora: a resposta pode chegar depois de outro passo.
        const debug = this.debugStates.get(model)?.() ?? null;
        const hover = await this.workerService
          .hover(
            model.getValue(),
            this.toPosition(position),
            this.toSignal(token),
            debug ? { linha: debug.pause.line, coluna: debug.pause.column } : undefined,
          )
          .catch(() => null);

        // O programa seguiu, ou outra chamada foi escolhida na aba Variáveis, enquanto o worker
        // respondia: o valor já não vale, e o `hideEditorHover` do passo já passou.
        const now = debug && this.debugStates.get(model)?.();

        if (!hover || (debug && (now?.pause !== debug.pause || now.frame !== debug.frame))) {
          return null;
        }

        // A declaração com o valor de agora, como na aba Variáveis.
        const { variável } = hover;
        const variable = debug && variável && this.debugVariable(variável, debug);
        const content = variável && variable ? comValorAtual(variável, hoverDeclarationText(variable)) : hover.conteúdo;
        const link = hover.ajuda ? `\n\n[Ver na Ajuda](${this.helpLink(hover.ajuda)})` : "";

        return { range: this.toRange(hover.intervalo), contents: [{ value: content + link }] };
      },
    });

    // O "Ver na Ajuda" e a definição de uma função de biblioteca abrem o tópico na aba de
    // Ajuda, como um endereço `#ajuda=`, e não numa aba nova do navegador.
    const editorApi = monaco.editor as MonacoEditorApi;

    editorApi.registerLinkOpener({
      open: resource => this.openHelpLink(resource),
    });

    // A definição em outro recurso: só as páginas da Ajuda.
    editorApi.registerEditorOpener({
      openCodeEditor: (_source, resource) => this.openHelpLink(resource),
    });

    // F12, Ctrl + clique e "Go to Definition" no menu de contexto. O que vem das bibliotecas e
    // da linguagem vai para a página na Ajuda.
    monaco.languages.registerDefinitionProvider("portugol", {
      provideDefinition: async (model, position, token) => {
        if (this.helpTopic(model.uri)) {
          return null;
        }

        const definition = await this.workerService
          .definition(model.getValue(), this.toPosition(position), this.toSignal(token))
          .catch(() => null);

        if (!definition) {
          return null;
        }

        if ("ajuda" in definition) {
          // O F12 e o Ctrl + clique abrem a Ajuda (`openHelpLink`); a prévia com o Ctrl e o Peek
          // mostram o modelo do endereço, com a declaração escrita como no código.
          const uri = monaco.Uri.parse(this.helpLink(definition.ajuda));
          const help = monaco.editor.getModel(uri) ?? this.createHelpModel(definition.declaração.texto, uri);

          return [this.declarationLink(help, definition.declaração.intervalo)];
        }

        return [this.declarationLink(model, definition.intervalo)];
      },
    });

    this.addScreenReaderToggle();
    this.freeF1();

    monaco.editor.onDidCreateEditor(editor => {
      this.hideCommandPalette(editor);

      // No navegador, o F12 pode abrir as ferramentas do desenvolvedor: o Monaco tem também o
      // Ctrl + F12, que o menu de contexto mostra, mas só o liga com a chave `isWeb`, que ele não
      // define fora do VS Code para a web.
      if ("createContextKey" in editor) {
        (editor as monaco.editor.IStandaloneCodeEditor).createContextKey("isWeb", true);
      }

      // O Monaco filtra a lista pedida com `sen` sem ignorar os acentos: o `ã` de `senã` a
      // esvazia e ele a fecha sem pedir outra. A letra com acento pode vir de uma tecla morta,
      // que compõe o caractere; colar ou desfazer não abre a lista.
      let composing = false;

      editor.onDidCompositionStart(() => (composing = true));
      editor.onDidCompositionEnd(() => {
        composing = false;
        this.suggestAgain(editor);
      });
      editor.onDidChangeModelContent(({ changes, isUndoing, isRedoing, isFlush }) => {
        const [change] = changes;
        const typed = changes.length === 1 && change.rangeLength === 0 && Array.from(change.text).length === 1;

        if (typed && !composing && !isUndoing && !isRedoing && !isFlush && /\P{ASCII}/u.test(change.text)) {
          this.suggestAgain(editor);
        }
      });

      // A declaração da Ajuda, no Peek, é só para ler, e as linhas longas da explicação quebram.
      // O Peek guarda o que muda nas opções dele: quando ele volta a mostrar o código, as
      // opções de antes voltam também.
      let before: monaco.editor.IEditorOptions | undefined;

      editor.onDidChangeModel(() => {
        const model = editor.getModel();
        const help = Boolean(model && this.helpTopic(model.uri));

        if (help && !before) {
          const { readOnly = false, wordWrap = "off" } = editor.getRawOptions();

          before = { readOnly, wordWrap };
          editor.updateOptions({
            readOnly: true,
            readOnlyMessage: { value: "O texto da Ajuda não pode ser editado." },
            wordWrap: "on",
          } as monaco.editor.IEditorOptions & { readOnlyMessage: monaco.IMarkdownString });
        } else if (!help && before) {
          editor.updateOptions(before);
          before = undefined;
        }
      });
    });
  }

  /**
   * Pede as sugestões de novo depois da letra com acento, como as sugestões rápidas pediriam
   * depois de outra letra. O serviço de linguagem compara a palavra sem os acentos e manda o
   * filtro com eles.
   */
  private suggestAgain(editor: monaco.editor.ICodeEditor) {
    // Depois de o Monaco filtrar e fechar a lista.
    setTimeout(() => {
      const model = editor.getModel();
      const position = editor.getPosition();

      if (
        !model ||
        !position ||
        model.getLanguageId() !== "portugol" ||
        !editor.hasTextFocus() ||
        editor.getOption(monaco.editor.EditorOption.quickSuggestions).other !== "on" ||
        !/\P{ASCII}/u.test(model.getWordUntilPosition(position).word)
      ) {
        return;
      }

      editor.trigger("keyboard", "editor.action.triggerSuggest", { auto: true });
    });
  }

  /**
   * Shift + Alt + F1 liga e desliga o modo para leitores de tela, como no VS Code. Enquanto ele
   * está desligado, o nome do editor diz esse atalho a quem usa um leitor de tela: no navegador,
   * o Monaco não percebe o leitor sozinho, e no Chrome e no Edge não passa o código a ele.
   */
  private addScreenReaderToggle() {
    // Para todos os editores de uma vez: o `addAction` de cada um não funciona no
    // `onDidCreateEditor`, que vem antes de o editor estar pronto para atalhos.
    (monaco.editor as MonacoEditorApi).addEditorAction({
      id: "portugol.screenReaderMode",
      label: "Otimizar para leitor de tela",
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.F1],
      run: () => {
        const setting = settings.editorAccessibilitySupport;
        const on = !this.settingsService.get(setting);

        this.localStorage.store(setting.key, on);
        void this.announcer.announce(
          on ? "Editor otimizado para leitores de tela." : "Otimização para leitores de tela desligada.",
        );
      },
    });
  }

  /**
   * O F1 abre a Ajuda em qualquer lugar (`AppComponent.onShortcut`), mas, nos editores que não
   * têm o próprio F1 (`TabEditorComponent.initShortcuts`), o Monaco o usaria para abrir a paleta
   * de comandos, que com o zone.js abre vazia (`hideCommandPalette`).
   */
  private freeF1() {
    (monaco.editor as MonacoEditorApi).addKeybindingRule({
      keybinding: monaco.KeyCode.F1,
      command: "-editor.action.quickCommand",
    });
  }

  /**
   * Tira a "Paleta de Comandos" do menu de contexto: o atalho dela, o F1, abre a Ajuda, e com o
   * zone.js do Angular ela abre vazia (o Monaco não reconhece a promessa da lista de comandos).
   *
   * O Monaco não tem como tirar um item do menu, então o serviço do menu de contexto, um só para
   * todos os editores, passa a filtrar o item antes de mostrar o menu. O serviço é achado pelo
   * método `showContextMenu` entre os campos do menu de contexto do editor, que são privados:
   * se uma versão do Monaco mudar isso, ou o que o menu recebe, o item só volta a aparecer.
   */
  private hideCommandPalette(editor: monaco.editor.ICodeEditor) {
    if (this.commandPaletteHidden) {
      return;
    }

    const contextMenu = editor.getContribution("editor.contrib.contextmenu") ?? {};
    const service = Object.values(contextMenu).find(
      (value): value is ContextMenuService =>
        typeof (value as Partial<ContextMenuService>)?.showContextMenu === "function",
    );

    if (!service) {
      return;
    }

    const showContextMenu = service.showContextMenu.bind(service);

    service.showContextMenu = delegate => {
      let menu = delegate;

      // Se o Monaco mudar o que o menu recebe, ele aparece como veio, em vez de não abrir.
      try {
        const actions = delegate.getActions().filter(action => action.id !== "editor.action.quickCommand");

        menu = { ...delegate, getActions: () => actions };
      } catch (error) {
        console.error(error);
      }

      showContextMenu(menu);
    };
    this.commandPaletteHidden = true;
  }

  /**
   * O modelo de uma declaração da Ajuda, para a prévia e o Peek. Os das declarações vistas antes,
   * que nenhum editor mostra mais, são descartados.
   */
  private createHelpModel(text: string, uri: monaco.Uri) {
    for (const model of monaco.editor.getModels()) {
      if (this.helpTopic(model.uri) && !model.isAttachedToEditor()) {
        model.dispose();
      }
    }

    return monaco.editor.createModel(text, "portugol", uri);
  }

  private toPosition(position: monaco.Position) {
    return { linha: position.lineNumber, coluna: position.column };
  }

  /**
   * A variável da pausa que é com certeza a do nome, na chamada que `chamadaDoValor` escolhe.
   */
  private debugVariable(
    variable: NonNullable<InformaçãoDoNome["variável"]>,
    { pause, frame }: DebugHoverState,
  ): DebugVariable | undefined {
    const call = chamadaDoValor(
      variable,
      pause.frames.map(item => item.name),
      frame,
    );

    if (call === undefined) {
      return;
    }

    const variables = call === "globais" ? pause.globals : pause.frames[call].variables;

    return variables.find(item => item.name === variable.nome);
  }

  private helpLink(topic: string) {
    // Sem a busca do endereço da página, para cada tópico ter um endereço só.
    return `${window.location.origin}${window.location.pathname}#ajuda=${topic}`;
  }

  /**
   * O fragmento `#ajuda=…` de um endereço desta página, ou `null` para os outros.
   */
  private helpTopic(resource: monaco.Uri) {
    // Comparados como `URL`, que codifica o caminho dos dois lados do mesmo jeito: o `path`
    // do `Uri` vem decodificado, e o `pathname` da página, não. Sem o `true`, o `Uri`
    // codificaria também o `=` e as barras do fragmento.
    const page = new URL(window.location.href);

    // Os modelos dos editores (`inmemory:`) nem chegam a ser lidos como endereço.
    if (`${resource.scheme}:` !== page.protocol) {
      return null;
    }

    const target = new URL(resource.toString(true));

    return target.origin === page.origin && target.pathname === page.pathname && target.hash.startsWith("#ajuda=")
      ? target.hash
      : null;
  }

  /**
   * Abre na aba de Ajuda um endereço `#ajuda=` desta página. Outros endereços ficam com o
   * Monaco.
   */
  private openHelpLink(resource: monaco.Uri) {
    const topic = this.helpTopic(resource);

    if (!topic) {
      return false;
    }

    window.location.hash = topic;

    return true;
  }

  /**
   * A definição com a linha toda da declaração, que a prévia com o Ctrl mostra, e o nome, que o
   * F12 seleciona e o Peek destaca.
   */
  private declarationLink(model: monaco.editor.ITextModel, name: Intervalo): monaco.languages.LocationLink {
    return {
      uri: model.uri,
      range: new monaco.Range(name.linha, 1, name.linha, model.getLineMaxColumn(name.linha)),
      targetSelectionRange: this.toRange(name),
    };
  }

  private toRange({ linha, início, fim }: Intervalo) {
    return new monaco.Range(linha, início, linha, fim);
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
    const { linha, início } = item.intervalo;

    return {
      // O leitor de tela lê o rótulo, o detalhe dele e a descrição: "idade, inteiro".
      label: { label: item.rótulo, detail: item.detalheDoRótulo, description: item.descrição },
      kind: this.completionKinds[item.tipo],
      detail: item.detalhe,
      documentation: item.documentação ? { value: item.documentação } : undefined,
      insertText: item.inserir,
      insertTextRules: item.trecho ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      sortText: item.ordem,
      filterText: item.filtro,
      range: {
        insert: new monaco.Range(linha, início, linha, position.column),
        replace: this.toRange(item.intervalo),
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
