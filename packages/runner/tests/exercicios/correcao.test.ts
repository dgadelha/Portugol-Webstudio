import { describe, expect, test } from "vitest";
import {
  analyzeExerciseCode,
  CheckableExercise,
  checkExercise,
  ExerciseCheck,
  FunctionCheck,
  normalizeOutput,
  PortugolWorkerThreadsRunner,
  runExerciseCase,
  transpile,
  WriteCheck,
} from "../../src";
import { portugol, portugolInicio } from "../helpers/code";

function check(code: string, exercise: CheckableExercise, timeout?: number) {
  return checkExercise(PortugolWorkerThreadsRunner, transpile(code), exercise, { timeout });
}

function simple(saída: string, entradas: string[] = []): CheckableExercise {
  return { modo: "simples", exemplos: [{ entradas, saída }], testes: [] };
}

function advanced(verificações: ExerciseCheck[]): CheckableExercise {
  return { modo: "avançado", exemplos: [{ entradas: [], verificações }], testes: [] };
}

async function failure(code: string, exercise: CheckableExercise, timeout?: number) {
  const result = await check(code, exercise, timeout);

  return result.cases[0].failure;
}

describe("Correção de exercícios", () => {
  describe("Modo simples", () => {
    test("Ignora os espaços nas pontas de cada linha e as linhas em branco do fim", () => {
      expect(normalizeOutput("  a  \n\tb\n\n  \n")).toEqual(["a", "b"]);
      expect(normalizeOutput("a\n\nb")).toEqual(["a", "", "b"]);
    });

    test("Passa com a mesma saída", async () => {
      await expect(failure(portugolInicio`escreva("par\\n")`, simple("par"))).resolves.toBeUndefined();
    });

    test("Uma linha em branco no meio conta", async () => {
      await expect(failure(portugolInicio`escreva("a\\n\\nb")`, simple("a\nb"))).resolves.toEqual({
        type: "differentOutput",
        line: 2,
        expected: "b",
        received: "",
      });
    });

    test("Aponta a primeira linha diferente", async () => {
      await expect(failure(portugolInicio`escreva("1\\n2\\n4\\n")`, simple("1\n2\n3\n"))).resolves.toEqual({
        type: "differentOutput",
        line: 3,
        expected: "3",
        received: "4",
      });
    });

    test("Uma linha que falta ou sobra é null", async () => {
      await expect(failure(portugolInicio`escreva("1")`, simple("1\n2"))).resolves.toMatchObject({
        line: 2,
        expected: "2",
        received: null,
      });

      await expect(failure(portugolInicio`escreva("1\\n2")`, simple("1"))).resolves.toMatchObject({
        line: 2,
        expected: null,
        received: "2",
      });
    });

    test("O que o leia recebe não entra na saída", async () => {
      const code = portugolInicio`
        inteiro n
        leia(n)
        escreva(n * 2)
      `;

      await expect(failure(code, simple("10", ["5"]))).resolves.toBeUndefined();
    });

    test("O limpa não apaga a saída", async () => {
      const code = portugolInicio`
        escreva("a\\n")
        limpa()
        escreva("b")
      `;

      await expect(failure(code, simple("a\nb"))).resolves.toBeUndefined();
    });
  });

  describe("Modo avançado", () => {
    const igual = (valores: WriteCheck["valores"], tolerância?: number): ExerciseCheck => {
      return {
        alvo: "escreva",
        regra: "igual",
        valores,
        tolerância,
      };
    };

    const contém = (valores: WriteCheck["valores"]): ExerciseCheck => {
      return {
        alvo: "escreva",
        regra: "contém",
        valores,
      };
    };

    test("Cada argumento do escreva é um valor", async () => {
      const result = await check(portugolInicio`escreva("a", 1, 2.5, 'c', verdadeiro)`, advanced([contém([])]));

      expect(result.cases[0].run.values).toEqual([
        { type: "cadeia", value: "a" },
        { type: "inteiro", value: 1 },
        { type: "real", value: 2.5 },
        { type: "caracter", value: "c" },
        { type: "logico", value: true },
      ]);
    });

    test("igual: o tipo conta", async () => {
      await expect(
        failure(portugolInicio`escreva("42")`, advanced([igual([{ tipo: "inteiro", valor: 42 }])])),
      ).resolves.toEqual({
        type: "differentValues",
        check: 1,
        description: undefined,
        position: 1,
        expected: { tipo: "inteiro", valor: 42 },
        received: { type: "cadeia", value: "42" },
      });

      await expect(
        failure(portugolInicio`escreva(42)`, advanced([igual([{ tipo: "inteiro", valor: 42 }])])),
      ).resolves.toBeUndefined();
    });

    test("igual: um valor a mais falha", async () => {
      await expect(
        failure(portugolInicio`escreva("Soma: ", 8)`, advanced([igual([{ tipo: "inteiro", valor: 8 }])])),
      ).resolves.toMatchObject({ type: "differentValues", position: 1, received: { type: "cadeia", value: "Soma: " } });

      await expect(
        failure(portugolInicio`escreva(8, 9)`, advanced([igual([{ tipo: "inteiro", valor: 8 }])])),
      ).resolves.toMatchObject({ type: "differentValues", position: 2, expected: null });
    });

    test("contém: ignora os outros valores, mas não a ordem", async () => {
      const code = portugolInicio`
        escreva("Digite: ", 3, " e ", 5, "\\n")
      `;

      await expect(
        failure(
          code,
          advanced([
            contém([
              { tipo: "inteiro", valor: 3 },
              { tipo: "inteiro", valor: 5 },
            ]),
          ]),
        ),
      ).resolves.toBeUndefined();

      await expect(
        failure(
          code,
          advanced([
            contém([
              { tipo: "inteiro", valor: 5 },
              { tipo: "inteiro", valor: 3 },
            ]),
          ]),
        ),
      ).resolves.toEqual({
        type: "missingValue",
        check: 1,
        description: undefined,
        position: 2,
        expected: { tipo: "inteiro", valor: 3 },
      });
    });

    test("real: compara com uma tolerância", async () => {
      await expect(
        failure(portugolInicio`escreva(0.1 + 0.2)`, advanced([igual([{ tipo: "real", valor: 0.3 }])])),
      ).resolves.toBeUndefined();

      await expect(
        failure(portugolInicio`escreva(10.0 / 3)`, advanced([igual([{ tipo: "real", valor: 3.33 }])])),
      ).resolves.toMatchObject({ type: "differentValues" });

      await expect(
        failure(portugolInicio`escreva(10.0 / 3)`, advanced([igual([{ tipo: "real", valor: 3.33 }], 0.01)])),
      ).resolves.toBeUndefined();
    });

    test("real e inteiro são tipos diferentes", async () => {
      await expect(
        failure(portugolInicio`escreva(8.0)`, advanced([igual([{ tipo: "inteiro", valor: 8 }])])),
      ).resolves.toMatchObject({ type: "differentValues" });
    });

    test("Uma cadeia sem valor é escrita como vazia", async () => {
      const code = portugolInicio`
        cadeia c[1]
        escreva(c[0])
      `;

      await expect(failure(code, advanced([igual([{ tipo: "cadeia", valor: "" }])]))).resolves.toBeUndefined();
    });

    test("Um argumento sem valor nenhum é pulado, como no texto escrito", async () => {
      const code = portugolInicio`
        cadeia x
        escreva(x, 1)
      `;

      await expect(failure(code, advanced([igual([{ tipo: "inteiro", valor: 1 }])]))).resolves.toBeUndefined();
    });

    test("Diz qual verificação falhou", async () => {
      const exercise = advanced([
        contém([{ tipo: "inteiro", valor: 1 }]),
        { ...contém([{ tipo: "inteiro", valor: 2 }]), descrição: "o segundo" },
      ]);

      await expect(failure(portugolInicio`escreva(1)`, exercise)).resolves.toMatchObject({
        type: "missingValue",
        check: 2,
        description: "o segundo",
      });
    });
  });

  describe("Verificação de função", () => {
    const retorna = (
      nome: string,
      argumentos: FunctionCheck["argumentos"],
      valor: FunctionCheck["valor"],
      tolerância?: number,
    ): FunctionCheck => ({ alvo: "função", nome, argumentos, regra: "igual", valor, tolerância });

    const soma = retorna(
      "soma",
      [
        { tipo: "inteiro", valor: 3 },
        { tipo: "inteiro", valor: 5 },
      ],
      { tipo: "inteiro", valor: 8 },
    );

    const programa = (funções: string, inicio = "") => {
      return portugol`
        programa {
          ${funções}

          funcao inicio() {
            ${inicio}
          }
        }
      `;
    };

    test("Passa com o retorno certo", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { retorne a + b }");

      await expect(check(code, advanced([soma]))).resolves.toMatchObject({ passed: true });
    });

    test("Chama só a função: o inicio não executa", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { retorne a + b }", "inteiro a leia(a)");

      await expect(failure(code, advanced([soma]))).resolves.toBeUndefined();
    });

    test("Um retorno diferente", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { retorne a - b }");

      await expect(failure(code, advanced([soma]))).resolves.toEqual({
        type: "differentReturn",
        check: 1,
        description: undefined,
        name: "soma",
        arguments: [
          { tipo: "inteiro", valor: 3 },
          { tipo: "inteiro", valor: 5 },
        ],
        expected: { tipo: "inteiro", valor: 8 },
        received: { type: "inteiro", value: -2 },
      });
    });

    test("A função não existe", async () => {
      const code = programa("funcao inteiro somar(inteiro a, inteiro b) { retorne a + b }");

      await expect(failure(code, advanced([soma]))).resolves.toMatchObject({ type: "missingFunction", name: "soma" });
    });

    test.each([
      ["outro retorno", "funcao real soma(inteiro a, inteiro b) { retorne a + b }", ["inteiro", "inteiro"], "real"],
      ["um parâmetro a menos", "funcao inteiro soma(inteiro a) { retorne a }", ["inteiro"], "inteiro"],
      [
        "outro tipo de parâmetro",
        "funcao inteiro soma(real a, inteiro b) { retorne 0 }",
        ["real", "inteiro"],
        "inteiro",
      ],
      [
        "um vetor no lugar de um valor",
        "funcao inteiro soma(inteiro a[], inteiro b) { retorne 0 }",
        ["inteiro[]", "inteiro"],
        "inteiro",
      ],
      ["sem retorno", "funcao soma(inteiro a, inteiro b) { }", ["inteiro", "inteiro"], "vazio"],
      [
        "uma matriz no lugar de um valor",
        "funcao inteiro soma(inteiro a[][], inteiro b) { retorne 0 }",
        ["inteiro[][]", "inteiro"],
        "inteiro",
      ],
    ])("Assinatura diferente: %s", async (_, funções, parameters, returns) => {
      await expect(failure(programa(funções), advanced([soma]))).resolves.toEqual({
        type: "differentSignature",
        check: 1,
        description: undefined,
        name: "soma",
        expected: { parameters: ["inteiro", "inteiro"], returns: "inteiro" },
        received: { parameters, returns },
      });
    });

    test("Um vetor como argumento", async () => {
      const code = programa(`
        funcao real media(real v[]) {
          real total = 0.0
          para (inteiro i = 0; i < 3; i++) { total = total + v[i] }
          retorne total / 3
        }
      `);
      const exercise = advanced([
        retorna("media", [{ tipo: "real[]", valor: [1, 2, 4.5] }], { tipo: "real", valor: 2.5 }),
      ]);

      await expect(check(code, exercise)).resolves.toMatchObject({ passed: true });
    });

    test("cadeia, caracter e logico", async () => {
      const code = programa(`
        funcao cadeia junta(cadeia a, caracter b) { retorne a + b }
        funcao logico par(inteiro n) { retorne n % 2 == 0 }
      `);
      const exercise = advanced([
        retorna(
          "junta",
          [
            { tipo: "cadeia", valor: "ab" },
            { tipo: "caracter", valor: "c" },
          ],
          { tipo: "cadeia", valor: "abc" },
        ),
        retorna("par", [{ tipo: "inteiro", valor: 4 }], { tipo: "logico", valor: true }),
      ]);

      await expect(check(code, exercise)).resolves.toMatchObject({ passed: true });
    });

    test.each([
      ["passa dentro da tolerância dada", 0.001, undefined],
      ["falha com a tolerância padrão", undefined, "differentReturn"],
    ])("real: %s", async (_, tolerância, type) => {
      const code = programa("funcao real terco() { retorne 1.0 / 3 }");
      const exercise = advanced([retorna("terco", [], { tipo: "real", valor: 0.333 }, tolerância)]);

      expect((await failure(code, exercise))?.type).toBe(type);
    });

    test("Uma cadeia que nunca recebeu valor retorna vazia", async () => {
      const code = programa("funcao cadeia c() { cadeia x retorne x }");

      await expect(failure(code, advanced([retorna("c", [], { tipo: "cadeia", valor: "" })]))).resolves.toBeUndefined();
    });

    test("Um leia dentro da função: a chamada dela pediu uma entrada", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { leia(a) retorne a + b }");

      await expect(failure(code, advanced([soma]))).resolves.toEqual({ type: "missingInputs", name: "soma" });
    });

    test("Diz qual verificação de função falhou", async () => {
      const code = programa(`
        funcao inteiro soma(inteiro a, inteiro b) { retorne a + b }
        funcao inteiro dobro(inteiro a) { retorne a }
      `);
      const exercise = advanced([
        soma,
        { ...retorna("dobro", [{ tipo: "inteiro", valor: 2 }], { tipo: "inteiro", valor: 4 }), descrição: "o dobro" },
      ]);

      await expect(failure(code, exercise)).resolves.toMatchObject({
        type: "differentReturn",
        check: 2,
        description: "o dobro",
        name: "dobro",
      });
    });

    test("Um laço infinito na função esgota o tempo, e os outros casos não são conferidos", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { enquanto (verdadeiro) {} retorne 0 }");
      const exercise: CheckableExercise = {
        modo: "avançado",
        exemplos: [{ entradas: [], verificações: [soma] }],
        testes: [{ entradas: [], verificações: [soma] }],
      };

      const result = await check(code, exercise, 300);

      expect(result).toMatchObject({ passed: false, total: 2, stopped: "timeout" });
      expect(result.cases).toHaveLength(1);
      expect(result.cases[0].failure).toEqual({ type: "timeout", name: "soma" });
    });

    test("Erro de execução na função", async () => {
      const code = programa("funcao inteiro soma(inteiro a, inteiro b) { retorne a / (b - b) }");

      await expect(failure(code, advanced([soma]))).resolves.toMatchObject({ type: "error" });
    });

    test("Com o escreva no mesmo caso: o inicio executa com as entradas", async () => {
      const code = programa(
        "funcao inteiro soma(inteiro a, inteiro b) { retorne a + b }",
        "inteiro a leia(a) escreva(a)",
      );
      const exercise: CheckableExercise = {
        modo: "avançado",
        exemplos: [
          {
            entradas: ["7"],
            verificações: [{ alvo: "escreva", regra: "igual", valores: [{ tipo: "inteiro", valor: 7 }] }, soma],
          },
        ],
        testes: [],
      };

      await expect(failure(code, exercise)).resolves.toBeUndefined();
    });
  });

  describe("Execução", () => {
    test("Pedir mais entradas do que o caso tem", async () => {
      const code = portugolInicio`
        inteiro a, b
        leia(a, b)
      `;

      await expect(failure(code, simple("", ["1"]))).resolves.toEqual({ type: "missingInputs" });
    });

    test("Deixar entradas sobrando", async () => {
      const code = portugolInicio`
        inteiro a
        leia(a)
      `;

      await expect(failure(code, simple("", ["1", "2", "3"]))).resolves.toEqual({ type: "extraInputs", remaining: 2 });
    });

    test("Erro de execução", async () => {
      const code = portugolInicio`
        inteiro v[2]
        escreva(v[5])
      `;

      await expect(failure(code, simple(""))).resolves.toMatchObject({ type: "error", position: { line: 4 } });
    });

    test("Tempo esgotado", async () => {
      const code = portugolInicio`
        enquanto (verdadeiro) {}
      `;

      await expect(failure(code, simple(""), 500)).resolves.toEqual({ type: "timeout" });
    });

    test("Depois de um tempo esgotado, os outros casos não são conferidos", async () => {
      const exercise: CheckableExercise = {
        modo: "simples",
        exemplos: [{ entradas: [], saída: "" }],
        testes: [{ entradas: [], saída: "" }],
      };

      const result = await check(portugolInicio`enquanto (verdadeiro) {}`, exercise, 300);

      expect(result).toMatchObject({ passed: false, total: 2, stopped: "timeout" });
      expect(result.cases).toHaveLength(1);
    });

    test("A correção pode ser interrompida", async () => {
      const controller = new AbortController();
      const exercise: CheckableExercise = {
        modo: "simples",
        exemplos: [{ entradas: [], saída: "" }],
        testes: [{ entradas: [], saída: "" }],
      };

      setTimeout(() => {
        controller.abort();
      }, 200);

      const result = await checkExercise(
        PortugolWorkerThreadsRunner,
        transpile(portugolInicio`enquanto (verdadeiro) {}`),
        exercise,
        { signal: controller.signal },
      );

      expect(result).toMatchObject({ passed: false, total: 2, stopped: "aborted" });
      expect(result.cases).toHaveLength(1);
      expect(result.cases[0].failure).toEqual({ type: "aborted" });
    });

    test("Interrompida entre um caso e outro, não confere os seguintes", async () => {
      const controller = new AbortController();
      const exercise: CheckableExercise = {
        modo: "simples",
        exemplos: [{ entradas: [], saída: "a" }],
        testes: [{ entradas: [], saída: "a" }],
      };

      const result = await checkExercise(
        PortugolWorkerThreadsRunner,
        transpile(portugolInicio`escreva("a")`),
        exercise,
        {
          signal: controller.signal,
          onCase: () => {
            controller.abort();
          },
        },
      );

      expect(result).toMatchObject({ passed: false, total: 2, stopped: "aborted" });
      expect(result.cases).toHaveLength(1);
      expect(result.cases[0].failure).toBeUndefined();
    });

    test("Com o sinal já interrompido, nenhum caso é conferido", async () => {
      const controller = new AbortController();

      controller.abort();

      const result = await checkExercise(
        PortugolWorkerThreadsRunner,
        transpile(portugolInicio`escreva("a")`),
        simple("a"),
        {
          signal: controller.signal,
        },
      );

      expect(result).toMatchObject({ passed: false, total: 1, stopped: "aborted" });
      expect(result.cases).toHaveLength(0);
    });

    test("Um caso executado com o sinal já interrompido termina na hora", async () => {
      const controller = new AbortController();

      controller.abort();

      const run = await runExerciseCase(
        PortugolWorkerThreadsRunner,
        transpile(portugolInicio`enquanto (verdadeiro) {}`).js,
        [],
        { signal: controller.signal },
      );

      expect(run.ending).toEqual({ type: "aborted" });
    });

    test("Avisa o andamento depois de cada caso", async () => {
      const progress: Array<[number, number]> = [];
      const exercise: CheckableExercise = {
        modo: "simples",
        exemplos: [{ entradas: [], saída: "a" }],
        testes: [{ entradas: [], saída: "a" }],
      };

      await checkExercise(PortugolWorkerThreadsRunner, transpile(portugolInicio`escreva("a")`), exercise, {
        onCase: (_, done, total) => {
          progress.push([done, total]);
        },
      });

      expect(progress).toEqual([
        [1, 2],
        [2, 2],
      ]);
    });

    test("Corrige os exemplos e depois os testes, e só passa se todos passarem", async () => {
      const exercise: CheckableExercise = {
        modo: "simples",
        exemplos: [{ descrição: "um", entradas: ["1"], saída: "1" }],
        testes: [
          { entradas: ["2"], saída: "2" },
          { descrição: "três", entradas: ["3"], saída: "4" },
        ],
      };

      const code = portugolInicio`
        inteiro n
        leia(n)
        escreva(n)
      `;

      const result = await check(code, exercise);

      expect(result.passed).toBe(false);
      expect(result.cases.map(c => [c.kind, c.index, c.description, c.failure?.type])).toEqual([
        ["exemplo", 1, "um", undefined],
        ["teste", 1, undefined, undefined],
        ["teste", 2, "três", "differentOutput"],
      ]);
    });
  });

  describe("Análise do código", () => {
    test.each([
      ["inclua biblioteca Teclado", ["Teclado"]],
      ["inclua biblioteca Graficos --> g\ninclua biblioteca Sons", ["Graficos", "Sons"]],
      ["inclua biblioteca Util", []],
      ["inclua biblioteca Matematica --> mat", []],
      ["// inclua biblioteca Teclado", []],
      ["/* inclua biblioteca Teclado */", []],
      ["/*\n inclua biblioteca Teclado\n*/", []],
      ['escreva("inclua biblioteca Teclado")', []],
    ])("Bibliotecas bloqueadas em %j", (code, expected) => {
      expect(analyzeExerciseCode(code).blockedLibraries).toEqual(expected);
    });

    test.each([
      ["u.sorteia(1, 2)", true],
      ["sorteia (1, 2)", true],
      ['escreva("sorteia(1, 2)")', false],
      ["// sorteia(1, 2)", false],
      ["/* sorteia(1, 2) */", false],
      ["inteiro sorteiaNumero", false],
    ])("Uso do sorteia em %j", (code, expected) => {
      expect(analyzeExerciseCode(code).usesSorteia).toBe(expected);
    });
  });
});
