import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { HotToastRef } from "@ngxpert/hot-toast";

@Component({
  selector: "app-new-version-available",
  imports: [MatButtonModule],
  standalone: true,
  templateUrl: "./new-version-available.component.html",
  styleUrl: "./new-version-available.component.scss",
})
export class NewVersionAvailableComponent {
  public toastRef = inject(HotToastRef, { optional: true });

  onReload() {
    if (
      confirm(
        'Lembre-se de salvar seu código antes de recarregar a página!\n\nAperte "OK" para recarregar a página, ou "Cancelar" para abortar.',
      )
    ) {
      window.location.reload();
    }
  }

  onIgnore() {
    this.toastRef?.close();
  }
}
