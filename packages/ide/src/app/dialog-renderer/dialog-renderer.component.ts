import { DragDropModule } from "@angular/cdk/drag-drop";
import { Component, ElementRef, inject, Input, viewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IGraphicsRendererComponent } from "../../renderer";

@Component({
  selector: "app-dialog-renderer",
  imports: [MatButtonModule, MatDialogClose, MatDialogContent, MatDialogTitle, AngularSvgIconModule, DragDropModule],
  standalone: true,
  templateUrl: "./dialog-renderer.component.html",
  styleUrl: "./dialog-renderer.component.scss",
})
export class DialogRendererComponent implements IGraphicsRendererComponent {
  @Input()
  title = "";

  private dialogRef = inject(MatDialogRef<DialogRendererComponent>);
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
    this.title = title;
  }

  setSize(_width: number, _height: number) {
    // Não precisa fazer nada
  }

  close() {
    this.dialogRef.close();
  }
}
