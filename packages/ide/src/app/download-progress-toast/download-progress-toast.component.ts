import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { HotToastRef } from "@ngxpert/hot-toast";

import type { DownloadToastData } from "../pwa.types";
import { ProgressBarComponent } from "../shared/progress-bar.component";

/**
 * Aviso de download com barra de progresso: `offline` na primeira visita, quando o IDE
 * baixa os arquivos para funcionar sem internet, e `update` numa atualização.
 */
@Component({
  selector: "app-download-progress-toast",
  imports: [ProgressBarComponent],
  templateUrl: "./download-progress-toast.component.html",
  styleUrl: "./download-progress-toast.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadProgressToastComponent {
  private toastRef = inject<HotToastRef<DownloadToastData>>(HotToastRef, { optional: true });

  readonly kind = this.toastRef?.data.kind ?? "update";

  readonly progress = computed(() => this.toastRef?.data.progress() ?? null);

  readonly message = computed(() => {
    if (this.kind === "offline") {
      return "Baixando o Portugol Webstudio para usar sem internet…";
    }

    const progress = this.progress();

    // Os arquivos novos chegaram; falta o service worker terminar de preparar a versão
    return progress && progress.total > 0 && progress.done >= progress.total
      ? "Finalizando a atualização…"
      : "Baixando atualizações…";
  });
}
