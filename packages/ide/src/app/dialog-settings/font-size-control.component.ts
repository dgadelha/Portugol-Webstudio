import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatSliderModule } from "@angular/material/slider";
import { AngularSvgIconModule } from "angular-svg-icon";
import { settings } from "../../settings";

/**
 * Tamanho da fonte em px: botões de um em um e um controle deslizante para
 * saltos maiores.
 */
@Component({
  selector: "app-font-size-control",
  imports: [FormsModule, MatButtonModule, MatSliderModule, AngularSvgIconModule],
  standalone: true,
  templateUrl: "./font-size-control.component.html",
  styleUrl: "./font-size-control.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FontSizeControlComponent {
  /**
   * `id` do rótulo do campo.
   */
  readonly labelledBy = input.required<string>();
  readonly value = input.required<number>();
  readonly valueChange = output<number>();

  protected readonly range = { min: settings.editorFontSize.min, max: settings.editorFontSize.max };

  change(size: number) {
    this.valueChange.emit(Math.min(this.range.max, Math.max(this.range.min, size)));
  }
}
