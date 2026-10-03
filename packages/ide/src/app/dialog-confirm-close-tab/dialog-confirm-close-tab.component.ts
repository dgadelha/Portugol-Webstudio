import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

interface DialogData {
  title: string;
}

@Component({
  selector: "app-dialog-confirm-close-tab",
  templateUrl: "./dialog-confirm-close-tab.component.html",
  styleUrl: "./dialog-confirm-close-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmCloseTabComponent {
  readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);
}
