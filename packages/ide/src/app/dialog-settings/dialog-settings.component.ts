import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage, LocalStorageService } from "ngx-webstorage";
import { defaultFontSize } from "../../settings";

@Component({
  selector: "app-dialog-settings",
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatRadioModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatInputModule,
    AngularSvgIconModule,
  ],
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
  standalone: true,
})
export class DialogSettingsComponent {
  private localStorageService = inject(LocalStorageService);

  @LocalStorage("theme", "auto")
  theme!: "light" | "dark" | "auto";

  @LocalStorage("editorFontSize", defaultFontSize)
  editorFontSize!: number;

  @LocalStorage("editorWordWrap", false)
  editorWordWrap!: boolean;

  resetDefaults() {
    this.localStorageService.clear();
  }
}
