import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

/**
 * Ícone do convite para a pesquisa, no lugar do ícone do aviso (o mesmo do link no Sobre).
 */
@Component({
  selector: "app-survey-invite-icon",
  imports: [AngularSvgIconModule],
  template: `<svg-icon src="assets/mdi/clipboard-text-outline.svg" class="icon-yellow" aria-hidden="true" />`,
  styles: `
    :host {
      display: flex;
    }
    svg-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyInviteIconComponent {}
