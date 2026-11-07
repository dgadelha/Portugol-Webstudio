import { DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { TooltipDirective } from "../shared/tooltip.directive";

/**
 * Antes do Restaurar padrões das Configurações, que desfaz todas as escolhas de uma vez.
 */
@Component({
  selector: "app-dialog-confirm-reset-settings",
  imports: [AngularSvgIconModule, TooltipDirective],
  templateUrl: "./dialog-confirm-reset-settings.component.html",
  styleUrl: "../dialog-confirm-close-tab/dialog-confirm-close-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmResetSettingsComponent {
  readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
}
