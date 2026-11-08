import { LiveAnnouncer } from "@angular/cdk/a11y";
import { DialogRef } from "@angular/cdk/dialog";
import { CdkDragEnd, DragDropModule } from "@angular/cdk/drag-drop";
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import { ConnectedPosition } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { textoLiteral } from "@portugol-webstudio/parser";
import {
  casesToCheck,
  DebugCommand,
  DebugPause,
  PortugolExecutor,
  PortugolMessage,
  PortugolWebWorkersRunner,
} from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/angular";
import { AngularSplitModule, SplitGutterInteractionEvent } from "angular-split";
import { AngularSvgIconModule } from "angular-svg-icon";
import { saveAs } from "file-saver";
import { GoogleAnalyticsService, NgxGoogleAnalyticsModule } from "ngx-google-analytics";
import { LocalStorageService } from "ngx-webstorage";
import { EMPTY, Subscription, debounceTime, fromEventPattern, mergeMap, startWith, switchMap } from "rxjs";
import { GraphicsRenderer, IGraphicsRendererComponent } from "../../renderer";
import { isMacintosh, settings } from "../../settings";
import { IExtendedWindowApi } from "../../types";
import { describeChange, previousFrameVariables, variableChanges } from "../debug-variables/debug-values";
import { DebugVariablesComponent } from "../debug-variables/debug-variables.component";
import { DialogConfirmAdoptExerciseComponent } from "../dialog-confirm-adopt-exercise/dialog-confirm-adopt-exercise.component";
import { DialogConfirmRestartExerciseComponent } from "../dialog-confirm-restart-exercise/dialog-confirm-restart-exercise.component";
import { DialogRendererComponent, RendererDialogResult } from "../dialog-renderer/dialog-renderer.component";
import type { SettingsSectionId } from "../dialog-settings/dialog-settings.component";
import {
  ExerciseCheckOutcome,
  exerciseLabel,
  ExerciseNotFoundError,
  ExercisesService,
  Exercício,
  SHARED_PREFIX,
} from "../exercises.service";
import { type DebugHoverState, MonacoService } from "../monaco.service";
import { ResponsiveService } from "../responsive.service";
import { editorAriaLabel, SettingsService } from "../settings.service";
import { ShareService } from "../share.service";
import { atalhoDoEvento } from "../shared/atalhos";
import { DialogService } from "../shared/dialog.service";
import { focusAfterRender } from "../shared/focus";
import { moveRovingFocus } from "../shared/roving-focus";
import { SplitAccessibilityDirective } from "../shared/split-accessibility.directive";
import { TooltipDirective } from "../shared/tooltip.directive";
import { ThemeService } from "../theme.service";
import { WORKER_CRASH_ERROR, WorkerService } from "../worker.service";
import { WorkspaceService } from "../workspace.service";
import { defaultCode } from "../workspace.types";
import { ExerciseResultsComponent } from "./exercise-results.component";
import { ExerciseStatementComponent } from "./exercise-statement.component";

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

type PanelView = "output" | "problems" | "variables" | "check";

/**
 * Quanto um passo da depuração pode levar, em milissegundos, antes de o status voltar a
 * dizer "Executando".
 */
const LONG_STEP_DELAY = 500;

/**
 * Os comandos que retomam um programa pausado na depuração.
 */
type DebugResume = Extract<DebugCommand["type"], "step" | "stepOver" | "stepOut" | "continue">;

// Os tipos do ngx-monaco-editor são de um Monaco sem o `lineNumberClassName`
type LineDecorationOptions = monaco.editor.IModelDecorationOptions & { lineNumberClassName?: string };

export type EditorOrigin = "editor" | "atalho";

@Component({
  selector: "app-tab-editor",
  imports: [
    AngularSplitModule,
    AngularSvgIconModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    DebugVariablesComponent,
    DragDropModule,
    ExerciseResultsComponent,
    ExerciseStatementComponent,
    FormsModule,
    MonacoEditorModule,
    NgxGoogleAnalyticsModule,
    SplitAccessibilityDirective,
    TooltipDirective,
  ],
  templateUrl: "./tab-editor.component.html",
  styleUrl: "./tab-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    "(document:keydown)": "onShortcut($event)",
    "(window:pagehide)": "flushDraft()",
    "(window:blur)": "flushDraft()",
    "(document:visibilitychange)": "onVisibilityChange()",
    "(window:online)": "onOnline()",
  },
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
  private announcer = inject(LiveAnnouncer);
  private zone = inject(NgZone);
  private storage = inject(LocalStorageService);
  private exercises = inject(ExercisesService);
  private monacoService = inject(MonacoService);

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
   * Esta aba de código é a que está em foco. Todas as abas ficam montadas: os
   * atalhos e a saída só valem para a aba em foco, e não para uma escondida.
   */
  readonly isActive = computed(() => this.workspace.activeTabId() === this.tabId());

  /**
   * Cópia local do código, que é o que o Monaco edita. O estado é a fonte da
   * verdade, mas reenviar cada tecla de volta para o editor recriaria o
   * conteúdo e jogaria o cursor para o início, então só escrevemos para fora.
   */
  code = "";

  /**
   * Se a execução atual terminou com erro, para o `execution_finish`
   */
  private runFailed = false;

  readonly help = output<EditorOrigin>();
  readonly settings = output<SettingsSectionId | undefined>();
  /**
   * Ctrl+O no editor: quem abre o arquivo é a janela, numa aba nova.
   */
  readonly openFile = output<EditorOrigin>();
  readonly examples = output();
  readonly exercisesDialog = output();
  readonly newTab = output();
  readonly closeTab = output();

  /**
   * O menu "Salvar como" abre ao lado da barra de atividades.
   */
  readonly menuPositions: ConnectedPosition[] = [
    { originX: "end", originY: "top", overlayX: "start", overlayY: "top", offsetX: 4 },
    { originX: "end", originY: "bottom", overlayX: "start", overlayY: "bottom", offsetX: 4 },
  ];

  private readonly shareToastTemplate =
    viewChild.required<TemplateRef<{ data: { url: string } }>>("shareToastTemplate");

  private readonly debugTipTemplate = viewChild.required<TemplateRef<unknown>>("debugTipTemplate");

  private readonly debugTipIcon = viewChild.required<TemplateRef<unknown>>("debugTipIcon");

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
      variablesTab: `painel-variaveis-aba-${id}`,
      variablesPanel: `painel-variaveis-${id}`,
      checkTab: `painel-correcao-aba-${id}`,
      checkPanel: `painel-correcao-${id}`,
    };
  });

  /**
   * O exercício que esta aba resolve, se for uma aba de exercício. Lido uma vez, ao abrir: a
   * aba sai da lista antes de ser destruída, e o código ainda precisa ser guardado.
   */
  private exerciseId?: string;
  /**
   * Uma cópia do exercício, aberta de um arquivo ou link: confere, mas não mexe no progresso.
   */
  readonly exerciseCopy = signal(false);

  /**
   * O exercício carregado. Enquanto ele carrega, a aba é uma aba de código comum.
   */
  readonly exercise = signal<Exercício | null>(null);
  /**
   * O exercício não carregou (sem conexão, por exemplo): o enunciado dá lugar a um botão para
   * tentar de novo.
   */
  readonly exerciseFailed = signal<"network" | "missing" | null>(null);
  readonly loadingExercise = signal(false);

  /**
   * Um exercício compartilhado por link (`share:<id>`), não um dos que vêm com o IDE.
   */
  get sharedExercise() {
    return this.exerciseId?.startsWith(SHARED_PREFIX) ?? false;
  }

  readonly exerciseDone = computed(() => {
    const exercise = this.exercise();

    return exercise !== null && !this.exerciseCopy() && this.exercises.isDone(exercise.id);
  });

  /**
   * O código que está no editor, a cada mudança: `code` não avisa quem depende dele.
   */
  private readonly editorCode = signal("");

  /**
   * O exercício passou, e o código no editor já não é o que passou: o enunciado oferece
   * recuperá-lo.
   */
  readonly approvedCodeChanged = computed(() => {
    const exercise = this.exercise();
    const approved = exercise && !this.exerciseCopy() ? this.exercises.progress()[exercise.id]?.aprovado : undefined;

    return approved !== undefined && approved.código !== this.editorCode();
  });

  /**
   * O andamento do Verificar, enquanto ele confere os casos.
   */
  readonly checkProgress = signal<{ done: number; total: number } | null>(null);
  readonly checking = computed(() => this.checkProgress() !== null);
  readonly checkOutcome = signal<ExerciseCheckOutcome | null>(null);
  private checkAbort?: AbortController;
  private recheckAbort?: AbortController;
  /**
   * A chave `pwsExercicio` de cada editor da aba (o do código e o da saída), que liga o
   * Ctrl+Shift+Enter do Verificar.
   */
  private readonly exerciseContextKeys: Array<monaco.editor.IContextKey<boolean>> = [];

  /**
   * O enunciado fica ao lado do código; numa tela estreita, em cima dele.
   */
  readonly isBelowMd = this.responsive.isBelowMd;

  transpiling = false;
  /**
   * Interrompe a transpilação desta aba (o Parar, ou a aba fechando), sem mexer na das outras.
   */
  private transpileAbort?: AbortController;

  /**
   * A edição do exercício esperando uma pausa para ser gravada no progresso, que guarda todos
   * os exercícios numa chave só: gravar a cada tecla avisaria as outras janelas a cada tecla.
   */
  private draftTimer?: ReturnType<typeof setTimeout>;

  /**
   * O último código do exercício que esta aba viu gravado, para notar quando outra janela o muda.
   */
  private knownDraft?: string;

  /**
   * A aba está fechando: o que acabar agora (a depuração, por exemplo) não agenda mais nada.
   */
  private closing = false;
  executor = new PortugolExecutor(PortugolWebWorkersRunner);

  /**
   * Uma execução passo a passo em andamento, pausada ou não.
   */
  debugging = false;

  /**
   * Com a "Depuração avançada" das configurações: Continuar, Pausar, Pular função, Sair
   * da função e pontos de parada. Sem ela, a depuração só tem o Próximo passo.
   */
  advancedDebugging = false;

  /**
   * O programa está pausado, esperando um comando da depuração.
   */
  readonly paused = signal(false);

  /**
   * Um passo (Próximo passo, Pular função ou Sair da função) em andamento: o status não diz
   * "Executando" entre duas pausas, senão o leitor de tela o anunciaria a cada passo. Só
   * vale pelo `LONG_STEP_DELAY`: um passo mais longo volta a mostrar o "Executando".
   */
  readonly stepInFlight = signal(false);

  private longStepTimer?: ReturnType<typeof setTimeout>;

  /**
   * Onde a barra flutuante da depuração avançada foi deixada, em relação ao alto e ao
   * meio do editor. Fica guardada neste navegador e vale para todas as abas.
   */
  readonly debugToolbarPosition = signal(this.settingsService.get(settings.debugToolbarPosition));

  // Onde a pessoa deixou a barra. A mostrada pode estar mais para dentro, numa tela menor,
  // e volta para cá quando o editor cresce de novo
  private savedToolbarPosition = this.settingsService.get(settings.debugToolbarPosition);

  /**
   * A pausa que a aba "Variáveis" mostra: a última, enquanto o programa dá um passo, ou
   * `null` enquanto ele continua até um ponto de parada.
   */
  readonly debugPause = signal<DebugPause | null>(null);

  /**
   * A pausa anterior, para destacar o que mudou.
   */
  readonly previousDebugPause = signal<DebugPause | null>(null);

  private lastDebugPause: DebugPause | null = null;

  /**
   * Um `leia` levou o painel da aba Variáveis para a Saída: a próxima pausa volta para lá.
   */
  private returnToVariables = false;

  /**
   * Quantas vezes cada botão foi usado na depuração atual, para o `debug_finish`: cada passo
   * não vira um evento, seriam centenas numa depuração.
   */
  private debugCounts = this.emptyDebugCounts();

  // Os tipos do Monaco vêm do ngx-monaco-editor e não têm o `createDecorationsCollection`
  private breakpointDecorations: string[] = [];
  private currentLineDecoration: string[] = [];
  private errorLineDecoration: string[] = [];

  /**
   * Depurando, o editor de código fica só para leitura, e os atalhos da depuração com Alt
   * valem nele até no Mac (veja `initShortcuts`).
   */
  private debuggingInEditor?: monaco.editor.IContextKey<boolean>;

  // Na saída, os atalhos da depuração valem com o Option no Mac, menos esperando um `leia`,
  // em que o Option digita os acentos e o "ç"
  private debuggingInOutput?: monaco.editor.IContextKey<boolean>;

  // Mantém a barra flutuante dentro do editor quando ele muda de tamanho durante a depuração
  private debugToolbarFit?: ResizeObserver;

  // A primeira linha do último erro de execução, para anunciar o fim da depuração
  private lastErrorAnnouncement: string | null = null;

  graphicsRenderer = new GraphicsRenderer(this.executor);
  graphicsRendererModal: DialogRef<RendererDialogResult, DialogRendererComponent> | null = null;

  codeEditor?: monaco.editor.IStandaloneCodeEditor;

  /**
   * O modelo ligado à depuração em `onEditorInit`: no `ngOnDestroy`, o editor pode já ter sido
   * descartado, e o `getModel()` dele, voltar `null`.
   */
  private debugModel?: monaco.editor.ITextModel;

  // As cores dos pares são uma opção do modelo de texto, e o Monaco só repassa
  // ao modelo as chaves registradas na configuração: `bracketPairColorization`
  // não é uma delas, só `bracketPairColorization.enabled`.
  codeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions & {
    "bracketPairColorization.enabled"?: boolean;
    readOnlyMessage?: monaco.IMarkdownString;
  } = {
    theme: "portugol-dark",
    language: "portugol",
    // O nome do editor para os leitores de tela; sem ele, os três editores da aba seriam
    // "Editor content", em inglês
    ariaLabel: "Código",
    tabCompletion: "on",
    // A margem dos pontos de parada e da seta da linha em que a depuração parou: só na
    // depuração avançada (veja o `executionAdvancedDebugging`)
    glyphMargin: false,
    readOnlyMessage: { value: "O código não pode ser editado durante a depuração." },
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
   * O painel ocupa no máximo esta fração da altura do editor com o painel: a altura dele é em
   * px, e numa janela que diminuiu (ou com zoom) ele tomaria o lugar do código inteiro.
   */
  private readonly maxPanelShare = 0.6;

  private panelFit?: ResizeObserver;

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
   * A aba Variáveis, que sabe a chamada escolhida: a informação do editor mostra o valor das
   * variáveis dela.
   */
  private readonly debugVariables = viewChild(DebugVariablesComponent);

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
   * parte porque os tipos do `monaco` do ngx-monaco-editor são mais antigos que o
   * Monaco em uso e não conhecem o `stickyScroll`.
   */
  private readonly saidaSemBlocos = { stickyScroll: { enabled: false }, folding: false };

  stdOutEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    ariaLabel: "Saída do programa",
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
    ariaLabel: "Código JavaScript gerado",
    language: "swift",
    guides: { indentation: true },
  };

  sharing = false;

  hasSaveFilePickerSupport = "showSaveFilePicker" in window;

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

  /**
   * Quando a altura muda (a janela, o zoom, o teclado virtual), o painel aberto encolhe se
   * passar do máximo. Um painel arrastado não muda a altura do `split`, então não é afetado.
   */
  private keepPanelFit() {
    const element = this.split().nativeElement;

    this.panelFit = new ResizeObserver(() => {
      const max = this.maxPanelSize();

      if (max !== null && !this.outputCollapsed && this.outputSize > max) {
        this.zone.run(() => {
          this.outputSize = max;
        });
      }
    });

    this.panelFit.observe(element);
  }

  /**
   * A maior altura do painel na altura atual, ou `null` se a aba está escondida (altura zero).
   */
  private maxPanelSize() {
    const height = this.split().nativeElement.clientHeight;

    return height > 0 ? Math.max(Math.round(height * this.maxPanelShare), this.panelHeaderHeight + 2) : null;
  }

  constructor() {
    // O `split` só existe depois da primeira renderização.
    afterNextRender(() => {
      this.openPanelOnFirstLayout();
      this.keepPanelFit();
    });

    // O Ctrl+Shift+Enter do Verificar só vale no editor depois que o exercício carrega
    effect(() => {
      const isExercise = this.exercise() !== null;

      for (const key of this.exerciseContextKeys) {
        key.set(isExercise);
      }
    });

    // O código aprovado é conferido de novo quando a aba aparece pela primeira vez, não ao
    // abrir o IDE: as abas restauradas que ficam escondidas não gastam o processador
    effect(() => {
      const exercise = this.exercise();

      if (exercise && !this.exerciseCopy() && this.isActive() && !this.recheckAbort) {
        untracked(() => {
          void this.recheckExercise(exercise);
        });
      }
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
    this.setCode(this.workspace.contentsOf(this.tabId()));
    const tab = this.workspace.tabs().find(item => item.id === this.tabId());

    this.exerciseId = tab?.exerciseId;
    this.exerciseCopy.set(tab?.exerciseCopy === true);
    void this.loadExercise();
    this.followStoredDraft();

    this._stdOut$ = this.executor.stdOut$.subscribe(() => {
      if (this.outputAutoScroll) {
        this.stdOutEditorCursorEnd();
      }
    });

    // Mesmo sem rolar sozinha, a saída vai para o fim quando o programa espera
    // uma entrada: é com o foco nela que o que se digita chega ao `leia`.
    this._stdOut$.add(
      this.executor.waitingForInput$.subscribe(waiting => {
        this.updateDebugContextKeys();

        if (waiting) {
          // Na depuração, a próxima pausa volta para as variáveis, se era nelas que o painel estava
          if (this.debugging && this.panelView() === "variables") {
            this.returnToVariables = true;
          }

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
            // Como a execução terminou e quanto durou, em segundos (o tempo inclui a espera
            // pelo que a pessoa digita)
            const outcome = event.stopped ? "parado" : this.runFailed ? "erro" : "ok";

            // O `value` vai nas opções: o `event` do ngx-google-analytics descarta o 0. Uma
            // depuração conta à parte, porque o tempo inclui as pausas, e leva quantos passos
            // foram dados (cada passo não vira um evento: seriam centenas numa depuração)
            const debug = this.debugging;

            this.gaService.event(
              debug ? "debug_finish" : "execution_finish",
              debug ? "Depuração" : "Execução",
              outcome,
              undefined,
              undefined,
              { value: Math.round(event.time / 1000), ...(debug && this.debugFinishParams()) },
            );

            if (debug) {
              this.showDebugEnd(event.stopped);
            }

            this.endDebugging();

            // Um programa que acaba sozinho com o foco no Parar: o foco vai para a saída, como
            // no Parar, ou para o Executar
            // (o Parar emite o fim na hora, dentro do `stopCode`, que já cuida do foco)
            if (!debug && !event.stopped && this.stopButtonFocused()) {
              this.leaveStopButton(this.stdOutEditorCursorEnd());
            }

            const rendererModal = this.graphicsRendererModal;

            if (rendererModal) {
              this.graphicsRendererModal = null;
              rendererModal.close();
            }

            break;
          }

          case "error": {
            this.runFailed = true;
            // "Erro na linha 14: Foi efetuada uma divisão por zero.", só com a primeira linha
            // da mensagem, que pode seguir com explicações e exemplos
            const where = event.position ? `Erro na linha ${event.position.line}` : "Erro";

            this.lastErrorAnnouncement = `${where}: ${event.error.message.split("\n", 1)[0]}`;

            if (event.position) {
              this.showErrorLine(event.position.line, event.error.message);
            }

            // Como o `debug_finish`, um erro durante a depuração conta à parte da execução normal
            this.gaService.event(
              this.debugging ? "debug_error" : "execution_error",
              this.debugging ? "Depuração" : "Execução",
              this.errorLabel(event.error.message),
            );
            break;
          }

          case "parseError": {
            // O código do Portugol Studio do primeiro erro; erros de sintaxe não têm código
            this.gaService.event(
              "execution_compile_error",
              "Execução",
              event.errors[0]?.code ?? "sintaxe",
              event.errors.length,
            );

            // Sem o programa, a depuração que começou não recebe o fim
            this.endDebugging();

            break;
          }

          case "message": {
            this.handlePortugolMessage(event.message).catch(console.error);
            break;
          }

          case "paused": {
            this.onDebugPause(event.pause);
            break;
          }

          default: {
            break;
          }
        }
      },

      error: error => {
        // Só o tipo do erro: a mensagem pode trazer partes do código
        this.gaService.event(
          "execution_runner_error",
          "Execução",
          error instanceof Error ? error.name : "desconhecido",
        );

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
        ariaLabel: editorAriaLabel("Código", options.accessibilitySupport),
        // No celular, o minimapa cobriria o fim das linhas de código.
        minimap: { enabled: options.minimap?.enabled === true && !this.isBelowSm() },
      };

      this.generatedCodeEditorOptions = {
        ...this.generatedCodeEditorOptions,
        fontSize: options.fontSize,
        wordWrap: options.wordWrap,
        accessibilitySupport: options.accessibilitySupport,
        ariaLabel: editorAriaLabel("Código JavaScript gerado", options.accessibilitySupport),
      };
    });

    // O modo para leitores de tela vale para a saída também: é nela que o `leia` recebe o que se
    // digita. Só ele: as outras configurações do editor não mexem na saída
    this._settings$.add(
      this.settingsService.accessibilitySupport().subscribe(accessibilitySupport => {
        this.stdOutEditorOptions = {
          ...this.stdOutEditorOptions,
          accessibilitySupport,
          ariaLabel: editorAriaLabel("Saída do programa", accessibilitySupport),
        };
      }),
    );

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

    this._settings$.add(
      this.settingsService.observe(settings.executionAdvancedDebugging).subscribe(advanced => {
        this.advancedDebugging = advanced;
        // A margem tem a largura de uma linha e não diminui: em troca, a coluna dos números
        // reserva espaço para 3 algarismos, e não 5, e o código não sai do lugar ao trocar
        this.codeEditorOptions = {
          ...this.codeEditorOptions,
          glyphMargin: advanced,
          lineNumbersMinChars: advanced ? 3 : 5,
        };

        // A seta da linha pausada muda de lugar junto com a margem
        const pause = this.debugPause();

        if (pause) {
          this.showCurrentLine(pause.line);
        }

        // Sem a depuração avançada, os pontos de parada nem aparecem: não podem continuar
        // valendo escondidos
        if (!advanced) {
          this.clearBreakpoints();

          // Continuando até um ponto de parada, o programa iria até o fim: a depuração simples
          // não tem o Pausar. Ele pausa no próximo comando, e segue com o Próximo passo
          if (this.debugging && !this.paused()) {
            this.executor.debug({ type: "pause" });
          }
        } else if (this.debugging) {
          // A barra flutuante aparece no meio da depuração, talvez fora do editor
          afterNextRender(
            () => {
              this.fitDebugToolbar();
            },
            { injector: this.injector },
          );
        }
      }),
    );

    // A barra pode ser movida em outra aba
    this._settings$.add(
      this.settingsService.observe(settings.debugToolbarPosition).subscribe(position => {
        this.savedToolbarPosition = position;
        this.debugToolbarPosition.set(position);
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
    this.closing = true;

    if (this.debugModel) {
      this.monacoService.setDebugState(this.debugModel, null);
    }

    this.checkAbort?.abort();
    this.recheckAbort?.abort();
    this.flushDraft();
    this.firstLayout?.disconnect();
    this.panelFit?.disconnect();
    this.debugToolbarFit?.disconnect();
    clearTimeout(this.longStepTimer);
    this.executor.stop();
    this.transpileAbort?.abort();
    this._code$?.unsubscribe();
    this._events$?.unsubscribe();
    this._stdOut$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._settings$?.unsubscribe();
  }

  /**
   * A mensagem do erro sem nada do programa, para os erros iguais serem contados juntos e
   * nada do que foi digitado sair do navegador: textos entre aspas (menos os nomes de
   * tipos, como 'cadeia'), valores entre parênteses, o nome depois de dois-pontos no fim
   * (como em "Função não declarada: calcular") e números. O Analytics guarda até 100
   * caracteres.
   */
  private errorLabel(message: string) {
    const typeNames = new Set(["inteiro", "real", "cadeia", "caracter", "logico", "vazio"]);

    return message
      .replaceAll(/'([^']*)'/g, (quoted, content: string) => (typeNames.has(content) ? quoted : "'…'"))
      .replaceAll(/"[^"]*"/g, '"…"')
      .replaceAll(/\([^)]*\)/g, "(…)")
      .replace(/:\s*\S+$/, ": …")
      .replaceAll(/\d+(?:[.,]\d+)?/g, "N")
      .trim()
      .slice(0, 100);
  }

  /**
   * Com `debug`, executa passo a passo: o programa para nos pontos de parada ou, sem
   * nenhum, no primeiro comando.
   */
  async runCode(origin: EditorOrigin, debug = false) {
    if (debug) {
      // Qual depuração as pessoas usam, e se começam já com pontos de parada
      this.gaService.event("editor_start_debug", "Editor", origin, undefined, undefined, {
        mode: this.debugMode(),
        breakpoints: this.breakpointLines().length,
      });
    } else {
      this.gaService.event("editor_start_execution", "Editor", origin);
    }
    this.runFailed = false;
    this.lastErrorAnnouncement = null;
    this.clearErrorLine();
    this.showPanel(debug ? "variables" : "output");
    // O que ficou no campo de toque de uma execução interrompida não pode
    // virar a resposta do próximo `leia`.
    this.programInput = "";
    setExtra("code", this.code);

    this.transpiling = true;

    const abort = new AbortController();

    this.transpileAbort = abort;

    let result;

    try {
      result = await this.worker.transpileCode(this.code, { debugSteps: debug, signal: abort.signal });
    } catch (error) {
      // O Parar durante a transpilação: não é um erro
      if (abort.signal.aborted) {
        return;
      }

      captureException(error, {
        tags: { transpile: true },
        extra: { code: this.code },
      });

      // O worker caiu no meio (falta de memória, por exemplo): o navegador suporta Web Workers,
      // e outras abas com uma transpilação pendente recebem o mesmo erro
      if (error instanceof Error && error.name === WORKER_CRASH_ERROR) {
        this.toast.error("O processo que prepara o programa para executar parou.", { duration: 5000 });
        return;
      }

      alert(
        "Ocorreu um erro ao transpilar o código, possivelmente o seu navegador não suporta Web Workers. Por favor, tente novamente em outro navegador. Caso o erro persista, acesse https://github.com/dgadelha/Portugol-Webstudio/issues/new/choose",
      );

      alert(error);
    } finally {
      this.transpiling = false;
      this.transpileAbort = undefined;
    }

    if (result) {
      // A checagem ao vivo é debounced: quem edita e roda em menos de 500ms veria as marcas
      // do código anterior. Estas vêm do mesmo `checkCode` que decidiu se ia executar.
      this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));

      // Com erro de compilação o programa não executa: a lista de Problemas, que leva até cada
      // erro, é mais útil que a saída.
      if (this.worker.hasCompileErrors(result)) {
        this.showPanel("problems");
      } else if (debug) {
        this.startDebugging();
        this.showAdvancedDebuggingTip();
      }

      this.executor.runTranspiled(result, debug ? { debug: { breakpoints: this.breakpointLines() } } : {});
    }
  }

  /**
   * Pelo botão Parar, ou ao fechar a janela de gráficos (pelo botão dela ou com Esc).
   */
  stopCode(origin: "editor" | "janela_graficos" | "atalho") {
    // O Parar da barra de ações fica desativado: o foco que estava nele vai para o Executar,
    // quando a saída não o recebe, e não se perde. Na depuração, quem cuida é o fim dela
    const stopFocused = this.stopButtonFocused();

    // O Parar (e o Shift+F5) também interrompe a correção de um exercício
    if (this.checking()) {
      this.stopExerciseCheck();

      if (stopFocused) {
        focusAfterRender(this.injector, () => this.rovingTarget(".activity-button", ".run-button"));
      }

      return;
    }

    this.gaService.event("editor_stop_execution", "Editor", origin);

    // O fim da depuração já cuida do foco (e o anuncia): a saída só rola até o fim
    const wasDebugging = this.debugging;

    this.executor.stop();

    if (this.transpiling) {
      this.transpileAbort?.abort();
      this.transpiling = false;
    }

    const outputFocused = this.stdOutEditorCursorEnd(!wasDebugging);

    if (stopFocused && !wasDebugging) {
      this.leaveStopButton(outputFocused);
    }
  }

  /**
   * Tira o foco do Parar da barra de ações, que fica desativado: ele vai para o Executar, se a
   * saída não o recebeu. Mesmo com o foco na saída, o Tab volta para a barra pelo Executar.
   */
  private leaveStopButton(outputFocused: boolean) {
    const runButton = this.rovingTarget(".activity-button", ".run-button");

    if (!outputFocused) {
      focusAfterRender(this.injector, () => runButton);
    }
  }

  /**
   * Os atalhos da aba de código quando o foco não está no editor, que tem os
   * mesmos atalhos (em `initShortcuts`) e consome o evento antes daqui.
   */
  onShortcut(event: KeyboardEvent) {
    if (!this.isActive()) {
      return;
    }

    const shortcut = atalhoDoEvento(event);

    // O F1 e o Ctrl+O valem em qualquer aba: ficam no `AppComponent`
    switch (shortcut) {
      case "ctrl+s": {
        event.preventDefault();
        this.saveFromEditor("atalho");
        break;
      }

      case "ctrl+enter": {
        event.preventDefault();

        if (this.canRun()) {
          void this.runCode("atalho");
        }

        break;
      }

      // Só numa aba de exercício: nas outras, a tecla fica com quem a recebeu
      case "ctrl+shift+enter": {
        if (this.exercise()) {
          event.preventDefault();
          void this.verifyExercise();
        }

        break;
      }

      // No Chrome, o Shift+F5 também recarrega a página sem o cache: sem programa para
      // parar, fica com o navegador
      case "shift+f5": {
        if (this.canStop()) {
          event.preventDefault();
          this.stopCode("atalho");
        }

        break;
      }

      case "alt+p":
      case "alt+j":
      case "alt+r":
      case "alt+c":
      case "alt+m": {
        event.preventDefault();
        this.onDebugShortcut(shortcut);
        break;
      }

      default:
    }
  }

  async handlePortugolMessage(message: PortugolMessage) {
    if (message.type.startsWith("graphics.")) {
      await this.graphicsRenderer.handleRendererMessage(message);
    }
  }

  openRendererModal(): IGraphicsRendererComponent | null {
    this.gaService.event("editor_open_renderer", "Editor", "Abrir modal de renderização");
    const titleId = `janela-graficos-titulo-${this.tabId()}`;

    const modal = this.dialog.open<RendererDialogResult, unknown, DialogRendererComponent>(DialogRendererComponent, {
      ariaLabelledBy: titleId,
      data: { titleId },
      panelClass: "pws-renderer-dialog",
      modeless: true,
    });

    this.graphicsRendererModal = modal;

    modal.closed.subscribe(result => {
      this.graphicsRenderer.destroy();

      // Só a janela atual: depois de um `encerrar_modo_grafico`, o programa pode abrir outra.
      if (this.graphicsRendererModal === modal) {
        this.graphicsRendererModal = null;

        // Sem resultado é o Esc, que também encerra o programa.
        if (result?.stopProgram !== false) {
          this.stopCode("janela_graficos");
        }
      }
    });

    return modal.componentInstance;
  }

  onCodeChange(contents: string) {
    // O editor também avisa quando recebe o código da própria aba (ao abrir, no Recomeçar, ou
    // vindo de outra janela): só uma mudança no texto é uma edição
    const edited = contents !== this.code;

    this.setCode(contents);

    if (edited && this.exerciseId && !this.exerciseCopy()) {
      clearTimeout(this.draftTimer);
      this.draftTimer = setTimeout(() => {
        this.flushDraft();
      }, 500);
    }
  }

  /**
   * Grava a edição que esperava a pausa. O código de um exercício fica com o progresso: abrir o
   * exercício de novo o traz de volta, mesmo que a aba não volte com a página. Só uma edição
   * grava, então uma aba que não foi mexida não passa por cima do código de outra janela. Roda
   * também quando a aba fecha, a página some ou a janela perde o foco, para nada ficar pendente.
   */
  protected flushDraft() {
    if (this.draftTimer === undefined) {
      return;
    }

    clearTimeout(this.draftTimer);
    this.draftTimer = undefined;

    // Mesmo sem o exercício carregado: a aba fecha sem confirmar, e o código não pode se perder
    const exerciseId = this.exerciseId;

    if (!exerciseId || this.exerciseCopy()) {
      return;
    }

    // Outra aba passou a ser a do exercício (o Usar no meu exercício de uma cópia): esta, que
    // está fechando, não grava por cima
    const owner = this.workspace.exerciseTab(exerciseId);

    if (!owner || owner.id === this.tabId()) {
      this.exercises.saveDraft(exerciseId, this.code);
    }
  }

  /**
   * Outra janela editou o mesmo exercício: a aba do exercício passa a mostrar o código gravado,
   * a não ser que tenha uma edição sua ainda por gravar (ela grava em seguida, e a última
   * edição vale). Receber o código não é uma edição, então as janelas não ficam gravando o
   * código uma da outra.
   */
  private followStoredDraft() {
    const exerciseId = this.exerciseId;

    if (!exerciseId) {
      return;
    }

    const stored = this.exercises.progress()[exerciseId]?.código;

    // Toda edição é gravada, então o rascunho gravado é o código mais novo: uma aba restaurada
    // com outro código (de uma janela fechada antes) começa por ele
    if (stored !== undefined && stored !== this.code && !this.exerciseCopy()) {
      this.setCode(stored);
    }

    // Sem rascunho gravado, a aba mostra o código inicial: o primeiro rascunho de outra janela
    // também vale para ela
    this.knownDraft = stored ?? this.code;

    effect(
      () => {
        this.exercises.progress();

        untracked(() => {
          this.syncStoredDraft();
        });
      },
      { injector: this.injector },
    );

    // Trocar de aba na mesma janela também grava na hora o que estava pendente
    effect(
      () => {
        if (!this.isActive()) {
          untracked(() => {
            this.flushDraft();
          });
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Confere se outra janela gravou um rascunho novo e, se esta aba não tem edição sua por gravar,
   * passa a mostrá-lo. Pelo que a aba mostra, não pelo foco: quem acabou de trocar de janela
   * ainda recebe a última gravação da janela que deixou. A aba que mostra outro código foi
   * editada.
   */
  private syncStoredDraft() {
    const exerciseId = this.exerciseId;
    const stored = exerciseId ? this.exercises.progress()[exerciseId]?.código : undefined;
    const previous = this.knownDraft;

    // Durante a depuração o editor não aceita edições, e os passos apontam para o código que
    // está nele: o rascunho novo fica para quando ela acabar
    if (stored === undefined || stored === previous || this.debugging) {
      return;
    }

    this.knownDraft = stored;

    if (this.draftTimer === undefined && this.code === previous && !this.exerciseCopy()) {
      this.loadStoredDraft(stored);
    }
  }

  /**
   * Põe no editor o código gravado por outra janela como uma edição, que o Ctrl+Z desfaz, e
   * mantém o cursor onde estava. O resultado do último Verificar era de outro código.
   */
  private loadStoredDraft(code: string) {
    // Antes da edição: o editor avisa a mudança, e o mesmo código não conta como edição
    this.setCode(code);
    this.checkOutcome.set(null);

    const selections = this.codeEditor?.getSelections();
    const replaced = this.replaceEditorText("rascunho-de-outra-janela", code);

    if (selections && replaced) {
      this.codeEditor?.setSelections(selections);
    }
  }

  /**
   * O código da aba: o campo, o sinal de quem depende dele e o conteúdo gravado na área de
   * trabalho, sempre juntos.
   */
  private setCode(code: string) {
    this.code = code;
    this.editorCode.set(code);

    if (this.workspace.contentsOf(this.tabId()) !== code) {
      this.workspace.setContents(this.tabId(), code);
    }
  }

  /**
   * Troca todo o texto do editor por uma edição entre paradas do desfazer: o Ctrl+Z volta ao
   * texto anterior, e o `ngModel` recebe a mudança pelo editor, sem o `setValue` que apagaria o
   * histórico. Devolve se o editor existe para receber a edição.
   */
  private replaceEditorText(source: string, text: string) {
    const editor = this.codeEditor;
    const model = editor?.getModel();

    if (!editor || !model) {
      return false;
    }

    editor.pushUndoStop();
    editor.executeEdits(source, [{ range: model.getFullModelRange(), text }]);
    editor.pushUndoStop();

    return true;
  }

  /**
   * O Reverter alterações, no enunciado: o código aprovado volta para o editor como
   * uma edição (o Ctrl+Z desfaz, e o rascunho é gravado). O foco vai para o editor, porque o
   * botão some quando o código volta a ser o que passou. O resultado do último Verificar era de
   * outro código.
   */
  protected restoreApprovedCode() {
    const exercise = this.exercise();
    const approved = exercise ? this.exercises.progress()[exercise.id]?.aprovado : undefined;

    if (!exercise || !approved || !this.canRun()) {
      return;
    }

    const replaced = this.replaceEditorText("codigo-aprovado", approved.código);

    if (!replaced) {
      return;
    }

    this.codeEditor?.setPosition({ lineNumber: 1, column: 1 });
    this.checkOutcome.set(null);
    this.codeEditor?.focus();
    void this.announcer.announce("O código que passou voltou para o editor.", "polite");
    this.gaService.event("exercise_restore_approved", "Exercícios", exerciseLabel(exercise.id));
  }

  /**
   * No celular, a página muitas vezes some sem `pagehide`: ficar escondida é a última chance
   * garantida de guardar o código.
   */
  protected onVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.flushDraft();
    }
  }

  /**
   * A conexão voltou: um exercício que não carregou tenta de novo sozinho.
   */
  protected onOnline() {
    if (this.exerciseFailed() === "network") {
      void this.loadExercise();
    }
  }

  /**
   * O botão Tentar de novo, quando o exercício não carregou.
   */
  retryExercise() {
    void this.loadExercise();
  }

  private async loadExercise() {
    const exerciseId = this.exerciseId;

    if (!exerciseId || this.loadingExercise()) {
      return;
    }

    let exercise: Exercício;

    this.loadingExercise.set(true);

    try {
      exercise = await this.exercises.load(exerciseId);
    } catch (error) {
      this.exerciseFailed.set(error instanceof ExerciseNotFoundError ? "missing" : "network");
      return;
    } finally {
      this.loadingExercise.set(false);
    }

    this.exerciseFailed.set(null);
    this.exercise.set(exercise);
  }

  /**
   * Os casos do exercício mudaram desde que ele passou: o código aprovado é conferido de novo.
   * Fechar a aba interrompe a conferência.
   */
  private async recheckExercise(exercise: Exercício) {
    const abort = new AbortController();

    this.recheckAbort = abort;

    const unapproved = await this.exercises.recheckIfChanged(exercise, abort.signal).catch((error: unknown) => {
      captureException(error, { tags: { exercise: exerciseLabel(exercise.id) } });
      return false;
    });

    if (unapproved) {
      this.toast.info(`O exercício "${exercise.título}" mudou, e o código que tinha passado não passa mais.`, {
        duration: 10_000,
        dismissible: true,
      });
    }
  }

  /**
   * O botão Verificar: confere o código em todos os casos do exercício.
   */
  async verifyExercise() {
    const exercise = this.exercise();

    if (!exercise || !this.canRun()) {
      return;
    }

    this.checkOutcome.set(null);
    this.checkProgress.set({ done: 0, total: casesToCheck(exercise).length });
    this.showPanel("check");
    // O botão vira Parar com o foco nele, e leitores de tela nem sempre anunciam a troca de nome
    void this.announcer.announce("Conferindo…", "polite");

    const abort = new AbortController();

    this.checkAbort = abort;

    let outcome: ExerciseCheckOutcome;

    try {
      outcome = await this.exercises.check(exercise, this.code, {
        record: !this.exerciseCopy(),
        signal: abort.signal,
        onCase: (_, done, total) => {
          this.checkProgress.set({ done, total });
        },
      });
    } catch (error) {
      captureException(error, { tags: { exercise: exerciseLabel(exercise.id) } });
      this.toast.error("Ocorreu um erro ao conferir o exercício.", { duration: 5000 });
      return;
    } finally {
      this.checkProgress.set(null);
      this.checkAbort = undefined;
    }

    // A aba fechou durante a correção: não há o que mostrar nem anunciar
    if (this.closing) {
      return;
    }

    this.checkOutcome.set(outcome);
    void this.announcer.announce(this.exercises.summary(outcome), "polite");

    this.gaService.event("exercise_check", "Exercícios", exerciseLabel(exercise.id), undefined, undefined, {
      outcome: outcome.type === "checked" ? (outcome.result.passed ? "aprovado" : "reprovado") : outcome.type,
    });
  }

  stopExerciseCheck() {
    this.checkAbort?.abort();
  }

  /**
   * O botão Recomeçar: o código volta ao inicial do exercício, depois de confirmar.
   */
  restartExercise() {
    const exercise = this.exercise();

    if (!exercise || this.exerciseCopy() || !this.canRun()) {
      return;
    }

    const ref = this.dialog.open<boolean>(DialogConfirmRestartExerciseComponent, {
      data: { title: exercise.título, done: this.exerciseDone() },
      width: "28rem",
      ariaLabelledBy: "dialogo-recomecar-exercicio-titulo",
      ariaDescribedBy: "dialogo-recomecar-exercicio-descricao",
    });

    ref.closed.subscribe(confirmed => {
      this.gaService.event(
        confirmed ? "exercise_restart" : "exercise_restart_cancel",
        "Exercícios",
        exerciseLabel(exercise.id),
      );

      if (confirmed) {
        const code = exercise.códigoInicial ?? defaultCode(this.settingsService.editorIndentation());

        this.setCode(code);
        this.codeEditor?.setValue(code);
        this.exercises.restart(exercise.id, code);
        this.checkOutcome.set(null);
        void this.announcer.announce("O código voltou a ser o código inicial.", "polite");
      }
    });
  }

  /**
   * O botão Usar no meu exercício, numa cópia: ela vira a aba do exercício, e o código dela,
   * o código do exercício, conferido em seguida. Se a aba do exercício estiver aberta, ela
   * fecha.
   */
  adoptExercise() {
    const exercise = this.exercise();

    // O código é conferido logo depois: com o programa executando, o Verificar não rodaria
    if (!exercise || !this.exerciseCopy() || !this.canRun()) {
      return;
    }

    const ownTab = this.workspace.exerciseTab(exercise.id);
    // Só avisa quando há o que perder: um código diferente do inicial e do desta aba
    const saved = this.exercises.progress()[exercise.id]?.código;
    const replacesCode =
      saved !== undefined && [exercise.códigoInicial ?? "", this.code].every(code => code.trim() !== saved.trim());
    const ref = this.dialog.open<boolean>(DialogConfirmAdoptExerciseComponent, {
      data: {
        title: exercise.título,
        closesTab: ownTab !== undefined,
        replacesCode,
        done: this.exercises.isDone(exercise.id),
      },
      width: "28rem",
      ariaLabelledBy: "dialogo-usar-exercicio-titulo",
      ariaDescribedBy: "dialogo-usar-exercicio-descricao",
    });

    ref.closed.subscribe(confirmed => {
      this.gaService.event(
        confirmed ? "exercise_adopt" : "exercise_adopt_cancel",
        "Exercícios",
        exerciseLabel(exercise.id),
      );

      if (!confirmed) {
        return;
      }

      // A aba antiga sai antes: ao ser destruída, ela vê que esta é a aba do exercício agora
      if (ownTab) {
        this.workspace.closeTab(ownTab.id);
      }

      this.workspace.adoptExerciseCopy(this.tabId(), exercise.título);
      this.exerciseCopy.set(false);
      // A aprovação era de outro código: este é conferido agora, e aprova se passar
      this.exercises.restart(exercise.id, this.code);
      this.checkOutcome.set(null);
      // O botão Usar no meu exercício, onde o foco voltou com o fim do diálogo, some: o foco vai
      // para o Verificar, que já confere o código
      focusAfterRender(this.injector, () => this.host.nativeElement.querySelector<HTMLElement>(".statement-verify"));
      void this.verifyExercise();
    });
  }

  /**
   * O código como vai para o arquivo ou para o link: num exercício, com o comentário que o
   * liga ao exercício no fim.
   */
  private codeToExport() {
    const exerciseId = this.exerciseId;

    return exerciseId ? this.exercises.addMarker(this.code, exerciseId) : this.code;
  }

  /**
   * ISO-8859-1 (o que o Portugol Studio abre) tem um byte por caractere, igual aos primeiros
   * 256 pontos do Unicode. O que não cabe nele vira `?`.
   */
  private encodeLatin1(text: string) {
    return Uint8Array.from(text, char => {
      const code = char.codePointAt(0)!;

      return code <= 0xff ? code : 0x3f;
    });
  }

  private prepareFile(as: "text" | "binary", compat = false) {
    const blob = (() => {
      if (compat) {
        return new Blob([this.encodeLatin1(this.codeToExport())], {
          type: `${as === "binary" ? "application/octet-stream" : "text/plain"}; charset=ISO-8859-1`,
        });
      }

      return new Blob([this.codeToExport()], {
        type: as === "binary" ? "application/octet-stream" : "text/plain",
      });
    })();

    let fileName = this.title();

    if (!fileName.endsWith(".por")) {
      fileName += ".por";
    }

    return { blob, fileName };
  }

  /**
   * O Salvar do editor, pelo botão ou pelo Ctrl+S. O "Baixar" do Salvar como também usa o
   * `saveFile`, mas tem o próprio evento.
   */
  saveFromEditor(origin: EditorOrigin) {
    this.gaService.event("editor_save_file", "Editor", origin);
    this.saveFile();
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

      this.gaService.event("editor_save_as_file_picker_result", "Editor", "ok");
      this.toast.success("Arquivo salvo com sucesso!", { duration: 3000 });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        this.gaService.event("editor_save_as_file_picker_result", "Editor", "cancelado");
        return;
      }

      this.gaService.event("editor_save_as_file_picker_result", "Editor", "erro");
      console.error(error);

      this.toast.error("Ocorreu um erro ao salvar o arquivo!", { duration: 5000 });
    }
  }

  onStdOutEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.initShortcuts(editor);
    this.stdOutEditor = editor;
    this.debuggingInOutput = editor.createContextKey("pwsDepurando", false);

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
    this.gaService.event("split_drag", "Divisores", "saida", undefined, undefined, { value: Math.round(size) });

    if (!this.outputCollapsed) {
      this.lastOpenOutputSize = size;
    }
  }

  /**
   * O código gerado está aberto. Fechado, ele fica fora da ordem do Tab: o foco cairia num
   * editor de largura zero, invisível.
   */
  readonly generatedCodeOpen = signal(false);

  /**
   * O código gerado fica escondido à direita do editor, atrás de um divisor de 1px: quem o
   * arrasta abre o JavaScript gerado. O valor é a largura do código gerado, em %.
   */
  onGeneratedCodeDragEnd({ sizes }: SplitGutterInteractionEvent) {
    const size = sizes[1];

    if (typeof size === "number") {
      this.generatedCodeOpen.set(size > 0);

      // 0 = o código gerado foi fechado de novo
      this.gaService.event("split_drag", "Divisores", "codigo_gerado", undefined, undefined, {
        value: Math.round(size),
      });
    }
  }

  expandOutput() {
    if (this.outputCollapsed) {
      const size = this.lastOpenOutputSize ?? Math.round(this.split().nativeElement.clientHeight * 0.3);
      const max = this.maxPanelSize();

      this.outputSize = max === null ? size : Math.min(size, max);
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
   * As abas "Saída" e "Problemas" do painel. O `showPanel` também é chamado ao executar,
   * e só o clique conta.
   */
  selectPanelTab(view: PanelView) {
    this.gaService.event("output_panel_tab", "Saída", view);
    this.showPanel(view);
  }

  /**
   * Pela barra de status: abre a lista de problemas e leva o foco até ela.
   */
  showProblems() {
    this.gaService.event("output_panel_tab", "Barra de status", "problems_barra_status");
    this.showPanel("problems");

    focusAfterRender(this.injector, () => this.panelTab(this.ids().problemsTab));
  }

  /**
   * As setas trocam entre Saída e Problemas, como no padrão de abas da
   * WAI-ARIA.
   */
  onPanelTabsKeydown(event: KeyboardEvent) {
    const tablist = (event.currentTarget as HTMLElement).closest<HTMLElement>("[role=tablist]");

    const tab = tablist ? moveRovingFocus(event, tablist, "[role=tab]", "horizontal") : null;

    if (tab) {
      tab.click();
      // Numa tela estreita as abas rolam para o lado: trocar de aba muda os botões do painel e a
      // largura da lista, então a aba escolhida é trazida à vista depois disso
      requestAnimationFrame(() => {
        tab.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }
  }

  /**
   * Uma das abas do painel desta aba de código, ou o conteúdo de uma delas, pelo id.
   */
  private panelTab(id: string) {
    return this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
  }

  canRun() {
    return !this.transpiling && !this.executor.running && !this.checking();
  }

  canStop() {
    return this.transpiling || this.executor.running || this.checking();
  }

  /**
   * Os botões de passo da barra flutuante da depuração avançada.
   */
  readonly stepButtons: Array<{
    type: Exclude<DebugResume, "continue">;
    label: string;
    shortcut: string;
    icon: string;
  }> = [
    { type: "step", label: "Próximo passo", shortcut: "Alt+P", icon: "assets/mdi/debug-step-into.svg" },
    { type: "stepOver", label: "Pular função", shortcut: "Alt+J", icon: "assets/mdi/debug-step-over.svg" },
    { type: "stepOut", label: "Sair da função", shortcut: "Alt+R", icon: "assets/mdi/debug-step-out.svg" },
  ];

  /**
   * Na depuração simples, como no Portugol Studio, o botão Depurar vira o Próximo passo.
   * É o mesmo botão, e não outro no lugar dele, para o foco do teclado continuar nele.
   */
  basicStepping() {
    return this.debugging && !this.advancedDebugging;
  }

  /**
   * O Depurar e o Alt+P: começa a depuração ou, com o programa pausado, dá o próximo
   * passo (na depuração avançada, o Próximo passo fica na barra flutuante).
   */
  onDebugButton(origin: EditorOrigin) {
    if (this.paused()) {
      this.resumeDebugging("step", origin);
    } else if (this.canRun()) {
      void this.runCode(origin, true);
    }
  }

  /**
   * Os atalhos da depuração, com o foco no editor ou fora dele.
   */
  private onDebugShortcut(shortcut: string) {
    if (shortcut === "alt+p") {
      this.onDebugButton("atalho");
      return;
    }

    // Os outros atalhos são da depuração avançada, como os botões deles
    if (!this.advancedDebugging) {
      return;
    }

    switch (shortcut) {
      case "alt+j": {
        this.resumeDebugging("stepOver", "atalho");
        break;
      }

      case "alt+r": {
        this.resumeDebugging("stepOut", "atalho");
        break;
      }

      case "alt+c": {
        if (this.paused()) {
          this.resumeDebugging("continue", "atalho");
        } else {
          this.pauseDebugging("atalho");
        }

        break;
      }

      case "alt+m": {
        const line = this.codeEditor?.getPosition()?.lineNumber;

        if (line) {
          this.toggleBreakpoint(line, "atalho");
        }

        break;
      }

      default:
    }
  }

  private startDebugging() {
    this.debugging = true;
    this.debugCounts = this.emptyDebugCounts();

    // A posição guardada pode ser de uma tela maior: a barra volta para dentro do editor, e
    // continua dentro quando ele muda de tamanho (celular girado, janela menor, o código gerado
    // aberto ao lado)
    afterNextRender(
      () => {
        this.fitDebugToolbar();

        const area = this.host.nativeElement.querySelector(".code-editor-area");

        if (area) {
          this.debugToolbarFit = new ResizeObserver(() => {
            // A depuração pode ter terminado antes da primeira renderização
            if (!this.debugging) {
              this.debugToolbarFit?.disconnect();
              return;
            }

            this.fitDebugToolbar();
          });
          this.debugToolbarFit.observe(area);
        }
      },
      { injector: this.injector },
    );

    this.updateDebugContextKeys();
    this.lastDebugPause = null;
    this.previousDebugPause.set(null);
    this.debugPause.set(null);
    this.codeEditorOptions = { ...this.codeEditorOptions, readOnly: true };
  }

  private endDebugging() {
    if (!this.debugging) {
      return;
    }

    // A barra flutuante some com o fim da depuração, e o Parar da barra de ações fica
    // desativado: o foco que estava num deles vai para o Depurar da barra de ações, e não se perde
    const host = this.host.nativeElement;

    if (host.querySelector(".debug-toolbar")?.contains(document.activeElement) || this.stopButtonFocused()) {
      focusAfterRender(this.injector, () => this.rovingTarget(".activity-button", ".debug-button"));
    }

    this.debugging = false;
    clearTimeout(this.longStepTimer);
    this.stepInFlight.set(false);
    this.debugToolbarFit?.disconnect();
    this.debugToolbarFit = undefined;
    this.updateDebugContextKeys();
    this.returnToVariables = false;
    this.paused.set(false);
    this.lastDebugPause = null;
    this.previousDebugPause.set(null);
    this.debugPause.set(null);
    this.clearCurrentLine();
    this.hideEditorHover();
    this.codeEditorOptions = { ...this.codeEditorOptions, readOnly: false };

    // Um rascunho de outra janela que chegou durante a depuração, depois que o editor volta a
    // aceitar edições. A depuração também acaba quando a aba fecha, e aí não há o que mostrar
    if (this.closing) {
      return;
    }

    afterNextRender(
      () => {
        this.syncStoredDraft();
      },
      { injector: this.injector },
    );
  }

  private onDebugPause(pause: DebugPause) {
    const previous = this.lastDebugPause;

    this.lastDebugPause = pause;
    this.previousDebugPause.set(previous);
    this.debugPause.set(pause);
    this.paused.set(true);

    if (this.returnToVariables) {
      this.returnToVariables = false;

      // Quem digitou a entrada está com o foco na saída, que vai sumir: o foco vai para a
      // aba Variáveis, e não se perde
      const outputFocused = this.panelTab(this.ids().outputPanel)?.contains(document.activeElement);

      this.showPanel("variables");

      if (outputFocused) {
        this.panelTab(this.ids().variablesTab)?.focus();
      }
    }

    this.showCurrentLine(pause.line);
    this.codeEditor?.revealLineInCenterIfOutsideViewport(pause.line);
    clearTimeout(this.longStepTimer);
    this.stepInFlight.set(false);

    // Uma pausa numa aba que não está à vista (com o Continuar, a pessoa pode ter trocado
    // de aba) não interrompe o que ela estiver ouvindo
    if (this.isActive()) {
      void this.announcer.announce(this.pauseAnnouncement(pause, previous), "polite");
    }
  }

  /**
   * Com o programa pausado, a pausa e a chamada escolhida na aba Variáveis. Durante um passo, a
   * pausa que a aba ainda mostra já não vale.
   */
  private debugHoverState(): DebugHoverState | null {
    const pause = this.debugPause();

    return pause && this.paused() ? { pause, frame: this.debugVariables()?.selectedFrame() ?? 0 } : null;
  }

  /**
   * A informação aberta no editor pode ter o valor de uma variável, que deixa de valer quando o
   * programa segue. Focada, pelo teclado, ela não fecharia sozinha; fechada, o Monaco devolve o
   * foco para o código.
   */
  private hideEditorHover() {
    this.codeEditor?.trigger("depuração", "editor.action.hideHover", null);
  }

  private emptyDebugCounts(): Record<DebugResume | "pause", number> {
    return { step: 0, stepOver: 0, stepOut: 0, continue: 0, pause: 0 };
  }

  private debugMode() {
    return this.advancedDebugging ? "avancada" : "simples";
  }

  /**
   * Os parâmetros do `debug_finish`: a depuração usada e quantas vezes cada botão foi usado.
   */
  private debugFinishParams() {
    return {
      mode: this.debugMode(),
      steps: this.debugCounts.step,
      step_overs: this.debugCounts.stepOver,
      step_outs: this.debugCounts.stepOut,
      continues: this.debugCounts.continue,
      pauses: this.debugCounts.pause,
      breakpoints: this.breakpointLines().length,
    };
  }

  /**
   * Os atalhos da depuração com o Option, no Mac: no código, durante toda a depuração; na
   * saída, menos esperando um `leia`.
   */
  private updateDebugContextKeys() {
    this.debuggingInEditor?.set(this.debugging);
    this.debuggingInOutput?.set(this.debugging && !this.executor.waitingForInput);
  }

  /**
   * O fim de uma depuração, que senão passaria em silêncio: o painel sai das variáveis, que
   * ficam vazias, para a saída, com o fim do programa ou o erro, e o leitor de tela anuncia.
   */
  private showDebugEnd(stopped: boolean) {
    if (this.panelView() === "variables") {
      const focusInPanel = [this.ids().variablesPanel, this.ids().variablesTab].some(id =>
        this.panelTab(id)?.contains(document.activeElement),
      );

      this.showPanel("output");

      if (focusInPanel) {
        focusAfterRender(this.injector, () => this.panelTab(this.ids().outputTab));
      }
    }

    if (this.isActive()) {
      const message = stopped
        ? "Programa interrompido."
        : this.runFailed
          ? (this.lastErrorAnnouncement ?? "Erro.")
          : "Programa finalizado.";

      void this.announcer.announce(message, "polite");
    }
  }

  /**
   * Um item de um grupo com foco itinerante, que passa a ser o da ordem do Tab, como se a
   * pessoa tivesse chegado nele pelas setas.
   */
  private rovingTarget(itemSelector: string, targetSelector: string) {
    const host = this.host.nativeElement;
    const target = host.querySelector<HTMLElement>(targetSelector);

    for (const item of host.querySelectorAll<HTMLElement>(itemSelector)) {
      item.tabIndex = item === target ? 0 : -1;
    }

    return target;
  }

  /**
   * Se o foco está no Parar da barra de ações, que fica desativado quando o programa acaba.
   */
  private stopButtonFocused() {
    const stopButton = this.host.nativeElement.querySelector(".stop-button");

    return stopButton !== null && stopButton === document.activeElement;
  }

  /**
   * Dois cliques na alça, ou o Enter com o foco nela, levam a barra flutuante de volta ao
   * lugar inicial, no alto do editor: uma alternativa a arrastar.
   */
  resetDebugToolbar() {
    const position = { x: 0, y: 0 };

    this.savedToolbarPosition = position;
    this.debugToolbarPosition.set(position);
    this.storage.store(settings.debugToolbarPosition.key, position);
    this.gaService.event("debug_toolbar_move", "Depuração", "lugar_inicial");
  }

  onDebugToolbarMoved(event: CdkDragEnd) {
    const position = event.source.getFreeDragPosition();

    this.savedToolbarPosition = position;
    this.debugToolbarPosition.set(position);
    this.storage.store(settings.debugToolbarPosition.key, position);
    this.gaService.event("debug_toolbar_move", "Depuração", "arrastar");
  }

  /**
   * Traz a barra flutuante para dentro do editor, se ela tiver ficado de fora.
   */
  private fitDebugToolbar() {
    const toolbar = this.host.nativeElement.querySelector<HTMLElement>(".debug-toolbar");
    const area = toolbar?.closest<HTMLElement>(".code-editor-area");

    if (!toolbar || !area) {
      return;
    }

    // Onde a barra ficaria na posição guardada, a partir de onde ela está agora
    const shown = this.debugToolbarPosition();
    let { x, y } = this.savedToolbarPosition;
    const rect = toolbar.getBoundingClientRect();
    const bar = {
      left: rect.left + x - shown.x,
      right: rect.right + x - shown.x,
      top: rect.top + y - shown.y,
      bottom: rect.bottom + y - shown.y,
    };
    const limits = area.getBoundingClientRect();

    x += Math.max(0, limits.left - bar.left) - Math.max(0, bar.right - limits.right);
    y += Math.max(0, limits.top - bar.top) - Math.max(0, bar.bottom - limits.bottom);

    this.debugToolbarPosition.set({ x, y });
  }

  /**
   * O que um leitor de tela fala a cada pausa: a linha, a função quando ela muda, e o que
   * mudou nas variáveis, como "Linha 12. x passou de 4 para 5". O selo "Pausado na linha"
   * do painel fica escondido dos leitores de tela, para a linha não ser lida duas vezes.
   */
  private pauseAnnouncement(pause: DebugPause, previous: DebugPause | null) {
    const parts = [`Linha ${pause.line}`];
    const frame = pause.frames[0];

    // Uma chamada nova, mesmo da mesma função (como na recursão ou entre duas pausas do
    // Continuar), diz a função
    if (frame && previous?.frames[0]?.id !== frame.id) {
      parts.push(`na função ${frame.name}`);
    }

    const changes = [
      ...variableChanges(frame?.variables ?? [], previousFrameVariables(pause, previous, 0)),
      ...variableChanges(pause.globals, previous?.globals ?? null),
    ].flatMap(change => describeChange(change));

    const described = changes.slice(0, 3);
    const more = changes.length - 3;

    if (more > 0) {
      described.push(`e mais ${more} ${more === 1 ? "mudança" : "mudanças"}`);
    }

    return [parts.join(", "), ...described].join(". ") + ".";
  }

  resumeDebugging(type: DebugResume, origin: EditorOrigin) {
    if (!this.paused()) {
      return;
    }

    this.debugCounts[type]++;

    // Os passos só contam no `debug_finish`; o Continuar, bem mais raro, vira um evento
    if (type === "continue") {
      this.gaService.event("debug_continue", "Depuração", origin);
    }

    this.paused.set(false);
    this.stepInFlight.set(type !== "continue");
    this.hideEditorHover();

    // Um passo que demora (pular uma função com um laço longo) volta a mostrar o "Executando",
    // senão a depuração pareceria travada
    clearTimeout(this.longStepTimer);

    if (type !== "continue") {
      this.longStepTimer = setTimeout(() => {
        this.stepInFlight.set(false);
      }, LONG_STEP_DELAY);
    }

    // Continuando, o programa pode demorar até a próxima pausa: a linha e as variáveis
    // de agora não valem mais. Num passo, ficam até a próxima pausa, sem piscar.
    if (type === "continue") {
      this.debugPause.set(null);
      this.clearCurrentLine();
    }

    this.executor.debug({ type });
  }

  pauseDebugging(origin: EditorOrigin) {
    // Esperando um `leia`, o programa não chega ao próximo comando até a entrada: o Pausar
    // fica desativado, e o atalho também não vale
    if (!this.debugging || this.paused() || this.executor.waitingForInput) {
      return;
    }

    this.debugCounts.pause++;
    this.gaService.event("debug_pause", "Depuração", origin);
    this.executor.debug({ type: "pause" });
  }

  /**
   * Destaca a linha em que o programa parou, com a seta na margem. Num ponto de parada, a
   * seta fica por cima da bolinha, que senão sumiria: por isso, ao marcar ou desmarcar um
   * ponto de parada com o programa pausado, a linha é desenhada de novo.
   */
  private showCurrentLine(line: number) {
    const options: LineDecorationOptions = {
      isWholeLine: true,
      className: "debug-current-line",
      // Sem a margem (fora da depuração avançada), a seta fica no espaço vazio à esquerda do
      // número da linha, que só sobra até a linha 999: depois, fica só o número destacado
      lineNumberClassName:
        this.advancedDebugging || line >= 1000
          ? "debug-current-line-number"
          : "debug-current-line-number debug-current-line-arrow",
      glyphMarginClassName: this.breakpointLines().includes(line)
        ? "debug-current-glyph debug-breakpoint-glyph"
        : "debug-current-glyph",
      glyphMarginHoverMessage: { value: "O programa está pausado nesta linha" },
    };

    this.currentLineDecoration =
      this.codeEditor?.deltaDecorations(this.currentLineDecoration, [
        { range: new monaco.Range(line, 1, line, 1), options },
      ]) ?? [];
  }

  private clearBreakpoints() {
    this.breakpointDecorations = this.codeEditor?.deltaDecorations(this.breakpointDecorations, []) ?? [];

    if (this.debugging) {
      this.executor.debug({ type: "breakpoints", lines: [] });
    }
  }

  private clearCurrentLine() {
    this.currentLineDecoration = this.codeEditor?.deltaDecorations(this.currentLineDecoration, []) ?? [];
  }

  /**
   * Marca de vermelho a linha de um erro de execução, com a mensagem ao passar o mouse. A
   * marca some quando o código muda ou o programa executa de novo.
   */
  private showErrorLine(line: number, message: string) {
    const options: LineDecorationOptions = {
      isWholeLine: true,
      className: "runtime-error-line",
      lineNumberClassName: "runtime-error-line-number",
      // Só a primeira linha: as mensagens do Portugol Studio seguem com explicações e
      // exemplos de código, que ficam na saída. É texto, e não Markdown: `[5]` ou `*`
      // aparecem como foram escritos
      hoverMessage: { value: textoLiteral(message.split("\n", 1)[0]) },
    };

    this.errorLineDecoration =
      this.codeEditor?.deltaDecorations(this.errorLineDecoration, [
        { range: new monaco.Range(line, 1, line, 1), options },
      ]) ?? [];
    this.codeEditor?.revealLineInCenterIfOutsideViewport(line);
  }

  private clearErrorLine() {
    if (this.errorLineDecoration.length > 0) {
      this.errorLineDecoration = this.codeEditor?.deltaDecorations(this.errorLineDecoration, []) ?? [];
    }
  }

  /**
   * As linhas com ponto de parada. As marcas acompanham o código: uma linha inserida
   * acima leva o ponto de parada junto.
   */
  private breakpointLines() {
    const model = this.codeEditor?.getModel();
    const lines = this.breakpointDecorations
      .map(id => model?.getDecorationRange(id)?.startLineNumber)
      .filter(line => line !== undefined);

    // eslint-disable-next-line unicorn/no-array-sort -- o `map` acima já criou uma cópia
    return [...new Set(lines)].sort((a, b) => a - b);
  }

  toggleBreakpoint(line: number, origin: EditorOrigin) {
    if (!this.advancedDebugging) {
      return;
    }

    const lines = new Set(this.breakpointLines());
    const adding = !lines.has(line);

    if (adding) {
      lines.add(line);
    } else {
      lines.delete(line);
    }

    this.gaService.event("debug_breakpoint", "Depuração", `${adding ? "marcar" : "desmarcar"}_${origin}`);

    this.breakpointDecorations =
      this.codeEditor?.deltaDecorations(
        this.breakpointDecorations,
        [...lines].map(breakpoint => {
          return {
            range: new monaco.Range(breakpoint, 1, breakpoint, 1),
            options: {
              glyphMarginClassName: "debug-breakpoint-glyph",
              glyphMarginHoverMessage: { value: "Ponto de parada" },
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            },
          };
        }),
      ) ?? [];

    void this.announcer.announce(
      `${adding ? "Ponto de parada marcado" : "Ponto de parada desmarcado"} na linha ${line}.`,
      "polite",
    );

    if (this.debugging) {
      this.executor.debug({ type: "breakpoints", lines: this.breakpointLines() });
    }

    const pause = this.debugPause();

    if (pause && this.paused()) {
      this.showCurrentLine(pause.line);
    }
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

    // Na barra flutuante da depuração avançada, as setas andam na horizontal
    const debugToolbar = target.closest<HTMLElement>(".debug-toolbar");

    if (debugToolbar && target.matches(".debug-toolbar-button")) {
      if (moveRovingFocus(event, debugToolbar, ".debug-toolbar-button", "horizontal")) {
        event.stopPropagation();
      }
    }
  }

  toggleOutput() {
    this.gaService.event("output_toggle", "Saída", this.outputCollapsed ? "mostrar" : "recolher");

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
    this.gaService.event("touch_input_submit", "Saída", "Campo de entrada");

    for (const char of this.programInput) {
      this.executor.stdIn.next(char);
    }

    this.executor.stdIn.next("\r");
    this.programInput = "";
  }

  clearOutput() {
    this.gaService.event("output_clear", "Saída", "Limpar saída");
    this.executor.stdOut = "";

    // Com a saída vazia, o botão fica desativado e perderia o foco: ele vai
    // para a aba "Saída", logo ao lado.
    this.panelTab(this.ids().outputTab)?.focus();
  }

  /**
   * Leva o cursor da saída para o fim. Devolve se ela recebe o foco.
   */
  stdOutEditorCursorEnd(focus = true) {
    if (!this.stdOutEditor) {
      return false;
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
      //
      // Na depuração, o foco fica nos botões dos passos, menos num `leia`.
      if (
        focus &&
        !this.coarsePointer() &&
        this.outputVisible() &&
        (!this.debugging || this.executor.waitingForInput)
      ) {
        // Num `leia` da depuração, a saída acabou de trocar de lugar com as variáveis e só
        // aparece na próxima renderização: escondida, ela não receberia o foco
        afterNextRender(
          () => {
            editor.focus();
          },
          { injector: this.injector },
        );

        return true;
      }
    }

    return false;
  }

  /**
   * Os atalhos dos editores de código e de saída. `CtrlCmd` é o Cmd no Mac, e o `WinCtrl`
   * faz valer lá também o Ctrl. Menos no Abrir arquivo: no Mac, o Ctrl+O insere uma linha,
   * no Monaco e nos campos de texto, e só o Cmd+O abre arquivos (`atalhoDoEvento`).
   */
  initShortcuts(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.addAction({
      id: "runCode",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, monaco.KeyMod.WinCtrl | monaco.KeyCode.Enter],
      label: "Executar código",
      run: () => {
        if (this.canRun()) {
          void this.runCode("atalho");
        }
      },
    });

    // Shift+F5, o mesmo do VS Code para parar a depuração: uma tecla de função não digita
    // nada, e vale até no Mac. Não é uma ação do Monaco, que sempre consumiria a tecla: sem
    // programa para parar, o Shift+F5 fica com o navegador, que no Chrome recarrega a página
    // sem o cache
    editor.onKeyDown(event => {
      if (
        event.keyCode === monaco.KeyCode.F5 &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        this.canStop()
      ) {
        event.preventDefault();
        event.stopPropagation();
        this.stopCode("atalho");
      }
    });

    // Ctrl+Shift+Enter: o Verificar, só numa aba de exercício (a chave `pwsExercicio`). Nas
    // outras, a tecla continua com o Monaco, que insere uma linha acima
    this.exerciseContextKeys.push(editor.createContextKey("pwsExercicio", this.exercise() !== null));

    editor.addAction({
      id: "verifyExercise",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        monaco.KeyMod.WinCtrl | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      ],
      precondition: "pwsExercicio",
      label: "Verificar o exercício",
      run: () => {
        void this.verifyExercise();
      },
    });

    editor.addAction({
      id: "saveFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS],
      label: "Salvar arquivo",
      run: () => {
        this.saveFromEditor("atalho");
      },
    });

    editor.addAction({
      id: "openFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
      label: "Abrir arquivo",
      run: () => {
        this.openFile.emit("atalho");
      },
    });

    editor.addAction({
      id: "openHelp",
      keybindings: [monaco.KeyCode.F1],
      label: "Ajuda",
      run: () => {
        this.openHelp("atalho");
      },
    });

    // No Mac, o Alt é o Option, que digita caracteres: no teclado americano, Option+C é o
    // "ç" e Option+N é o til do "ã". No editor, os atalhos com Alt só valem quando não
    // tiram uma letra de ninguém: fora do Mac e, os da depuração, também depurando (a chave
    // `pwsDepurando`, que no editor de código vale a depuração inteira, e na saída, menos
    // esperando um `leia`)
    editor.createContextKey("pwsAtalhosAlt", !isMacintosh);

    // Os atalhos de abas do IDE também valem com o cursor no código
    editor.addAction({
      id: "newTab",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyN],
      precondition: "pwsAtalhosAlt",
      label: "Nova aba de código",
      run: () => {
        this.newTab.emit();
      },
    });

    // A depuração usa o Alt com letras que o navegador não usa (no Windows, o Firefox abre
    // menus com Alt+F, E, V, S, B, T e H, e o Chrome usa Alt+D, E e F)
    const debugActions: Array<[string, string, monaco.KeyCode]> = [
      ["alt+p", "Depurar ou dar o próximo passo", monaco.KeyCode.KeyP],
      ["alt+j", "Pular função", monaco.KeyCode.KeyJ],
      ["alt+r", "Sair da função", monaco.KeyCode.KeyR],
      ["alt+c", "Continuar ou pausar", monaco.KeyCode.KeyC],
      ["alt+m", "Marcar ou desmarcar ponto de parada", monaco.KeyCode.KeyM],
    ];

    for (const [shortcut, label, key] of debugActions) {
      editor.addAction({
        id: `debug-${shortcut}`,
        keybindings: [monaco.KeyMod.Alt | key],
        precondition: "pwsAtalhosAlt || pwsDepurando",
        // No campo de busca e substituição, Alt+C, Alt+R e Alt+P são do Monaco: diferenciar
        // maiúsculas, expressão regular e preservar maiúsculas
        keybindingContext: "!findInputFocussed && !replaceInputFocussed",
        label,
        run: () => {
          this.onDebugShortcut(shortcut);
        },
      });
    }

    editor.addAction({
      id: "closeTab",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
      precondition: "pwsAtalhosAlt",
      label: "Fechar aba",
      run: () => {
        this.closeTab.emit();
      },
    });
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.codeEditor = editor;
    this.initShortcuts(editor);
    this.debuggingInEditor = editor.createContextKey("pwsDepurando", false);

    this.debugModel = editor.getModel() ?? undefined;

    if (this.debugModel) {
      this.monacoService.setDebugState(this.debugModel, () => this.debugHoverState());
    }

    // Mudar o código tira a marca do erro de execução, que pode não estar mais naquela linha
    editor.onDidChangeModelContent(() => {
      this.clearErrorLine();
    });

    // Um clique na margem à esquerda dos números das linhas marca um ponto de parada
    editor.onMouseDown(({ target, event }) => {
      if (event.leftButton && target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN && target.position) {
        this.toggleBreakpoint(target.position.lineNumber, "editor");
      }
    });

    // Uma aba recém-aberta pede o foco antes de o Monaco existir.
    if (this.workspace.consumeFocusRequest(this.tabId())) {
      editor.focus();
    }

    editor.onDidChangeCursorPosition(({ position }) => {
      this.cursor.set({ line: position.lineNumber, column: position.column });
    });

    this._code$?.unsubscribe();

    // Sem a checagem ao vivo, os erros só aparecem ao executar. Ligada, ela confere o código
    // na hora, sem esperar a próxima tecla: o editor pode nascer já com o código da aba (ao
    // recarregar a página), e aí nenhuma mudança de conteúdo chega a disparar a primeira
    // checagem. Se o código ainda chegar depois, o `debounceTime` junta as duas numa só.
    this._code$ = this.settingsService
      .observe(settings.editorLiveDiagnostics)
      .pipe(
        switchMap(live => {
          if (!live) {
            this.setEditorDiagnostics([]);
            return EMPTY;
          }

          const changes = fromEventPattern(
            handler => editor.onDidChangeModelContent(handler),
            (_handler, listener: monaco.IDisposable) => {
              listener.dispose();
            },
          );

          // Dentro do `switchMap`, uma checagem em andamento ao desligar é
          // descartada, e não marca erros depois da limpeza.
          return changes.pipe(
            startWith(null),
            debounceTime(500),
            // Se o worker quebrar, esta checagem falha sozinha: a próxima mudança tenta de novo
            mergeMap(async () => this.worker.checkCode(this.code).catch(() => null)),
          );
        }),
      )
      .subscribe({
        next: result => {
          if (result) {
            this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));
          }
        },
        error(err) {
          console.error(err);
        },
      });
  }

  /**
   * A aba da Ajuda registra o próprio evento (`help_tab_open` ou `help_tab_select`), com
   * esta origem.
   */
  openHelp(origin: EditorOrigin) {
    this.help.emit(origin);
  }

  openSettings() {
    this.gaService.event("open_settings_dialog", "Editor", "editor");
    this.settings.emit(undefined);
  }

  /**
   * Na primeira depuração simples neste navegador, avisa que a depuração avançada existe:
   * a opção fica nas configurações, onde quem só depura não procuraria.
   */
  private showAdvancedDebuggingTip() {
    if (this.advancedDebugging || this.settingsService.get(settings.debugAdvancedTipShown)) {
      return;
    }

    this.storage.store(settings.debugAdvancedTipShown.key, true);
    this.gaService.event("debug_tip_show", "Depuração", "avancada");

    this.toast.show(this.debugTipTemplate(), {
      icon: this.debugTipIcon(),
      dismissible: true,
      // O aviso tem um botão: só some ao ser fechado, senão sumiria enquanto alguém chega
      // nele pelo teclado
      autoClose: false,
      ariaLive: "polite",
    });
  }

  /**
   * O botão da dica abre as configurações na seção Execução. A depuração continua: ligar a
   * opção ali já mostra a barra flutuante.
   */
  openAdvancedDebuggingSettings(toastRef: CreateHotToastRef<unknown>) {
    this.gaService.event("open_settings_dialog", "Depuração", "dica_depuracao");

    // O diálogo devolve o foco a quem o abriu, e o aviso some: o foco passa antes para o
    // Depurar, e volta para ele quando as configurações fecham
    this.rovingTarget(".activity-button", ".debug-button")?.focus();
    toastRef.close();
    this.settings.emit("execution");
  }

  async shareFile() {
    if (!this.code) {
      return;
    }

    this.sharing = true;

    const result = await this.shareService.share(this.codeToExport());

    if (result.ok) {
      this.toast.show(this.shareToastTemplate(), {
        data: { url: result.value },
        duration: 30_000,
        dismissible: true,
        // O link precisa ser lido e copiado: o aviso só some ao ser fechado,
        // senão sumiria enquanto alguém chega nele pelo teclado.
        autoClose: false,
        ariaLive: "polite",
      });

      this.gaService.event("share_code_success", "Editor", "editor");
    } else {
      this.toast.error(
        result.reason === "offline"
          ? "Sem internet para compartilhar o código. Conecte-se e tente de novo."
          : "Ocorreu um erro ao compartilhar o arquivo. Tente novamente mais tarde.",
        { duration: 5000 },
      );

      this.gaService.event("share_code_error", "Editor", result.reason);
    }

    setTimeout(() => {
      this.sharing = false;
    }, 1000);
  }

  /**
   * A área de transferência pode recusar (sem permissão, ou fora de um contexto seguro): o
   * aviso com o link continua aberto para copiar à mão.
   */
  async copyShareUrl(toastRef: CreateHotToastRef<{ url: string }>) {
    try {
      await navigator.clipboard.writeText(toastRef.data.url);
    } catch (error) {
      console.error(error);
      this.gaService.event("share_copy_link", "Editor", "erro");
      this.toast.error("Não foi possível copiar o link. Selecione o link e copie.", { duration: 5000 });
      return;
    }

    this.gaService.event("share_copy_link", "Editor", "ok");
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
            startColumn: this.editorColumn(model, error.startLine, error.startCol),
            endLineNumber: error.endLine,
            endColumn: this.editorColumn(model, error.endLine, error.endCol + 1),
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
            column: model
              ? this.editorColumn(model, diagnostic.startLine, diagnostic.startCol)
              : diagnostic.startCol + 1,
          };
        })
        // O Firefox 113 e o Chrome 96–101, que ainda aparecem no Sentry, não têm `toSorted`.
        // eslint-disable-next-line unicorn/no-array-sort -- o `map` acima já criou uma cópia
        .sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line || a.column - b.column),
    );
  }

  /**
   * A coluna (base 0) da análise conta pontos de código, como o ANTLR; o Monaco conta unidades
   * de UTF-16 (base 1). Sem a conversão, cada emoji antes na linha deslocava o marcador.
   */
  private editorColumn(model: monaco.editor.ITextModel, line: number, column: number) {
    if (line < 1 || line > model.getLineCount()) {
      return column + 1;
    }

    return Array.from(model.getLineContent(line)).slice(0, column).join("").length + 1;
  }

  /**
   * Leva o cursor até o problema e devolve o foco ao código.
   */
  revealProblem(problem: Problem) {
    this.gaService.event("problem_reveal", "Problemas", problem.severity);

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
