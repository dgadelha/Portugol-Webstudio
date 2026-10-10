import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  CaracterContext,
  ChamadaFuncaoContext,
  ExpressaoContext,
  NumeroInteiroContext,
  NumeroRealContext,
  PortugolLexer,
  PortugolParser,
  ReferenciaArrayContext,
  ReferenciaMatrizContext,
  ReferenciaParaVariavelContext,
  StringContext,
  ValorLogicoContext,
} from "@portugol-webstudio/antlr";
import { CharStream, CommonTokenStream, ParserRuleContext, type ParseTree, Token } from "antlr4ng";
import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { EXEMPLOS, temCorpus } from "../helpers/corpus.js";

/**
 * A árvore do Portugol Studio não tem nó de parênteses; a nossa tem, e toda checagem que olha a
 * forma de uma expressão precisa desembrulhá-lo (`semParênteses`). Esta é a garantia de que
 * nenhuma esquece: em volta de qualquer expressão, parênteses não mudam os diagnósticos. Só a
 * coluna pode mudar, porque o texto andou.
 */
const ÁTOMOS = [
  ChamadaFuncaoContext,
  ReferenciaArrayContext,
  ReferenciaMatrizContext,
  ReferenciaParaVariavelContext,
  NumeroInteiroContext,
  NumeroRealContext,
  ValorLogicoContext,
  CaracterContext,
  StringContext,
];

/**
 * Sem separador entre comandos, uma linha que começa com `(` depois de uma que termina num nome
 * vira uma chamada: `inteiro r = n` seguido de `(x)` é `n(x)`, aqui e no Portugol Studio. Essas
 * expressões ficam de fora, porque os parênteses mudariam o programa.
 */
function viraChamada(tokens: CommonTokenStream, ctx: ExpressaoContext) {
  for (let i = ctx.start!.tokenIndex - 1; i >= 0; i--) {
    const anterior = tokens.get(i);

    if (anterior.channel === Token.DEFAULT_CHANNEL) {
      return anterior.type === PortugolLexer.ID;
    }
  }

  return false;
}

function expressões(código: string): ExpressaoContext[] {
  const tokens = new CommonTokenStream(new PortugolLexer(CharStream.fromString(código)));
  const parser = new PortugolParser(tokens);

  parser.removeErrorListeners();

  const encontradas: ExpressaoContext[] = [];
  const visitar = (nó: ParseTree) => {
    if (nó instanceof ExpressaoContext) {
      encontradas.push(nó);
    }

    if (nó instanceof ParserRuleContext) {
      for (const filho of nó.children) {
        visitar(filho);
      }
    }
  };

  visitar(parser.arquivo());

  return encontradas.filter(ctx => !viraChamada(tokens, ctx));
}

/**
 * Põe parênteses em volta das expressões, contando em pontos de código como o ANTLR, de trás
 * para a frente para as posições anteriores continuarem valendo.
 */
function envolver(código: string, alvos: readonly ExpressaoContext[]): string {
  const pontos = Array.from(código);
  const inserções = alvos.flatMap(ctx => {
    return [
      { posição: ctx.start!.start, texto: "(" },
      { posição: ctx.stop!.stop + 1, texto: ")" },
    ];
  });

  const deTrásParaAFrente = inserções.toSorted((a, b) => b.posição - a.posição);

  for (const { posição, texto } of deTrásParaAFrente) {
    pontos.splice(posição, 0, texto);
  }

  return pontos.join("");
}

function resumo(código: string) {
  const { diagnostics, parseErrors } = PortugolCodeChecker.checkCode(código);

  return [...parseErrors, ...diagnostics]
    .map(d => `${d.startLine} ${d.severity} ${d.code ?? d.message}`)
    .toSorted((a, b) => a.localeCompare(b));
}

let semente = 1983;

function aleatório() {
  semente = (semente * 1_103_515_245 + 12_345) % 2 ** 31;

  return semente / 2 ** 31;
}

const casos = temCorpus
  ? globSync("**/*.por", { cwd: EXEMPLOS })
      .toSorted((a, b) => a.localeCompare(b))
      .flatMap(arquivo => {
        const código = readFileSync(path.join(EXEMPLOS, arquivo), "utf8");
        const todas = expressões(código);
        const átomos = todas.filter(ctx => ÁTOMOS.some(classe => ctx instanceof classe));
        const sorteadas = () => Array.from({ length: 2 }, () => todas[Math.floor(aleatório() * todas.length)]);

        return [
          [`${arquivo}: todas as variáveis, literais e chamadas`, código, envolver(código, átomos)],
          [`${arquivo}: expressões sorteadas (1)`, código, envolver(código, sorteadas())],
          [`${arquivo}: expressões sorteadas (2)`, código, envolver(código, sorteadas())],
        ] as const;
      })
  : [];

describe.skipIf(!temCorpus)("Parênteses não mudam os diagnósticos", () => {
  test.each(casos)("%s", (_nome, original, envolvido) => {
    expect(resumo(envolvido)).toEqual(resumo(original));
  });
});
