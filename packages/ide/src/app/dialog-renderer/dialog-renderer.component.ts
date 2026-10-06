import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { IGraphicsRendererComponent } from "../../renderer";
import { TooltipDirective } from "../shared/tooltip.directive";

export interface RendererDialogResult {
  stopProgram: boolean;
}

interface DialogData {
  /**
   * `id` do título, que dá o nome acessível da janela.
   */
  titleId: string;
}

/**
 * Janela da biblioteca Gráficos. Ela não escurece o resto da tela e pode ser
 * arrastada pelo título.
 */
@Component({
  selector: "app-dialog-renderer",
  imports: [AngularSvgIconModule, DragDropModule, TooltipDirective],
  templateUrl: "./dialog-renderer.component.html",
  styleUrl: "./dialog-renderer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogRendererComponent implements IGraphicsRendererComponent {
  private readonly dialogRef = inject<DialogRef<RendererDialogResult>>(DialogRef);
  readonly data = inject<DialogData>(DIALOG_DATA);

  readonly title = signal("");

  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>("canvas");

  getCanvas(): Promise<OffscreenCanvas> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const canvas = this.canvas()?.nativeElement;

        if (canvas?.transferControlToOffscreen) {
          clearInterval(interval);
          resolve(canvas.transferControlToOffscreen());
        }
      }, 100);
    });
  }

  setTitle(title: string) {
    this.title.set(title);
  }

  setSize(_width: number, _height: number) {
    // O canvas se ajusta sozinho
  }

  close(stopProgram = true) {
    this.dialogRef.close({ stopProgram });
  }
}
