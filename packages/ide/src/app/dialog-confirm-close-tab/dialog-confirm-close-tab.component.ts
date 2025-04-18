import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";

interface DialogData {
  title: string;
}

@Component({
  selector: "app-dialog-confirm-close-tab",
  templateUrl: "./dialog-confirm-close-tab.component.html",
  styleUrl: "./dialog-confirm-close-tab.component.scss",
  standalone: true,
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class DialogConfirmCloseTabComponent {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
}
