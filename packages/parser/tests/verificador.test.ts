import { ArquivoContext } from "@portugol-webstudio/antlr";
import { afterEach, describe, expect, test, vi } from "vitest";

import { erro, ParseError, PortugolCodeChecker, PortugolNode, textoDe } from "../src";
import { portugol } from "./helpers/code";

const VÁLIDO = portugol`
  programa {
    funcao inicio() {
      escreva("ok")
    }
  }
`;

/**
 * Com a sintaxe certa, montar os nós não deveria falhar: os `ParseError` dos nós são guardas
 * para uma árvore que o ANTLR remendou, e essa nunca chega aqui. Se um dia uma falha escapar,
 * ela tem que virar um erro no editor, e não derrubar a checagem que a IDE roda a cada tecla.
 */
describe("falha ao montar os nós", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("um ParseError vira erro de sintaxe no trecho que ele aponta", () => {
    vi.spyOn(PortugolNode.prototype, "visit").mockImplementation(ctx => {
      throw new ParseError("Expressão inválida", (ctx as ArquivoContext).declaracaoFuncao(0)!);
    });

    const resultado = PortugolCodeChecker.checkCode(VÁLIDO);

    expect(resultado.diagnostics).toEqual([]);
    expect(resultado.parseErrors).toMatchObject([{ message: "Expressão inválida", startLine: 2, endLine: 4 }]);
  });

  test("qualquer outra exceção também vira erro, e não sai do checkCode", () => {
    vi.spyOn(PortugolNode.prototype, "visit").mockImplementation(() => {
      throw new TypeError("falha inesperada");
    });

    const resultado = PortugolCodeChecker.checkCode(VÁLIDO);

    expect(resultado.diagnostics).toEqual([]);
    expect(resultado.parseErrors.map(diagnóstico => diagnóstico.message)).toEqual(["TypeError: falha inesperada"]);
  });

  test("a montagem só começa pelo arquivo inteiro", () => {
    const { tree } = PortugolCodeChecker.checkCode(VÁLIDO);

    expect(() => new PortugolNode().visit(tree.declaracaoFuncao(0)!)).toThrow(
      "deve-se iniciar com um contexto de arquivo",
    );
  });
});

/**
 * As mensagens aceitam um token ou um nó terminal do ANTLR além dos nós da nossa árvore; o
 * diagnóstico marca só aquele token.
 */
describe("posição dos diagnósticos", () => {
  const { tree } = PortugolCodeChecker.checkCode(VÁLIDO);
  const nome = tree.declaracaoFuncao(0)!.ID();

  test("um nó terminal marca o token dele", () => {
    expect(erro(nome, "mensagem", "Codigo")).toMatchObject({ startLine: 2, startCol: 9, endLine: 2, endCol: 14 });
  });

  test("o texto de um token é o texto dele", () => {
    expect(textoDe(nome.symbol)).toBe("inicio");
  });
});
