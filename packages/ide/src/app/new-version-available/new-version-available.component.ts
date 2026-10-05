import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { HotToastRef } from "@ngxpert/hot-toast";

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

  onReload() {
    this.toastRef?.data.reload();
  }

  onIgnore() {
    this.toastRef?.close();
  }
}
