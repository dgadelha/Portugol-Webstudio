import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage } from "ngx-webstorage";
import { settings, ThemePreference } from "../../settings";

const THEMES: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "auto", label: "Sistema" },
];

/**
 * Escolha do tema, com uma miniatura do IDE em cada opção. "Sistema" mostra
 * metade clara e metade escura.
 */
@Component({
  selector: "app-appearance-section",
  imports: [NgTemplateOutlet, AngularSvgIconModule],
  standalone: true,
  templateUrl: "./appearance-section.component.html",
  styleUrls: ["./setting-field.scss", "./appearance-section.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AppearanceSectionComponent {
  protected readonly themes = THEMES;

  @LocalStorage(settings.theme.key, settings.theme.default)
  theme!: ThemePreference;

  /**
   * Setas trocam a opção, como num grupo de rádios nativo.
   */
  onKeyDown(event: KeyboardEvent) {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Partial<Record<string, number>>)[
      event.key
    ];

    if (!step) {
      return;
    }

    event.preventDefault();

    const index = THEMES.findIndex(option => option.value === this.theme);
    const next = THEMES[(index + step + THEMES.length) % THEMES.length];

    this.theme = next.value;
    (event.currentTarget as HTMLElement)
      .closest("[role=radiogroup]")
      ?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)
      ?.focus();
  }
}
