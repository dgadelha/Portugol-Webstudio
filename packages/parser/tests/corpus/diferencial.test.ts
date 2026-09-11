import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { describe, expect, test } from "vitest";

import { éDoWebstudio, PortugolCodeChecker } from "../../src";
import { lerGolden, linhasDeErro } from "../../tools/golden.mjs";

/**
 * Compara a nossa análise dos 119 exemplos oficiais com a do Portugol Studio, gravada em
 * `tests/fixtures/portugol-studio.golden.txt` (regere com
 * `packages/parser/tools/oracle/run.sh --golden`). O critério que não se negocia é zero
 * falso positivo: um erro nosso numa linha em que o Portugol Studio não vê erro bloqueia um
 * programa que funcionava.
 *
 * A comparação é por (arquivo, linha) e ignora o texto das mensagens: o
 * `ErroSimboloNaoInicializado` do Portugol Studio embute um exemplo sorteado e não é
 * determinístico.
 */
const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const EXEMPLOS = path.join(RAIZ, "packages/resources/assets/exemplos");

const golden = lerGolden();

const resultados = [...golden].map(([arquivo, entradas]) => {
  const resultado = PortugolCodeChecker.checkCode(readFileSync(path.join(EXEMPLOS, arquivo), "utf8"), {
    avisosDeUso: false,
  });

  return {
    arquivo,
    resultado,
    linhasPs: linhasDeErro(entradas),
    erros: resultado.diagnostics.filter(diagnóstico => {
      // Os códigos do Webstudio ficam fora do diferencial de propósito: o Portugol
      // Studio aceita o programa, o nosso runtime não sabe executá-lo.
      return diagnóstico.severity === PortugolDiagnosticSeverity.Error && !éDoWebstudio(diagnóstico.code);
    }),
  };
});

describe("Corpus dos exemplos oficiais", () => {
  test("o golden cobre exatamente os exemplos que existem no disco", () => {
    expect(golden.size).toBe(119);
    expect(globSync("**/*.por", { cwd: EXEMPLOS })).toHaveLength(119);
  });

  test("nenhum falso positivo", () => {
    const falsos = resultados.flatMap(({ arquivo, erros, linhasPs }) => {
      return erros
        .filter(erro => !linhasPs.has(erro.startLine))
        .map(erro => `${arquivo}:${erro.startLine} ${erro.code ?? ""} ${erro.message}`);
    });

    expect(falsos).toEqual([]);
  });

  /**
   * Os dois são exemplos quebrados no upstream, que o próprio Portugol Studio recusa no
   * sintático: a nossa análise também para antes de chegar à linha do erro.
   */
  test("nenhum falso negativo além dos dois exemplos quebrados no upstream", () => {
    const falsos = resultados.flatMap(({ arquivo, erros, linhasPs }) => {
      const linhasNossas = new Set(erros.map(erro => erro.startLine));

      return [...linhasPs].filter(linha => !linhasNossas.has(linha)).map(linha => `${arquivo}:${linha}`);
    });

    expect(falsos).toMatchInlineSnapshot(`
      [
        "bibliotecas/tipos/logico.por:67",
        "jogos/arkanoid.por:193",
      ]
    `);
  });

  test("os avisos batem em quantidade e código com o Portugol Studio", () => {
    // Em 8 destes avisos a linha difere da do Portugol Studio, sempre pelo bug de posição
    // dele (`linha -1` em atribuição composta).
    const porCódigo: Record<string, number> = {};

    for (const { resultado } of resultados) {
      for (const diagnóstico of resultado.diagnostics) {
        if (diagnóstico.severity === PortugolDiagnosticSeverity.Warning) {
          const code = diagnóstico.code ?? "";

          porCódigo[code] = (porCódigo[code] ?? 0) + 1;
        }
      }
    }

    expect(porCódigo).toEqual({
      "AvisoSemantico.AvisoSimboloGlobalOcultado": 13,
      "AvisoSemantico.AvisoValorExpressaoSeraConvertido": 509,
      "AvisoSemantico.AvisoVetorPodeSerVariavel": 2,
    });
  });

  test("só os erros específicos do Webstudio sobram, e só de biblioteca não suportada", () => {
    const webstudio = resultados.flatMap(({ arquivo, resultado }) => {
      return resultado.diagnostics
        .filter(diagnóstico => éDoWebstudio(diagnóstico.code))
        .map(diagnóstico => `${arquivo}:${diagnóstico.startLine} ${diagnóstico.code ?? ""}`);
    });

    expect(webstudio.filter(linha => !linha.endsWith("ErroWebstudio.ErroBibliotecaNaoSuportada"))).toEqual([]);
    expect(webstudio).toHaveLength(68);
  });

  test("os parseErrors são só os dos dois arquivos quebrados", () => {
    expect(
      resultados
        .filter(({ resultado }) => resultado.parseErrors.length > 0)
        .map(({ arquivo, resultado }) => `${arquivo} (${resultado.parseErrors.length})`),
    ).toMatchInlineSnapshot(`
      [
        "bibliotecas/tipos/logico.por (1)",
        "jogos/arkanoid.por (2)",
      ]
    `);
  });
});
