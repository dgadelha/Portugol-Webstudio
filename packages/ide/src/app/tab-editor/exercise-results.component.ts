import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import {
  CaseFailure,
  CaseResult,
  CaseRun,
  comparedValues,
  EXERCISE_TIMEOUT,
  portugolCall,
  portugolSignature,
} from "@portugol-webstudio/runner";
import { AngularSvgIconModule } from "angular-svg-icon";

import { ExerciseCheckOutcome, ExercisesService } from "../exercises.service";
import { PortugolCodeDirective } from "../shared/portugol-code.directive";
import { ExerciseValuePipe } from "./exercise-value.pipe";

/**
 * A aba Correção do painel: o resultado do Verificar, caso a caso. Nos exemplos, mostra o
 * que era esperado e o que o programa fez; nos testes, só o tipo de falha.
 */
@Component({
  selector: "app-exercise-results",
  imports: [AngularSvgIconModule, ExerciseValuePipe, PortugolCodeDirective],
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
    const description = result.description ? ` (${result.description})` : "";

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

      case "differentReturn": {
        return `a função ${failure.name} retornou outro valor`;
      }

      case "missingFunction": {
        return `a função ${failure.name} não existe`;
      }

      case "differentSignature": {
        return `a função ${failure.name} tem outra assinatura`;
      }

      // Com `name`, foi a chamada da função conferida, e não o inicio
      case "timeout": {
        const where = failure.name ? ` na função ${failure.name}` : "";

        return `tempo esgotado${where} (${EXERCISE_TIMEOUT / 1000} segundos)`;
      }

      case "error": {
        return failure.name ? `erro de execução na função ${failure.name}` : "erro de execução";
      }

      case "missingInputs": {
        // Uma função conferida sozinha não recebe entradas: o leia foi dentro dela
        return failure.name ? `a função ${failure.name} pediu uma entrada` : "pediu mais entradas do que o caso tem";
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
   * Os valores em que o `contém` procurou: um valor que faltou pode ter sido escrito com outro
   * tipo (`inteiro 8` no lugar de `real 8.0`), e a saída do programa não mostra o tipo.
   */
  writtenValues(run: CaseRun) {
    return comparedValues(run, "contém");
  }

  /**
   * As falhas que têm o que mostrar além do tipo, nos exemplos.
   */
  hasDetails(failure: CaseFailure) {
    return [
      "differentOutput",
      "differentValues",
      "missingValue",
      "error",
      "differentReturn",
      "differentSignature",
    ].includes(failure.type);
  }

  /**
   * A assinatura esperada e a declarada, e a chamada que a correção fez, como no Portugol.
   */
  protected readonly signature = portugolSignature;
  protected readonly call = portugolCall;

  /**
   * As linhas da saída como são comparadas, para mostrar entre aspas.
   */
  quoted(line: string | null) {
    return line === null ? "nada" : `“${line}”`;
  }
}
