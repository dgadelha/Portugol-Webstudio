import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";
import { DialogConfirmCloseTabComponent } from "./dialog-confirm-close-tab/dialog-confirm-close-tab.component";
import { DialogRenameTabComponent } from "./dialog-rename-tab/dialog-rename-tab.component";
import { DialogSettingsComponent } from "./dialog-settings/dialog-settings.component";
import { ShareService } from "./share.service";

interface Tab {
  id: number;
  title: string;
  contents?: string;
  type: "editor" | "help";
}

@Component({
  selector: "app-root",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {
  private gaService = inject(GoogleAnalyticsService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private shareService = inject(ShareService);

  renameDialogRef?: MatDialogRef<DialogRenameTabComponent>;
  renameDialogSubscription?: Subscription;
  closeDialogRef?: MatDialogRef<DialogConfirmCloseTabComponent>;
  closeDialogSubscription?: Subscription;
  selected = new FormControl(0);
  tabs: Tab[] = [];
  tabIndex = 1;

  shortcuts: ShortcutInput[] = [
    {
      key: "ctrl + q",
      preventDefault: true,
      command: () => {
        this.closeTab(this.tabs[this.selected.value ?? 0]);
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
    void (async () => {
      if (window.location.hash.startsWith("#share=")) {
        this.snack.open("Carregando código compartilhado…", undefined, { duration: -1 });

        const hash = window.location.hash.slice(7);
        const data = await this.shareService.load(hash);

        if (data) {
          this.addTab(`Código compartilhado (#${hash})`, data);
          this.snack.dismiss();
          this.gaService.event("load_shared_code_success", "Interface", "Código compartilhado carregado");
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

  addTab(title?: string, contents?: string) {
    this.tabs.push({
      id: this.tabIndex++,
      title: title || "Sem título",
      contents,
      type: "editor",
    });

    this.selected.setValue(this.tabs.length);
    this.gaService.event("new_tab_top", "Editor", "Nova aba", this.tabs.length);
  }

  closeTab(tab: Tab) {
    const confirmClose = () => {
      this.tabs.splice(this.tabs.indexOf(tab), 1);
      this.selected.setValue(0);
      this.gaService.event("close_tab", "Interface", "Fechar aba", this.tabs.length);
    };

    if (tab.type === "editor") {
      this.closeDialogRef = this.dialog.open(DialogConfirmCloseTabComponent, {
        data: { title: tab.title },
      });

      this.closeDialogRef.afterClosed().subscribe(result => {
        if (result) {
          confirmClose();
        }

        this.closeDialogSubscription?.unsubscribe();
      });
    } else {
      confirmClose();
    }
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
        tab.title = result;
      }

      this.renameDialogSubscription?.unsubscribe();
    });
  }

  upsertHelpTab() {
    const tabPos = this.tabs.findIndex(t => t.type === "help");

    if (tabPos === -1) {
      this.tabs.push({
        id: this.tabIndex++,
        title: "Ajuda",
        type: "help",
      });

      this.gaService.event("help_tab_open", "Interface", "Nova aba de ajuda");
      this.selected.setValue(this.tabs.length);
    } else {
      this.gaService.event("help_tab_select", "Interface", "Selecionar aba de ajuda já aberta");
      this.selected.setValue(tabPos + 1);
    }
  }

  openSettingsModal() {
    this.gaService.event("open_settings_modal", "Interface", "Abrir modal de configurações");
    this.dialog.open(DialogSettingsComponent);
  }
}
