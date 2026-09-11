import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { EXEMPLOS, temCorpus } from "../helpers/corpus.js";

/**
 * A IDE mostra no editor os diagnósticos da mesma checagem que autoriza a execução, então
 * um `checkCode` que guardasse estado entre chamadas marcaria erro em código válido — ou
 * pior, deixaria de marcar em código inválido. Já aconteceu: `analisar()` desempilhava o
 * escopo global e a segunda chamada no mesmo analisador perdia todos os globais.
 */
const VÁLIDO = `programa {\n  funcao inicio() {\n    escreva("ok")\n  }\n}`;
const COM_ERRO = `programa {\n  funcao inicio() {\n    inteiro a = b\n  }\n}`;
const COM_AVISO = `programa {\n  funcao inicio() {\n    inteiro a = 1.5\n    escreva(a)\n  }\n}`;

function resumir(código: string) {
  const resultado = PortugolCodeChecker.checkCode(código);

  return JSON.stringify({
    diagnósticos: resultado.diagnostics.map(d => [d.severity, d.code ?? "", d.startLine, d.startCol, d.message]),
    parseErrors: resultado.parseErrors.map(d => [d.startLine, d.message]),
  });
}

describe("PortugolCodeChecker não guarda estado entre chamadas", () => {
  test("a mesma entrada dá sempre o mesmo resultado", () => {
    const esperado = resumir(COM_ERRO);

    for (let i = 0; i < 20; i++) {
      expect(resumir(COM_ERRO)).toBe(esperado);
    }
  });

  test("alternar entre programas não vaza diagnóstico de um para o outro", () => {
    const esperado = { VÁLIDO: resumir(VÁLIDO), COM_ERRO: resumir(COM_ERRO), COM_AVISO: resumir(COM_AVISO) };
    const ciclo = [VÁLIDO, COM_ERRO, COM_AVISO, VÁLIDO, COM_ERRO] as const;
    const nomes = ["VÁLIDO", "COM_ERRO", "COM_AVISO", "VÁLIDO", "COM_ERRO"] as const;

    for (let i = 0; i < 30; i++) {
      const posição = i % ciclo.length;

      expect(resumir(ciclo[posição])).toBe(esperado[nomes[posição]]);
    }
  });

  test("código válido logo depois de um inválido não herda erro nenhum", () => {
    for (let i = 0; i < 20; i++) {
      PortugolCodeChecker.checkCode(COM_ERRO);

      const resultado = PortugolCodeChecker.checkCode(VÁLIDO);

      expect(resultado.parseErrors).toEqual([]);
      expect(resultado.diagnostics.filter(d => d.severity === PortugolDiagnosticSeverity.Error)).toEqual([]);
    }
  });

  // São 60 análises de programas reais: passa do timeout padrão de 5s num runner de CI.
  test.skipIf(!temCorpus)("os exemplos oficiais dão o mesmo resultado em qualquer ordem", { timeout: 30_000 }, () => {
    const arquivos = globSync("**/*.por", { cwd: EXEMPLOS }).slice(0, 30);
    const ler = (arquivo: string) => readFileSync(path.join(EXEMPLOS, arquivo), "utf8");

    const direto = arquivos.map(arquivo => resumir(ler(arquivo)));
    const inverso = new Map(arquivos.toReversed().map(arquivo => [arquivo, resumir(ler(arquivo))]));

    expect(arquivos.map(arquivo => inverso.get(arquivo))).toEqual(direto);
  });
});
