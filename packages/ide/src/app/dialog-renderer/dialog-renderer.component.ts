import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { IGraphicsRendererComponent } from "../../renderer";

@Component({
  selector: "app-dialog-renderer",
  imports: [MatDialogContent, MatDialogTitle],
  templateUrl: "./dialog-renderer.component.html",
  styleUrl: "./dialog-renderer.component.scss",
  standalone: true,
})
export class DialogRendererComponent implements IGraphicsRendererComponent {
  @Input()
  title = "";

  @ViewChild("canvas")
  canvas?: ElementRef<HTMLCanvasElement>;

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

  setTitle(title: string): void {
    this.title = title;
  }

  setSize(_width: number, _height: number): void {
    // Não precisa fazer nada
  }
}
