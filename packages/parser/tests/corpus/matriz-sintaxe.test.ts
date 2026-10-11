import { expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { gerarMatriz } from "../../tools/matriz-sintaxe.mjs";

/**
 * O erro de cada caso da grade de enganos (`tools/matriz-sintaxe.mjs`), uma linha por caso:
 * o nome (engano e lugar), a posição, o código e a mensagem. As linhas de um mesmo engano ficam
 * juntas, e uma mensagem que muda num lugar só aparece no diff.
 *
 * Mudou uma mensagem de propósito, regere com `npx vitest run tests/corpus/matriz-sintaxe.test.ts -u`
 * e confira o diff de `tests/fixtures/matriz-sintaxe.txt`.
 */
function resumo(código: string) {
  const { parseErrors, diagnostics } = PortugolCodeChecker.checkCode(código);
  const [erro] = parseErrors;

  if (erro) {
    const mensagem = erro.message.replaceAll("\n", "⏎");

    return `${erro.startLine}:${erro.startCol}-${erro.endLine}:${erro.endCol} | ${erro.code} | ${mensagem}`;
  }

  const semântico = diagnostics.find(diagnóstico => diagnóstico.code?.startsWith("Erro"));

  return semântico ? `sem erro de sintaxe; semântico: ${semântico.code}` : "sem erros";
}

test("a grade de enganos de sintaxe dá as mensagens de sempre", async () => {
  const linhas = gerarMatriz().map(({ nome, código }) => `${nome} | ${resumo(código)}`);

  await expect(`${linhas.join("\n")}\n`).toMatchFileSnapshot("../fixtures/matriz-sintaxe.txt");
  // São quase 2 mil programas: com a suíte inteira rodando ao lado, passa dos 5 s padrão.
}, 60_000);
