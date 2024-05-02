import { Component, Inject, Optional } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { HotToastRef } from "@ngxpert/hot-toast";

@Component({
  selector: "app-new-version-available",
  templateUrl: "./new-version-available.component.html",
  styleUrls: ["./new-version-available.component.scss"],
  standalone: true,
  imports: [MatButtonModule],
})
export class NewVersionAvailableComponent {
  constructor(@Optional() @Inject(HotToastRef) public toastRef?: HotToastRef<any>) {}

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
