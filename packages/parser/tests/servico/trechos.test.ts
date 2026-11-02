import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { describe, expect, test } from "vitest";

import {
  prévia,
  TRECHO_PROGRAMA,
  TRECHO_SENAO_SE,
  TRECHOS_DA_FUNÇÃO,
  TRECHOS_DO_PROGRAMA,
} from "../../src/servico/trechos";
import { completarEm, item, rótulos } from "../helpers/cursor";
import { analisar } from "../helpers/analise";

const TODOS = [TRECHO_PROGRAMA, TRECHO_SENAO_SE, ...TRECHOS_DO_PROGRAMA, ...TRECHOS_DA_FUNÇÃO];

/**
 * As paradas de tabulação do VS Code: `$1`, `${1}`, `${1:texto}` e `${1|a,b|}`.
 */
function paradas(código: string) {
  return código
    .matchAll(/\$(\d+)|\$\{(\d+)(?::[^}]*|\|[^}]*\|)?\}/g)
    .map(([, solta, entre]) => Number(solta ?? entre))
    .toArray();
}

describe("trechos", () => {
  test.each(TODOS.map(t => [t.descrição, t]))("%s: as paradas são válidas e há a parada final", (_, trecho) => {
    const números = paradas(trecho.código);

    expect(números).toContain(0);
    // Sem `$` solto, que o editor mostraria como texto.
    expect(trecho.código.replaceAll(/\$(\d+|\{[^}]*\})/g, "")).not.toContain("$");
    // As paradas vão de 1 em 1.
    const distintas = [...new Set(números.filter(n => n > 0))].toSorted((a, b) => a - b);

    expect(distintas).toEqual(distintas.map((_, i) => i + 1));
  });

  test.each(TODOS.map(t => [t.descrição, t]))("%s: a indentação é com tabulação", (_, trecho) => {
    for (const linha of trecho.código.split("\n")) {
      expect(linha).toMatch(/^\t*\S/);
    }
  });

  test("os trechos viram código válido", () => {
    const corpo = TRECHOS_DA_FUNÇÃO.map(t => prévia(t).replaceAll("condicao", "verdadeiro").replaceAll("valor", "1"))
      .join("\n")
      .replaceAll("\n", "\n    ");
    // A inclusão vem antes das funções.
    const declarações = TRECHOS_DO_PROGRAMA.toReversed()
      .map(t => prévia(t).replace("nome", "f"))
      .join("\n");

    expect(
      analisar(`programa {\n  ${declarações}\n  funcao inicio() {\n    ${corpo}\n  }\n}`).filter(
        d => d.severity === PortugolDiagnosticSeverity.Error,
      ),
    ).toEqual([]);
    expect(analisar(prévia(TRECHO_PROGRAMA))).toEqual([]);
  });

  test("no corpo da função, a palavra e o trecho aparecem, a palavra antes", () => {
    const itens = completarEm("programa {\n  funcao inicio() {\n    se▮\n  }\n}");
    const se = itens.filter(i => i.rótulo === "se");

    expect(se.map(i => i.tipo)).toEqual(["palavra", "trecho", "trecho"]);
    expect(se[0].ordem < se[1].ordem).toBe(true);
    expect(se[1]).toMatchObject({ trecho: true, inserir: "se (${1:condicao}) {\n\t$0\n}" });
    expect(se[1].documentação).toBe("```portugol\nse (condicao) {\n\t\n}\n```");
  });

  test("entre as declarações do programa, funcao e inclua", () => {
    const itens = completarEm("programa {\n  ▮\n}");

    expect(item(itens, "funcao", "trecho")).toBeDefined();
    expect(item(itens, "inclua", "trecho")?.inserir).toMatch(/^inclua biblioteca \$\{1\|Calendario,/);
    expect(rótulos(itens.filter(i => i.tipo === "trecho"))).toEqual(["funcao", "inclua"]);
  });
});

describe("inserir uma função", () => {
  test("com parâmetros, o cursor entre os parênteses e a ajuda de assinatura", () => {
    const itens = completarEm(
      "programa {\n  inclua biblioteca Matematica --> mat\n  funcao inicio() {\n    mat.▮\n  }\n}",
    );

    expect(item(itens, "potencia")).toMatchObject({
      inserir: "potencia($0)",
      trecho: true,
      comando: "ajudaDeAssinatura",
    });
  });

  test("sem parâmetros, o cursor depois dos parênteses", () => {
    const itens = completarEm("programa {\n  funcao inicio() {\n    ▮\n  }\n}");

    expect(item(itens, "limpa")).toMatchObject({ inserir: "limpa()$0", trecho: true, comando: undefined });
    expect(item(itens, "inicio")).toMatchObject({ inserir: "inicio()$0" });
    expect(item(itens, "escreva")).toMatchObject({ inserir: "escreva($0)", comando: "ajudaDeAssinatura" });
  });

  test("com os parênteses já escritos, só o nome", () => {
    const itens = completarEm("programa {\n  funcao inicio() {\n    esc▮(1)\n  }\n}");

    expect(item(itens, "escreva")).toMatchObject({ inserir: "escreva", trecho: false, comando: undefined });
  });

  test("uma variável entra só com o nome", () => {
    const itens = completarEm("programa {\n  funcao inicio() {\n    inteiro v[2]\n    ▮\n  }\n}");

    expect(item(itens, "v")).toMatchObject({ inserir: "v", trecho: false });
  });
});
