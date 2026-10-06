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
        this.addTab();
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
      this.closeTab(tab);
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
        this.addTab();
        return;
      }

      case "#exemplos": {
        this.clearHash();
        this.openExamplesDialog();
        return;
      }

      case "#ajuda": {
        this.clearHash();
        this.upsertHelpTab();
        return;
      }

      default:
    }

    if (hash.startsWith("#share=")) {
      this.clearHash();
      void this.loadSharedCode(hash.slice(7));
    } else if (hash.startsWith("#ajuda=")) {
      this.clearHash();
      this.upsertHelpTab();

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
    const data = await this.shareService.load(hash);

    loading.close();

    if (data) {
      this.addTab(`Código compartilhado (#${hash})`, data);
      this.gaService.event("load_shared_code_success", "Interface", "Código compartilhado carregado");
    } else {
      this.toast.error("Erro ao carregar código compartilhado", { duration: 10_000, dismissible: true });
      this.gaService.event("load_shared_code_error", "Interface", "Erro ao carregar código compartilhado");
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
      this.closeTab(tab);
    } else {
      this.changeTabTitle(tab);
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
      this.closeTab(tab);
      return;
    }

    if (tab && event.key === "F2") {
      event.preventDefault();
      this.changeTabTitle(tab);
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

  addTab(title?: string, contents?: string) {
    this.workspace.addTab(title, contents);
    this.gaService.event("new_tab_top", "Editor", "Nova aba", this.workspace.tabs().length);
    this.selectTab(this.workspace.activeTabId());
    this.focusNewTab(this.workspace.activeTab());
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
      this.gaService.event("open_file", "Interface", "Abrir arquivo");
      this.addTab(file.name, await this.fileService.getContents(file));
    }
  }

  closeTab(tab: Tab) {
    // A aba fechada leva junto o botão que estava em foco: o foco vai para a
    // aba que ficou no lugar.
    const confirmClose = () => {
      this.workspace.closeTab(tab.id);
      this.gaService.event("close_tab", "Interface", "Fechar aba", this.workspace.tabs().length);
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
      ariaLabelledBy: "dialogo-fechar-aba-titulo",
      restoreFocus: ACTIVE_TAB_SELECTOR,
    });

    ref.closed.subscribe(result => {
      if (result) {
        confirmClose();
      }
    });
  }

  changeTabTitle(tab: Tab) {
    if (tab.type !== "editor") {
      return;
    }

    this.gaService.event("edit_tab_title", "Interface", "Editar título de aba");

    const ref = this.dialog.open<string>(DialogRenameTabComponent, {
      data: { title: tab.title },
      width: "28rem",
      ariaLabelledBy: "dialogo-renomear-aba-titulo",
      restoreFocus: ACTIVE_TAB_SELECTOR,
    });

    ref.closed.subscribe(result => {
      if (result) {
        this.workspace.renameTab(tab.id, result);
      }
    });
  }

  upsertHelpTab() {
    this.upsertSingleTab(
      this.workspace.upsertHelpTab(),
      "help",
      "Nova aba de ajuda",
      "Selecionar aba de ajuda já aberta",
    );
  }

  upsertChangelogTab() {
    this.upsertSingleTab(
      this.workspace.upsertChangelogTab(),
      "changelog",
      "Nova aba de novidades",
      "Selecionar aba de novidades já aberta",
    );
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

  openExamplesDialog() {
    this.gaService.event("open_examples_dialog", "Interface", "Abrir diálogo de exemplos");

    const ref = this.dialog.open<{ title: string; code: string }>(DialogOpenExampleComponent, {
      width: "min(92vw, 960px)",
      height: "min(85dvh, 640px)",
      ariaLabelledBy: "dialogo-exemplos-titulo",
    });

    ref.closed.subscribe(example => {
      if (example) {
        this.gaService.event("open_example", "Diálogo de Exemplos", `Abrir exemplo: ${example.title}`);
        this.addTab(example.title, example.code);
      }
    });
  }

  openSettingsDialog(section?: SettingsSectionId) {
    // A aba Inicial e o editor já registram de onde o diálogo foi aberto.
    this.dialog.open(DialogSettingsComponent, {
      data: { section },
      width: "min(92vw, 768px)",
      // Alto o bastante para a prévia do editor e os controles abaixo dela
      height: "min(90dvh, 720px)",
      ariaLabelledBy: "dialogo-configuracoes-titulo",
    });
  }
}
