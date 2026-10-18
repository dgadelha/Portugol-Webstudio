import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  analyzeExerciseCode,
  CheckableExercise,
  checkExercise,
  ExerciseCase,
  PortugolWorkerThreadsRunner,
  runsInicio,
  transpile,
} from "../../src";
import { runPortugolCode } from "../helpers/runner";

// Os exercícios embutidos no IDE. Com `ATUALIZAR_EXERCICIOS=1`, a saída de cada caso do modo
// simples é regravada com a da solução de referência, em vez de comparada.
const exercisesDir = path.join(import.meta.dirname, "..", "..", "..", "resources", "exercicios");
const update = process.env.ATUALIZAR_EXERCICIOS === "1";

type Exercise = CheckableExercise & { id: string; solução: string; códigoInicial?: string };

const files = readdirSync(exercisesDir, { recursive: true, encoding: "utf8" }).filter(
  file => file.endsWith(".json") && file.includes(path.sep),
);

describe("Exercícios", () => {
  test("Há exercícios", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  describe.each(files)("%s", file => {
    const filePath = path.join(exercisesDir, file);
    const exercise = JSON.parse(readFileSync(filePath, "utf8")) as Exercise;

    test("A solução compila sem erros nem avisos", () => {
      const { parseErrors, diagnostics } = transpile(exercise.solução);

      expect(parseErrors).toEqual([]);
      expect(diagnostics.filter(d => d.severity !== PortugolDiagnosticSeverity.Information)).toEqual([]);
    });

    // Sem código inicial, o IDE abre o esqueleto de um programa
    test.skipIf(exercise.códigoInicial === undefined)("O código inicial compila sem erros", () => {
      const { parseErrors, diagnostics } = transpile(exercise.códigoInicial!);

      expect(parseErrors).toEqual([]);
      expect(diagnostics.filter(d => d.severity === PortugolDiagnosticSeverity.Error)).toEqual([]);
    });

    test("Um caso só com verificações de função não tem entradas", () => {
      // O inicio não executa nesses casos: entradas ali nunca seriam lidas
      const cases: ExerciseCase[] = [...exercise.exemplos, ...exercise.testes];

      for (const testCase of cases) {
        if (!runsInicio(testCase)) {
          expect(testCase.entradas, testCase.descrição).toEqual([]);
        }
      }
    });

    test("Não usa bibliotecas bloqueadas", () => {
      for (const code of [exercise.solução, exercise.códigoInicial ?? ""]) {
        expect(analyzeExerciseCode(code).blockedLibraries).toEqual([]);
      }
    });

    test("A saída de cada caso é a da solução, também no Portugol Studio", async () => {
      const cases = [...exercise.exemplos, ...exercise.testes];

      for (const testCase of cases) {
        // Compara com o Portugol CLI quando ele está disponível
        const output = await runPortugolCode(exercise.solução, testCase.entradas);

        if (exercise.modo === "simples") {
          if (update) {
            (testCase as { saída: string }).saída = output;
          } else {
            expect(output, `entradas: ${JSON.stringify(testCase.entradas)}`).toBe(testCase.saída);
          }
        }
      }

      if (update && exercise.modo === "simples") {
        writeFileSync(filePath, JSON.stringify(exercise, undefined, 2) + "\n");
      }
    });

    test("A solução passa em todos os casos", async () => {
      const exerciseNow = JSON.parse(readFileSync(filePath, "utf8")) as Exercise;
      const result = await checkExercise(PortugolWorkerThreadsRunner, transpile(exerciseNow.solução), exerciseNow);

      expect(result.cases.filter(c => c.failure).map(c => ({ ...c, run: undefined }))).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });
});
