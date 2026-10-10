import { PortugolLexer } from "@portugol-webstudio/antlr";
import { CharStream, Token } from "antlr4ng";
import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { gerarMutantes, lerGoldenSintaxe } from "../../tools/mutantes.mjs";
import { temCorpus } from "../helpers/corpus.js";

const mutantes = temCorpus ? gerarMutantes() : [];
const golden = temCorpus ? lerGoldenSintaxe() : new Map();

/**
 * Onde o erro do Portugol Studio fica depois do último token, o nosso marca o último token
 * (o fim do arquivo costuma ser uma linha vazia, onde o sublinhado nem aparece).
 */
function depoisDoÚltimoToken(código: string, linha: number, coluna: number) {
  const lexer = new PortugolLexer(CharStream.fromString(código));

  lexer.removeErrorListeners();

  const último = lexer
    .getAllTokens()
    .findLast(token => token.channel === Token.DEFAULT_CHANNEL && token.type !== Token.EOF);

  if (!último) {
    return { depois: true, linhaDoÚltimo: 1 };
  }

  const fim = último.column + (último.text?.length ?? 1);

  return { depois: linha > último.line || (linha === último.line && coluna >= fim), linhaDoÚltimo: último.line };
}

/**
 * Quando o erro do Portugol Studio está no primeiro token de uma linha, a linha de antes é que
 * ficou incompleta (um `(` sem fechar, um nome faltando), e o nosso erro fica no fim dela.
 */
function linhaIncompletaAntes(código: string, linha: number, coluna: number) {
  const lexer = new PortugolLexer(CharStream.fromString(código));

  lexer.removeErrorListeners();

  const tokens = lexer.getAllTokens().filter(token => token.channel === Token.DEFAULT_CHANNEL);
  const índice = tokens.findIndex(token => token.line === linha && token.column === coluna);
  const anterior = tokens[índice - 1];

  if (!anterior || índice <= 0) {
    return;
  }

  const fimDoAnterior = anterior.line + (anterior.text?.split("\n").length ?? 1) - 1;

  return fimDoAnterior < linha ? fimDoAnterior : undefined;
}

/**
 * Os exemplos oficiais quebrados de algumas formas (`tools/mutantes.mjs`), comparados com o que
 * o Portugol Studio diz deles (`tests/fixtures/portugol-studio-sintaxe.golden.txt`). Mudou um
 * exemplo, regere o golden com `tools/oracle/run.sh --golden-sintaxe`.
 */
describe.skipIf(!temCorpus)("Exemplos quebrados", () => {
  test("o golden cobre exatamente os mutantes gerados", () => {
    expect(golden.keys().toArray()).toEqual(mutantes.map(mutante => mutante.nome));
  });

  test.each(mutantes.map(mutante => [mutante.nome, mutante.código] as const))("%s", (nome, código) => {
    const linhas = código.split("\n").length;
    const { parseErrors } = PortugolCodeChecker.checkCode(código);
    const [erro] = parseErrors;
    const doStudio = golden.get(nome);

    // Como no Portugol Studio, no máximo um erro de sintaxe, sempre com código, e marcando um
    // token, nunca um trecho de várias linhas.
    expect(parseErrors.length).toBeLessThanOrEqual(1);

    if (erro) {
      expect(erro.code).toMatch(/^Erro/);
      expect(erro.startLine).toBeGreaterThanOrEqual(1);
      expect(erro.endLine).toBe(erro.startLine);
      expect(erro.endLine).toBeLessThanOrEqual(linhas);
      expect(erro.endCol).toBeGreaterThanOrEqual(erro.startCol);
    }

    // Erro de sintaxe exatamente quando o Portugol Studio vê um.
    expect(
      Boolean(erro),
      doStudio ? `o Portugol Studio vê erro na linha ${doStudio.linha}` : "o Portugol Studio não vê erro",
    ).toBe(Boolean(doStudio));

    if (!erro || !doStudio) {
      return;
    }

    // As divergências deliberadas de posição, documentadas no `AnalisadorSintático`: o Java
    // marca 1:1 o código fora do programa, e aqui o comentário sem fim é marcado no `/*`.
    if (
      doStudio.código === "ErroSintatico.ErroExpressoesForaEscopoPrograma" ||
      erro.code === "ErroWebstudio.ErroComentarioSemFim"
    ) {
      return;
    }

    const { depois, linhaDoÚltimo } = depoisDoÚltimoToken(código, doStudio.linha, doStudio.coluna);

    const esperadas = [
      depois ? linhaDoÚltimo : doStudio.linha,
      linhaIncompletaAntes(código, doStudio.linha, doStudio.coluna),
    ];

    expect(esperadas).toContain(erro.startLine);
  });
});

describe("Desempenho", () => {
  // A predição LL completa do ANTLR levava 2,5 s neste programa; a SLL, que roda primeiro,
  // leva milissegundos. O limite folgado só pega a volta da passada lenta.
  test("um programa de 5000 linhas é analisado em menos de um segundo", () => {
    const corpo = Array.from({ length: 5000 }, (_, i) => `    escreva(${i})`).join("\n");
    const início = performance.now();
    const { parseErrors } = PortugolCodeChecker.checkCode(`programa {\n  funcao inicio() {\n${corpo}\n  }\n}\n`);

    expect(parseErrors).toEqual([]);
    expect(performance.now() - início).toBeLessThan(1000);
  });
});
