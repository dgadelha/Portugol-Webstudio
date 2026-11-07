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
  NgZone,
  OnInit,
  viewChild,
  viewChildren,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService, NgxGoogleAnalyticsModule } from "ngx-google-analytics";

import { isMacintosh, settings } from "../settings";
import { IS_BETA } from "./beta";
import { DialogConfirmCloseTabComponent } from "./dialog-confirm-close-tab/dialog-confirm-close-tab.component";
import { DialogOpenExampleComponent } from "./dialog-open-example/dialog-open-example.component";
import {
  DialogOpenExerciseComponent,
  ExerciseDialogResult,
} from "./dialog-open-exercise/dialog-open-exercise.component";
import { DialogRenameTabComponent } from "./dialog-rename-tab/dialog-rename-tab.component";
import { DialogSettingsComponent, SettingsSectionId } from "./dialog-settings/dialog-settings.component";
import { draftTitle, emptyDraft, ExerciseDraft, readDraftFile } from "./exercise-draft";
import { ExerciseNotFoundError, exerciseLabel, ExercisesService, SHARED_PREFIX } from "./exercises.service";
import { FileService } from "./file.service";
import { SettingsService } from "./settings.service";
import { ShareService } from "./share.service";
import { atalhoDoEvento } from "./shared/atalhos";
import { DialogService } from "./shared/dialog.service";
import { ACTIVE_TAB_SELECTOR, focusAfterRender } from "./shared/focus";
import { moveRovingFocus } from "./shared/roving-focus";
import { TooltipDirective } from "./shared/tooltip.directive";
import { SurveyService } from "./survey.service";
import { TabChangelogComponent } from "./tab-changelog/tab-changelog.component";
import { TabEditorComponent } from "./tab-editor/tab-editor.component";
import { TabHelpComponent } from "./tab-help/tab-help.component";
import { TabExerciseBuilderComponent } from "./tab-exercise-builder/tab-exercise-builder.component";
import { TabStartComponent } from "./tab-start/tab-start.component";
import { WorkspaceService } from "./workspace.service";
import { hasMeaningfulContents } from "./tab-contents";
import { defaultCode, isOwnExerciseTab, Tab, TabExercise, TabType } from "./workspace.types";

/**
 * De onde veio a ação, enviado como rótulo dos eventos do Analytics: a aba Inicial, o
 * editor, a barra de abas, um atalho de teclado, um atalho do app instalado (ou um
 * endereço `#...`), um link da Ajuda ou a barra de status.
 */
type Origin = "inicio" | "editor" | "abas" | "atalho" | "app" | "link" | "barra_status";

@Component({
  selector: "app-root",
  imports: [
    AngularSvgIconModule,
    MonacoEditorModule,
    NgxGoogleAnalyticsModule,
    TabChangelogComponent,
    TabEditorComponent,
    TabHelpComponent,
    // Só dentro de um `@defer`: pouca gente cria exercícios, e a aba vem num pacote à parte
    TabExerciseBuilderComponent,
    TabStartComponent,
    TooltipDirective,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    "(keydown)": "onKeydown($event)",
    "(document:keydown)": "onShortcut($event)",
    "(click)": "onClick($event)",
    // Um link `#share=` ou `#ajuda=` colado na barra de endereço com o IDE já aberto, ou um
    // atalho do app instalado.
    "(window:hashchange)": "openFromHash()",
  },
})
export class AppComponent implements OnInit {
  private gaService = inject(GoogleAnalyticsService);
  private readonly lifetime = inject(DestroyRef);
  private toast = inject(HotToastService);
  private dialog = inject(DialogService);
  private fileService = inject(FileService);
  private shareService = inject(ShareService);
  private workspace = inject(WorkspaceService);
  private settingsService = inject(SettingsService);
  private injector = inject(Injector);
  private zone = inject(NgZone);
  private survey = inject(SurveyService);
  private exercises = inject(ExercisesService);

  private readonly tablist = viewChild.required<ElementRef<HTMLElement>>("tablist");
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput");
  private openFileOrigin: Origin = "inicio";
  private readonly editors = viewChildren(TabEditorComponent);

  readonly tabs = this.workspace.tabs;
  readonly activeTabId = this.workspace.activeTabId;
  readonly isBeta = IS_BETA;
  readonly isOwnExerciseTab = isOwnExerciseTab;

  readonly tabIcons: Record<TabType, string> = {
    editor: "assets/mdi/file-document-outline.svg",
    help: "assets/mdi/help-circle-outline.svg",
    changelog: "assets/mdi/newspaper.svg",
    "exercise-builder": "assets/mdi/puzzle-edit-outline.svg",
  };

  /**
   * O editor da aba em foco: as ações da barra de atividades e a barra de
   * status valem para ele.
   */
  readonly activeEditor = computed(() => this.editors().find(editor => editor.tabId() === this.activeTabId()));

  readonly problemCounts = computed(() => {
    const problems = this.activeEditor()?.problems() ?? [];

    return {
      errors: problems.filter(problem => problem.severity === "error").length,
      warnings: problems.filter(problem => problem.severity === "warning").length,
      infos: problems.filter(problem => problem.severity === "info").length,
    };
  });

  readonly problemsLabel = computed(() => {
    const { errors, warnings, infos } = this.problemCounts();
    const counts = [
      `${errors} ${errors === 1 ? "erro" : "erros"}`,
      `${warnings} ${warnings === 1 ? "aviso" : "avisos"}`,
    ];

    // As informações só aparecem quando existem, como no ícone da barra
    if (infos > 0) {
      counts.push(`${infos} ${infos === 1 ? "informação" : "informações"}`);
    }

    return `${counts.slice(0, -1).join(", ")} e ${counts.at(-1)}. Ver os problemas do código`;
  });

  constructor() {
    // A lista de abas muda de largura (o celular girado, a janela redimensionada): a aba
    // escolhida continua à vista
    afterNextRender(() => {
      const observer = new ResizeObserver(() => {
        this.scrollActiveTabIntoView();
      });

      observer.observe(this.tablist().nativeElement);
      this.lifetime.onDestroy(() => {
        observer.disconnect();
      });
    });

    // Um nome novo muda a largura da aba, mas não a da lista (renomear, ou uma cópia de
    // exercício que vira o exercício): a aba escolhida também volta à vista. Os nomes viram um
    // texto só para não rodar a cada tecla, que também muda a lista de abas.
    const titles = computed(() => {
      return this.workspace
        .tabs()
        .map(tab => tab.title)
        .join("\n");
    });

    effect(() => {
      titles();
      afterNextRender(
        () => {
          this.scrollActiveTabIntoView();
        },
        { injector: this.injector },
      );
    });
  }

  ngOnInit() {
    if (this.workspace.restoredFromPreviousSession()) {
      this.toast.show("Recuperamos o código que você estava editando.", { duration: 8000, dismissible: true });

      this.gaService.event(
        "workspace_restored",
        "Interface",
        "Código recuperado de uma sessão anterior",
        this.workspace.tabs().length,
      );
    } else if (!this.workspace.persistenceAvailable) {
      this.toast.warning(
        "Seu navegador não está salvando o código automaticamente. Baixe o arquivo antes de fechar a aba.",
        { duration: 15_000, dismissible: true },
      );

      this.gaService.event(
        "workspace_storage_unavailable",
        "Interface",
        "Não foi possível salvar o código no navegador",
      );
    }

    this.openFromHash();
    this.openLaunchedFiles();

    // Com muitas abas restauradas, a aba em foco pode começar fora da vista.
    this.selectTab(this.workspace.activeTabId());

    // A aba Inicial é a que aparece sem nenhuma aba ativa.
    this.survey.inviteOnStart(() => this.workspace.activeTabId() === null);
  }

  onShortcut(event: KeyboardEvent) {
    switch (atalhoDoEvento(event)) {
      case "alt+n": {
        event.preventDefault();
        this.newTab("atalho");
        break;
      }

      case "alt+w": {
        event.preventDefault();
        this.closeActiveTab();
        break;
      }

      // Em todas as abas, a Inicial também: sem isso, o F1 do navegador abriria a ajuda dele.
      // Nos editores de código e de saída, os atalhos são deles (`TabEditorComponent.initShortcuts`).
      case "f1": {
        event.preventDefault();
        this.upsertHelpTab("atalho");
        break;
      }

      case "ctrl+o": {
        event.preventDefault();
        this.chooseFiles("atalho");
        break;
      }

      default: {
        // Num diálogo, o F1 não faz nada: a Ajuda abriria atrás dele, e a do navegador, numa aba
        // nova. Só o F1 sem outras teclas abre a ajuda do navegador.
        if (event.key === "F1" && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
          event.preventDefault();
        }
      }
    }
  }

  closeActiveTab() {
    const tab = this.workspace.activeTab();

    if (tab) {
      this.closeTab(tab, "atalho");
    }
  }

  /**
   * Endereços que abrem algo no IDE: `#share=<id>` (código compartilhado), `#exercise=<id>`
   * (exercício compartilhado) e `#ajuda=<arquivo>` (um tópico da Ajuda, como nos links entre tópicos). Os
   * atalhos do app instalado (`shortcuts` no `manifest.webmanifest`) usam
   * `#novo`, `#exemplos` e `#ajuda`; `#exercicios` abre a lista de exercícios.
   */
  openFromHash() {
    const hash = window.location.hash;

    // O que o endereço pede é aberto uma vez só: mantê-lo faria cada
    // recarregamento abrir de novo (ou repetir o erro de um link inválido).
    switch (hash) {
      case "#novo": {
        this.clearHash();
        this.newTab("app");
        return;
      }

      case "#exemplos": {
        this.clearHash();
        this.openExamplesDialog("app");
        return;
      }

      case "#exercicios": {
        this.clearHash();
        this.openExercisesDialog("app");
        return;
      }

      case "#ajuda": {
        this.clearHash();
        this.upsertHelpTab("app");
        return;
      }

      default:
    }

    if (hash.startsWith("#share=")) {
      this.clearHash();
      void this.loadSharedCode(hash.slice(7));
    } else if (hash.startsWith("#exercise=")) {
      this.clearHash();

      // Só o que um id de link pode ser: o resto não chega ao armazenamento
      const id = hash.slice(10);

      if (/^[a-z0-9]{6,32}$/.test(id)) {
        void this.loadSharedExercise(id);
      } else {
        this.toast.error("O link do exercício expirou ou não existe.", { duration: 5000 });
      }
    } else if (hash.startsWith("#ajuda=")) {
      this.clearHash();
      this.upsertHelpTab("link");

      // Um `%` solto num endereço colado à mão faz o `decodeURIComponent` lançar.
      let topico: string;

      try {
        topico = decodeURIComponent(hash.slice(7));
      } catch {
        return;
      }

      // A aba de Ajuda abre o tópico quando os tópicos carregarem.
      this.workspace.helpTopicRequest.set(topico);
    }
  }

  /**
   * Arquivos `.por` abertos pelo sistema com o app instalado (`file_handlers` no
   * `manifest.webmanifest`). Com o IDE já aberto, eles chegam nesta mesma janela.
   */
  private openLaunchedFiles() {
    const { launchQueue } = window;

    launchQueue?.setConsumer(params => {
      void this.zone.run(async () => {
        for (const handle of params.files) {
          if (handle.kind !== "file") {
            continue;
          }

          const file = await (handle as FileSystemFileHandle).getFile();

          this.gaService.event("open_file_launch", "Interface", "Abrir arquivo pelo sistema");
          await this.openCode(file.name, await this.fileService.getContents(file));
        }
      });
    });
  }

  private clearHash() {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  private async loadSharedCode(hash: string) {
    const loading = this.toast.loading("Carregando código compartilhado…");
    const result = await this.shareService.load(hash);

    loading.close();

    if (result.ok) {
      await this.openCode(`Código compartilhado (#${hash})`, result.value);
      this.gaService.event("load_shared_code_success", "Interface", "link");
    } else {
      this.toast.error(
        result.reason === "offline"
          ? "Sem internet para abrir o código compartilhado. Conecte-se e abra o link de novo."
          : "Erro ao carregar código compartilhado",
        { duration: 10_000, dismissible: true },
      );
      this.gaService.event("load_shared_code_error", "Interface", result.reason);
    }
  }

  /**
   * O aviso de carregando só aparece se demorar: com a aba já aberta ou o exercício guardado
   * neste navegador, abrir termina antes de o aviso aparecer na tela, e o `close` de um aviso
   * que ainda não apareceu não faz nada (ele ficaria aberto até o tempo dele acabar).
   */
  private async loadSharedExercise(id: string) {
    let loading: CreateHotToastRef<unknown> | undefined;
    const timer = setTimeout(() => {
      loading = this.toast.loading("Carregando exercício compartilhado…");
    }, 300);

    try {
      await this.openExercise(`${SHARED_PREFIX}${id}`);
    } finally {
      clearTimeout(timer);
      loading?.close();
    }
  }

  private readonly insertSpaces = toSignal(this.settingsService.observe(settings.editorInsertSpaces));
  private readonly tabSize = toSignal(this.settingsService.observe(settings.editorTabSize));

  readonly indentationLabel = computed(() =>
    this.insertSpaces() ? `Espaços: ${this.tabSize()}` : `Tabulação: ${this.tabSize()}`,
  );

  /**
   * O link "Ir para o conteúdo" leva o foco para dentro da aba em foco.
   */
  focusContent(event: Event) {
    event.preventDefault();

    const editor = this.activeEditor();

    if (editor) {
      editor.focusEditor();
    } else {
      document.querySelector<HTMLElement>(".tab-panel:not([hidden])")?.focus();
    }
  }

  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    if (target.matches("[role=tab]") && this.tablist().nativeElement.contains(target)) {
      this.onTabKeydown(event);
    }
  }

  /**
   * Os botões de renomear e fechar de cada aba são atalhos para o mouse: pelo
   * teclado, F2 e Delete fazem o mesmo na aba em foco, como anuncia o
   * `aria-describedby` das abas. Por isso eles ficam fora da árvore de
   * acessibilidade, e os cliques chegam por aqui.
   */
  onClick(event: MouseEvent) {
    const action = (event.target as HTMLElement).closest<HTMLElement>("[data-tab-action]");
    const tab = this.tabs().find(item => item.id === action?.dataset["tabId"]);

    if (!action || !tab) {
      return;
    }

    if (action.dataset["tabAction"] === "close") {
      this.closeTab(tab, "abas");
    } else {
      this.changeTabTitle(tab, "abas");
    }
  }

  /**
   * Nas abas, as setas trocam de aba (como no VS Code e no padrão de abas da
   * WAI-ARIA), Delete fecha e F2 renomeia. No Mac, a tecla Delete é o Backspace.
   */
  private onTabKeydown(event: KeyboardEvent) {
    const tab = this.workspace.activeTab();

    const semModificador = !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;

    if (tab && semModificador && (event.key === "Delete" || (isMacintosh && event.key === "Backspace"))) {
      event.preventDefault();
      this.closeTab(tab, "atalho");
      return;
    }

    if (tab && event.key === "F2") {
      event.preventDefault();
      this.changeTabTitle(tab, "atalho");
      return;
    }

    const target = moveRovingFocus(event, this.tablist().nativeElement, "[role=tab]", "horizontal");

    target?.click();
  }

  private focusActiveTab() {
    focusAfterRender(this.injector, () => this.tablist().nativeElement.querySelector(ACTIVE_TAB_SELECTOR));
  }

  /**
   * Leva o foco para o conteúdo de uma aba recém-aberta: o código, numa aba de
   * código (que se foca sozinha quando o Monaco fica pronto), ou a própria aba
   * nas outras. Sem isso, o foco ficaria perdido no `<body>`.
   */
  private focusNewTab(tab: Tab | null) {
    const editor = this.editors().find(item => item.tabId() === tab?.id);

    if (editor?.codeEditor) {
      editor.focusEditor();
    } else if (tab?.type === "editor") {
      this.workspace.requestFocus(tab.id);
    } else {
      this.focusActiveTab();
    }
  }

  selectTab(tabId: string | null) {
    this.workspace.setActiveTab(tabId);

    // A aba escolhida aparece inteira, com os botões de renomear e fechar, mesmo com muitas
    // abas abertas
    afterNextRender(
      () => {
        this.scrollActiveTabIntoView();
      },
      { injector: this.injector },
    );
  }

  private scrollActiveTabIntoView() {
    this.tablist()
      .nativeElement.querySelector(ACTIVE_TAB_SELECTOR)
      ?.closest(".tab")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /**
   * Uma aba vazia pedida por quem usa. Só ela conta como `new_tab_top`: as abas de
   * arquivos, exemplos e links têm eventos próprios.
   */
  newTab(origin: Origin) {
    this.addTab();
    this.gaService.event("new_tab_top", "Editor", origin, this.workspace.tabs().length);
  }

  addTab(title?: string, contents?: string, exercise?: TabExercise) {
    this.workspace.addTab(title, contents, exercise);
    this.selectTab(this.workspace.activeTabId());
    this.focusNewTab(this.workspace.activeTab());
  }

  /**
   * O seletor de arquivos é um só: a origem fica guardada até o arquivo ser escolhido.
   */
  chooseFiles(origin: Origin) {
    this.openFileOrigin = origin;
    this.fileInput().nativeElement.click();
  }

  /**
   * Abrir um arquivo sempre cria uma aba nova: nada do que está aberto é
   * substituído.
   */
  async openFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];

    // Permite abrir o mesmo arquivo de novo logo em seguida.
    input.value = "";

    for (const file of files) {
      this.gaService.event("open_file", "Interface", this.openFileOrigin);
      await this.openCode(file.name, await this.fileService.getContents(file));
    }
  }

  /**
   * Pelo X ou o clique do meio (`abas`), ou por Delete e Alt+W (`atalho`).
   */
  closeTab(tab: Tab, origin: "abas" | "atalho") {
    // A aba fechada leva junto o botão que estava em foco: o foco vai para a
    // aba que ficou no lugar.
    const confirmClose = () => {
      this.workspace.closeTab(tab.id);
      // O `value` vai nas opções: o `event` do ngx-google-analytics descarta o 0 (a última aba)
      this.gaService.event("close_tab", "Interface", origin, undefined, undefined, {
        value: this.workspace.tabs().length,
      });
      this.focusActiveTab();
    };

    // Só vale interromper quem tem algo a perder: aba de ajuda e aba intocada
    // fecham direto, e quem desligou a confirmação também.
    // O código de um exercício fica guardado com o progresso: reabrir o exercício o traz de volta
    // (uma cópia não guarda nada, então pergunta como uma aba comum)
    // A criação de um exercício pergunta como uma aba de código: o rascunho só está nela
    const meaningful = !isOwnExerciseTab(tab) && hasMeaningfulContents(tab.type, tab.contents);

    if (!meaningful || !this.settingsService.get(settings.interfaceConfirmCloseTab)) {
      confirmClose();
      return;
    }

    const ref = this.dialog.open<boolean>(DialogConfirmCloseTabComponent, {
      data: { title: tab.title, exercise: tab.type === "exercise-builder" },
      width: "28rem",
      ariaLabelledBy: "dialogo-fechar-aba-titulo",
      ariaDescribedBy: "dialogo-fechar-aba-descricao",
      restoreFocus: ACTIVE_TAB_SELECTOR,
    });

    ref.closed.subscribe(result => {
      // Se a confirmação evita perder código: quantas vezes a pessoa desiste de fechar
      this.gaService.event("close_tab_confirm", "Interface", result ? "fechar" : "manter");

      if (result) {
        confirmClose();
      }
    });
  }

  /**
   * `edit_tab_title` conta o nome trocado, e `edit_tab_title_cancel`, a desistência, com a
   * origem: o duplo clique ou o lápis (`abas`), ou o F2 (`atalho`). O nome não é enviado.
   */
  changeTabTitle(tab: Tab, origin: "abas" | "atalho") {
    // A aba de um exercício tem o nome dele; uma cópia tem o nome do arquivo, e esse muda
    if (tab.type !== "editor" || isOwnExerciseTab(tab)) {
      return;
    }

    const ref = this.dialog.open<string>(DialogRenameTabComponent, {
      data: { title: tab.title },
      width: "28rem",
      ariaLabelledBy: "dialogo-renomear-aba-titulo",
      restoreFocus: ACTIVE_TAB_SELECTOR,
    });

    ref.closed.subscribe(result => {
      this.gaService.event(result ? "edit_tab_title" : "edit_tab_title_cancel", "Interface", origin);

      if (result) {
        this.workspace.renameTab(tab.id, result);
      }
    });
  }

  upsertHelpTab(origin: Origin) {
    this.upsertSingleTab(this.workspace.upsertHelpTab(), "help", origin, origin);
  }

  upsertChangelogTab(origin: "inicio" | "sobre") {
    this.upsertSingleTab(this.workspace.upsertChangelogTab(), "changelog", origin, origin);
  }

  /**
   * A Ajuda e o histórico são abas únicas: registra se a aba foi criada ou só
   * trazida para frente, e leva o foco até ela.
   */
  private upsertSingleTab({ created }: { created: boolean }, kind: string, openLabel: string, selectLabel: string) {
    if (created) {
      this.gaService.event(`${kind}_tab_open`, "Interface", openLabel);
    } else {
      this.gaService.event(`${kind}_tab_select`, "Interface", selectLabel);
    }

    this.focusNewTab(this.workspace.activeTab());
  }

  openExamplesDialog(origin: Origin) {
    this.gaService.event("open_examples_dialog", "Interface", origin);

    const ref = this.dialog.open<{ title: string; code: string; file?: string }, unknown, DialogOpenExampleComponent>(
      DialogOpenExampleComponent,
      {
        width: "min(92vw, 60rem)",
        height: "min(85dvh, 640px)",
        ariaLabelledBy: "dialogo-exemplos-titulo",
      },
    );

    const exampleDialog = ref.componentInstance;

    ref.closed.subscribe(example => {
      // Só se algo foi buscado, e sem o texto da busca: se ela levou a um exemplo, não achou
      // nada, ou a pessoa desistiu. O valor é o número de resultados.
      if (exampleDialog?.query.trim()) {
        const results = exampleDialog.filtered.length;
        const outcome = example ? "aberto" : results === 0 ? "sem_resultado" : "fechado";

        this.gaService.event("examples_search", "Diálogo de Exemplos", outcome, undefined, undefined, {
          value: results,
        });
      }

      if (example) {
        this.gaService.event("open_example", "Diálogo de Exemplos", example.file ?? example.title);
        this.addTab(example.title, example.code);
      }
    });
  }

  openExercisesDialog(origin: Origin) {
    this.gaService.event("open_exercises_dialog", "Interface", origin);

    const ref = this.dialog.open<ExerciseDialogResult, unknown, DialogOpenExerciseComponent>(
      DialogOpenExerciseComponent,
      {
        width: "min(92vw, 60rem)",
        height: "min(85dvh, 640px)",
        ariaLabelledBy: "dialogo-exercicios-titulo",
      },
    );

    ref.closed.subscribe(choice => {
      if (choice && "create" in choice) {
        this.newExerciseBuilder();
      } else if (choice) {
        void this.openExercise(choice.id);
      }
    });
  }

  /**
   * Uma aba para criar um exercício, que começa com o esqueleto de um programa na solução.
   */
  newExerciseBuilder() {
    this.gaService.event("exercise_builder_new", "Exercícios");

    const draft = emptyDraft(defaultCode(this.settingsService.editorIndentation()));

    this.openBuilderTab(draft);
  }

  private openBuilderTab(draft: ExerciseDraft) {
    this.workspace.addBuilderTab(draftTitle(draft), JSON.stringify(draft));
    this.focusNewTab(this.workspace.activeTab());
  }

  /**
   * Cada exercício tem uma aba só: abrir de novo leva até ela. Uma aba nova começa com o
   * último código escrito no exercício, ou com o código inicial dele.
   */
  async openExercise(exerciseId: string) {
    const existing = this.workspace.exerciseTab(exerciseId);

    if (existing) {
      this.selectTab(existing.id);
      this.focusNewTab(existing);
      return;
    }

    try {
      const exercise = await this.exercises.load(exerciseId);
      const contents = this.exercises.initialCode(exercise, defaultCode(this.settingsService.editorIndentation()));
      const opened = this.workspace.exerciseTab(exerciseId);

      // Aberto por outro caminho enquanto carregava
      if (opened) {
        this.selectTab(opened.id);
        this.focusNewTab(opened);
        return;
      }

      this.gaService.event("open_exercise", "Exercícios", exerciseLabel(exerciseId));
      this.addTab(exercise.título, contents, { id: exerciseId });
    } catch (error) {
      const expired = error instanceof ExerciseNotFoundError && exerciseId.startsWith(SHARED_PREFIX);

      this.toast.error(
        expired ? "O link do exercício expirou ou não existe." : "Não foi possível carregar o exercício.",
        { duration: 5000 },
      );
    }
  }

  /**
   * Abre o código de um arquivo ou de um link. Com o comentário de um exercício, ele abre como
   * uma cópia do exercício, com o nome do arquivo: dá para abrir vários arquivos do mesmo
   * exercício, e nenhum mexe no progresso. Se o exercício não existir aqui, abre numa aba
   * comum, com o comentário, para nada se perder.
   */
  private async openCode(title: string, contents: string) {
    // Um exercício baixado da criação de exercícios volta para uma aba de criação
    const draft = await readDraftFile(title, contents);

    if (draft === "invalid") {
      this.toast.error("O arquivo do exercício não segue o formato e não foi aberto.", { duration: 5000 });
      return;
    }

    if (draft) {
      this.openBuilderTab(draft.draft);
      return;
    }

    const { code, exerciseId } = this.exercises.extractMarker(contents);

    if (exerciseId) {
      try {
        await this.exercises.load(exerciseId);
        this.addTab(title, code, { id: exerciseId, copy: true });
        return;
      } catch (error) {
        // Sem conexão, abre como cópia mesmo assim: a aba tenta carregar o exercício de novo.
        // Só um exercício que não existe aqui abre numa aba comum
        if (!(error instanceof ExerciseNotFoundError)) {
          this.addTab(title, code, { id: exerciseId, copy: true });
          return;
        }
      }
    }

    this.addTab(title, contents);
  }

  openStatusBarSettings() {
    this.gaService.event("open_settings_dialog", "Barra de status", "barra_status");
    this.openSettingsDialog("editor");
  }

  openSettingsDialog(section?: SettingsSectionId) {
    // A aba Inicial e o editor registram o próprio evento; a barra de status, o dela.
    this.dialog.open(DialogSettingsComponent, {
      data: { section },
      width: "min(92vw, 768px)",
      // Alto o bastante para a prévia do editor e os controles abaixo dela
      height: "min(90dvh, 720px)",
      ariaLabelledBy: "dialogo-configuracoes-titulo",
    });
  }
}
