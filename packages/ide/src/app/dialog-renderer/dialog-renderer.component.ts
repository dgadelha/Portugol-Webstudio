import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CdkDrag, DragDropModule } from "@angular/cdk/drag-drop";
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
  readonly fullscreen = signal(false);

  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>("canvas");
  readonly content = viewChild<ElementRef<HTMLElement>>("content");
  readonly drag = viewChild(CdkDrag);

  /**
   * O canvas já nasce com 640x480, o tamanho padrão do Portugol Studio, para não
   * aparecer pequeno antes de o programa assumi-lo.
   */
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

  async enterFullscreen() {
    this.drag()?.reset();
    this.dialogRef.addPanelClass("pws-renderer-fullscreen");
    this.fullscreen.set(true);

    // Espera o navegador aplicar o novo tamanho antes de medir
    await new Promise(resolve => requestAnimationFrame(resolve));

    const content = this.content()?.nativeElement;

    return {
      width: content?.clientWidth ?? window.innerWidth,
      height: content?.clientHeight ?? window.innerHeight,
    };
  }

  exitFullscreen() {
    this.dialogRef.removePanelClass("pws-renderer-fullscreen");
    this.fullscreen.set(false);
  }

  close(stopProgram = true) {
    this.dialogRef.close({ stopProgram });
  }
}
