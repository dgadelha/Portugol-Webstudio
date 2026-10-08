import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { EXEMPLOS, temCorpus } from "../helpers/corpus.js";

const AJUDA = path.resolve(EXEMPLOS, "../ajuda");

/**
 * Os blocos ```portugol exemplo da Ajuda: são os que ganham o botão "Tente você mesmo", que
 * abre o código numa aba nova. Os de sintaxe são trechos e não precisam compilar.
 */
const exemplos = temCorpus
  ? globSync("**/*.md", { cwd: AJUDA }).flatMap(arquivo => {
      const texto = readFileSync(path.join(AJUDA, arquivo), "utf8");

      return Array.from(
        texto.matchAll(/```portugol exemplo[^\n]*\n([\s\S]*?)\n```/g),
        (bloco, i) => [`${arquivo} #${i + 1}`, bloco[1] ?? ""] as const,
      );
    })
  : [];

/**
 * Um exemplo da Ajuda é código que ensina: abri-lo não deve mostrar erro nem aviso. As
 * informações de uso ficam de fora, porque os exemplos de declaração declaram de propósito
 * variáveis que não usam.
 */
describe.skipIf(!temCorpus)("Exemplos da Ajuda", () => {
  test("a Ajuda tem exemplos", () => {
    expect(exemplos.length).toBeGreaterThan(0);
  });

  test.each(exemplos)("%s não tem erros nem avisos", (_nome, código) => {
    const { diagnostics, parseErrors } = PortugolCodeChecker.checkCode(código);
    const problemas = [...parseErrors, ...diagnostics].filter(
      d => d.severity !== PortugolDiagnosticSeverity.Information,
    );

    expect(problemas.map(d => `${d.startLine}:${d.startCol} ${d.message}`)).toEqual([]);
  });
});
