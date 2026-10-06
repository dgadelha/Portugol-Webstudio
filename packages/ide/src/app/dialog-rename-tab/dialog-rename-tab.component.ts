import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

interface DialogData {
  title: string;
}

@Component({
  selector: "app-dialog-rename-tab",
  imports: [FormsModule],
  templateUrl: "./dialog-rename-tab.component.html",
  styleUrl: "./dialog-rename-tab.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogRenameTabComponent {
  readonly dialogRef = inject<DialogRef<string>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);
  readonly title = signal(this.data.title);

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>("input");

  constructor() {
    // O nome atual vem todo selecionado, para digitar o novo por cima. O
    // `ngModel` preenche o campo depois do foco, então a seleção espera.
    afterNextRender(() => {
      setTimeout(() => {
        this.input().nativeElement.select();
      });
    });
  }

  onSubmit() {
    const title = this.title().trim();

    if (title) {
      this.dialogRef.close(title);
    }
  }
}
