import { DialogRef } from "@angular/cdk/dialog";
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import { ConnectedPosition } from "@angular/cdk/overlay";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { PortugolExecutor, PortugolMessage, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/angular";
import { AngularSplitModule, SplitGutterInteractionEvent } from "angular-split";
import { AngularSvgIconModule } from "angular-svg-icon";
import { saveAs } from "file-saver";
import { encode } from "iconv-lite";
import { KeyboardShortcutsModule, ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService, NgxGoogleAnalyticsModule } from "ngx-google-analytics";
import { EMPTY, Subscription, debounceTime, fromEventPattern, mergeMap, startWith, switchMap } from "rxjs";
import { GraphicsRenderer, IGraphicsRendererComponent } from "../../renderer";
import { IExtendedWindowApi } from "../../types";
import { DialogRendererComponent } from "../dialog-renderer/dialog-renderer.component";
import { settings } from "../../settings";
import { SettingsService } from "../settings.service";
import { ResponsiveService } from "../responsive.service";
import { ShareService } from "../share.service";
import { DialogService } from "../shared/dialog.service";
import { focusAfterRender } from "../shared/focus";
import { moveRovingFocus } from "../shared/roving-focus";
import { TooltipDirective } from "../shared/tooltip.directive";
import { ThemeService } from "../theme.service";
import { WorkerService } from "../worker.service";
import { WorkspaceService } from "../workspace.service";

export type ProblemSeverity = "error" | "warning" | "info";

/**
 * Um erro, aviso ou informação do código, na forma que a lista de problemas e
 * a barra de status mostram.
 */
export interface Problem {
  severity: ProblemSeverity;
  message: string;
  line: number;
  column: number;
}

const SEVERITIES: Record<PortugolDiagnosticSeverity, ProblemSeverity> = {
  [PortugolDiagnosticSeverity.Error]: "error",
  [PortugolDiagnosticSeverity.Warning]: "warning",
  [PortugolDiagnosticSeverity.Information]: "info",
};

type PanelView = "output" | "problems";

@Component({
  selector: "app-tab-editor",
  imports: [
    AngularSplitModule,
    AngularSvgIconModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    FormsModule,
    KeyboardShortcutsModule,
    MonacoEditorModule,
    NgxGoogleAnalyticsModule,
    TooltipDirective,
  ],
  templateUrl: "./tab-editor.component.html",
  styleUrl: "./tab-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabEditorComponent implements OnInit, OnDestroy {
  private gaService = inject(GoogleAnalyticsService);
  private toast = inject(HotToastService);
  private worker = inject(WorkerService);
  private shareService = inject(ShareService);
  private themeService = inject(ThemeService);
  private settingsService = inject(SettingsService);
  private dialog = inject(DialogService);
  private injector = inject(Injector);
  private responsive = inject(ResponsiveService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private workspace = inject(WorkspaceService);

  private _code$?: Subscription;
  private _stdOut$?: Subscription;
  private _events$?: Subscription;
  private _theme$?: Subscription;
  private _settings$?: Subscription;

  /**
   * A aba que este editor mostra; o conteúdo dela vive no estado da aplicação.
   */
  readonly tabId = input.required<string>();

  private readonly title = computed(() => this.workspace.titleOf(this.tabId()));

  /**
   * Esta aba de código é a que está em foco. Todas as abas ficam montadas, e o
   * `ng-keyboard-shortcuts` entrega cada atalho a um só componente (o último
   * registrado): só a aba em foco registra os seus, para o Ctrl+Enter e o
   * Ctrl+S valerem para ela, e não para uma aba escondida.
   */
  readonly isActive = computed(() => this.workspace.activeTabId() === this.tabId());

  /**
   * Cópia local do código, que é o que o Monaco edita. O estado é a fonte da
   * verdade, mas reenviar cada tecla de volta para o editor recriaria o
   * conteúdo e jogaria o cursor para o início, então só escrevemos para fora.
   */
  code = "";

  readonly help = output();
  readonly settings = output();
  /**
   * Ctrl+O no editor: quem abre o arquivo é a janela, numa aba nova.
   */
  readonly openFile = output();
  readonly examples = output();

  /**
   * O menu "Salvar como" abre ao lado da barra de atividades.
   */
  readonly menuPositions: ConnectedPosition[] = [
    { originX: "end", originY: "top", overlayX: "start", overlayY: "top", offsetX: 4 },
    { originX: "end", originY: "bottom", overlayX: "start", overlayY: "bottom", offsetX: 4 },
  ];

  private readonly shareToastTemplate =
    viewChild.required<TemplateRef<{ data: { url: string } }>>("shareToastTemplate");

  /**
   * Erros, avisos e informações do código, da checagem mais recente.
   */
  readonly problems = signal<Problem[]>([]);

  /**
   * Posição do cursor no código, para a barra de status.
   */
  readonly cursor = signal({ line: 1, column: 1 });

  readonly panelView = signal<PanelView>("output");

  readonly problemIcons: Record<ProblemSeverity, string> = {
    error: "assets/mdi/close-circle-outline.svg",
    warning: "assets/mdi/alert-outline.svg",
    info: "assets/mdi/information-outline.svg",
  };

  readonly severityLabels: Record<ProblemSeverity, string> = {
    error: "Erro",
    warning: "Aviso",
    info: "Informação",
  };

  /**
   * Várias abas de código ficam abertas ao mesmo tempo: os `id`s usados por
   * `aria-controls` e `aria-labelledby` levam o da aba.
   */
  readonly ids = computed(() => {
    const id = this.tabId();

    return {
      outputTab: `painel-saida-aba-${id}`,
      outputPanel: `painel-saida-${id}`,
      problemsTab: `painel-problemas-aba-${id}`,
      problemsPanel: `painel-problemas-${id}`,
    };
  });

  transpiling = false;
  executor = new PortugolExecutor(PortugolWebWorkersRunner);

  graphicsRenderer = new GraphicsRenderer(this.executor);
  graphicsRendererModal: DialogRef<unknown, DialogRendererComponent> | null = null;

  codeEditor?: monaco.editor.IStandaloneCodeEditor;

  // As cores dos pares são uma opção do modelo de texto, e o Monaco só repassa
  // ao modelo as chaves registradas na configuração: `bracketPairColorization`
  // não é uma delas, só `bracketPairColorization.enabled`.
  codeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions & {
    "bracketPairColorization.enabled"?: boolean;
  } = {
    theme: "portugol-dark",
    language: "portugol",
    tabCompletion: "on",
    // Com a detecção, um arquivo já indentado ignoraria o tamanho da tabulação
    // escolhido nas configurações.
    detectIndentation: false,
  };

  stdOutEditor?: monaco.editor.IStandaloneCodeEditor;

  private readonly split = viewChild.required("split", { read: ElementRef<HTMLElement> });

  /**
   * Altura do cabeçalho do painel: é o que fica visível com ele recolhido.
   */
  // Mesma altura de `--pws-tab-height` (`.panel-header`), que o SCSS usa.
  readonly panelHeaderHeight = 35;

  /**
   * Altura do painel, em px. Começa recolhido e abre ao executar.
   */
  outputSize = this.panelHeaderHeight;

  /**
   * A última altura aberta que o usuário escolheu, para voltar a ela ao abrir
   * de novo.
   */
  private lastOpenOutputSize: number | null = null;

  /**
   * Em telas de toque, o teclado virtual não manda para o editor da saída
   * teclas que dê para ler (no Android, quase todas chegam como
   * "Unidentified"), e acentos e o corretor nem passam por elas. Lá, a entrada
   * do `leia` vai por um campo de texto comum.
   */
  readonly coarsePointer = this.responsive.coarsePointer;
  private readonly isBelowSm = this.responsive.isBelowSm;

  programInput = "";

  private readonly programInputField = viewChild<ElementRef<HTMLInputElement>>("programInputField");

  /**
   * A saída está na tela: a aba é a que está em foco, o painel está aberto e
   * mostra a saída, não a lista de problemas.
   */
  private outputVisible() {
    return this.isActive() && !this.outputCollapsed && this.panelView() === "output";
  }

  get outputCollapsed() {
    return this.outputSize <= this.panelHeaderHeight + 1;
  }

  outputAutoScroll = true;

  /**
   * O Monaco liga por padrão a fixação do bloco no topo e o recolher blocos, que
   * tratariam as linhas recuadas da saída como blocos de código. Fica num campo à
   * parte porque os tipos do \`monaco\` do ngx-monaco-editor são mais antigos que o
   * Monaco em uso e não conhecem o \`stickyScroll\`.
   */
  private readonly saidaSemBlocos = { stickyScroll: { enabled: false }, folding: false };

  stdOutEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    lineNumbers: "off",
    readOnly: true,
    minimap: { enabled: false },
    wordWrap: "on",
    language: "plaintext",
    // Na saída não se edita: a faixa da linha do cursor só pareceria uma caixa
    // vazia em volta da primeira linha.
    renderLineHighlight: "none",
    ...this.saidaSemBlocos,
    // Sem `tabSize`: no Monaco ele vale para todos os editores da página, e um
    // valor aqui sobrescreveria o das configurações no editor de código.
    guides: { indentation: false },
  };

  generatedCodeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    ...this.stdOutEditorOptions,
    language: "swift",
    guides: { indentation: true },
  };

  sharing = false;

  hasSaveFilePickerSupport = "showSaveFilePicker" in window;

  shortcuts: ShortcutInput[] = [
    {
      key: "f1",
      preventDefault: true,
      command: this.openHelp.bind(this),
    },
    {
      key: "ctrl + s",
      preventDefault: true,
      command: () => {
        this.saveFile();
      },
    },
    {
      key: "ctrl + o",
      preventDefault: true,
      command: () => {
        this.openFile.emit();
      },
    },
    {
      key: "ctrl + enter",
      preventDefault: true,
      command: this.runCode.bind(this),
    },
  ];

  /**
   * Com "Começar com o painel recolhido" desligado, o painel abre em 30% da
   * altura. Uma aba restaurada em segundo plano tem altura zero até aparecer,
   * então a conta espera a primeira vez que ela fica visível.
   */
  private firstLayout?: ResizeObserver;

  private openPanelOnFirstLayout() {
    if (this.settingsService.get(settings.outputStartCollapsed)) {
      return;
    }

    const element = this.split().nativeElement;

    this.firstLayout = new ResizeObserver(() => {
      if (element.clientHeight > 0) {
        this.firstLayout?.disconnect();
        this.expandOutput();
      }
    });

    this.firstLayout.observe(element);
  }

  constructor() {
    // O `split` só existe depois da primeira renderização.
    afterNextRender(() => {
      this.openPanelOnFirstLayout();
    });

    // Na fase de captura, antes do `cdkMenuTrigger` do "Salvar como": nele, as
    // setas para cima e para baixo abririam o menu enquanto o foco itinerante
    // vai para o botão vizinho.
    this.host.nativeElement.addEventListener(
      "keydown",
      event => {
        this.onKeydown(event);
      },
      { capture: true },
    );
  }

  ngOnInit() {
    // O estado já entrega a aba pronta, inclusive o esqueleto de um programa novo.
    this.code = this.workspace.contentsOf(this.tabId());

    this._stdOut$ = this.executor.stdOut$.subscribe(() => {
      if (this.outputAutoScroll) {
        this.stdOutEditorCursorEnd();
      }
    });

    // Mesmo sem rolar sozinha, a saída vai para o fim quando o programa espera
    // uma entrada: é com o foco nela que o que se digita chega ao `leia`.
    this._stdOut$.add(
      this.executor.waitingForInput$.subscribe(waiting => {
        if (waiting) {
          this.showPanel("output");

          this.stdOutEditorCursorEnd();

          if (this.coarsePointer() && this.isActive()) {
            // O campo só existe depois da próxima renderização.
            focusAfterRender(this.injector, () => this.programInputField()?.nativeElement);
          }
        }
      }),
    );

    this._events$ = this.executor.events.subscribe({
      next: event => {
        switch (event.type) {
          case "finish": {
            const rendererModal = this.graphicsRendererModal;

            if (rendererModal) {
              this.graphicsRendererModal = null;
              rendererModal.close();
            }

            break;
          }

          case "error": {
            this.gaService.event("execution_error", "Execução", "Erro em execução de código");
            break;
          }

          case "message": {
            this.handlePortugolMessage(event.message).catch(console.error);
            break;
          }

          default: {
            break;
          }
        }
      },

      error: error => {
        this.gaService.event("execution_runner_error", "Execução", "Erro ao carregar o runner para rodar o código");

        captureException(error, { extra: { code: this.code } });
      },
    });

    this._theme$ = this.themeService.theme$.subscribe(theme => {
      this.codeEditorOptions = { ...this.codeEditorOptions, theme: `portugol-${theme}` };
      this.stdOutEditorOptions = { ...this.stdOutEditorOptions, theme: `portugol-${theme}` };
      this.generatedCodeEditorOptions = { ...this.generatedCodeEditorOptions, theme: `portugol-${theme}` };
    });

    this._settings$ = this.settingsService.editorOptions().subscribe(options => {
      this.codeEditorOptions = {
        ...this.codeEditorOptions,
        ...options,
        // No celular, o minimapa cobriria o fim das linhas de código.
        minimap: { enabled: options.minimap?.enabled === true && !this.isBelowSm() },
      };

      this.generatedCodeEditorOptions = {
        ...this.generatedCodeEditorOptions,
        fontSize: options.fontSize,
        wordWrap: options.wordWrap,
      };
    });

    this._settings$.add(
      this.settingsService.outputFontSize().subscribe(fontSize => {
        this.stdOutEditorOptions = { ...this.stdOutEditorOptions, fontSize };
      }),
    );

    // A quebra de linha da saída é uma configuração à parte da do editor de
    // código: desenhos e tabelas feitos com texto só ficam certos sem ela.
    this._settings$.add(
      this.settingsService.observe(settings.outputWordWrap).subscribe(wordWrap => {
        this.stdOutEditorOptions = { ...this.stdOutEditorOptions, wordWrap: wordWrap ? "on" : "off" };
      }),
    );

    this._settings$.add(
      this.settingsService.observe(settings.outputShowExecutionTime).subscribe(show => {
        this.executor.showExecutionTime = show;
      }),
    );

    this._settings$.add(
      this.settingsService.observe(settings.outputClearOnRun).subscribe(clear => {
        this.executor.clearStdOutOnRun = clear;
      }),
    );

    this._settings$.add(
      this.settingsService.observe(settings.outputAutoScroll).subscribe(autoScroll => {
        this.outputAutoScroll = autoScroll;
      }),
    );

    this.graphicsRenderer.addEventListener("create", event => {
      const component = this.openRendererModal();

      if (component) {
        event.component = component;
      }
    });
  }

  ngOnDestroy() {
    this.firstLayout?.disconnect();
    this.executor.stop();
    this.worker.abortTranspilation();
    this._code$?.unsubscribe();
    this._events$?.unsubscribe();
    this._stdOut$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._settings$?.unsubscribe();
  }

  async runCode() {
    this.gaService.event("editor_start_execution", "Editor", "Botão de Iniciar Execução");
    this.showPanel("output");
    // O que ficou no campo de toque de uma execução interrompida não pode
    // virar a resposta do próximo `leia`.
    this.programInput = "";
    setExtra("code", this.code);

    this.transpiling = true;

    let result;

    try {
      result = await this.worker.transpileCode(this.code);
    } catch (error) {
      captureException(error, {
        tags: { transpile: true },
        extra: { code: this.code },
      });

      alert(
        "Ocorreu um erro ao transpilar o código, possivelmente o seu navegador não suporta Web Workers. Por favor, tente novamente em outro navegador. Caso o erro persista, acesse https://github.com/dgadelha/Portugol-Webstudio/issues/new/choose",
      );

      alert(error);
    } finally {
      this.transpiling = false;
    }

    if (result) {
      // A checagem ao vivo é debounced: quem edita e roda em menos de 500ms veria as marcas
      // do código anterior. Estas vêm do mesmo `checkCode` que decidiu se ia executar.
      this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));
      this.executor.runTranspiled(result);
    }
  }

  stopCode() {
    this.gaService.event("editor_stop_execution", "Editor", "Botão de Parar Execução");
    this.executor.stop();

    if (this.transpiling) {
      this.worker.abortTranspilation();
      this.transpiling = false;
    }

    this.stdOutEditorCursorEnd();
  }

  async handlePortugolMessage(message: PortugolMessage) {
    if (message.type.startsWith("graphics.")) {
      await this.graphicsRenderer.handleRendererMessage(message);
    }
  }

  openRendererModal(): IGraphicsRendererComponent | null {
    this.gaService.event("editor_open_renderer", "Editor", "Abrir modal de renderização");
    const titleId = `janela-graficos-titulo-${this.tabId()}`;

    this.graphicsRendererModal = this.dialog.open<unknown, unknown, DialogRendererComponent>(DialogRendererComponent, {
      ariaLabelledBy: titleId,
      data: { titleId },
      panelClass: "pws-renderer-dialog",
      modeless: true,
    });

    this.graphicsRendererModal.closed.subscribe(() => {
      this.graphicsRenderer.destroy();

      if (this.graphicsRendererModal !== null) {
        this.graphicsRendererModal = null;
        this.stopCode();
      }
    });

    return this.graphicsRendererModal.componentInstance;
  }

  onCodeChange(contents: string) {
    this.code = contents;
    this.workspace.setContents(this.tabId(), contents);
  }

  private prepareFile(as: "text" | "binary", compat = false) {
    const blob = (() => {
      if (compat) {
        return new Blob([Uint8Array.from(encode(this.code, "ISO-8859-1"))], {
          type: `${as === "binary" ? "application/octet-stream" : "text/plain"}; charset=ISO-8859-1`,
        });
      }

      return new Blob([this.code], {
        type: as === "binary" ? "application/octet-stream" : "text/plain",
      });
    })();

    let fileName = this.title();

    if (!fileName.endsWith(".por")) {
      fileName += ".por";
    }

    return { blob, fileName };
  }

  saveFile(compat = false) {
    const { blob, fileName } = this.prepareFile("binary", compat);

    saveAs(blob, fileName, { autoBom: false });
  }

  saveFileManual(as: "text" | "binary") {
    const { blob, fileName } = this.prepareFile(as);
    const file = new File([blob], fileName, { type: blob.type });

    window.open(URL.createObjectURL(file), "_blank");
  }

  async saveFileWithPicker() {
    const extendedWindowApi = window as IExtendedWindowApi;

    if (!extendedWindowApi.showSaveFilePicker) {
      return;
    }

    const { blob, fileName } = this.prepareFile("binary");

    try {
      const fileHandle = await extendedWindowApi.showSaveFilePicker({
        types: [
          {
            description: "Arquivo Portugol",
            accept: {
              "application/octet-stream": [".por"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        suggestedName: fileName,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      this.toast.success("Arquivo salvo com sucesso!", { duration: 3000 });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error(error);

      this.toast.error("Ocorreu um erro ao salvar o arquivo!", { duration: 5000 });
    }
  }

  onStdOutEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.initShortcuts(editor);
    this.stdOutEditor = editor;

    editor.onKeyDown(e => {
      if (!this.executor.waitingForInput) {
        return;
      }

      if (e.code === "Enter" || e.browserEvent.key === "Enter") {
        this.executor.stdIn.next("\r");
      } else if (e.code === "Backspace") {
        this.executor.stdIn.next("\b");
      } else if (e.browserEvent.key.length === 1) {
        this.executor.stdIn.next(e.browserEvent.key);
      }
    });
  }

  /**
   * O divisor guarda o tamanho arrastado só para ele: o valor fica espelhado
   * aqui para recolher e abrir partirem do tamanho certo.
   */
  onSplitDragEnd({ sizes }: SplitGutterInteractionEvent) {
    const size = sizes[1];

    if (typeof size !== "number") {
      return;
    }

    this.outputSize = size;

    if (!this.outputCollapsed) {
      this.lastOpenOutputSize = size;
    }
  }

  expandOutput() {
    if (this.outputCollapsed) {
      this.outputSize = this.lastOpenOutputSize ?? Math.round(this.split().nativeElement.clientHeight * 0.3);
    }
  }

  /**
   * Mostra a saída ou a lista de problemas, abrindo o painel se estiver
   * recolhido.
   */
  showPanel(view: PanelView) {
    this.panelView.set(view);
    this.expandOutput();
  }

  /**
   * Pela barra de status: abre a lista de problemas e leva o foco até ela.
   */
  showProblems() {
    this.showPanel("problems");

    focusAfterRender(this.injector, () => this.panelTab(this.ids().problemsTab));
  }

  /**
   * As setas trocam entre Saída e Problemas, como no padrão de abas da
   * WAI-ARIA.
   */
  onPanelTabsKeydown(event: KeyboardEvent) {
    const tablist = (event.currentTarget as HTMLElement).closest<HTMLElement>("[role=tablist]");

    if (tablist) {
      moveRovingFocus(event, tablist, "[role=tab]", "horizontal")?.click();
    }
  }

  /**
   * Uma das abas do painel (Saída ou Problemas) desta aba de código.
   */
  private panelTab(id: string) {
    return this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
  }

  canRun() {
    return !this.transpiling && !this.executor.running;
  }

  canStop() {
    return this.transpiling || this.executor.running;
  }

  private onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const activityBar = target.closest<HTMLElement>(".activity-bar");

    // Setas, Home e End percorrem os botões da barra de atividades, como numa
    // barra de ferramentas: só um deles fica na ordem do Tab.
    if (activityBar && target.matches(".activity-button")) {
      if (moveRovingFocus(event, activityBar, ".activity-button", "vertical")) {
        event.stopPropagation();
      }
    }
  }

  toggleOutput() {
    if (this.outputCollapsed) {
      this.expandOutput();
    } else {
      this.outputSize = this.panelHeaderHeight;
    }
  }

  /**
   * Manda a linha do campo como se cada letra tivesse sido digitada na saída,
   * seguida do Enter.
   */
  sendProgramInput() {
    for (const char of this.programInput) {
      this.executor.stdIn.next(char);
    }

    this.executor.stdIn.next("\r");
    this.programInput = "";
  }

  clearOutput() {
    this.executor.stdOut = "";

    // Com a saída vazia, o botão fica desativado e perderia o foco: ele vai
    // para a aba "Saída", logo ao lado.
    this.panelTab(this.ids().outputTab)?.focus();
  }

  stdOutEditorCursorEnd() {
    if (!this.stdOutEditor) {
      return;
    }

    const editor = this.stdOutEditor;
    const model = editor.getModel();

    if (model) {
      // TODO: Find a better way to do this
      setTimeout(() => {
        editor.setPosition({
          lineNumber: model.getLineCount(),
          column: model.getLineMaxColumn(model.getLineCount()),
        });

        editor.setScrollPosition({
          scrollLeft: 0,
          scrollTop: editor.getScrollHeight(),
        });
      }, 1);

      // Em telas de toque, o foco fica no campo de entrada: no editor, ele só
      // abriria o teclado virtual à toa. Com a saída escondida (painel
      // recolhido, lista de problemas ou outra aba em foco), focá-la tiraria o
      // foco do que a pessoa estiver usando.
      if (!this.coarsePointer() && this.outputVisible()) {
        editor.focus();
      }
    }
  }

  /**
   * `CtrlCmd` é o Cmd no Mac; o `WinCtrl` acrescenta o Ctrl de verdade, que é o
   * atalho mostrado nas dicas (no Mac, o Ctrl+O do Monaco inseriria uma linha).
   */
  initShortcuts(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.addAction({
      id: "runCode",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, monaco.KeyMod.WinCtrl | monaco.KeyCode.Enter],
      label: "Executar código",
      run: this.runCode.bind(this),
    });

    editor.addAction({
      id: "saveFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS],
      label: "Salvar arquivo",
      run: () => {
        this.saveFile();
      },
    });

    editor.addAction({
      id: "openFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyO],
      label: "Abrir arquivo",
      run: () => {
        this.openFile.emit();
      },
    });

    editor.addAction({
      id: "openHelp",
      keybindings: [monaco.KeyCode.F1],
      label: "Ajuda",
      run: this.openHelp.bind(this),
    });
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.codeEditor = editor;
    this.initShortcuts(editor);

    // Uma aba recém-aberta pede o foco antes de o Monaco existir.
    if (this.workspace.consumeFocusRequest(this.tabId())) {
      editor.focus();
    }

    editor.onDidChangeCursorPosition(({ position }) => {
      this.cursor.set({ line: position.lineNumber, column: position.column });
    });

    this._code$?.unsubscribe();

    // Sem a checagem ao vivo, os erros só aparecem ao executar. Ao ser religada,
    // ela confere o código na hora, sem esperar a próxima tecla.
    let initial = true;

    this._code$ = this.settingsService
      .observe(settings.editorLiveDiagnostics)
      .pipe(
        switchMap(live => {
          const changes = fromEventPattern(
            handler => editor.onDidChangeModelContent(handler),
            (_handler, listener: monaco.IDisposable) => {
              listener.dispose();
            },
          );
          const wasInitial = initial;

          initial = false;

          if (!live) {
            this.setEditorDiagnostics([]);
            return EMPTY;
          }

          // Dentro do `switchMap`, uma checagem em andamento ao desligar é
          // descartada, e não marca erros depois da limpeza.
          return (wasInitial ? changes : changes.pipe(startWith(null))).pipe(
            debounceTime(500),
            mergeMap(async () => this.worker.checkCode(this.code)),
          );
        }),
      )
      .subscribe({
        next: result => {
          this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));
        },
        error(err) {
          console.error(err);
        },
      });
  }

  openHelp() {
    this.gaService.event("editor_help_tab_open", "Editor", "Nova aba de ajuda através do Editor");
    this.help.emit();
  }

  openSettings() {
    this.gaService.event("editor_settings_open", "Editor", "Abrir diálogo de configurações");
    this.settings.emit();
  }

  async shareFile() {
    if (!this.code) {
      return;
    }

    this.sharing = true;

    const shareUrl = await this.shareService.share(this.code);

    if (shareUrl) {
      this.toast.show(this.shareToastTemplate(), {
        data: { url: shareUrl },
        duration: 30_000,
        dismissible: true,
        // O link precisa ser lido e copiado: o aviso só some ao ser fechado,
        // senão sumiria enquanto alguém chega nele pelo teclado.
        autoClose: false,
        ariaLive: "polite",
      });

      this.gaService.event("share_code_success", "Editor", "Código compartilhado com sucesso");
    } else {
      this.toast.error("Ocorreu um erro ao compartilhar o arquivo. Tente novamente mais tarde.", {
        duration: 5000,
      });

      this.gaService.event("share_code_error", "Editor", "Erro ao compartilhar código");
    }

    setTimeout(() => {
      this.sharing = false;
    }, 1000);
  }

  async copyShareUrl(toastRef: CreateHotToastRef<{ url: string }>) {
    await navigator.clipboard.writeText(toastRef.data.url);
    toastRef.close();
    this.toast.success("Link copiado.", { duration: 3000 });
  }

  setEditorDiagnostics(diagnostics: IPortugolCodeDiagnostic[]) {
    const model = this.codeEditor?.getModel();

    if (model) {
      const severityMap: Record<PortugolDiagnosticSeverity, monaco.MarkerSeverity> = {
        [PortugolDiagnosticSeverity.Error]: monaco.MarkerSeverity.Error,
        [PortugolDiagnosticSeverity.Warning]: monaco.MarkerSeverity.Warning,
        [PortugolDiagnosticSeverity.Information]: monaco.MarkerSeverity.Info,
      };

      monaco.editor.setModelMarkers(
        model,
        "owner",
        diagnostics.map(error => {
          return {
            startLineNumber: error.startLine,
            startColumn: error.startCol + 1,
            endLineNumber: error.endLine,
            endColumn: error.endCol + 2,
            message: error.message,
            severity: severityMap[error.severity] ?? monaco.MarkerSeverity.Error,
          };
        }),
      );
    }

    // A lista de problemas mostra os erros primeiro, na ordem do código.
    const order: Record<ProblemSeverity, number> = { error: 0, warning: 1, info: 2 };

    this.problems.set(
      diagnostics
        .map<Problem>(diagnostic => {
          return {
            severity: SEVERITIES[diagnostic.severity] ?? "error",
            message: diagnostic.message,
            line: diagnostic.startLine,
            column: diagnostic.startCol + 1,
          };
        })
        .toSorted((a, b) => order[a.severity] - order[b.severity] || a.line - b.line || a.column - b.column),
    );
  }

  /**
   * Leva o cursor até o problema e devolve o foco ao código.
   */
  revealProblem(problem: Problem) {
    const editor = this.codeEditor;

    if (!editor) {
      return;
    }

    editor.setPosition({ lineNumber: problem.line, column: problem.column });
    editor.revealPositionInCenter({ lineNumber: problem.line, column: problem.column });
    editor.focus();
  }

  focusEditor() {
    this.codeEditor?.focus();
  }

  goToLine() {
    this.codeEditor?.focus();
    this.codeEditor?.trigger("barra-de-status", "editor.action.gotoLine", null);
  }
}
