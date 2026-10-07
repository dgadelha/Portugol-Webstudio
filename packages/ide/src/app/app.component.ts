import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { HotToastService } from "@ngxpert/hot-toast";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService, NgxGoogleAnalyticsModule } from "ngx-google-analytics";

import { settings } from "../settings";
import { IS_BETA } from "./beta";
import { DialogConfirmCloseTabComponent } from "./dialog-confirm-close-tab/dialog-confirm-close-tab.component";
import { DialogOpenExampleComponent } from "./dialog-open-example/dialog-open-example.component";
import { DialogRenameTabComponent } from "./dialog-rename-tab/dialog-rename-tab.component";
import { DialogSettingsComponent, SettingsSectionId } from "./dialog-settings/dialog-settings.component";
import { FileService } from "./file.service";
import { SettingsService } from "./settings.service";
import { ShareService } from "./share.service";
import { SurveyService } from "./survey.service";
import { atalhoDoEvento } from "./shared/atalhos";
import { DialogService } from "./shared/dialog.service";
import { ACTIVE_TAB_SELECTOR, focusAfterRender } from "./shared/focus";
import { moveRovingFocus } from "./shared/roving-focus";
import { TooltipDirective } from "./shared/tooltip.directive";
import { TabChangelogComponent } from "./tab-changelog/tab-changelog.component";
import { TabEditorComponent } from "./tab-editor/tab-editor.component";
import { TabHelpComponent } from "./tab-help/tab-help.component";
import { TabStartComponent } from "./tab-start/tab-start.component";
import { WorkspaceService } from "./workspace.service";
import { isMeaningfulCode, Tab, TabType } from "./workspace.types";

/**
 * O IDE no formato do VS Code: barra de atividades à esquerda, abas em cima do
 * conteúdo e barra de status embaixo.
 */
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
  private toast = inject(HotToastService);
  private dialog = inject(DialogService);
  private fileService = inject(FileService);
  private shareService = inject(ShareService);
  private workspace = inject(WorkspaceService);
  private settingsService = inject(SettingsService);
  private injector = inject(Injector);
  private zone = inject(NgZone);
  private survey = inject(SurveyService);

  private readonly tablist = viewChild.required<ElementRef<HTMLElement>>("tablist");
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput");
  private openFileOrigin: Origin = "inicio";
  private readonly editors = viewChildren(TabEditorComponent);

  readonly tabs = this.workspace.tabs;
  readonly activeTabId = this.workspace.activeTabId;
  readonly isBeta = IS_BETA;

  readonly tabIcons: Record<TabType, string> = {
    editor: "assets/mdi/file-document-outline.svg",
    help: "assets/mdi/help-circle-outline.svg",
    changelog: "assets/mdi/newspaper.svg",
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
    };
  });

  readonly problemsLabel = computed(() => {
    const { errors, warnings } = this.problemCounts();

    return `${errors} ${errors === 1 ? "erro" : "erros"} e ${warnings} ${warnings === 1 ? "aviso" : "avisos"}. Ver os problemas do código`;
  });

  ngOnInit() {
    if (this.workspace.restoredFromPreviousSession()) {
      this.toast.show("Recuperamos o código que você estava editando.", { duration: 8000 });

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

      default:
    }
  }

  closeActiveTab() {
    const tab = this.workspace.activeTab();

    if (tab) {
      this.closeTab(tab, "atalho");
    }
  }

  /**
   * Endereços que abrem algo no IDE: `#share=<id>` (código compartilhado) e
   * `#ajuda=<arquivo>` (um tópico da Ajuda, como nos links entre tópicos). Os
   * atalhos do app instalado (`shortcuts` no `manifest.webmanifest`) usam
   * `#novo`, `#exemplos` e `#ajuda`.
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
          this.addTab(file.name, await this.fileService.getContents(file));
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
      this.addTab(`Código compartilhado (#${hash})`, result.value);
      this.gaService.event("load_shared_code_success", "Interface", "link");
    } else {
      this.toast.error("Erro ao carregar código compartilhado", { duration: 10_000, dismissible: true });
      this.gaService.event("load_shared_code_error", "Interface", result.reason);
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
   * WAI-ARIA), Delete fecha e F2 renomeia.
   */
  private onTabKeydown(event: KeyboardEvent) {
    const tab = this.workspace.activeTab();

    if (tab && event.key === "Delete") {
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

    // A aba escolhida aparece inteira, mesmo com muitas abas abertas.
    afterNextRender(
      () => {
        this.tablist()
          .nativeElement.querySelector(ACTIVE_TAB_SELECTOR)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
      },
      { injector: this.injector },
    );
  }

  /**
   * Uma aba vazia pedida por quem usa. Só ela conta como `new_tab_top`: as abas de
   * arquivos, exemplos e links têm eventos próprios.
   */
  newTab(origin: Origin) {
    this.addTab();
    this.gaService.event("new_tab_top", "Editor", origin, this.workspace.tabs().length);
  }

  addTab(title?: string, contents?: string) {
    this.workspace.addTab(title, contents);
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
      this.addTab(file.name, await this.fileService.getContents(file));
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
    if (
      tab.type !== "editor" ||
      !isMeaningfulCode(tab.contents) ||
      !this.settingsService.get(settings.interfaceConfirmCloseTab)
    ) {
      confirmClose();
      return;
    }

    const ref = this.dialog.open<boolean>(DialogConfirmCloseTabComponent, {
      data: { title: tab.title },
      width: "28rem",
      ariaLabelledBy: "exampleDialog-fechar-aba-titulo",
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
    if (tab.type !== "editor") {
      return;
    }

    const ref = this.dialog.open<string>(DialogRenameTabComponent, {
      data: { title: tab.title },
      width: "28rem",
      ariaLabelledBy: "exampleDialog-renomear-aba-titulo",
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
        width: "min(92vw, 960px)",
        height: "min(85dvh, 640px)",
        ariaLabelledBy: "exampleDialog-exemplos-titulo",
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
      ariaLabelledBy: "exampleDialog-configuracoes-titulo",
    });
  }
}
