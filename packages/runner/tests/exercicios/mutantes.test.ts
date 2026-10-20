import { readFileSync, readdirSync } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import { PortugolDiagnosticSeverity, PortugolLexer } from "@portugol-webstudio/antlr";
import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { describe, expect, test } from "vitest";
import {
  CheckableExercise,
  ExerciseCase,
  checkExercise,
  PortugolWorkerThreadsRunner,
  runsInicio,
  transpile,
} from "../../src";
import { pool } from "../helpers/pool";

// Mede a força dos casos de teste de cada exercício: troca um pedaço da solução de referência
// por um erro plausível (um `>` por `>=`, um `e` por `ou`, um número por outro…) e confere se
// algum caso pega a troca. Uma solução errada que passa em todos os casos é um buraco nos
// testes, ou uma troca que não muda o resultado (equivalente), justificada em
// `mutantes-equivalentes.json`.
//
// É lento, então só roda quando pedido:
//   MUTANTES=1 SEM_PORTUGOL_CLI=1 npx vitest run packages/runner/tests/exercicios/mutantes.test.ts
// Com `MUTANTES=maior-de-dois`, só os exercícios cujo arquivo tem esse trecho no caminho.

const filter = process.env.MUTANTES;
const exercisesDir = path.join(import.meta.dirname, "..", "..", "..", "resources", "exercicios");
const equivalents = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "mutantes-equivalentes.json"), "utf8"),
) as Record<string, Record<string, string>>;

// Uma solução errada costuma terminar em milissegundos; um laço infinito não deve prender a
// medição por um minuto
const MUTANT_TIMEOUT = 2000;

type Exercise = CheckableExercise & { id: string };

type Mutant = { key: string; code: string; line: string };

type Token = { type: number; start: number; stop: number; line: number; column: number; text?: string };

const REPLACEMENTS: Partial<Record<number, string[]>> = {
  [PortugolLexer.OP_MAIOR]: [">=", "<"],
  [PortugolLexer.OP_MAIOR_IGUAL]: [">", "<="],
  [PortugolLexer.OP_MENOR]: ["<=", ">"],
  [PortugolLexer.OP_MENOR_IGUAL]: ["<", ">="],
  [PortugolLexer.OP_IGUALDADE]: ["!="],
  [PortugolLexer.OP_DIFERENCA]: ["=="],
  [PortugolLexer.OP_E_LOGICO]: ["ou"],
  [PortugolLexer.OP_OU_LOGICO]: ["e"],
  [PortugolLexer.OP_ADICAO]: ["-"],
  [PortugolLexer.OP_SUBTRACAO]: ["+"],
  [PortugolLexer.OP_MULTIPLICACAO]: ["/"],
  [PortugolLexer.OP_DIVISAO]: ["*"],
  [PortugolLexer.OP_MOD]: ["/"],
  [PortugolLexer.OP_INCREMENTO_UNARIO]: ["--"],
  [PortugolLexer.OP_DECREMENTO_UNARIO]: ["++"],
  [PortugolLexer.OP_MAIS_IGUAL]: ["-="],
  [PortugolLexer.OP_MENOS_IGUAL]: ["+="],
};

const files = readdirSync(exercisesDir, { recursive: true, encoding: "utf8" })
  .filter(file => file.endsWith(".json") && file.includes(path.sep))
  .filter(file => filter === "1" || (filter !== undefined && file.includes(filter)));

describe.skipIf(filter === undefined)("Mutantes das soluções", () => {
  test.each(files)("%s", { timeout: 30 * 60 * 1000 }, async file => {
    const exercise = JSON.parse(readFileSync(path.join(exercisesDir, file), "utf8")) as Exercise;
    const solution = readFileSync(path.join(exercisesDir, file.replace(/\.json$/, ".solucao.por")), "utf8");
    const accepted = equivalents[exercise.id] ?? {};
    const cases: ExerciseCase[] = [...exercise.exemplos, ...exercise.testes];
    // Sem caso que execute o inicio, trocar algo nele não muda nada
    const mutants = mutate(solution, { skipInicio: cases.every(testCase => !runsInicio(testCase)) });

    // Na ordem do código, qualquer que seja a ordem em que as execuções terminam
    const outcomes = await pool(mutants, availableParallelism(), mutant => outcome(mutant.code, exercise));

    const survivors = mutants
      .filter((mutant, i) => outcomes[i] === "survived" && !Object.hasOwn(accepted, mutant.key))
      .map(mutant => `${mutant.key}\n      ${mutant.line}`);

    // Uma troca aceita como equivalente que algum caso pega, ou que não existe mais (a solução
    // mudou e a posição andou): a lista está velha. Um tempo esgotado não decide nada
    const stale = Object.keys(accepted).filter(key => {
      const i = mutants.findIndex(mutant => mutant.key === key);

      return i === -1 || outcomes[i] === "killed";
    });

    expect(survivors, `${mutants.length} mutantes`).toEqual([]);
    expect(stale, "equivalentes que não sobrevivem mais").toEqual([]);
  });

  test.skipIf(filter !== "1")("Todo exercício em mutantes-equivalentes.json existe", () => {
    const ids = new Set(
      files.map(file => (JSON.parse(readFileSync(path.join(exercisesDir, file), "utf8")) as Exercise).id),
    );

    expect(Object.keys(equivalents).filter(id => !ids.has(id))).toEqual([]);
  });
});

/**
 * As soluções erradas: uma troca de cada vez. Também um `se` sempre verdadeiro e sempre falso.
 */
function mutate(code: string, { skipInicio }: { skipInicio: boolean }): Mutant[] {
  const all = terminals(PortugolCodeChecker.checkCode(code).tree);
  const tokens = skipInicio ? withoutInicio(all) : all;
  const mutants: Mutant[] = [];

  const add = (token: Token, replacement: string) => {
    const original = code.slice(token.start, token.stop + 1);
    const mutated = code.slice(0, token.start) + replacement + code.slice(token.stop + 1);
    const lineStart = code.lastIndexOf("\n", token.start) + 1;
    const lineEnd = mutated.indexOf("\n", lineStart);

    mutants.push({
      key: `${token.line}:${token.column + 1} ${original} → ${replacement.trim()}`,
      code: mutated,
      line: mutated.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim(),
    });
  };

  for (const [i, token] of tokens.entries()) {
    const replacements = REPLACEMENTS[token.type];

    if (replacements) {
      for (const replacement of replacements) {
        add(token, replacement);
      }
    }

    if (token.type === PortugolLexer.INT) {
      const value = Number(token.text);

      add(token, String(value + 1));

      if (value > 0) {
        add(token, String(value - 1));
      }
    }

    if (token.type === PortugolLexer.LOGICO) {
      add(token, token.text === "verdadeiro" ? "falso" : "verdadeiro");
    }

    // A condição do `se` sempre verdadeira ou sempre falsa: um ramo que nenhum caso precisa
    if (token.type === PortugolLexer.SE && tokens[i + 1]?.type === PortugolLexer.ABRE_PARENTESES) {
      const open = tokens[i + 1];

      add(open, "(verdadeiro ou ");
      add(open, "(falso e ");
    }
  }

  return mutants;
}

/**
 * Os tokens fora da função `inicio`: do `funcao inicio` até a chave que fecha o corpo dela.
 */
function withoutInicio(tokens: Token[]) {
  const start = tokens.findIndex((token, i) => token.type === PortugolLexer.FUNCAO && tokens[i + 1]?.text === "inicio");

  if (start === -1) {
    return tokens;
  }

  let depth = 0;
  let end = start;

  for (let i = start; i < tokens.length; i++) {
    if (tokens[i].type === PortugolLexer.ABRE_CHAVES) {
      depth++;
    } else if (tokens[i].type === PortugolLexer.FECHA_CHAVES && --depth === 0) {
      end = i;
      break;
    }
  }

  return [...tokens.slice(0, start), ...tokens.slice(end + 1)];
}

function terminals(node: unknown): Token[] {
  const { symbol, children } = node as { symbol?: Token; children?: unknown[] };

  if (symbol) {
    return symbol.type === PortugolLexer.EOF ? [] : [symbol];
  }

  return (children ?? []).flatMap(child => terminals(child));
}

/**
 * O que acontece com uma solução errada: passa em todos os casos (`survived`), algum caso a pega
 * (`killed`), ou o tempo esgota (`timeout`), o que não diz nada: uma troca equivalente só mais
 * lenta também esgota com a máquina ocupada. Uma que nem compila conta como pega: o erro
 * apareceria antes de qualquer caso.
 */
async function outcome(code: string, exercise: Exercise): Promise<"survived" | "killed" | "timeout"> {
  const program = transpile(code);

  if (
    program.parseErrors.length > 0 ||
    program.diagnostics.some(d => d.severity === PortugolDiagnosticSeverity.Error)
  ) {
    return "killed";
  }

  // A primeira falha já decide: interrompe o resto
  const controller = new AbortController();
  let first: "killed" | "timeout" | undefined;

  const result = await checkExercise(PortugolWorkerThreadsRunner, program, exercise, {
    timeout: MUTANT_TIMEOUT,
    signal: controller.signal,
    onCase: ({ failure }) => {
      if (first === undefined && failure && failure.type !== "aborted") {
        first = failure.type === "timeout" ? "timeout" : "killed";
        controller.abort();
      }
    },
  });

  return first ?? (result.passed ? "survived" : "killed");
}
