import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { TooltipDirective } from "../shared/tooltip.directive";

interface DialogData {
  title: string;
  /**
   * A aba do exercício está aberta, e fecha.
   */
  closesTab: boolean;
  /**
   * Já havia código guardado no exercício, e ele é substituído.
   */
  replacesCode: boolean;
  /**
   * O exercício estava concluído: continua só se o código passar.
   */
  done: boolean;
}

/**
 * Antes do Usar no meu exercício, que faz do código de um arquivo o código do exercício e o
 * confere em seguida.
 */
@Component({
  selector: "app-dialog-confirm-adopt-exercise",
  imports: [AngularSvgIconModule, TooltipDirective],
  templateUrl: "./dialog-confirm-adopt-exercise.component.html",
  styleUrl: "../dialog-confirm-close-tab/dialog-confirm-close-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmAdoptExerciseComponent {
  readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);
}
