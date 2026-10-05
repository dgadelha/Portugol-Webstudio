import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import type { DownloadProgress } from "../pwa.types";

/**
 * Barra de progresso de um download (um `<progress>`). Sem `progress`, fica indeterminada.
 * A porcentagem visível não é lida pelos leitores de tela, que leem o valor da barra
 * quando chegam nela: num aviso, que é uma região viva, cada mudança seria anunciada.
 */
@Component({
  selector: "app-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrl: "./progress-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  readonly progress = input<DownloadProgress | null>(null);
  readonly label = input.required<string>();

  readonly percent = computed(() => {
    const progress = this.progress();

    if (!progress || progress.total === 0) {
      return null;
    }

    return Math.min(100, Math.floor((progress.done / progress.total) * 100));
  });
}
