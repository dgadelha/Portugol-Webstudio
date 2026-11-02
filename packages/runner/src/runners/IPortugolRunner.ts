import { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { Observable, Subject } from "rxjs";

export type PortugolEvent =
  | { type: "start" }
  | { type: "clear" }
  | { type: "stdIn" }
  | { type: "error"; error: Error; position?: ErrorPosition }
  | { type: "parseError"; errors: IPortugolCodeDiagnostic[] }
  | { type: "finish"; stopped: boolean; time: number }
  | { type: "message"; message: PortugolMessage }
  | { type: "paused"; pause: DebugPause }
  | { type: "write"; values: PortugolValue[] }
  | { type: "return"; value: PortugolValue | null };

/**
 * Um valor do Portugol com o tipo, no formato dos exercícios (`@portugol-webstudio/resources/
 * exercicios`): o esperado num exercício, cada argumento de um `escreva` (como no corretor do
 * Portugol Studio) e o retorno de uma função conferida.
 */
export type PortugolValue =
  | { tipo: "inteiro" | "real"; valor: number }
  | { tipo: "cadeia" | "caracter"; valor: string }
  | { tipo: "logico"; valor: boolean };

/**
 * Um vetor num argumento de uma função conferida.
 */
export type PortugolVector =
  | { tipo: "inteiro[]" | "real[]"; valor: number[] }
  | { tipo: "cadeia[]" | "caracter[]"; valor: string[] }
  | { tipo: "logico[]"; valor: boolean[] };

/**
 * Um argumento de uma função conferida (`RunOptions.call`), como no exercício: um valor
 * simples ou um vetor. O runtime o recebe assim mesmo.
 */
export type ExerciseArgument = PortugolValue | PortugolVector;

/**
 * Funções `valuesOf(args)` e `returnOf(result)` dos workers, no formato de `PortugolValue`. Uma
 * \`cadeia\` sem valor vale "", que é o que o \`escreva\` escreve.
 * - `valuesOf`: os valores dos argumentos de um `escreva`. Os argumentos sem valor nenhum
 *   (\`undefined\`) são pulados, como no texto escrito.
 * - `returnOf`: o retorno de uma função chamada pela correção, ou `null` quando ela não
 *   retorna nada (uma função sem tipo, ou um valor que nunca foi atribuído, menos numa
 *   \`cadeia\`).
 */
export const WRITTEN_VALUES = /* javascript */ `
  const writtenValue = (arg) => ({ tipo: arg.type, valor: arg.type === "cadeia" ? (arg.value ?? "") : arg.value });

  const valuesOf = (args) => args.filter((arg) => typeof arg.value !== "undefined").map(writtenValue);

  const returnOf = (result) =>
    result && typeof result === "object" && result.type && (result.type === "cadeia" || typeof result.value !== "undefined")
      ? writtenValue(result)
      : null;
`;

/**
 * Onde aconteceu um erro de execução: o começo do comando, com a linha e a coluna contadas
 * do 1, como no Portugol Studio e no editor.
 */
export type ErrorPosition = { line: number; column: number };

/**
 * Um valor numa pausa da depuração: o texto de um valor simples, como `5`, `"abc"` ou
 * `verdadeiro` (`null` antes de receber um valor), ou os itens de um vetor ou matriz.
 */
export type DebugValue = {
  type: string;
  text?: string | null;
  items?: DebugValue[];
};

export type DebugVariable = DebugValue & {
  name: string;
  constant: boolean;
};

export type DebugPause = {
  line: number;
  column: number;
  /**
   * As funções em andamento, da chamada mais recente para a mais antiga. O `id` distingue
   * duas chamadas da mesma função, como `f(1)` e depois `f(2)`.
   */
  frames: Array<{ id: number; name: string; variables: DebugVariable[] }>;
  globals: DebugVariable[];
};

export type DebugCommand =
  { type: "step" | "stepOver" | "stepOut" | "continue" | "pause" } | { type: "breakpoints"; lines: number[] };

export type RunOptions = {
  /**
   * Para um programa transpilado com os passos da depuração.
   */
  debug?: { breakpoints: number[] };

  /**
   * Manda também um evento `write` com os valores de cada `escreva`, para a correção dos
   * exercícios.
   */
  writeValues?: boolean;

  /**
   * Chama só esta função do programa, com estes argumentos, em vez do `inicio`, e manda um
   * evento `return` com o retorno dela. Para a correção dos exercícios.
   */
  call?: { name: string; args: ExerciseArgument[] };
};

export type PortugolMessage = {
  id?: string;
  type: string;
  data?: unknown;
};

export abstract class IPortugolRunner {
  constructor(public byteCode: string) {}

  abstract stdIn: Subject<string>;
  abstract stdOut$: Observable<string>;

  abstract waitingForInput: boolean;
  abstract waitingForInput$: Observable<boolean>;

  abstract running: boolean;
  abstract running$: Observable<boolean>;

  abstract run(options?: RunOptions): Observable<PortugolEvent>;
  abstract destroy(stopped?: boolean): void;

  abstract debug(command: DebugCommand): void;

  abstract postMessage(message: PortugolMessage): void;
  abstract replyMessage(message: PortugolMessage, result: unknown, transferable?: Transferable[]): void;
}
