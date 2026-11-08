import { ChangeDetectionStrategy, Component, computed, inject, input, output, resource } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { ExerciseMarkdownService } from "../exercise-markdown.service";
import { attributionText, DIFFICULTY_ICONS, DIFFICULTY_LABELS, Exercício } from "../exercises.service";
import { TooltipDirective } from "../shared/tooltip.directive";
import { ExerciseExamplesComponent } from "./exercise-examples.component";

/**
 * O lado do enunciado numa aba de exercício: o texto, os exemplos e os botões Verificar e
 * Recomeçar.
 */
@Component({
  selector: "app-exercise-statement",
  imports: [AngularSvgIconModule, ExerciseExamplesComponent, TooltipDirective],
  templateUrl: "./exercise-statement.component.html",
  styleUrl: "./exercise-statement.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseStatementComponent {
  private markdown = inject(ExerciseMarkdownService);

  readonly exercise = input.required<Exercício>();
  readonly done = input(false);
  /**
   * Uma cópia aberta de um arquivo ou link: sem Recomeçar, e o Verificar não conta para o
   * progresso.
   */
  readonly copy = input(false);
  readonly checking = input(false);
  /**
   * O código não pode ser conferido nem trocado agora: o programa está executando, sendo
   * depurado ou conferido.
   */
  readonly busy = input(false);
  /**
   * O exercício passou, e o código no editor já não é o que passou.
   */
  readonly approvedChanged = input(false);

  readonly verify = output();
  readonly stopCheck = output();
  readonly restart = output();
  readonly adopt = output();
  readonly restoreApproved = output();

  /**
   * Verificar e Parar são o mesmo botão: trocar um pelo outro tiraria o foco do teclado de
   * quem acabou de apertá-lo.
   */
  onVerifyClick() {
    if (this.checking()) {
      this.stopCheck.emit();
    } else if (!this.busy()) {
      this.verify.emit();
    }
  }

  readonly statement = resource({
    params: () => ({ text: this.exercise().enunciado, theme: this.markdown.theme() }),
    loader: ({ params }) => this.markdown.render(params.text, params.theme),
  });

  /**
   * O exercício com nomes sem acento: o analisador de templates do Angular não aceita
   * `exercise.título`.
   */
  readonly view = computed(() => {
    const exercise = this.exercise();

    return {
      title: exercise.título,
      difficulty: DIFFICULTY_LABELS[exercise.dificuldade],
      difficultyIcon: DIFFICULTY_ICONS[exercise.dificuldade],
      attribution: attributionText(exercise),
    };
  });
}
