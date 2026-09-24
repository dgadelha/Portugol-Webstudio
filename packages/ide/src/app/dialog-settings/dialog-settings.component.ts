import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage, LocalStorageService } from "ngx-webstorage";
import { defaultFontSize, SettingsKey } from "../../settings";

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
  standalone: true,
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DialogSettingsComponent {
  private localStorageService = inject(LocalStorageService);

  @LocalStorage(SettingsKey.Theme, "auto")
  theme!: "light" | "dark" | "auto";

  @LocalStorage(SettingsKey.EditorFontSize, defaultFontSize)
  editorFontSize!: number;

  @LocalStorage(SettingsKey.EditorWordWrap, false)
  editorWordWrap!: boolean;

  resetDefaults() {
    // `clear()` do ngx-webstorage apaga o `localStorage` inteiro, inclusive o
    // código que o usuário está editando: aqui só as configurações voltam ao
    // padrão.
    for (const key of Object.values(SettingsKey)) {
      this.localStorageService.clear(key);
    }
  }
}
