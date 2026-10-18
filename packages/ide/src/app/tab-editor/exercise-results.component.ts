import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { CaseFailure, CaseResult, EXERCISE_TIMEOUT } from "@portugol-webstudio/runner";
import { AngularSvgIconModule } from "angular-svg-icon";

import { ExerciseCheckOutcome, ExercisesService } from "../exercises.service";
import { ExerciseValuePipe } from "./exercise-value.pipe";

/**
 * A aba Correção do painel: o resultado do Verificar, caso a caso. Nos exemplos, mostra o
 * que era esperado e o que o programa fez; nos testes, só o tipo de falha.
 */
@Component({
  selector: "app-exercise-results",
  imports: [AngularSvgIconModule, ExerciseValuePipe],
  templateUrl: "./exercise-results.component.html",
  styleUrl: "./exercise-results.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseResultsComponent {
  private exercises = inject(ExercisesService);

  readonly outcome = input<ExerciseCheckOutcome | null>(null);
  /**
   * O andamento enquanto o Verificar confere os casos.
   */
  readonly progress = input<{ done: number; total: number } | null>(null);

  readonly summary = computed(() => {
    const outcome = this.outcome();

    return outcome ? this.exercises.summary(outcome) : "";
  });

  caseLabel(result: CaseResult) {
    const kind = result.kind === "exemplo" ? "Exemplo" : "Teste";
    const description = result.descrição ? ` (${result.descrição})` : "";

    return `${kind} ${result.index}${description}`;
  }

  /**
   * O tipo da falha, que aparece também nos testes.
   */
  failureKind(failure: CaseFailure) {
    switch (failure.type) {
      case "differentOutput":
      case "differentValues":
      case "missingValue": {
        return "resposta diferente";
      }

      case "timeout": {
        return `tempo esgotado (${EXERCISE_TIMEOUT / 1000} segundos)`;
      }

      case "error": {
        return "erro de execução";
      }

      case "missingInputs": {
        return "pediu mais entradas do que o caso tem";
      }

      case "extraInputs": {
        return failure.remaining === 1
          ? "sobrou 1 entrada sem ser lida"
          : `sobraram ${failure.remaining} entradas sem ser lidas`;
      }

      case "aborted": {
        return "correção interrompida";
      }
    }
  }

  /**
   * As falhas que têm o que mostrar além do tipo, nos exemplos.
   */
  hasDetails(failure: CaseFailure) {
    return ["differentOutput", "differentValues", "missingValue", "error"].includes(failure.type);
  }

  /**
   * As linhas da saída como são comparadas, para mostrar entre aspas.
   */
  quoted(line: string | null) {
    return line === null ? "nada" : `“${line}”`;
  }
}
