import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { MarkdownComponent } from "ngx-markdown";

import { IS_BETA } from "../beta";
import { LATEST_CHANGELOG_ENTRY } from "../changelog";
import { DialogAboutComponent } from "../dialog-about/dialog-about.component";
import { DialogService } from "../shared/dialog.service";
import { ACTIVE_TAB_SELECTOR, focusAfterRender } from "../shared/focus";
import { TooltipDirective } from "../shared/tooltip.directive";
import { WorkspaceService } from "../workspace.service";

@Component({
  selector: "app-tab-start",
  imports: [AngularSvgIconModule, DatePipe, MarkdownComponent, TooltipDirective],
  templateUrl: "./tab-start.component.html",
  styleUrl: "./tab-start.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabStartComponent {
  private dialog = inject(DialogService);
  private injector = inject(Injector);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private workspace = inject(WorkspaceService);
  public gaService = inject(GoogleAnalyticsService);

  /**
   * Código de janelas fechadas que esta sessão não adotou automaticamente.
   */
  readonly recoverable = this.workspace.recoverable;

  readonly newTab = output<{ name: string; contents: string } | undefined>();
  readonly openFile = output();
  readonly examples = output();
  readonly help = output();
  readonly changelog = output();
  readonly settings = output();

  readonly latestNews = LATEST_CHANGELOG_ENTRY;

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

    // O botão some com o cartão: o foco vai para a aba restaurada.
    focusAfterRender(this.injector, () => document.querySelector<HTMLElement>(ACTIVE_TAB_SELECTOR));
  }

  discardWorkspace(workspaceId: string) {
    this.workspace.discard(workspaceId);

    this.gaService.event("workspace_discard", "Aba Inicial", "Descartar código de uma sessão anterior");

    // O botão some da lista: o foco vai para a próxima sessão, ou para o
    // primeiro atalho da página se não sobrou nenhuma. São duas buscas porque,
    // numa só, o atalho viria antes da sessão, na ordem da página.
    focusAfterRender(this.injector, () => {
      const host = this.host.nativeElement;

      return (
        host.querySelector<HTMLElement>(":scope .recovery button") ??
        host.querySelector<HTMLElement>(":scope .tiles .tile")
      );
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
    const ref = this.dialog.open<"changelog">(DialogAboutComponent, {
      width: "min(92vw, 44rem)",
      ariaLabelledBy: "dialogo-sobre-titulo",
    });

    // O diálogo fecha pedindo o histórico: a aba abre pelo mesmo caminho do botão da aba inicial
    ref.closed.subscribe(result => {
      if (result === "changelog") {
        this.changelog.emit();
      }
    });
  }
}
