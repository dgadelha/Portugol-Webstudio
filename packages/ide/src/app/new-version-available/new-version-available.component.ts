import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { HotToastRef } from "@ngxpert/hot-toast";
import { GoogleAnalyticsService } from "ngx-google-analytics";

import { WorkspaceService } from "../workspace.service";

@Component({
  selector: "app-new-version-available",
  templateUrl: "./new-version-available.component.html",
  styleUrl: "./new-version-available.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewVersionAvailableComponent {
  /**
   * O `PwaService` passa como recarregar, o mesmo do botão Atualizar do Sobre.
   */
  public toastRef = inject<HotToastRef<{ reload: () => void }>>(HotToastRef, { optional: true });

  readonly persistenceAvailable = inject(WorkspaceService).persistenceAvailable;
  private readonly gaService = inject(GoogleAnalyticsService);

  onReload() {
    this.toastRef?.data.reload();
  }

  onIgnore() {
    this.gaService.event("pwa_update", "PWA", "ignorar");
    this.toastRef?.close();
  }
}
