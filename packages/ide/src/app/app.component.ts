import { OnInit, Component } from "@angular/core";
import { Storage, getBlob, ref } from "@angular/fire/storage";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";

interface Tab {
  id: number;
  title: string;
  contents?: string;
  type: "editor" | "help";
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  selected = new FormControl(0);
  tabs: Tab[] = [];
  tabIndex = 1;

  shortcuts: ShortcutInput[] = [
    {
      key: "ctrl + q",
      preventDefault: true,
      command: () => this.closeTab(this.tabs[this.selected.value ?? 0]),
    },
    {
      key: "ctrl + n",
      preventDefault: true,
      command: () => this.addTab(),
    },
  ];

  constructor(
    private gaService: GoogleAnalyticsService,
    private storage: Storage,
    private snack: MatSnackBar,
  ) {}

  async ngOnInit() {
    try {
      if (window.location.hash.startsWith("#share=")) {
        this.snack.open("Carregando código compartilhado…", undefined, { duration: -1 });

        const hash = window.location.hash.substring(7);
        const data = await getBlob(ref(this.storage, hash));
        const contents = await data.text();

        this.addTab(`Código compartilhado (#${hash})`, contents);
        this.snack.dismiss();
        this.gaService.event("load_shared_code_success", "Interface", "Código compartilhado carregado");
      }
    } catch (e) {
      console.error(e);
      this.snack.dismiss();
      this.snack.open("Erro ao carregar código compartilhado", "FECHAR", { duration: 10000 });
      this.gaService.event("load_shared_code_error", "Interface", "Erro ao carregar código compartilhado");
    }
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
    if (tab.type === "editor") {
      const confirm = window.confirm("Tem certeza que deseja fechar a aba? O código não salvo será perdido.");

      if (!confirm) {
        return;
      }
    }

    this.tabs.splice(this.tabs.indexOf(tab), 1);
    this.selected.setValue(0);
    this.gaService.event("close_tab", "Interface", "Fechar aba", this.tabs.length);
  }

  changeTabTitle(tab: Tab) {
    if (this.selected.value !== tab.id || tab.type !== "editor") {
      return;
    }

    this.gaService.event("edit_tab_title", "Interface", "Editar título de aba");
    const title = prompt("Digite o novo título", tab.title);

    if (title) {
      tab.title = title;
    }
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
}
