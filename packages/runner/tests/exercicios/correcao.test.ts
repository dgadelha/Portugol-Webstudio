import { describe, expect, test } from "vitest";
import {
  CheckableExercise,
  checkExercise,
  ExerciseCheck,
  normalizeOutput,
  PortugolWorkerThreadsRunner,
  transpile,
} from "../../src";
import { portugolInicio } from "../helpers/code";

function check(code: string, exercise: CheckableExercise, timeout?: number) {
  return checkExercise(PortugolWorkerThreadsRunner, transpile(code).js, exercise, { timeout });
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
    const igual = (valores: ExerciseCheck["valores"], tolerância?: number): ExerciseCheck => {
      return {
        alvo: "escreva",
        regra: "igual",
        valores,
        tolerância,
      };
    };

    const contém = (valores: ExerciseCheck["valores"]): ExerciseCheck => {
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
        descrição: undefined,
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
        descrição: undefined,
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

    test("Diz qual verificação falhou", async () => {
      const exercise = advanced([
        contém([{ tipo: "inteiro", valor: 1 }]),
        { ...contém([{ tipo: "inteiro", valor: 2 }]), descrição: "o segundo" },
      ]);

      await expect(failure(portugolInicio`escreva(1)`, exercise)).resolves.toMatchObject({
        type: "missingValue",
        check: 2,
        descrição: "o segundo",
      });
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
      expect(result.cases.map(c => [c.kind, c.index, c.descrição, c.failure?.type])).toEqual([
        ["exemplo", 1, "um", undefined],
        ["teste", 1, undefined, undefined],
        ["teste", 2, "três", "differentOutput"],
      ]);
    });
  });
});
