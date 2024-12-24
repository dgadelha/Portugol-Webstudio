import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSliderModule } from "@angular/material/slider";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage } from "ngx-webstorage";

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
    MatInputModule,
    AngularSvgIconModule,
  ],
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
  standalone: true,
})
export class DialogSettingsComponent {
  @LocalStorage("theme", "auto")
  theme!: "light" | "dark" | "auto";

  @LocalStorage("fontSize", 14)
  fontSize!: number;
}
