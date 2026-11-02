import { describe, expect, test } from "vitest";

import { completarEm, item, rótulos } from "../helpers/cursor";

describe("onde não há sugestões", () => {
  test.each([
    ["numa cadeia", 'escreva("ab▮")'],
    ["numa cadeia sem fim", 'escreva("ab▮'],
    ["num caractere sem fim", "caracter c = 'a▮"],
    ["num comentário de linha", "// um comentário▮"],
    ["num comentário de bloco", "/* um ▮ comentário */"],
    ["num comentário de bloco sem fim", "/* um comentário▮"],
    ["depois de um tipo", "inteiro ▮"],
    ["no nome da variável", "inteiro ida▮"],
    ["no nome da segunda variável", "inteiro a = 1, ▮"],
    ["num número", "inteiro a = 12▮"],
    ["num real", "real a = 1.5▮"],
    ["numa palavra colada a um número", "inteiro a = 12ab▮"],
  ])("%s", (_, linha) => {
    expect(completarEm(`programa {\n  funcao inicio() {\n    ${linha}\n  }\n}`)).toEqual([]);
  });

  test.each([
    ["sem o tipo", "funcao ▮"],
    ["depois do tipo", "funcao inteiro ▮"],
    ["começado", "funcao inteiro so▮"],
  ])("no nome de uma função, %s", (_, linha) => {
    expect(completarEm(`programa {\n  ${linha}\n}`)).toEqual([]);
  });

  test.each([
    ["por valor", "funcao f(inteiro ▮"],
    ["por referência", "funcao f(inteiro &▮"],
    ["depois dos colchetes", "funcao f(inteiro v[]▮"],
  ])("no nome de um parâmetro, %s", (_, linha) => {
    expect(completarEm(`programa {\n  ${linha}\n}`)).toEqual([]);
  });

  test("no apelido de uma biblioteca", () => {
    expect(completarEm("programa {\n  inclua biblioteca Matematica --> ▮\n}")).toEqual([]);
  });

  test("no nome de outra variável do para", () => {
    expect(completarEm("programa {\n  funcao inicio() {\n    para (inteiro i = 0, ▮\n  }\n}")).toEqual([]);
  });
});

const TIPOS = new Set(["cadeia", "caracter", "inteiro", "logico", "real"]);

describe("o que cabe em cada lugar", () => {
  test("fora do programa, a palavra e o trecho programa", () => {
    const itens = completarEm("▮");

    expect(itens.map(i => [i.rótulo, i.tipo])).toEqual([
      ["programa", "palavra"],
      ["programa", "trecho"],
    ]);
  });

  test("entre as declarações do programa", () => {
    const itens = completarEm`
      programa {
        ▮
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["funcao", "inclua", "const", "inteiro", "real"]));
    expect(rótulos(itens)).not.toContain("se");
    expect(rótulos(itens)).not.toContain("escreva");
  });

  test("no início de uma lista de parâmetros, só os tipos", () => {
    // Num conjunto: a ordem na lista é a do editor, pelo `ordem` de cada item.
    expect(new Set(rótulos(completarEm("programa {\n  funcao f(▮\n}")))).toEqual(TIPOS);
    expect(rótulos(completarEm("programa {\n  funcao f(inteiro a, ▮\n}"))).toContain("real");
  });

  test("depois de const, só os tipos", () => {
    // Num conjunto: a ordem na lista é a do editor, pelo `ordem` de cada item.
    expect(new Set(rótulos(completarEm("programa {\n  const ▮\n}")))).toEqual(TIPOS);
  });

  test("no corpo de uma função", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          ▮
        }
      }
    `;

    expect(rótulos(itens)).toEqual(
      expect.arrayContaining(["inicio", "escreva", "leia", "limpa", "sorteia", "se", "para", "retorne", "inteiro"]),
    );
    expect(rótulos(itens)).not.toContain("senao");
    expect(rótulos(itens)).not.toContain("pare");
    expect(rótulos(itens)).not.toContain("caso");
  });

  test("numa expressão, sem comandos nem trechos", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          se (idade > ▮
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["idade", "verdadeiro", "falso", "nao"]));
    expect(rótulos(itens)).not.toContain("enquanto");
    expect(itens.some(i => i.tipo === "trecho")).toBe(false);
  });

  test("senao só logo depois do bloco de um se", () => {
    const depoisDoSe = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
          } ▮
        }
      }
    `;
    const depoisDoEnquanto = completarEm`
      programa {
        funcao inicio() {
          enquanto (verdadeiro) {
          } ▮
        }
      }
    `;

    expect(item(depoisDoSe, "senao", "palavra")).toBeDefined();
    expect(item(depoisDoSe, "senao", "trecho")).toMatchObject({ descrição: "Desvio condicional senao se" });
    expect(item(depoisDoEnquanto, "senao")).toBeUndefined();
  });

  test("pare num laço", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          enquanto (verdadeiro) {
            ▮
          }
        }
      }
    `;

    expect(rótulos(itens)).toContain("pare");
  });

  test("caso, caso contrario e pare num escolha", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro opcao = 1
          escolha (opcao) {
            caso 1:
              escreva("um")
              ▮
          }
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["caso", "caso contrario", "pare"]));
  });

  test("contrario depois de caso", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro opcao = 1
          escolha (opcao) {
            caso ▮
          }
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["contrario", "opcao"]));
  });

  test("os tipos logo depois de para (", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro i
          para (▮
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["inteiro", "i"]));
  });

  test("o intervalo cobre a palavra inteira em volta do cursor", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          esc▮reva
        }
      }
    `;

    expect(itens[0].intervalo).toEqual({ linha: 4, início: 5, fim: 12 });
  });

  // O Monaco conta as colunas em unidades UTF-16: o emoji vale duas.
  test("um emoji antes do cursor não desloca o intervalo", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          escreva("😀", id▮
        }
      }
    `;

    expect(rótulos(itens)).toContain("idade");
    expect(itens[0].intervalo).toEqual({ linha: 4, início: 19, fim: 21 });
  });
});
