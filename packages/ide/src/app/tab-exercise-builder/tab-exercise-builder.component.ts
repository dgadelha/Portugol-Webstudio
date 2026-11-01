import { LiveAnnouncer } from "@angular/cdk/a11y";
import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnInit,
  resource,
  signal,
  untracked,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { ExpectedValue, portugolLiteral } from "@portugol-webstudio/runner";
import { AngularSvgIconModule } from "angular-svg-icon";
import { saveAs } from "file-saver";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { map } from "rxjs";

import { isMacintosh } from "../../settings";
import {
  CaseStatus,
  DraftCase,
  DraftCheck,
  DraftFunctionCheck,
  DraftWriteCheck,
  ExerciseBuilderService,
  ExerciseDraft,
  SHARED_EXERCISE_DAYS,
} from "../exercise-builder.service";
import { ExerciseMarkdownService } from "../exercise-markdown.service";
import { DIFFICULTY_LABELS, Exercício, ExercisesService } from "../exercises.service";
import { SettingsService } from "../settings.service";
import { ShareService } from "../share.service";
import { focusAfterRender } from "../shared/focus";
import { moveRovingFocus } from "../shared/roving-focus";
import { TooltipDirective } from "../shared/tooltip.directive";
import { ExerciseValuePipe } from "../tab-editor/exercise-value.pipe";
import { ThemeService } from "../theme.service";
import { WorkerService } from "../worker.service";
import { WorkspaceService } from "../workspace.service";
import { isMeaningfulCode } from "../workspace.types";

type Step = "dados" | "enunciado" | "codigo" | "casos" | "compartilhar";

type StepStatus = "done" | "todo" | "warning" | "error";

/**
 * O lugar de uma lista de problemas: no alto, perto do "Gerar respostas"; na seção
 * Compartilhar; ou no caso (a posição) cujo botão gerou as respostas, onde quem clicou está
 * olhando.
 */
type ProblemsPlace = "top" | "share" | number;

/**
 * A criação de um exercício: os dados, o enunciado com a prévia, a solução e os casos. As
 * respostas esperadas saem da solução ("Gerar respostas"); "Compartilhar" publica o exercício
 * num link, sem a solução, e "Baixar" grava o rascunho inteiro para editar depois.
 */
@Component({
  selector: "app-tab-exercise-builder",
  imports: [
    AngularSvgIconModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    DragDropModule,
    ExerciseValuePipe,
    FormsModule,
    MonacoEditorModule,
    NgTemplateOutlet,
    TooltipDirective,
  ],
  templateUrl: "./tab-exercise-builder.component.html",
  styleUrl: "./tab-exercise-builder.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabExerciseBuilderComponent implements OnInit {
  private builder = inject(ExerciseBuilderService);
  private exercises = inject(ExercisesService);
  private workspace = inject(WorkspaceService);
  private markdown = inject(ExerciseMarkdownService);
  private share = inject(ShareService);
  private themeService = inject(ThemeService);
  private announcer = inject(LiveAnnouncer);
  private gaService = inject(GoogleAnalyticsService);
  private lifetime = inject(DestroyRef);
  private injector = inject(Injector);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private worker = inject(WorkerService);
  private settings = inject(SettingsService);

  readonly tabId = input.required<string>();
  /**
   * O atalho do Monaco que faz o Tab sair do editor: no Mac, ele usa o Control mesmo.
   */
  readonly tabFocusShortcut = isMacintosh ? "Ctrl+Shift+M" : "Ctrl+M";

  readonly draft = signal<ExerciseDraft>(this.builder.emptyDraft(""));
  readonly topics = signal<Array<{ id: Exercício["tópico"]; name: string }>>([]);
  readonly difficulties = Object.entries(DIFFICULTY_LABELS).map(([value, label]) => {
    return {
      value: Number(value) as Exercício["dificuldade"],
      label,
    };
  });

  /**
   * O andamento de "Gerar respostas", e o que impediu de gerar ou de compartilhar. O mesmo
   * botão vira Parar enquanto gera: trocar de elemento tiraria o foco de quem usa o teclado.
   */
  readonly progress = signal<{ done: number; total: number } | null>(null);
  readonly problems = signal<{ at: ProblemsPlace; items: string[] } | null>(null);
  readonly sharing = signal(false);
  /**
   * O link da última vez que o exercício foi compartilhado: fica no rascunho, para voltar
   * depois de recarregar a página, e sai quando o exercício muda.
   */
  readonly shared = computed(() => {
    const compartilhado = this.draft().compartilhado;

    if (!compartilhado) {
      return null;
    }

    // Meio-dia, para o fuso horário não mudar o dia
    const until = new Date(`${compartilhado.até}T12:00:00`);

    return {
      url: compartilhado.link,
      until: until.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }),
      expired: compartilhado.até < this.today(),
    };
  });

  readonly busy = computed(() => this.progress() !== null || this.sharing());

  /**
   * Um problema da solução inteira (não compila, usa uma biblioteca bloqueada), conferido
   * enquanto se escreve: a etapa Código fica marcada.
   */
  readonly solutionProblem = signal<string | null>(null);

  /**
   * A etapa que está na tela, para a navegação marcar onde se está.
   */
  readonly activeStep = signal<Step>("dados");

  /**
   * Numa área estreita, o enunciado e a prévia ficam em abas, um de cada vez; numa larga, lado
   * a lado.
   */
  readonly narrowStatement = signal(false);
  readonly statementTab = signal<"write" | "preview">("write");

  /**
   * Todos os casos recolhidos: o botão do alto da lista expande todos, senão recolhe.
   */
  readonly allCasesClosed = computed(() => this.draft().casos.every(caso => caso.fechado === true));

  /**
   * A situação de cada caso e quantos são exemplos e testes: as etapas, a lista do Compartilhar
   * e os cartões dos casos leem daqui, e a situação (que confere a solução inteira) sai uma vez
   * só a cada mudança.
   */
  private readonly caseStats = computed(() => {
    const draft = this.draft();
    const examples = draft.casos.filter(caso => caso.tipo === "exemplo").length;

    return {
      statuses: draft.casos.map(caso => this.builder.caseStatus(draft, caso)),
      examples,
      tests: draft.casos.length - examples,
    };
  });

  /**
   * As etapas da criação, cada uma com o que falta: pronta, por preencher, precisando de
   * atenção (respostas desatualizadas) ou com problema.
   */
  readonly steps = computed(() => {
    const draft = this.draft();
    const { statuses, examples, tests } = this.caseStats();
    let cases: StepStatus = "done";

    if (statuses.includes("problem")) {
      cases = "error";
    } else if (statuses.includes("stale")) {
      cases = "warning";
    } else if (examples === 0 || tests === 0 || statuses.includes("missing")) {
      cases = "todo";
    }

    const steps: Array<{ id: Step; label: string; status: StepStatus; detail: string }> = [
      {
        id: "dados",
        label: "Exercício",
        status: draft.título.trim() ? "done" : "todo",
        detail: draft.título.trim() ? "" : "sem título",
      },
      { id: "enunciado", label: "Enunciado", status: draft.enunciado.trim() ? "done" : "todo", detail: "" },
      {
        id: "codigo",
        label: "Código",
        status: this.solutionProblem() ? "error" : isMeaningfulCode(draft.solução) ? "done" : "todo",
        detail: "",
      },
      { id: "casos", label: "Casos", status: cases, detail: this.countLabel(examples, tests) },
      {
        id: "compartilhar",
        label: "Compartilhar",
        status: this.shared()?.expired === false ? "done" : "todo",
        detail: "",
      },
    ];

    return steps.map(step => {
      // Um nome só, com vírgulas: o navegador separaria as partes do botão com espaços
      const parts = [step.label, this.stepStatusLabels[step.status], step.detail].filter(Boolean);

      return { ...step, ariaLabel: parts.join(", ") };
    });
  });

  /**
   * O que o Compartilhar vai conferir, para ver antes de clicar se falta alguma coisa.
   */
  readonly checklist = computed(() => {
    const [dados, enunciado, codigo, casos] = this.steps();
    const { statuses, examples, tests } = this.caseStats();
    const count = (status: CaseStatus) => statuses.filter(item => item === status).length;
    const stale = count("stale");
    const issues = [
      examples === 0 ? "falta um exemplo" : "",
      tests === 0 ? "falta um teste" : "",
      count("problem") > 0 ? `${count("problem")} com problema` : "",
      stale > 0 ? `${stale} ${stale === 1 ? "desatualizado" : "desatualizados"}` : "",
      count("missing") > 0 ? `${count("missing")} sem respostas` : "",
    ].filter(Boolean);
    let cases = casos.detail;

    if (issues.length > 0) {
      cases += `: ${issues.join(", ")}`;
    } else if (statuses.length > 0) {
      cases += ", com as respostas geradas";
    }

    return [
      { status: dados.status, text: dados.status === "done" ? "Título preenchido" : "Falta o título" },
      { status: enunciado.status, text: enunciado.status === "done" ? "Enunciado escrito" : "Falta o enunciado" },
      {
        status: codigo.status,
        text: this.solutionProblem() ?? (codigo.status === "done" ? "Solução escrita" : "Falta a solução"),
      },
      { status: casos.status, text: cases },
    ];
  });

  readonly sharedDays = SHARED_EXERCISE_DAYS;

  private readonly stepStatusLabels: Record<StepStatus, string> = {
    done: "pronto",
    todo: "falta preencher",
    warning: "precisa de atenção",
    error: "com problema",
  };

  readonly caseStatusLabels: Record<CaseStatus, string> = {
    ready: "Respostas geradas",
    stale: "Desatualizado",
    problem: "Problema",
    missing: "Sem respostas",
  };

  /**
   * O ícone de cada situação, nas etapas, nos casos e na lista do Compartilhar. A situação não
   * fica só na cor: o ícone muda, e o texto ao lado diz qual é.
   */
  readonly statusIcons: Record<StepStatus, { src: string; color: string }> = {
    done: { src: "assets/mdi/check-circle.svg", color: "icon-green" },
    warning: { src: "assets/mdi/alert-outline.svg", color: "icon-yellow" },
    error: { src: "assets/mdi/close-circle-outline.svg", color: "icon-red" },
    todo: { src: "assets/mdi/circle-outline.svg", color: "icon-muted" },
  };

  /**
   * A situação de um caso no mesmo vocabulário das etapas, para o ícone.
   */
  readonly caseStepStatus: Record<CaseStatus, StepStatus> = {
    ready: "done",
    stale: "warning",
    problem: "error",
    missing: "todo",
  };

  /**
   * O rascunho com nomes sem acento: o analisador de templates do Angular não aceita
   * `draft.título`.
   */
  readonly view = computed(() => {
    const draft = this.draft();
    const { statuses, examples, tests } = this.caseStats();

    return {
      title: draft.título,
      heading: this.builder.titleOf(draft),
      caseCount: this.countLabel(examples, tests),
      topic: draft.tópico,
      difficulty: draft.dificuldade,
      statement: draft.enunciado,
      starter: draft.códigoInicial,
      // O código inicial mudou: a seção abre sozinha, para quem reabre o rascunho ver
      starterChanged: isMeaningfulCode(draft.códigoInicial),
      solution: draft.solução,
      mode: draft.modo,
      cases: draft.casos.map((caso, i) => {
        return {
          name: this.builder.caseName(draft.casos, i),
          status: statuses[i],
          closed: caso.fechado === true,
          summary: this.caseSummary(draft, caso),
          kind: caso.tipo,
          description: caso.descrição,
          inputs: caso.entradas,
          output: caso.saída,
          problem: caso.problema,
          checks: caso.verificações.map(check => {
            return check.alvo === "escreva"
              ? {
                  target: "write" as const,
                  rule: check.regra,
                  values: check.valores,
                  tolerance: check.tolerância,
                  hasReal: check.valores.some(value => value.tipo === "real"),
                }
              : {
                  target: "function" as const,
                  name: check.nome,
                  args: check.argumentos,
                  returned: check.valor,
                  tolerance: check.tolerância,
                  hasReal: check.valor?.tipo === "real",
                };
          }),
        };
      }),
    };
  });

  /**
   * O enunciado da prévia, um pouco depois da última tecla: o KaTeX e o DOMPurify não rodam de
   * novo a cada letra.
   */
  private readonly previewText = signal("");

  readonly statement = resource({
    params: () => ({ text: this.previewText(), theme: this.markdown.theme() }),
    // Sem guardar cada versão: na prévia, o texto muda enquanto se escreve
    loader: ({ params }) => this.markdown.render(params.text, params.theme, { cache: false }),
  });

  private readonly editorTheme = toSignal(this.themeService.theme$.pipe(map(theme => `portugol-${theme}`)), {
    initialValue: "portugol-dark",
  });
  private readonly editorSettings = toSignal(this.settings.editorOptions(), { initialValue: {} });

  /**
   * A solução sozinha: o efeito que a confere não roda de novo quando muda outro campo.
   */
  private readonly solution = computed(() => this.draft().solução);

  /**
   * As opções dos dois editores, com o tema do IDE e o nome de cada um para os leitores de tela.
   */
  readonly solutionOptions = computed(() => this.editorOptions("Solução"));
  readonly starterOptions = computed(() => this.editorOptions("Código inicial"));

  private abort?: AbortController;

  constructor() {
    // O rascunho vive no conteúdo da aba, como o código das outras: volta com a área de trabalho
    effect(() => {
      const draft = this.draft();

      untracked(() => {
        this.workspace.setContents(this.tabId(), JSON.stringify(draft));
      });
    });

    // O nome da aba é o título: só muda quando ele muda
    const tabTitle = computed(() => this.builder.titleOf(this.draft()));

    effect(() => {
      const title = tabTitle();

      untracked(() => {
        this.workspace.renameTab(this.tabId(), title);
      });
    });

    // A navegação acompanha a etapa que está na tela, e o layout a largura da aba
    afterNextRender(() => {
      this.watchLayout();
    });

    // Na faixa de etapas do celular, a etapa atual fica à vista
    effect(() => {
      const step = this.activeStep();

      untracked(() => {
        this.host.nativeElement
          .querySelector(`.steps [data-target="${CSS.escape(step)}"]`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    });

    // A prévia do enunciado acompanha o texto: na hora ao abrir, depois de uma pausa ao escrever
    let previewTimer: ReturnType<typeof setTimeout> | undefined;

    effect(() => {
      const text = this.draft().enunciado;

      clearTimeout(previewTimer);

      if (!untracked(this.previewText)) {
        this.previewText.set(text);
        return;
      }

      previewTimer = setTimeout(() => {
        this.previewText.set(text);
      }, 250);
    });

    // A solução é conferida enquanto se escreve, como no editor de código: a etapa Código avisa
    // o erro de compilação sem esperar o "Gerar respostas"
    let checkTimer: ReturnType<typeof setTimeout> | undefined;

    effect(() => {
      const solution = this.solution();

      clearTimeout(checkTimer);
      checkTimer = setTimeout(() => {
        void this.checkSolution(solution);
      }, 600);
    });

    this.lifetime.onDestroy(() => {
      clearTimeout(checkTimer);
      clearTimeout(previewTimer);
    });

    this.lifetime.onDestroy(() => {
      this.abort?.abort();
    });
  }

  ngOnInit() {
    const saved = this.builder.parseDraft(this.workspace.contentsOf(this.tabId()));

    if (saved) {
      this.draft.set(saved);
    }

    void this.loadTopics();
  }

  private update(changes: Partial<ExerciseDraft>) {
    const draft = this.draft();

    // Os editores de código avisam uma mudança ao abrir, com o mesmo texto: não é uma edição,
    // e não pode tirar o link do exercício compartilhado
    if (Object.entries(changes).every(([key, value]) => draft[key as keyof ExerciseDraft] === value)) {
      return;
    }

    // Mudar o exercício invalida um link já mostrado: o novo precisa ser compartilhado de novo
    this.draft.update(draft => ({ ...draft, ...changes, compartilhado: undefined }));
  }

  private updateCase(index: number, changes: Partial<DraftCase>) {
    this.update({
      casos: this.draft().casos.map((caso, i) => (i === index ? { ...caso, ...changes } : caso)),
    });
  }

  private updateCheck(
    caseIndex: number,
    checkIndex: number,
    changes: Partial<DraftWriteCheck> | Partial<DraftFunctionCheck>,
  ) {
    const caso = this.draft().casos[caseIndex];

    this.updateCase(caseIndex, {
      verificações: caso.verificações.map((check, i) =>
        i === checkIndex ? ({ ...check, ...changes } as DraftCheck) : check,
      ),
    });
  }

  toggleCase(index: number) {
    const caso = this.draft().casos[index];

    // Não muda o exercício: o link mostrado continua valendo
    this.draft.update(draft => {
      return {
        ...draft,
        casos: draft.casos.map((item, i) => (i === index ? { ...item, fechado: !caso.fechado } : item)),
      };
    });
  }

  /**
   * Recolhe todos os casos, ou expande todos se já estão recolhidos.
   */
  toggleAllCases() {
    const fechado = !this.allCasesClosed();

    // Não muda o exercício: o link mostrado continua valendo
    this.draft.update(draft => ({ ...draft, casos: draft.casos.map(caso => ({ ...caso, fechado })) }));
  }

  /**
   * Muda um caso de lugar pelo menu do caso (o teclado e o leitor de tela), anuncia a posição
   * nova e leva o foco junto com ele.
   */
  moveCase(index: number, delta: -1 | 1) {
    const casos = [...this.draft().casos];
    const target = index + delta;

    if (target < 0 || target >= casos.length) {
      return;
    }

    moveItemInArray(casos, index, target);
    this.update({ casos });
    this.dropCaseProblems();
    this.focusCaseMenu(target);
    void this.announcer.announce(
      `${this.builder.caseName(casos, target)}, posição ${target + 1} de ${casos.length}.`,
      "polite",
    );
  }

  /**
   * O foco vai para um elemento dentro de um caso, depois que a lista muda: o primeiro dos
   * seletores que existir. Sem isso, o botão em que o foco estava some e o foco cai no `<body>`.
   */
  private focusInCase(index: number, ...selectors: string[]) {
    focusAfterRender(this.injector, () => {
      const caseCard = this.host.nativeElement.querySelector<HTMLElement>(
        `:scope [data-case="${CSS.escape(String(index))}"]`,
      );

      for (const selector of selectors) {
        const found = caseCard?.querySelector<HTMLElement>(selector);

        if (found) {
          return found;
        }
      }

      return null;
    });
  }

  /**
   * O foco vai para o botão de ações de um caso (o menu devolve o foco ao botão em que abriu,
   * que agora é de outro caso ou sumiu). Sem casos, vai para "Adicionar exemplo".
   */
  private focusCaseMenu(index: number) {
    focusAfterRender(this.injector, () => {
      const root = this.host.nativeElement;

      return (
        root.querySelector<HTMLElement>(`:scope [data-case-menu="${CSS.escape(String(index))}"]`) ??
        root.querySelector<HTMLElement>(":scope .case-actions .btn")
      );
    });
  }

  dropCase(event: CdkDragDrop<unknown>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const casos = [...this.draft().casos];

    moveItemInArray(casos, event.previousIndex, event.currentIndex);
    this.update({ casos });
    this.dropCaseProblems();
  }

  /**
   * Leva até uma etapa e põe o foco no título dela, para quem navega pelo teclado.
   */
  goTo(step: Step) {
    const section = this.host.nativeElement.querySelector<HTMLElement>(`[data-step="${CSS.escape(step)}"]`);

    // A seção, não o título: a margem dela deixa o título abaixo do cabeçalho fixo
    section?.scrollIntoView({ block: "start" });
    section?.querySelector<HTMLElement>("h3")?.focus({ preventScroll: true });
    this.activeStep.set(step);
  }

  /**
   * Os problemas mostrados num caso ficam presos à posição dele: com os casos mudando de lugar,
   * iriam parar em outro.
   */
  private dropCaseProblems() {
    if (typeof this.problems()?.at === "number") {
      this.problems.set(null);
    }
  }

  addCase(tipo: DraftCase["tipo"]) {
    const casos = [...this.draft().casos, { tipo, descrição: "", entradas: "", verificações: [] }];
    const index = casos.length - 1;

    this.update({ casos });
    // O caso novo aparece acima do botão: o foco vai para o primeiro campo dele
    this.focusInCase(index, ":scope .case-body .input");
    void this.announcer.announce(`${this.builder.caseName(casos, index)} adicionado.`, "polite");
  }

  removeCase(index: number) {
    const casos = this.draft().casos;
    const name = this.builder.caseName(casos, index);

    this.update({ casos: casos.filter((_, i) => i !== index) });
    this.dropCaseProblems();
    // O caso seguinte, ou o anterior se era o último
    this.focusCaseMenu(index < casos.length - 1 ? index : index - 1);
    void this.announcer.announce(`${name} removido.`, "polite");
  }

  /**
   * As abas Escrever e Prévia do enunciado: as setas, o Home e o End trocam de aba.
   */
  onStatementTabsKeydown(event: KeyboardEvent) {
    const tablist = (event.currentTarget as HTMLElement).closest<HTMLElement>("[role=tablist]");

    if (tablist) {
      moveRovingFocus(event, tablist, "[role=tab]", "horizontal")?.click();
    }
  }

  addCheck(caseIndex: number, alvo: DraftCheck["alvo"]) {
    const check: DraftCheck =
      alvo === "escreva"
        ? { alvo: "escreva", regra: "contém", valores: [] }
        : { alvo: "função", nome: "", argumentos: "" };

    const verificações = [...this.draft().casos[caseIndex].verificações, check];

    this.updateCase(caseIndex, { verificações });
    this.focusInCase(caseIndex, `:scope [data-check="${verificações.length - 1}"] .input`);
    void this.announcer.announce(`Verificação ${verificações.length} adicionada.`, "polite");
  }

  removeCheck(caseIndex: number, checkIndex: number) {
    const verificações = this.draft().casos[caseIndex].verificações;

    this.updateCase(caseIndex, { verificações: verificações.filter((_, i) => i !== checkIndex) });
    // A verificação que ficou no lugar, a anterior se era a última, ou o botão de adicionar
    const target = checkIndex < verificações.length - 1 ? checkIndex : checkIndex - 1;

    this.focusInCase(caseIndex, `:scope [data-check="${target}"] .check-remove`, ":scope .check-actions .btn");
    void this.announcer.announce(`Verificação ${checkIndex + 1} removida.`, "polite");
  }

  /**
   * Só no `contém`, que dispensa valores: o `igual` confere todos, e a tela nem mostra o botão.
   */
  removeValue(caseIndex: number, checkIndex: number, valueIndex: number) {
    const check = this.draft().casos[caseIndex].verificações[checkIndex] as DraftWriteCheck;
    const target = valueIndex < check.valores.length - 1 ? valueIndex : valueIndex - 1;
    const checkSelector = `:scope [data-check="${checkIndex}"]`;

    this.updateCheck(caseIndex, checkIndex, { valores: check.valores.filter((_, i) => i !== valueIndex) });
    this.focusInCase(caseIndex, `${checkSelector} [data-value="${target}"]`, `${checkSelector} .input`);
    void this.announcer.announce("Valor removido.", "polite");
  }

  /**
   * A tolerância de um campo de texto: vazio é a padrão.
   */
  setTolerance(caseIndex: number, checkIndex: number, text: string) {
    const value = Number(text.replace(",", "."));

    this.updateCheck(caseIndex, checkIndex, {
      tolerância: text.trim() && Number.isFinite(value) && value >= 0 ? value : undefined,
    });
  }

  setTitle(text: string) {
    this.update({ título: text });
  }

  setTopic(topic: Exercício["tópico"]) {
    this.update({ tópico: topic });
  }

  setDifficulty(value: string | number) {
    this.update({ dificuldade: Number(value) as Exercício["dificuldade"] });
  }

  setStatement(text: string) {
    this.update({ enunciado: text });
  }

  setStarter(code: string) {
    this.update({ códigoInicial: code });
  }

  setSolution(code: string) {
    this.update({ solução: code });
  }

  setMode(modo: ExerciseDraft["modo"]) {
    this.update({ modo });
  }

  setCaseKind(index: number, kind: DraftCase["tipo"]) {
    this.updateCase(index, { tipo: kind });
  }

  setCaseDescription(index: number, text: string) {
    this.updateCase(index, { descrição: text });
  }

  setCaseInputs(index: number, text: string) {
    this.updateCase(index, { entradas: text });
  }

  setRule(caseIndex: number, checkIndex: number, regra: DraftWriteCheck["regra"]) {
    this.updateCheck(caseIndex, checkIndex, { regra });
  }

  setFunctionName(caseIndex: number, checkIndex: number, name: string) {
    this.updateCheck(caseIndex, checkIndex, { nome: name.trim() });
  }

  setArguments(caseIndex: number, checkIndex: number, text: string) {
    this.updateCheck(caseIndex, checkIndex, { argumentos: text });
  }

  /**
   * "Gerar respostas": de todos os casos, ou só de um (`only`, a posição), pelo botão do caso.
   */
  async generate(only?: number) {
    if (this.busy()) {
      return;
    }

    const draft = this.draft();
    const abort = new AbortController();
    const caseName = only === undefined ? undefined : this.builder.caseName(draft.casos, only);

    this.abort = abort;
    this.problems.set(null);
    this.progress.set({ done: 0, total: only === undefined ? draft.casos.length : 1 });
    void this.announcer.announce(caseName ? `Gerando as respostas do ${caseName}…` : "Gerando as respostas…", "polite");
    this.gaService.event("exercise_builder_generate", "Exercícios", only === undefined ? draft.modo : "caso");

    try {
      const result = await this.builder.generate(draft, {
        signal: abort.signal,
        only,
        onCase: (done, total) => {
          this.progress.set({ done, total });
        },
      });

      const current = this.draft();

      // Editado enquanto gerava: as respostas seriam de outro rascunho. Recolher ou expandir um
      // caso não muda o exercício, e as respostas continuam valendo
      if (!this.sameContent(current, draft)) {
        this.showProblems(only ?? "top", ["O exercício mudou enquanto as respostas eram geradas: gere de novo."]);
        return;
      }

      this.draft.set({
        ...result.draft,
        casos: result.draft.casos.map((caso, i) => ({ ...caso, fechado: current.casos[i]?.fechado })),
      });

      // A caixa dos problemas é um `role="alert"`: o leitor de tela já a lê
      if (result.problems.length > 0) {
        this.showProblems(only ?? "top", result.problems);
        return;
      }

      void this.announcer.announce(caseName ? `Respostas do ${caseName} geradas.` : "Respostas geradas.", "polite");
    } catch (error) {
      // O Parar durante a compilação da solução interrompe o worker
      const aborted = abort.signal.aborted;

      if (!aborted) {
        console.error(error);
      }

      this.showProblems(only ?? "top", [
        aborted ? "A geração foi interrompida." : "Não foi possível gerar as respostas.",
      ]);
    } finally {
      this.progress.set(null);
      this.abort = undefined;
    }
  }

  /**
   * A barra de formatação do enunciado: põe a marcação do Markdown em volta do que está
   * selecionado (ou no começo das linhas, numa lista), e deixa selecionado o texto de dentro.
   */
  format(textarea: HTMLTextAreaElement, kind: "bold" | "italic" | "code" | "block" | "list" | "formula") {
    const { value } = textarea;
    let { selectionStart: start, selectionEnd: end } = textarea;
    const selected = value.slice(start, end);
    // Um bloco e uma lista começam numa linha própria
    const lineBreakBefore = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
    const lineBreakAfter = end < value.length && value[end] !== "\n" ? "\n" : "";
    const wrap: Record<string, [string, string, string]> = {
      bold: ["**", "**", "texto"],
      italic: ["_", "_", "texto"],
      code: ["`", "`", "codigo"],
      formula: ["$", "$", "a + b"],
      block: [
        `${lineBreakBefore}\`\`\`portugol\n`,
        `\n\`\`\`${lineBreakAfter}`,
        "funcao inteiro soma(inteiro a, inteiro b)",
      ],
    };
    let inserted: string;
    let innerStart: number;
    let innerEnd: number;

    if (kind === "list") {
      // No meio de uma linha, os espaços em volta somem, e o texto que segue fica depois de uma
      // linha em branco: sem ela, o Markdown o juntaria ao último item da lista
      while (start > 0 && value[start - 1] === " ") {
        start--;
      }

      while (end < value.length && value[end] === " ") {
        end++;
      }

      const lines = (selected.trim() || "item").split("\n");
      const items = lines.map(line => `- ${line}`).join("\n");
      const before = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      // Texto logo depois, na mesma linha ou na seguinte, precisa de uma linha em branco antes
      let after = "";

      if (end < value.length && value[end] !== "\n") {
        after = "\n\n";
      } else if (end + 1 < value.length && value[end + 1] !== "\n") {
        after = "\n";
      }

      inserted = `${before}${items}${after}`;
      // Num item só, fica selecionado o texto dele, sem o "- "
      innerStart = start + before.length + (lines.length === 1 ? 2 : 0);
      innerEnd = start + before.length + items.length;
    } else {
      const [before, after, placeholder] = wrap[kind];
      const inner = selected || placeholder;

      inserted = `${before}${inner}${after}`;
      innerStart = start + before.length;
      innerEnd = innerStart + inner.length;
    }

    textarea.focus();
    textarea.setSelectionRange(start, end);

    // Pela edição do próprio navegador: o Ctrl+Z desfaz, e o campo avisa o `ngModel` pelo
    // evento `input`. O `execCommand` está obsoleto, mas é o único jeito de manter o desfazer
    // num campo de texto; sem ele, troca o trecho sem o histórico
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (!document.execCommand("insertText", false, inserted)) {
      textarea.setRangeText(inserted, start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    textarea.setSelectionRange(innerStart, innerEnd);
  }

  /**
   * Mostra uma lista de problemas no lugar dela. A do Compartilhar fica logo abaixo do botão, e
   * aparece inteira na tela.
   */
  private showProblems(at: ProblemsPlace, items: string[]) {
    this.problems.set({ at, items });

    if (at === "share") {
      afterNextRender(
        () => {
          this.host.nativeElement.querySelector(".share-problems")?.scrollIntoView({ block: "nearest" });
        },
        { injector: this.injector },
      );
    }
  }

  /**
   * "Há um problema:" ou "Há 3 problemas:", com o começo próprio de cada lugar.
   */
  problemsHeading(count: number, prefix = "") {
    return `${prefix}${count === 1 ? "Há um problema:" : `Há ${count} problemas:`}`;
  }

  /**
   * Ctrl+B e Ctrl+I (Cmd no Mac) no enunciado, como num editor de texto.
   */
  onStatementKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
      return;
    }

    const kind = { b: "bold", i: "italic" }[event.key.toLowerCase()] as "bold" | "italic" | undefined;

    if (kind) {
      event.preventDefault();
      this.format(textarea, kind);
    }
  }

  stopGenerating() {
    this.abort?.abort();
  }

  /**
   * Fecha a lista de problemas do alto: ela fica fixa com o cabeçalho, e os problemas de cada
   * caso continuam marcados nele.
   */
  dismissProblems() {
    const at = this.problems()?.at;

    this.problems.set(null);

    // O foco volta para perto de onde a lista estava
    if (typeof at === "number") {
      this.focusCaseMenu(at);
    } else {
      this.host.nativeElement.querySelector<HTMLElement>(":scope .builder-actions .btn")?.focus();
    }
  }

  async shareExercise() {
    if (this.busy()) {
      return;
    }

    // Um link anterior continua até o novo dar certo: o exercício não mudou, e ele ainda vale
    this.sharing.set(true);
    this.problems.set(null);

    const draft = this.draft();

    try {
      const id = this.share.newId();
      const { exercise, problems } = await this.builder.toExercise(draft, id);

      // Os problemas aparecem logo abaixo do botão, onde quem compartilhou está olhando, numa
      // caixa `role="alert"` que o leitor de tela já lê
      if (!exercise) {
        this.showProblems("share", problems);
        return;
      }

      const result = await this.share.shareExercise(id, JSON.stringify(exercise));

      this.gaService.event("exercise_builder_share", "Exercícios", result.ok ? "ok" : result.reason);

      if (!result.ok) {
        this.showProblems("share", [
          result.reason === "offline"
            ? "Sem conexão com a internet: o exercício não foi compartilhado."
            : "Não foi possível compartilhar o exercício.",
        ]);
        return;
      }

      // Editado enquanto compartilhava: o link é do exercício de antes, não do que está na tela
      if (!this.sameContent(this.draft(), draft)) {
        this.showProblems("share", ["O exercício mudou enquanto era compartilhado: compartilhe de novo."]);
        return;
      }

      const until = new Date(Date.now() + SHARED_EXERCISE_DAYS * 24 * 60 * 60 * 1000);

      const compartilhado = { link: result.value, até: this.localDate(until) };

      this.draft.update(current => ({ ...current, compartilhado }));
      void this.announcer.announce("Exercício compartilhado. O link está logo abaixo.", "polite");
    } catch (error) {
      // O esquema vem num pacote à parte, e a conferência roda a solução no worker
      console.error(error);
      this.showProblems("share", [
        navigator.onLine
          ? "Não foi possível compartilhar o exercício."
          : "Sem conexão com a internet: o exercício não foi compartilhado.",
      ]);
    } finally {
      this.sharing.set(false);
    }
  }

  /**
   * Se dois rascunhos têm o mesmo exercício: recolher ou expandir um caso não conta.
   */
  private sameContent(a: ExerciseDraft, b: ExerciseDraft) {
    if (a === b) {
      return true;
    }

    const content = (draft: ExerciseDraft) =>
      JSON.stringify({ ...draft, casos: draft.casos.map(caso => ({ ...caso, fechado: undefined })) });

    return content(a) === content(b);
  }

  private today() {
    return this.localDate(new Date());
  }

  /**
   * A data no fuso de quem usa, como `2027-04-29`.
   */
  private localDate(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  async copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      void this.announcer.announce("Link copiado.", "polite");
    } catch {
      void this.announcer.announce("Não foi possível copiar o link.", "polite");
    }
  }

  /**
   * O rascunho inteiro, com a solução, num arquivo que "Abrir" lê de volta.
   */
  download() {
    const draft = this.draft();
    const name = draft.título.trim() || "exercicio";

    const blob = new Blob([JSON.stringify(draft, undefined, 2) + "\n"], { type: "application/json" });

    saveAs(blob, `${name}.exercicio.json`, { autoBom: false });
    this.gaService.event("exercise_builder_download", "Exercícios");
  }

  /**
   * O resumo de um caso recolhido: as entradas e o que se espera dele.
   */
  private caseSummary(draft: ExerciseDraft, caso: DraftCase) {
    const inputs = this.builder.inputsOf(caso);
    const parts: Array<{ label: string; value: string; empty?: boolean }> = [];
    const inputsPart = () => {
      return inputs.length === 0
        ? { label: "Entradas:", value: "nenhuma", empty: true }
        : { label: "Entradas:", value: this.shorten(inputs.join(", ")) };
    };

    if (draft.modo === "simples") {
      const output = caso.saída?.trimEnd();

      parts.push(
        inputsPart(),
        output === undefined
          ? { label: "Saída:", value: "não gerada", empty: true }
          : output === ""
            ? { label: "Saída:", value: "nenhuma", empty: true }
            : { label: "Saída:", value: this.shorten(output.replaceAll("\n", " / ")) },
      );

      return parts;
    }

    // Um caso só com funções não tem entradas: nem aparecem
    if (inputs.length > 0 || caso.verificações.some(check => check.alvo === "escreva")) {
      parts.push(inputsPart());
    }

    for (const check of caso.verificações) {
      if (check.alvo === "escreva") {
        const label = check.regra === "contém" ? "Escreve:" : "Escreve exatamente:";

        parts.push(
          check.valores.length === 0
            ? { label, value: "não gerado", empty: true }
            : { label, value: this.shorten(check.valores.map(value => this.literal(value)).join(", ")) },
        );
      } else {
        const call = `${check.nome || "?"}(${check.argumentos})`;

        parts.push({
          label: "",
          value: this.shorten(
            check.valor === undefined ? `${call}: retorno não gerado` : `${call} retorna ${this.literal(check.valor)}`,
          ),
        });
      }
    }

    if (caso.verificações.length === 0) {
      parts.push({ label: "Verificações:", value: "nenhuma", empty: true });
    }

    return parts;
  }

  private literal(value: ExpectedValue) {
    return portugolLiteral(value.tipo, value.valor);
  }

  /**
   * Um trecho do resumo cortado: a linha do caso recolhido já corta o que não cabe, isto só evita
   * montar um texto enorme.
   */
  private shorten(text: string) {
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  }

  private countLabel(examples: number, tests: number) {
    return `${examples === 1 ? "1 exemplo" : `${examples} exemplos`} · ${tests === 1 ? "1 teste" : `${tests} testes`}`;
  }

  private async checkSolution(solution: string) {
    // Vazia ou só o esqueleto: falta escrever, não é um erro
    if (!isMeaningfulCode(solution)) {
      this.solutionProblem.set(null);
      return;
    }

    const blocked = this.builder.blockedLibraries(solution);

    if (blocked) {
      this.solutionProblem.set(blocked);
      return;
    }

    const result = await this.worker.checkCode(solution).catch(() => null);

    // Escrita de novo enquanto conferia: a próxima conferência decide
    if (result && this.solution() === solution) {
      this.solutionProblem.set(this.worker.hasCompileErrors(result) ? "A solução tem erros de compilação." : null);
    }
  }

  /**
   * Acompanha a largura da aba e a altura do cabeçalho: numa área larga o cabeçalho fica fixo no
   * alto, e as etapas e a rolagem até uma seção descontam a altura dele (`--builder-top`).
   */
  private watchLayout() {
    const root = this.host.nativeElement;
    const top = root.querySelector<HTMLElement>(".builder-top");
    const rem = () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let topMargin = -1;
    let stopSteps = () => {};

    const measure = () => {
      // Se o cabeçalho é fixo, quem decide é a consulta de contêiner do SCSS
      const sticky = top ? getComputedStyle(top).position === "sticky" : false;
      const height = top?.offsetHeight ?? 0;

      // As abas do enunciado mudam os papéis (abas ou região) no HTML: a largura vem daqui
      this.narrowStatement.set(root.clientWidth < 60 * rem());
      root.style.setProperty("--builder-top", `${height}px`);

      // Um cabeçalho fixo cobre o alto da área: a etapa ativa é a que está logo abaixo dele. Um
      // pixel a mais: ao levar até uma seção, a de cima termina rente ao cabeçalho e não conta
      const margin = sticky ? height + 1 : 0;

      if (margin !== topMargin) {
        topMargin = margin;
        stopSteps();
        stopSteps = this.watchSteps(margin);
      }
    };

    const resize = new ResizeObserver(measure);

    resize.observe(root);

    if (top) {
      resize.observe(top);
    }

    measure();

    this.lifetime.onDestroy(() => {
      resize.disconnect();
      stopSteps();
    });
  }

  private watchSteps(topMargin: number) {
    const root = this.host.nativeElement;
    const atBottom = () => root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => (entry.target as HTMLElement).dataset["step"] as Step);

        // A última seção não chega ao alto da área: no fim da rolagem, é ela a da tela
        if (atBottom()) {
          this.activeStep.set("compartilhar");
        } else if (visible.length > 0) {
          this.activeStep.set(visible[0]);
        }
      },
      // A etapa ativa é a que ocupa o terço de cima da área
      { root, rootMargin: `-${topMargin}px 0px -66% 0px` },
    );

    for (const section of root.querySelectorAll("[data-step]")) {
      observer.observe(section);
    }

    const onScroll = () => {
      if (atBottom()) {
        this.activeStep.set("compartilhar");
      }
    };

    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }

  private editorOptions(ariaLabel: string): monaco.editor.IStandaloneEditorConstructionOptions {
    return {
      // As configurações do editor (fonte, tabulação, quebra de linha), como nas abas de código
      ...this.editorSettings(),
      theme: this.editorTheme(),
      language: "portugol",
      ariaLabel,
      automaticLayout: true,
      minimap: { enabled: false },
      // Menos margem à esquerda: no celular, sobra mais largura para o código
      folding: false,
      lineNumbersMinChars: 3,
      scrollBeyondLastLine: false,
      detectIndentation: false,
      tabCompletion: "on",
    };
  }

  /**
   * Os tópicos do índice de exercícios, que a lista já baixou: sem carregar o zod do esquema.
   */
  private async loadTopics() {
    try {
      const index = await this.exercises.loadIndex();

      this.topics.set(index.map(topic => ({ id: topic.tópico, name: topic.nome })));
    } catch {
      // Sem o índice, os tópicos vêm do esquema: sem eles, a lista de tópicos ficaria vazia
      try {
        const { tópicos } = await import("@portugol-webstudio/resources/exercicios/esquema");

        this.topics.set(Object.entries(tópicos).map(([id, name]) => ({ id: id as Exercício["tópico"], name })));
      } catch (error) {
        console.error(error);
      }
    }
  }
}
