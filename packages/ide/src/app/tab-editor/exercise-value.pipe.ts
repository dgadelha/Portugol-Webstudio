import { Pipe, PipeTransform } from "@angular/core";
import { portugolLiteral, PortugolValue } from "@portugol-webstudio/runner";

/**
 * Um valor esperado ou escrito como o Portugol o escreve, com o tipo antes: `inteiro 42`,
 * `real 8.0`, `cadeia "42"`, `caracter 'a'`, `logico verdadeiro`.
 */
@Pipe({ name: "exerciseValue" })
export class ExerciseValuePipe implements PipeTransform {
  transform(value: PortugolValue | null): string {
    return value === null ? "nada" : `${value.tipo} ${portugolLiteral(value.tipo, value.valor)}`;
  }
}
