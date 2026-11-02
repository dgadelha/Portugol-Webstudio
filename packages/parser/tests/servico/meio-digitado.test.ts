import { describe, expect, test } from "vitest";

import { completarEm, rótulos } from "../helpers/cursor";

/**
 * O código que está sendo escrito quase sempre tem erro de sintaxe: o que foi declarado antes
 * do cursor precisa continuar aparecendo.
 */
describe("código pela metade", () => {
  test("um parêntese aberto antes", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          escreva(
          inteiro depois = 2
          ▮
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["idade", "depois"]));
  });

  test("uma linha só com escreva(", () => {
    const itens = completarEm`
      programa {
        inteiro global = 1

        funcao inicio() {
          inteiro idade = 3
          escreva(▮
        }

        funcao vazio outra() {
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["idade", "global", "outra", "inicio"]));
  });

  test("uma chave aberta", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          se (idade > 2) {
            cadeia nome = ""
            ▮
        }

        funcao real media(real a, real b) {
          retorne a
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["idade", "nome", "media"]));
  });

  test("sem a chave que fecha o programa", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          ▮
    `;

    expect(rótulos(itens)).toContain("idade");
  });

  test("um se ( sem fechar", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          se (▮
        }
      }
    `;

    expect(rótulos(itens)).toContain("idade");
  });

  test("um se ( sem fechar numa linha anterior", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          se (
          ▮
        }

        funcao vazio outra() {
        }
      }
    `;

    expect(rótulos(itens)).toEqual(expect.arrayContaining(["idade", "outra"]));
  });

  test("uma palavra pela metade no fim de uma função", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          real altura = 1.8
          alt▮
        }
      }
    `;

    expect(rótulos(itens)).toContain("altura");
  });

  test("a palavra que está sendo escrita não vira sugestão dela mesma", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          inteiro a = 1
          ab▮
        }
      }
    `;

    expect(rótulos(itens)).not.toContain("ab");
  });
});
