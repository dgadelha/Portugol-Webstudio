import { Component, inject, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

interface DialogData {
  title: string;
}

@Component({
  selector: "app-dialog-rename-tab",
  templateUrl: "./dialog-rename-tab.component.html",
  styleUrl: "./dialog-rename-tab.component.scss",
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DialogRenameTabComponent {
  readonly dialogRef = inject(MatDialogRef<DialogRenameTabComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly title = model(this.data.title);

  onSubmit() {
    this.dialogRef.close(this.title());
  }
}
