import type { ErrorPosition, IPortugolRunner, WrittenValue } from "./runners/IPortugolRunner.js";

/**
 * Um valor esperado num exercício, como no JSON (`@portugol-webstudio/resources/exercicios`).
 */
export type ExpectedValue =
  | { tipo: "inteiro" | "real"; valor: number }
  | { tipo: "cadeia" | "caracter"; valor: string }
  | { tipo: "logico"; valor: boolean };

export type ExerciseCheck = {
  descrição?: string;
  alvo: "escreva";
  regra: "igual" | "contém";
  valores: ExpectedValue[];
  tolerância?: number;
};

export type ExerciseCase = {
  descrição?: string;
  entradas: string[];
  saída?: string;
  verificações?: ExerciseCheck[];
};

/**
 * O que a correção usa de um exercício. O tipo completo, gerado do esquema, fica em
 * `@portugol-webstudio/resources/exercicios`.
 */
export type CheckableExercise =
  | {
      modo: "simples";
      exemplos: Array<ExerciseCase & { saída: string }>;
      testes: Array<ExerciseCase & { saída: string }>;
    }
  | {
      modo: "avançado";
      exemplos: Array<ExerciseCase & { verificações: ExerciseCheck[] }>;
      testes: Array<ExerciseCase & { verificações: ExerciseCheck[] }>;
    };

/**
 *  * Como terminou a execução de um caso.
 */
export type CaseEnding =
  | { type: "finished" }
  | { type: "timeout" }
  | { type: "error"; message: string; position?: ErrorPosition }
  | { type: "missingInputs" }
  | { type: "extraInputs"; remaining: number };

export type CaseRun = {
  ending: CaseEnding;
  /**
   * O texto escrito pelo programa. O `limpa` não apaga nada.
   */
  output: string;
  /**
   * Os valores escritos, só quando a execução pediu (`writeValues`).
   */
  values: WrittenValue[];
};

/**
 * Por que um caso não passou. As linhas e as posições contam do 1. `null` é uma linha ou um
 * valor que faltou.
 */
export type CaseFailure =
  | Exclude<CaseEnding, { type: "finished" }>
  | { type: "differentOutput"; line: number; expected: string | null; received: string | null }
  | {
      type: "differentValues";
      check: number;
      descrição?: string;
      position: number;
      expected: ExpectedValue | null;
      received: WrittenValue | null;
    }
  | { type: "missingValue"; check: number; descrição?: string; position: number; expected: ExpectedValue };

export type CaseResult = {
  kind: "exemplo" | "teste";
  /**
   * A posição do caso entre os exemplos ou entre os testes, contando do 1.
   */
  index: number;
  descrição?: string;
  run: CaseRun;
  failure?: CaseFailure;
};

export type ExerciseResult = {
  passed: boolean;
  cases: CaseResult[];
};

export type CheckOptions = {
  /**
   * Em milissegundos, por caso.
   */
  timeout?: number;
};

/**
 *  * Tempo limite de cada caso, o mesmo do corretor do Portugol Studio.
 */
export const EXERCISE_TIMEOUT = 60_000;

/**
 *  * Diferença aceita entre dois valores `real` quando a verificação não diz outra.
 */
export const DEFAULT_TOLERANCE = 0.000001;

/**
 * Executa o programa já transpilado (`js`) com as entradas de um caso: cada `leia` recebe a
 * próxima entrada. Pedir mais entradas do que o caso tem, ou deixar entradas sobrando, termina
 * o caso.
 */
export function runExerciseCase(
  Runner: typeof IPortugolRunner,
  js: string,
  inputs: string[],
  { timeout = EXERCISE_TIMEOUT, writeValues = false } = {},
): Promise<CaseRun> {
  // @ts-expect-error A classe concreta, não a abstrata
  const runner: IPortugolRunner = new Runner(js);
  const pending = [...inputs];
  const values: WrittenValue[] = [];
  let output = "";
  let ending: CaseEnding | undefined;

  return new Promise(resolve => {
    const timer = setTimeout(() => {
      ending ??= { type: "timeout" };
      runner.destroy(true);
    }, timeout);

    const stdOut$ = runner.stdOut$.subscribe(text => {
      output += text;
    });

    runner.run({ writeValues }).subscribe(event => {
      switch (event.type) {
        case "stdIn": {
          const input = pending.shift();

          if (input === undefined) {
            ending ??= { type: "missingInputs" };
            runner.destroy(true);
          } else {
            runner.stdIn.next(input);
          }

          break;
        }

        case "write": {
          values.push(...event.values);
          break;
        }

        case "error": {
          ending ??= { type: "error", message: event.error.message, position: event.position };
          break;
        }

        case "finish": {
          clearTimeout(timer);
          stdOut$.unsubscribe();

          if (ending === undefined && pending.length > 0) {
            ending = { type: "extraInputs", remaining: pending.length };
          }

          resolve({ ending: ending ?? { type: "finished" }, output, values });
          break;
        }
      }
    });
  });
}

/**
 * Corrige um exercício: executa o código já transpilado (`js`) em cada exemplo e em cada teste,
 * um de cada vez, e compara o resultado com o esperado.
 */
export async function checkExercise(
  Runner: typeof IPortugolRunner,
  js: string,
  exercise: CheckableExercise,
  { timeout }: CheckOptions = {},
): Promise<ExerciseResult> {
  const writeValues = exercise.modo === "avançado";
  const cases: CaseResult[] = [];

  for (const kind of ["exemplo", "teste"] as const) {
    const list: ExerciseCase[] = kind === "exemplo" ? exercise.exemplos : exercise.testes;

    for (const [i, testCase] of list.entries()) {
      const run = await runExerciseCase(Runner, js, testCase.entradas, { timeout, writeValues });
      const failure = run.ending.type === "finished" ? compareCase(testCase, run) : run.ending;

      cases.push({ kind, index: i + 1, descrição: testCase.descrição, run, failure });
    }
  }

  return { passed: cases.every(result => result.failure === undefined), cases };
}

/**
 * O texto como é comparado no modo simples: sem os espaços do começo e do fim de cada linha, e
 * sem as linhas em branco do fim.
 */
export function normalizeOutput(text: string) {
  const lines = text.split("\n").map(line => line.trim());

  while (lines.length > 0 && lines.at(-1) === "") {
    lines.pop();
  }

  return lines;
}

function compareCase(testCase: ExerciseCase, run: CaseRun): CaseFailure | undefined {
  if (testCase.verificações === undefined) {
    return compareOutput(testCase.saída ?? "", run.output);
  }

  for (const [i, check] of testCase.verificações.entries()) {
    const failure = check.regra === "igual" ? compareEqual(check, run.values) : compareContains(check, run.values);

    if (failure) {
      return { ...failure, check: i + 1, descrição: check.descrição };
    }
  }

  return undefined;
}

function compareOutput(expected: string, received: string): CaseFailure | undefined {
  const expectedLines = normalizeOutput(expected);
  const receivedLines = normalizeOutput(received);
  const length = Math.max(expectedLines.length, receivedLines.length);

  for (let i = 0; i < length; i++) {
    if (expectedLines[i] !== receivedLines[i]) {
      return {
        type: "differentOutput",
        line: i + 1,
        expected: expectedLines[i] ?? null,
        received: receivedLines[i] ?? null,
      };
    }
  }

  return undefined;
}

function compareEqual(check: ExerciseCheck, values: WrittenValue[]) {
  const length = Math.max(check.valores.length, values.length);

  for (let i = 0; i < length; i++) {
    const expected = check.valores[i];
    const received = values[i];

    if (expected === undefined || received === undefined || !sameValue(expected, received, check.tolerância)) {
      return {
        type: "differentValues" as const,
        position: i + 1,
        expected: expected ?? null,
        received: received ?? null,
      };
    }
  }

  return;
}

function compareContains(check: ExerciseCheck, values: WrittenValue[]) {
  let next = 0;

  for (const [i, expected] of check.valores.entries()) {
    while (next < values.length && !sameValue(expected, values[next], check.tolerância)) {
      next++;
    }

    if (next === values.length) {
      return { type: "missingValue" as const, position: i + 1, expected };
    }

    next++;
  }

  return;
}

function sameValue(expected: ExpectedValue, received: WrittenValue, tolerance = DEFAULT_TOLERANCE) {
  if (expected.tipo !== received.type) {
    return false;
  }

  if (expected.tipo === "real") {
    return Math.abs(expected.valor - (received.value as number)) <= tolerance;
  }

  // O 'escreva' escreve uma cadeia que nunca recebeu valor como vazia
  return expected.valor === (received.value ?? "");
}
