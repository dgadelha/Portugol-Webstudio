import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { HotToastRef } from "@ngxpert/hot-toast";

/**
 * O `SurveyService` passa o endereço e o que fazer em cada botão (assim este componente não
 * depende do serviço, que o importa).
 */
export interface SurveyInviteData {
  url: string;
  answer: () => void;
  dismiss: () => void;
}

/**
 * Convite para a pesquisa, mostrado num aviso quando o IDE abre na aba Inicial.
 */
@Component({
  selector: "app-survey-invite",
  templateUrl: "./survey-invite.component.html",
  styleUrl: "./survey-invite.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyInviteComponent {
  readonly toastRef = inject<HotToastRef<SurveyInviteData>>(HotToastRef, { optional: true });

  onAnswer() {
    this.toastRef?.data.answer();
  }

  onDismiss() {
    this.toastRef?.data.dismiss();
  }
}
