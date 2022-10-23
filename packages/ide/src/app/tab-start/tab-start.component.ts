import { Component, EventEmitter, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";

import { DialogOpenExampleComponent } from "../dialog-open-example/dialog-open-example.component";

@Component({
  selector: "app-tab-start",
  templateUrl: "./tab-start.component.html",
  styleUrls: ["./tab-start.component.scss"],
})
export class TabStartComponent {
  @Output() newTab = new EventEmitter();
  @Output() help = new EventEmitter();

  private _dialogExample$?: Subscription;
  private _dialogRef$?: Subscription;

  constructor(public gaService: GoogleAnalyticsService, private dialog: MatDialog) {}

  openFile(event: Event) {
    this.gaService.event("home_open_file", "Aba Inicial", "Abrir arquivo através da aba Inicial");

    const { files } = event.target as HTMLInputElement;

    if (!files || files.length === 0) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const file = files[i];

      reader.onload = e => {
        const contents = e.target?.result;

        this.newTab.emit({
          name: file.name,
          contents,
        });
      };

      reader.readAsText(file, "ISO-8859-1");
    }
  }

  openExamplesDialog() {
    this.gaService.event("open_examples_dialog", "Aba Inicial", "Abrir diálogo de exemplos");

    const ref = this.dialog.open(DialogOpenExampleComponent, {
      width: "min(85vw, 780px)",
      height: "min(85vh, 600px)",
    });

    this._dialogExample$ = ref.componentInstance.exampleOpened.subscribe(example => {
      this.gaService.event("open_example", "Diálogo de Exemplos", `Abrir exemplo: ${example.title}`);

      ref.close();

      this.newTab.emit({
        name: example.title,
        contents: example.code,
      });
    });

    this._dialogRef$ = ref.beforeClosed().subscribe(() => {
      this._dialogRef$?.unsubscribe();
      this._dialogExample$?.unsubscribe();
    });
  }
}
