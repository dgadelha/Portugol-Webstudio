import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { TooltipDirective } from "../shared/tooltip.directive";

interface DialogData {
  title: string;
  /**
   * Uma aba de criação de exercício: o que se perde é o exercício, não um código.
   */
  exercise?: boolean;
}

@Component({
  selector: "app-dialog-confirm-close-tab",
  imports: [AngularSvgIconModule, TooltipDirective],
  templateUrl: "./dialog-confirm-close-tab.component.html",
  styleUrl: "./dialog-confirm-close-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmCloseTabComponent {
  readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);
}
