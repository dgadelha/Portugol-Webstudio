import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { EXEMPLOS, temCorpus } from "../helpers/corpus.js";

/**
 * Formato do `exemplos/index.json`: o mesmo que o diálogo "Abrir exemplo" lê
 */
interface Exemplo {
  nome: string;
  arquivo?: string;
  itens?: Exemplo[];
  suportado?: boolean;
}

/**
 * Os exemplos que o diálogo "Abrir exemplo" mostra: os que não estão marcados com
 * `"suportado": false`, nem dentro de uma pasta marcada assim
 */
function exemplosExibidos(exemplos: Exemplo[]): string[] {
  return exemplos.flatMap(exemplo => {
    if (exemplo.suportado === false) {
      return [];
    }

    if (exemplo.itens) {
      return exemplosExibidos(exemplo.itens);
    }

    return exemplo.arquivo ? [exemplo.arquivo] : [];
  });
}

const exibidos = temCorpus
  ? exemplosExibidos(JSON.parse(readFileSync(path.join(EXEMPLOS, "index.json"), "utf8")) as Exemplo[])
  : [];

/**
 * Quem abre um exemplo no Webstudio não deve ver nenhum erro nem aviso em "Problemas":
 * um exemplo é o código que ensina como fazer. O diferencial compara com o Portugol
 * Studio; aqui vale a análise completa do Webstudio, com os avisos de uso.
 */
describe.skipIf(!temCorpus)("Exemplos exibidos no Webstudio", () => {
  test("o índice tem exemplos exibidos", () => {
    expect(exibidos.length).toBeGreaterThan(0);
  });

  test.each(exibidos)("%s não tem erros nem avisos", arquivo => {
    const { diagnostics, parseErrors } = PortugolCodeChecker.checkCode(
      readFileSync(path.join(EXEMPLOS, arquivo), "utf8"),
    );

    expect([...parseErrors, ...diagnostics].map(d => `${d.startLine}:${d.startCol} ${d.message}`)).toEqual([]);
  });
});
