import { describe, expect, test } from "vitest";

import { completarEm, item } from "../helpers/cursor";

/**
 * Os nomes do Portugol não têm acentos, mas quem escreve português escreve `senão`, `média`,
 * `função`: a palavra com acento é o começo do nome sem acento.
 */
describe("palavras escritas com acentos", () => {
  test("senão depois do bloco de um se", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
          } senã▮
        }
      }
    `;

    expect(item(itens, "senao", "palavra")).toMatchObject({
      filtro: "senão",
      intervalo: { linha: 4, início: 7, fim: 11 },
    });
  });

  test("não numa expressão", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          logico ok = verdadeiro
          se (nã▮
        }
      }
    `;

    expect(item(itens, "nao")).toMatchObject({ filtro: "não", intervalo: { linha: 4, início: 9, fim: 11 } });
  });

  test("lógico como tipo no corpo de uma função", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          lógi▮
        }
      }
    `;

    expect(item(itens, "logico")).toMatchObject({ filtro: "lógico", intervalo: { linha: 3, início: 5, fim: 9 } });
  });

  test("função entre as declarações do programa, a palavra e o trecho", () => {
    const itens = completarEm`
      programa {
        funçã▮
      }
    `;

    expect(item(itens, "funcao", "palavra")?.filtro).toBe("função");
    expect(item(itens, "funcao", "trecho")?.filtro).toBe("função");
  });

  test("uma variável sem acento", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          real media = 7.5
          escreva(méd▮)
        }
      }
    `;

    expect(item(itens, "media")).toMatchObject({
      filtro: "média",
      intervalo: { linha: 4, início: 13, fim: 16 },
    });
  });

  test("a palavra inteira, com o acento no fim", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
          } senão▮
        }
      }
    `;

    expect(item(itens, "senao", "palavra")?.filtro).toBe("senão");
  });

  test("maiúsculas", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          logico ok = NÃ▮
        }
      }
    `;

    expect(item(itens, "nao")?.filtro).toBe("NÃo");
  });

  test("só os itens que começam com a palavra têm filtro", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          real media = 7.5
          escreva(méd▮)
        }
      }
    `;

    expect(itens.filter(i => i.filtro !== undefined).map(i => i.rótulo)).toEqual(["media"]);
  });

  test("sem acento, sem filtro", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          se (verdadeiro) {
          } sen▮
        }
      }
    `;

    expect(item(itens, "senao", "palavra")).toBeDefined();
    expect(itens.every(i => i.filtro === undefined)).toBe(true);
  });

  test.each([
    ["numa cadeia", 'escreva("senã▮'],
    ["num comentário", "// senã▮"],
    ["no nome da variável", "inteiro médi▮"],
  ])("nada %s", (_, linha) => {
    expect(completarEm(`programa {\n  funcao inicio() {\n    ${linha}\n  }\n}`)).toEqual([]);
  });
});
