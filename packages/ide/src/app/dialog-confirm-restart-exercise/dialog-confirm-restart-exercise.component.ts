import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { TooltipDirective } from "../shared/tooltip.directive";

interface DialogData {
  title: string;
  done: boolean;
}

/**
 * Antes do Recomeçar de um exercício, que troca o código da aba pelo código inicial e
 * desfaz a conclusão.
 */
@Component({
  selector: "app-dialog-confirm-restart-exercise",
  imports: [AngularSvgIconModule, TooltipDirective],
  templateUrl: "./dialog-confirm-restart-exercise.component.html",
  styleUrl: "../dialog-confirm-close-tab/dialog-confirm-close-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmRestartExerciseComponent {
  readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);
}
