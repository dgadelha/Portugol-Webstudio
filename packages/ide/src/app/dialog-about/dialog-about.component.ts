import { DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, computed, inject, isDevMode } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService, NgxGoogleAnalyticsModule } from "ngx-google-analytics";

import { IS_BETA } from "../beta";
import { PwaService } from "../pwa.service";
import { ProgressBarComponent } from "../shared/progress-bar.component";
import { TooltipDirective } from "../shared/tooltip.directive";
import { APP_COMMIT_URL, APP_VERSION } from "../version";

@Component({
  selector: "app-dialog-about",
  imports: [AngularSvgIconModule, NgxGoogleAnalyticsModule, ProgressBarComponent, TooltipDirective],
  templateUrl: "./dialog-about.component.html",
  styleUrl: "./dialog-about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAboutComponent {
  readonly dialogRef = inject<DialogRef<"changelog">>(DialogRef);
  readonly pwa = inject(PwaService);
  private gaService = inject(GoogleAnalyticsService);

  readonly isBeta = IS_BETA;

  readonly version = APP_VERSION;
  readonly commitUrl = APP_COMMIT_URL;
  readonly dateSuffix = APP_VERSION.buildDate ? `, de ${APP_VERSION.buildDate.toLocaleDateString("pt-BR")}` : "";

  readonly offline = computed(() => {
    const status = this.pwa.offlineStatus();

    switch (status) {
      case "ready": {
        return this.pwa.online()
          ? { icon: "cloud-check-outline", text: "Pronto para usar sem internet" }
          : { icon: "cloud-off-outline", text: "Sem internet: usando a cópia guardada no navegador" };
      }

      case "downloading": {
        return { icon: "cloud-download-outline", text: "Baixando para usar sem internet…" };
      }

      case "checking": {
        return { icon: "cloud-question-outline", text: "Conferindo a cópia guardada no navegador…" };
      }

      case "unknown": {
        return { icon: "cloud-question-outline", text: "Não foi possível conferir se o IDE já funciona sem internet" };
      }

      default: {
        return {
          icon: "cloud-off-outline",
          text: isDevMode()
            ? "O uso sem internet fica desligado no ambiente local"
            : "Este navegador não guarda o IDE para usar sem internet",
        };
      }
    }
  });

  readonly updateMessage = computed(() => {
    switch (this.pwa.updateStatus()) {
      case "checking": {
        return "Procurando atualizações…";
      }

      case "latest": {
        return "Você já está na versão mais recente.";
      }

      case "offline": {
        return "Sem internet para procurar atualizações.";
      }

      case "downloading": {
        return "Baixando a nova versão…";
      }

      case "ready": {
        return "Uma nova versão está pronta.";
      }

      case "failed": {
        return "Não foi possível baixar a atualização. Tente de novo mais tarde.";
      }

      default: {
        return "";
      }
    }
  });

  readonly checking = computed(() => ["checking", "downloading"].includes(this.pwa.updateStatus()));

  checkForUpdate() {
    this.gaService.event("about_check_updates", "about_dialog", "Procurar atualizações (diálogo Sobre)");
    void this.pwa.checkForUpdate();
  }
}
