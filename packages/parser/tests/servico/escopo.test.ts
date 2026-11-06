import { describe, expect, test } from "vitest";

import { completarEm, item, rótulos } from "../helpers/cursor";

describe("símbolos visíveis no cursor", () => {
  test("a variável local declarada antes do cursor, com o tipo", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          id▮
        }
      }
    `;

    expect(item(itens, "idade")).toMatchObject({ tipo: "variável", descrição: "inteiro", detalhe: "inteiro idade" });
  });

  test("a local declarada depois do cursor não aparece", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          ▮
          inteiro depois = 1
        }
      }
    `;

    expect(rótulos(itens)).not.toContain("depois");
  });

  test("a local de um bloco só vale dentro dele", () => {
    const dentro = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
            real dentro = 1.0
            ▮
          }
        }
      }
    `;
    const fora = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
            real dentro = 1.0
          }
          ▮
        }
      }
    `;

    expect(rótulos(dentro)).toContain("dentro");
    expect(rótulos(fora)).not.toContain("dentro");
  });

  test("a variável do para vale no laço inteiro, e não depois dele", () => {
    const noCabeçalho = completarEm`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < ▮; i++) {
          }
        }
      }
    `;
    const noCorpo = completarEm`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < 10; i++) {
            ▮
          }
        }
      }
    `;
    const depois = completarEm`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < 10; i++) {
          }
          ▮
        }
      }
    `;

    expect(rótulos(noCabeçalho)).toContain("i");
    expect(rótulos(noCorpo)).toContain("i");
    expect(rótulos(depois)).not.toContain("i");
  });

  test("a declaração de dentro esconde a de fora com o mesmo nome", () => {
    const itens = completarEm`
      programa {
        cadeia valor = "global"

        funcao inicio() {
          inteiro valor = 1
          ▮
        }
      }
    `;

    expect(itens.filter(i => i.rótulo === "valor")).toEqual([expect.objectContaining({ descrição: "inteiro" })]);
  });

  test("os parâmetros, com vetores, matrizes e referência", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
        }

        funcao vazio f(inteiro &total, real notas[], cadeia nomes[][]) {
          ▮
        }
      }
    `;

    expect(item(itens, "total")).toMatchObject({ descrição: "inteiro", detalhe: "inteiro &total" });
    expect(item(itens, "notas")).toMatchObject({ descrição: "real[]", detalhe: "real notas[]" });
    expect(item(itens, "nomes")).toMatchObject({ descrição: "cadeia[][]", detalhe: "cadeia nomes[][]" });
  });

  test("os parâmetros de uma função não aparecem em outra", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          ▮
        }

        funcao vazio f(inteiro x) {
        }
      }
    `;

    expect(rótulos(itens)).not.toContain("x");
  });

  test("as globais, mesmo declaradas depois da função", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          ▮
        }

        logico pronto = falso
      }
    `;

    expect(item(itens, "pronto")).toMatchObject({ tipo: "variável", descrição: "logico" });
  });

  test("as funções do programa, mesmo declaradas depois do cursor", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          ▮
        }

        funcao real media(real a, real b) {
          retorne (a + b) / 2
        }
      }
    `;

    expect(item(itens, "media")).toMatchObject({
      tipo: "função",
      detalheDoRótulo: "(real a, real b)",
      descrição: "real",
      detalhe: "funcao real media(real a, real b)",
    });
  });

  // Redeclaração: o analisador guarda a função, e a global com o nome dela fica de fora.
  test("a global com o nome de uma função: a função", () => {
    const itens = completarEm(
      "programa {\n  inteiro f = 1\n\n  funcao inicio() {\n    ▮\n  }\n\n  funcao f() {\n  }\n}",
    );

    expect(itens.filter(i => i.rótulo === "f")).toEqual([expect.objectContaining({ tipo: "função" })]);
  });

  test("const é uma constante", () => {
    const itens = completarEm`
      programa {
        const inteiro MAXIMO = 10

        funcao inicio() {
          ▮
        }
      }
    `;

    expect(item(itens, "MAXIMO")).toMatchObject({
      tipo: "constante",
      descrição: "const inteiro",
      detalhe: "const inteiro MAXIMO",
    });
  });

  test("vetores e matrizes locais", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro v[3], m[2][2]
          ▮
        }
      }
    `;

    expect(item(itens, "v")).toMatchObject({ descrição: "inteiro[]" });
    expect(item(itens, "m")).toMatchObject({ descrição: "inteiro[][]" });
  });

  test("a local de um caso vale só nele", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro opcao = 1
          escolha (opcao) {
            caso 1:
              inteiro primeiro = 1
              pare
            caso 2:
              ▮
          }
        }
      }
    `;

    expect(rótulos(itens)).toContain("opcao");
    expect(rótulos(itens)).not.toContain("primeiro");
  });

  test("a ordem: locais, globais, funções do programa, bibliotecas e funções da linguagem, palavras, trechos", () => {
    const itens = completarEm`
      programa {
        inclua biblioteca Matematica --> mat
        inteiro global = 0

        funcao inicio() {
          inteiro local = 0
          ▮
        }
      }
    `;
    const ordenados = itens.toSorted((a, b) => a.ordem.localeCompare(b.ordem));
    const posição = (rótulo: string, tipo?: string) =>
      ordenados.findIndex(i => i.rótulo === rótulo && (!tipo || i.tipo === tipo));

    expect(posição("local")).toBeLessThan(posição("global"));
    expect(posição("global")).toBeLessThan(posição("inicio"));
    expect(posição("inicio")).toBeLessThan(posição("mat"));
    expect(posição("mat")).toBeLessThan(posição("se", "palavra"));
    expect(posição("se", "palavra")).toBeLessThan(posição("se", "trecho"));
  });
});
