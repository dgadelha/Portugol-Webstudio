import { ChangeDetectionStrategy, Component, computed, inject, input, output, resource } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { ExerciseMarkdownService } from "../exercise-markdown.service";
import { DIFFICULTY_ICONS, DIFFICULTY_LABELS, Exercício } from "../exercises.service";
import { TooltipDirective } from "../shared/tooltip.directive";
import { ExerciseValuePipe } from "./exercise-value.pipe";

/**
 * O lado do enunciado numa aba de exercício: o texto, os exemplos e os botões Verificar e
 * Recomeçar.
 */
@Component({
  selector: "app-exercise-statement",
  imports: [AngularSvgIconModule, ExerciseValuePipe, TooltipDirective],
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

  readonly verify = output();
  readonly stopCheck = output();
  readonly restart = output();
  readonly adopt = output();

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
    params: () => this.exercise().enunciado,
    loader: ({ params }) => this.markdown.render(params),
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
      examples: exercise.exemplos.map(example => {
        return {
          description: example.descrição,
          inputs: example.entradas,
          output: "saída" in example ? example.saída : undefined,
          checks: ("verificações" in example ? example.verificações : []).map(check => {
            return {
              description: check.descrição,
              rule: check.regra,
              values: check.valores,
            };
          }),
        };
      }),
    };
  });
}
