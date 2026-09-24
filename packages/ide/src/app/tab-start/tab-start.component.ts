import { ChangeDetectionStrategy, Component, inject, output, OutputRefSubscription } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";

import { IS_BETA } from "../beta";
import { LATEST_CHANGELOG_ENTRY } from "../changelog";
import { DialogAboutComponent } from "../dialog-about/dialog-about.component";
import { DialogOpenExampleComponent } from "../dialog-open-example/dialog-open-example.component";
import { FileService } from "../file.service";
import { WorkspaceService } from "../workspace.service";

@Component({
  selector: "app-tab-start",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./tab-start.component.html",
  styleUrl: "./tab-start.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabStartComponent {
  private dialog = inject(MatDialog);
  private fileService = inject(FileService);
  private workspace = inject(WorkspaceService);
  public gaService = inject(GoogleAnalyticsService);

  /**
   * Código de janelas fechadas que esta sessão não adotou automaticamente.
   */
  readonly recoverable = this.workspace.recoverable;

  readonly newTab = output<{ name: string; contents: string } | undefined>();
  readonly help = output();
  readonly changelog = output();
  readonly settings = output();

  readonly latestNews = LATEST_CHANGELOG_ENTRY;

  private _dialogExample$?: OutputRefSubscription;
  private _dialogRef$?: Subscription;

  public logo: string;

  readonly isBeta = IS_BETA;

  constructor() {
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    if ((currentMonth === 2 && currentDay >= 5) || (currentMonth === 3 && currentDay <= 15)) {
      this.logo = "assets/logo/carnaval.svg";
    } else if ((currentMonth === 3 && currentDay >= 20) || (currentMonth === 4 && currentDay <= 30)) {
      this.logo = "assets/logo/pascoa.svg";
    } else if ((currentMonth === 10 && currentDay >= 20) || (currentMonth === 11 && currentDay <= 5)) {
      this.logo = "assets/logo/halloween.svg";
    } else if (currentMonth === 12 && currentDay >= 15 && currentDay <= 29) {
      this.logo = "assets/logo/natal.svg";
    } else if ((currentMonth === 12 && currentDay >= 30) || (currentMonth === 1 && currentDay <= 5)) {
      this.logo = "assets/logo/ano-novo.svg";
    } else {
      this.logo = "assets/logo/default.svg";
    }
  }

  recoverWorkspace(workspaceId: string) {
    const recovered = this.workspace.recover(workspaceId);

    this.gaService.event("workspace_recover", "Aba Inicial", "Recuperar código de uma sessão anterior", recovered);
  }

  discardWorkspace(workspaceId: string) {
    this.workspace.discard(workspaceId);

    this.gaService.event("workspace_discard", "Aba Inicial", "Descartar código de uma sessão anterior");
  }

  async openFile(event: Event) {
    this.gaService.event("home_open_file", "Aba Inicial", "Abrir arquivo através da aba Inicial");

    const { files } = event.target as HTMLInputElement;

    if (!files || files.length === 0) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const contents = await this.fileService.getContents(file);

      this.newTab.emit({
        name: file.name,
        contents,
      });
    }
  }

  openExamplesDialog() {
    this.gaService.event("open_examples_dialog", "Aba Inicial", "Abrir diálogo de exemplos");

    const ref = this.dialog.open(DialogOpenExampleComponent, {
      width: "min(85vw, 780px)",
      height: "min(85vh, 600px)",
    });

    this._dialogExample$ = ref.componentInstance.exampleOpened.subscribe(example => {
      this.gaService.event("open_example", "Diálogo de Exemplos", `Abrir exemplo: ${example.title}`);

      ref.close();

      this.newTab.emit({
        name: example.title,
        contents: example.code,
      });
    });

    this._dialogRef$ = ref.beforeClosed().subscribe(() => {
      this._dialogRef$?.unsubscribe();
      this._dialogExample$?.unsubscribe();
    });
  }

  openChangelog() {
    this.gaService.event("open_changelog", "Aba Inicial", "Ver histórico de atualizações");
    this.changelog.emit();
  }

  openSettingsDialog() {
    this.gaService.event("open_settings_dialog", "Aba Inicial", "Abrir diálogo de Configurações");
    this.settings.emit();
  }

  openAboutDialog() {
    this.gaService.event("open_about_dialog", "Aba Inicial", "Abrir diálogo Sobre");
    const ref = this.dialog.open<DialogAboutComponent, unknown, "changelog">(DialogAboutComponent, {
      maxHeight: "85vh",
    });

    // O diálogo fecha pedindo o histórico: a aba abre pelo mesmo caminho do botão da aba inicial
    ref.afterClosed().subscribe(result => {
      if (result === "changelog") {
        this.changelog.emit();
      }
    });
  }
}
