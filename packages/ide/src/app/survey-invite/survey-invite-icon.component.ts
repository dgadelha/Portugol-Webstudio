import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

/**
 * Ícone do convite para a pesquisa, no lugar do ícone do aviso (o mesmo do link no Sobre).
 */
@Component({
  selector: "app-survey-invite-icon",
  imports: [AngularSvgIconModule],
  templateUrl: "./survey-invite-icon.component.html",
  styleUrl: "./survey-invite-icon.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyInviteIconComponent {}
