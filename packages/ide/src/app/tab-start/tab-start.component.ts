import { Component, EventEmitter, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
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

  public logo;

  constructor(
    public gaService: GoogleAnalyticsService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) {
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    if ((currentMonth === 2 && currentDay >= 10) || (currentMonth === 3 && currentDay <= 5)) {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/carnaval.svg");
    } else if ((currentMonth === 3 && currentDay >= 20) || (currentMonth === 4 && currentDay <= 25)) {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/pascoa.svg");
    } else if ((currentMonth === 10 && currentDay >= 20) || (currentMonth === 11 && currentDay <= 5)) {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/halloween.svg");
    } else if (currentMonth === 12 && currentDay >= 15 && currentDay <= 29) {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/natal.svg");
    } else if ((currentMonth === 12 && currentDay >= 30) || (currentMonth === 1 && currentDay <= 5)) {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/ano-novo.svg");
    } else {
      this.logo = this.sanitizer.bypassSecurityTrustResourceUrl("assets/logo/default.svg");
    }
  }

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
