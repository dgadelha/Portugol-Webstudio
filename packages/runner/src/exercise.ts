import type { FunctionSignature } from "@portugol-webstudio/parser";

import type { ErrorPosition, ExerciseArgument, IPortugolRunner, PortugolValue } from "./runners/IPortugolRunner.js";

/**
 * O tipo dos elementos de um tipo de vetor (`real[]` → `real`), ou `undefined` num tipo
 * simples. Matrizes ainda não existem nos exercícios: uma delas aqui é um erro, não um vetor
 * de vetores.
 */
export function vectorElementType(tipo: string) {
  if (!tipo.endsWith("[]")) {
    return;
  }

  const element = tipo.slice(0, -2);

  if (element.endsWith("[]")) {
    throw new Error(`Tipo de argumento não suportado: ${tipo}`);
  }

  return element as PortugolValue["tipo"];
}

export type WriteCheck = {
  descrição?: string;
  alvo: "escreva";
  /**
   * `igual`: os valores escritos são exatamente estes. `contém`: estes valores aparecem, nesta
   * ordem, entre os escritos depois da última leitura (as mensagens antes de cada `leia` não
   * contam).
   */
  regra: "igual" | "contém";
  valores: PortugolValue[];
  tolerância?: number;
};

/**
 * O retorno de uma função do programa, chamada sozinha com estes argumentos. A assinatura
 * esperada vem dos tipos dos argumentos e do valor.
 */
export type FunctionCheck = {
  descrição?: string;
  alvo: "função";
  nome: string;
  argumentos: ExerciseArgument[];
  regra: "igual";
  valor: PortugolValue;
  tolerância?: number;
};

export type ExerciseCheck = WriteCheck | FunctionCheck;

/**
 * Uma assinatura sem o nome: os tipos dos parâmetros (`inteiro[]` num vetor, `inteiro[][]` numa
 * matriz) e o do retorno.
 */
export type SignatureTypes = Omit<FunctionSignature, "name">;

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
 * Como terminou a execução de um caso.
 */
export type CaseEnding =
  | { type: "finished" }
  | { type: "timeout" }
  | { type: "error"; message: string; position?: ErrorPosition }
  | { type: "missingInputs" }
  | { type: "extraInputs"; remaining: number }
  | { type: "aborted" };

export type CaseRun = {
  ending: CaseEnding;
  /**
   * O texto escrito pelo programa. O `limpa` não apaga nada.
   */
  output: string;
  /**
   * Os valores escritos, só quando a execução pediu (`writeValues`).
   */
  values: PortugolValue[];
  /**
   * Quantos dos `values` foram escritos antes da última leitura. O `contém` não confere nada
   * disso: nem as mensagens antes de cada `leia`, nem um resultado escrito entre duas leituras.
   */
  valuesBeforeLastInput: number;
  /**
   * O retorno da função chamada (`call`): `null` sem chamada, ou se ela não retornou nada.
   */
  returned: PortugolValue | null;
};

/**
 * Por que um caso não passou. As linhas e as posições contam do 1. `null` é uma linha ou um
 * valor que faltou.
 */
export type CaseFailure =
  // `name`: a função conferida, quando a execução que terminou assim era a chamada dela
  | (Exclude<CaseEnding, { type: "finished" }> & { name?: string })
  | { type: "differentOutput"; line: number; expected: string | null; received: string | null }
  | {
      type: "differentValues";
      check: number;
      description?: string;
      position: number;
      expected: PortugolValue | null;
      received: PortugolValue | null;
    }
  | {
      type: "missingValue";
      check: number;
      description?: string;
      position: number;
      expected: PortugolValue;
      /**
       * O caso tem entradas: o `contém` só procurou no que foi escrito depois da última leitura.
       */
      afterLastInput: boolean;
    }
  | { type: "missingFunction"; check: number; description?: string; name: string }
  | {
      type: "differentSignature";
      check: number;
      description?: string;
      name: string;
      expected: SignatureTypes;
      received: SignatureTypes;
    }
  | {
      type: "differentReturn";
      check: number;
      description?: string;
      name: string;
      arguments: ExerciseArgument[];
      expected: PortugolValue;
      received: PortugolValue | null;
    };

export type CaseResult = {
  kind: "exemplo" | "teste";
  /**
   * A posição do caso entre os exemplos ou entre os testes, contando do 1.
   */
  index: number;
  description?: string;
  /**
   * A última execução do caso: a do `inicio` ou, numa verificação de função, a da chamada.
   */
  run: CaseRun;
  failure?: CaseFailure;
};

export type ExerciseResult = {
  passed: boolean;
  /**
   * Os casos conferidos, na ordem. Ficam de fora os que vinham depois de um tempo esgotado ou
   * da correção interrompida (`stopped`).
   */
  cases: CaseResult[];
  /**
   * Quantos casos o exercício tem.
   */
  total: number;
  stopped?: "timeout" | "aborted";
};

/**
 * O programa já transpilado, com as funções declaradas (`transpile` ou o worker do IDE).
 */
export type CheckableProgram = { js: string; functions: FunctionSignature[] };

export type CheckOptions = {
  /**
   * Em milissegundos, para cada execução: a do `inicio` de um caso, e a de cada função
   * conferida sozinha.
   */
  timeout?: number;
  /**
   * Interrompe a correção: o caso em execução para, e os seguintes não são conferidos.
   */
  signal?: AbortSignal;
  /**
   * Chamado depois de cada caso, para mostrar o andamento.
   */
  onCase?: (result: CaseResult, done: number, total: number) => void;
};

/**
 * Tempo limite de cada execução (o `inicio` de um caso, ou uma função conferida), o mesmo do
 * corretor do Portugol Studio para cada caso.
 */
export const EXERCISE_TIMEOUT = 60_000;

/**
 * Diferença aceita entre dois valores `real` quando a verificação não diz outra.
 */
export const DEFAULT_TOLERANCE = 0.000001;

/**
 * Bibliotecas que precisam de interação ou que o IDE não tem: os exercícios não as aceitam.
 */
export const BLOCKED_LIBRARIES = new Set([
  "Arquivos",
  "Graficos",
  "Internet",
  "Mouse",
  "ServicosWeb",
  "Sons",
  "Teclado",
]);

/**
 * As bibliotecas bloqueadas que o código inclui e o uso do `sorteia`, fora dos comentários e
 * das cadeias.
 */
export function analyzeExerciseCode(code: string) {
  const stripped = code.replaceAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, " ");
  const libraries = Array.from(stripped.matchAll(/\binclua\s+biblioteca\s+(\w+)/g), match => match[1]);

  return {
    blockedLibraries: libraries.filter(library => BLOCKED_LIBRARIES.has(library)),
    usesSorteia: /\bsorteia\s*\(/.test(stripped),
  };
}

/**
 * Executa o programa já transpilado (`js`) com as entradas de um caso: cada `leia` recebe a
 * próxima entrada. Pedir mais entradas do que o caso tem, ou deixar entradas sobrando, termina
 * o caso.
 */
export function runExerciseCase(
  Runner: typeof IPortugolRunner,
  js: string,
  inputs: string[],
  {
    timeout = EXERCISE_TIMEOUT,
    writeValues = false,
    call,
    signal,
  }: {
    timeout?: number;
    writeValues?: boolean;
    /**
     * Chama só esta função, em vez do `inicio`: o retorno fica em `returned`.
     */
    call?: { name: string; args: ExerciseArgument[] };
    signal?: AbortSignal;
  } = {},
): Promise<CaseRun> {
  // @ts-expect-error A classe concreta, não a abstrata
  const runner: IPortugolRunner = new Runner(js);
  const pending = [...inputs];
  const values: PortugolValue[] = [];
  let valuesBeforeLastInput = 0;
  let returned: PortugolValue | null = null;
  let output = "";
  let ending: CaseEnding | undefined;

  return new Promise(resolve => {
    const timer = setTimeout(() => {
      ending ??= { type: "timeout" };
      runner.destroy(true);
    }, timeout);

    const abort = () => {
      ending ??= { type: "aborted" };
      runner.destroy(true);
    };

    signal?.addEventListener("abort", abort, { once: true });

    const stdOut$ = runner.stdOut$.subscribe(text => {
      output += text;
    });

    runner.run({ writeValues, call }).subscribe(event => {
      switch (event.type) {
        case "stdIn": {
          const input = pending.shift();

          valuesBeforeLastInput = values.length;

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

        case "return": {
          returned = event.value;
          break;
        }

        case "error": {
          ending ??= { type: "error", message: event.error.message, position: event.position };
          break;
        }

        case "finish": {
          clearTimeout(timer);
          signal?.removeEventListener("abort", abort);
          stdOut$.unsubscribe();

          if (ending === undefined && pending.length > 0) {
            ending = { type: "extraInputs", remaining: pending.length };
          }

          resolve({ ending: ending ?? { type: "finished" }, output, values, valuesBeforeLastInput, returned });
          break;
        }
      }
    });

    // Um sinal que já chegou interrompido não dispara o evento `abort`
    if (signal?.aborted) {
      abort();
    }
  });
}

/**
 * Corrige um exercício: executa o programa já transpilado em cada exemplo e em cada teste, um
 * de cada vez, e compara o resultado com o esperado. Uma verificação de função confere a
 * assinatura e chama a função sozinha, numa execução à parte.
 */
export async function checkExercise(
  Runner: typeof IPortugolRunner,
  program: CheckableProgram,
  exercise: CheckableExercise,
  { timeout, signal, onCase }: CheckOptions = {},
): Promise<ExerciseResult> {
  const total = exercise.exemplos.length + exercise.testes.length;
  const cases: CaseResult[] = [];

  for (const kind of ["exemplo", "teste"] as const) {
    const list: ExerciseCase[] = kind === "exemplo" ? exercise.exemplos : exercise.testes;

    for (const [i, testCase] of list.entries()) {
      if (signal?.aborted) {
        return { passed: false, cases, total, stopped: "aborted" };
      }

      const { run, failure } = await checkCase(Runner, program, testCase, { timeout, signal });
      const result: CaseResult = { kind, index: i + 1, description: testCase.descrição, run, failure };

      cases.push(result);
      onCase?.(result, cases.length, total);

      // Um laço infinito costuma prender todos os casos: esperar o tempo de cada um levaria
      // minutos para dizer a mesma coisa
      if (run.ending.type === "timeout" || run.ending.type === "aborted") {
        return { passed: false, cases, total, stopped: run.ending.type };
      }
    }
  }

  return { passed: cases.every(result => result.failure === undefined), cases, total };
}

/**
 * Se o caso executa o `inicio` com as entradas: no modo simples, ou quando confere o `escreva`.
 * Um caso só com verificações de função chama cada função sozinha, sem entradas. Vale também
 * para um caso da criação de exercício, que tem as mesmas verificações.
 */
export function runsInicio(testCase: ExerciseCase | { verificações: ReadonlyArray<{ alvo: string }> }) {
  const checks = "verificações" in testCase ? testCase.verificações : undefined;

  return checks?.some(check => check.alvo !== "função") ?? true;
}

/**
 * Um caso: o `inicio` com as entradas, se o caso confere a saída ou o `escreva`, e cada função
 * conferida numa execução própria, na ordem das verificações. Para na primeira falha.
 */
async function checkCase(
  Runner: typeof IPortugolRunner,
  program: CheckableProgram,
  testCase: ExerciseCase,
  options: { timeout?: number; signal?: AbortSignal },
): Promise<{ run: CaseRun; failure?: CaseFailure }> {
  const checks = testCase.verificações;
  let run: CaseRun = { ending: { type: "finished" }, output: "", values: [], valuesBeforeLastInput: 0, returned: null };

  if (runsInicio(testCase)) {
    run = await runExerciseCase(Runner, program.js, testCase.entradas, {
      ...options,
      writeValues: checks !== undefined,
    });

    if (run.ending.type !== "finished") {
      return { run, failure: run.ending };
    }
  }

  if (checks === undefined) {
    return { run, failure: compareOutput(testCase.saída ?? "", run.output) };
  }

  for (const [i, check] of checks.entries()) {
    const where = { check: i + 1, description: check.descrição };

    if (check.alvo === "escreva") {
      const values = comparedValues(run, check.regra);
      const failure =
        check.regra === "igual"
          ? compareEqual(check, values)
          : compareContains(check, values, testCase.entradas.length > 0);

      if (failure) {
        return { run, failure: { ...failure, ...where } };
      }

      continue;
    }

    const result = await checkFunction(Runner, program, check, where, options);

    run = result.run ?? run;

    if (result.failure) {
      return { run, failure: result.failure };
    }
  }

  return { run };
}

/**
 * Uma verificação de função: a assinatura, depois a chamada sozinha, e o retorno. `where` diz
 * qual verificação do caso ela é.
 */
async function checkFunction(
  Runner: typeof IPortugolRunner,
  program: CheckableProgram,
  check: FunctionCheck,
  where: { check: number; description?: string },
  options: { timeout?: number; signal?: AbortSignal },
): Promise<{ run?: CaseRun; failure?: CaseFailure }> {
  const declared = program.functions.find(signature => signature.name === check.nome);

  if (!declared) {
    return { failure: { type: "missingFunction", ...where, name: check.nome } };
  }

  const expected = { parameters: check.argumentos.map(argument => argument.tipo), returns: check.valor.tipo };
  const received = { parameters: declared.parameters, returns: declared.returns };

  // Os tipos não têm vírgula: juntar compara as listas
  if (expected.returns !== received.returns || expected.parameters.join(",") !== received.parameters.join(",")) {
    return { failure: { type: "differentSignature", ...where, name: check.nome, expected, received } };
  }

  const run = await runExerciseCase(Runner, program.js, [], {
    ...options,
    call: { name: check.nome, args: check.argumentos },
  });

  if (run.ending.type !== "finished") {
    return { run, failure: { ...run.ending, name: check.nome } };
  }

  if (run.returned === null || !sameValue(check.valor, run.returned, check.tolerância)) {
    return {
      run,
      failure: {
        type: "differentReturn",
        ...where,
        name: check.nome,
        arguments: check.argumentos,
        expected: check.valor,
        received: run.returned,
      },
    };
  }

  return { run };
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

function compareEqual(check: WriteCheck, values: PortugolValue[]) {
  const length = Math.max(check.valores.length, values.length);

  for (let i = 0; i < length; i++) {
    const expected = check.valores[i];
    const received = values[i];

    if (expected === undefined || received === undefined || !sameValue(expected, received, check.tolerância, true)) {
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

function compareContains(check: WriteCheck, values: PortugolValue[], afterLastInput: boolean) {
  let next = 0;

  for (const [i, expected] of check.valores.entries()) {
    while (next < values.length && !sameValue(expected, values[next], check.tolerância, true)) {
      next++;
    }

    if (next === values.length) {
      return { type: "missingValue" as const, position: i + 1, expected, afterLastInput };
    }

    next++;
  }

  return;
}

/**
 * Se o valor recebido é o esperado. Com `written`, é um valor escrito pelo `escreva`: uma cadeia
 * vale com ou sem as quebras de linha do fim (`escreva("Par\n")` escreve "Par"). Um retorno é
 * conferido como veio.
 */
function sameValue(expected: PortugolValue, received: PortugolValue, tolerance = DEFAULT_TOLERANCE, written = false) {
  if (expected.tipo === "real" && received.tipo === "real") {
    return Math.abs(expected.valor - received.valor) <= tolerance;
  }

  if (written && expected.tipo === "cadeia" && received.tipo === "cadeia") {
    return withoutTrailingLineBreaks(expected.valor) === withoutTrailingLineBreaks(received.valor);
  }

  return expected.tipo === received.tipo && expected.valor === received.valor;
}

/**
 * Os valores escritos que uma verificação do `escreva` compara: todos no `igual`, e os
 * escritos depois da última leitura no `contém`. As cadeias que são só quebras de linha não
 * contam. Quem cria um exercício gera os valores esperados daqui, da solução.
 */
export function comparedValues(run: CaseRun, regra: WriteCheck["regra"]) {
  return withoutLineBreaks(regra === "igual" ? run.values : run.values.slice(run.valuesBeforeLastInput));
}

/**
 * Os valores escritos sem as cadeias que são só quebras de linha: `escreva("Par", "\n")` é o
 * mesmo que `escreva("Par\n")`, e a quebra de linha é a formatação da saída, não um valor.
 */
function withoutLineBreaks(values: PortugolValue[]) {
  return values.filter(
    value => value.tipo !== "cadeia" || withoutTrailingLineBreaks(value.valor) !== "" || value.valor === "",
  );
}

function withoutTrailingLineBreaks(text: string) {
  let end = text.length;

  while (end > 0 && (text[end - 1] === "\n" || text[end - 1] === "\r")) {
    end--;
  }

  return text.slice(0, end);
}
