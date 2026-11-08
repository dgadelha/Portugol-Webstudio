import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { portugolCall, runsInicio } from "@portugol-webstudio/runner";

import { Exercício } from "../exercises.service";
import { PortugolCodeDirective } from "../shared/portugol-code.directive";
import { ExerciseValuePipe } from "./exercise-value.pipe";

/**
 * Os exemplos de um exercício, como o aluno vê embaixo do enunciado: também na prévia da
 * criação de exercício.
 */
@Component({
  selector: "app-exercise-examples",
  imports: [ExerciseValuePipe, PortugolCodeDirective],
  templateUrl: "./exercise-examples.component.html",
  styleUrl: "./exercise-examples.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseExamplesComponent {
  readonly examples = input.required<Exercício["exemplos"]>();

  /**
   * Os exemplos com nomes sem acento: o analisador de templates do Angular não aceita
   * `example.descrição`.
   */
  readonly view = computed(() => {
    return this.examples().map(example => {
      const checks = "verificações" in example ? example.verificações : undefined;

      return {
        description: example.descrição,
        // Um exemplo só com funções não executa o inicio: não há entrada para mostrar
        showsInputs: runsInicio(example),
        inputs: example.entradas,
        output: "saída" in example ? example.saída : undefined,
        checks: (checks ?? []).map(check => {
          if (check.alvo === "função") {
            return {
              target: "function" as const,
              description: check.descrição,
              call: portugolCall(check.nome, check.argumentos),
              returned: check.valor,
            };
          }

          return {
            target: "write" as const,
            description: check.descrição,
            rule: check.regra,
            values: check.valores,
          };
        }),
      };
    });
  });
}
