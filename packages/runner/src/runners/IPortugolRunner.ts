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
  | { type: "write"; values: WrittenValue[] };

/**
 * Um valor escrito pelo `escreva`, com o tipo: um por argumento, como no corretor do Portugol
 * Studio. Uma `cadeia` que nunca recebeu valor vem como `null`.
 */
export type WrittenValue =
  | { type: "inteiro" | "real"; value: number }
  | { type: "cadeia"; value: string | null }
  | { type: "caracter"; value: string }
  | { type: "logico"; value: boolean };

/**
 * Função `valuesOf(args)` dos workers: os valores dos argumentos de um `escreva`, no formato
 * de `WrittenValue`. Os argumentos sem valor são pulados, como no texto escrito.
 */
export const WRITTEN_VALUES = /* javascript */ `
  const valuesOf = (args) =>
    args.filter((arg) => typeof arg.value !== "undefined").map((arg) => ({ type: arg.type, value: arg.value }));
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
