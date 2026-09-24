import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";
import { DialogConfirmCloseTabComponent } from "./dialog-confirm-close-tab/dialog-confirm-close-tab.component";
import { DialogRenameTabComponent } from "./dialog-rename-tab/dialog-rename-tab.component";
import { DialogSettingsComponent } from "./dialog-settings/dialog-settings.component";
import { ShareService } from "./share.service";
import { WorkspaceService } from "./workspace.service";
import { isMeaningfulCode, Tab } from "./workspace.types";

@Component({
  selector: "app-root",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AppComponent implements OnInit, OnDestroy {
  private gaService = inject(GoogleAnalyticsService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private shareService = inject(ShareService);
  private workspace = inject(WorkspaceService);

  renameDialogRef?: MatDialogRef<DialogRenameTabComponent>;
  renameDialogSubscription?: Subscription;
  closeDialogRef?: MatDialogRef<DialogConfirmCloseTabComponent>;
  closeDialogSubscription?: Subscription;

  readonly tabs = this.workspace.tabs;

  /**
   * A aba inicial ocupa a posição 0, então as abas do usuário começam em 1.
   */
  readonly selectedIndex = computed(() => {
    const activeTabId = this.workspace.activeTabId();
    const position = this.workspace.tabs().findIndex(tab => tab.id === activeTabId);

    return position === -1 ? 0 : position + 1;
  });

  shortcuts: ShortcutInput[] = [
    {
      key: "ctrl + q",
      preventDefault: true,
      command: () => {
        const tab = this.workspace.activeTab();

        if (tab) {
          this.closeTab(tab);
        }
      },
    },
    {
      key: "ctrl + n",
      preventDefault: true,
      command: () => {
        this.addTab();
      },
    },
  ];

  ngOnInit() {
    if (this.workspace.restoredFromPreviousSession()) {
      this.snack.open("Recuperamos o código que você estava editando.", "OK", { duration: 8000 });

      this.gaService.event(
        "workspace_restored",
        "Interface",
        "Código recuperado de uma sessão anterior",
        this.workspace.tabs().length,
      );
    } else if (!this.workspace.persistenceAvailable) {
      this.snack.open(
        "Seu navegador não está salvando o código automaticamente. Baixe o arquivo antes de fechar a aba.",
        "OK",
        { duration: 15_000 },
      );

      this.gaService.event(
        "workspace_storage_unavailable",
        "Interface",
        "Não foi possível salvar o código no navegador",
      );
    }

    void (async () => {
      if (window.location.hash.startsWith("#share=")) {
        this.snack.open("Carregando código compartilhado…", undefined, { duration: -1 });

        const hash = window.location.hash.slice(7);
        const data = await this.shareService.load(hash);

        if (data) {
          this.addTab(`Código compartilhado (#${hash})`, data);
          this.snack.dismiss();
          this.gaService.event("load_shared_code_success", "Interface", "Código compartilhado carregado");

          // O código agora vive na área de trabalho: manter o `#share=` faria
          // cada recarregamento abrir uma cópia nova da mesma aba.
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
          this.snack.dismiss();
          this.snack.open("Erro ao carregar código compartilhado", "FECHAR", { duration: 10_000 });
          this.gaService.event("load_shared_code_error", "Interface", "Erro ao carregar código compartilhado");
        }
      }
    })();
  }

  ngOnDestroy() {
    this.renameDialogSubscription?.unsubscribe();
    this.closeDialogSubscription?.unsubscribe();
  }

  selectTab(index: number) {
    const tabs = this.workspace.tabs();

    this.workspace.setActiveTab(index >= 1 && index <= tabs.length ? tabs[index - 1].id : null);
  }

  addTab(title?: string, contents?: string) {
    this.workspace.addTab(title, contents);
    this.gaService.event("new_tab_top", "Editor", "Nova aba", this.workspace.tabs().length);
  }

  closeTab(tab: Tab) {
    const confirmClose = () => {
      this.workspace.closeTab(tab.id);
      this.gaService.event("close_tab", "Interface", "Fechar aba", this.workspace.tabs().length);
    };

    // Só vale interromper quem tem algo a perder: aba de ajuda e aba intocada
    // fecham direto.
    if (tab.type !== "editor" || !isMeaningfulCode(tab.contents)) {
      confirmClose();
      return;
    }

    this.closeDialogRef = this.dialog.open(DialogConfirmCloseTabComponent, {
      data: { title: tab.title },
    });

    this.closeDialogSubscription = this.closeDialogRef.afterClosed().subscribe(result => {
      if (result) {
        confirmClose();
      }

      this.closeDialogSubscription?.unsubscribe();
    });
  }

  changeTabTitle(tab: Tab) {
    if (tab.type !== "editor") {
      return;
    }

    this.gaService.event("edit_tab_title", "Interface", "Editar título de aba");

    this.renameDialogRef = this.dialog.open(DialogRenameTabComponent, {
      data: { title: tab.title },
    });

    this.renameDialogSubscription = this.renameDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspace.renameTab(tab.id, result);
      }

      this.renameDialogSubscription?.unsubscribe();
    });
  }

  upsertHelpTab() {
    const { created } = this.workspace.upsertHelpTab();

    if (created) {
      this.gaService.event("help_tab_open", "Interface", "Nova aba de ajuda");
    } else {
      this.gaService.event("help_tab_select", "Interface", "Selecionar aba de ajuda já aberta");
    }
  }

  openSettingsModal() {
    this.gaService.event("open_settings_modal", "Interface", "Abrir modal de configurações");
    this.dialog.open(DialogSettingsComponent);
  }
}
