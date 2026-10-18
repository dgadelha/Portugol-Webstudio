import { Pipe, PipeTransform } from "@angular/core";
import { ExpectedValue, realToString, WrittenValue } from "@portugol-webstudio/runner";

/**
 * Um valor esperado ou escrito como o Portugol o escreve, com o tipo antes: `inteiro 42`,
 * `real 8.0`, `cadeia "42"`, `caracter 'a'`, `logico verdadeiro`.
 */
@Pipe({ name: "exerciseValue" })
export class ExerciseValuePipe implements PipeTransform {
  transform(value: ExpectedValue | WrittenValue | null): string {
    if (value === null) {
      return "nada";
    }

    const [type, raw] = "tipo" in value ? [value.tipo, value.valor] : [value.type, value.value];

    switch (type) {
      case "real": {
        const number = raw as number;

        return `real ${realToString(number)}`;
      }

      case "cadeia": {
        return `cadeia "${raw as string}"`;
      }

      case "caracter": {
        return `caracter '${raw as string}'`;
      }

      case "logico": {
        return `logico ${raw ? "verdadeiro" : "falso"}`;
      }

      default: {
        return `${type} ${String(raw)}`;
      }
    }
  }
}
