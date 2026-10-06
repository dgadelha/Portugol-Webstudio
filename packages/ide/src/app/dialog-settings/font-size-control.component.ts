import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { settings } from "../../settings";

/**
 * Tamanho da fonte em px: botões de um em um e um controle deslizante para
 * saltos maiores.
 */
@Component({
  selector: "app-font-size-control",
  imports: [FormsModule, AngularSvgIconModule],
  templateUrl: "./font-size-control.component.html",
  styleUrl: "./font-size-control.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FontSizeControlComponent {
  /**
   * `id` do rótulo do campo.
   */
  readonly labelledBy = input.required<string>();
  /**
   * `id` da descrição do campo.
   */
  readonly describedBy = input<string>();
  readonly value = model.required<number>();

  protected readonly range = { min: settings.editorFontSize.min, max: settings.editorFontSize.max };

  change(size: number) {
    this.value.set(Math.min(this.range.max, Math.max(this.range.min, size)));
  }
}
