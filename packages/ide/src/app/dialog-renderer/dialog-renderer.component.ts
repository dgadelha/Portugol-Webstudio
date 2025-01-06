import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IGraphicsRendererComponent } from "../../renderer";

@Component({
  selector: "app-dialog-renderer",
  imports: [MatButtonModule, MatDialogClose, MatDialogContent, MatDialogTitle, AngularSvgIconModule],
  templateUrl: "./dialog-renderer.component.html",
  styleUrl: "./dialog-renderer.component.scss",
  standalone: true,
})
export class DialogRendererComponent implements IGraphicsRendererComponent {
  @Input()
  title = "";

  @ViewChild("canvas")
  canvas?: ElementRef<HTMLCanvasElement>;

  constructor(public dialogRef: MatDialogRef<DialogRendererComponent>) {}

  getCanvas(): Promise<OffscreenCanvas> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.canvas?.nativeElement) {
          clearInterval(interval);
          resolve(this.canvas.nativeElement.transferControlToOffscreen());
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
