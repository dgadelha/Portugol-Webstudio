import { describe, expect, test } from "vitest";

import { BIBLIOTECAS_IMPLEMENTADAS, FUNÇÕES_RESERVADAS, obterBiblioteca } from "../../src";
import { FUNÇÕES_DA_LINGUAGEM } from "../../src/servico/chamáveis";
import { completarEm, item, rótulos } from "../helpers/cursor";

describe("bibliotecas", () => {
  test("inclua biblioteca ▮ lista as bibliotecas que o Webstudio executa", () => {
    const itens = completarEm("programa {\n  inclua biblioteca ▮\n}");

    expect(rótulos(itens)).toEqual([...BIBLIOTECAS_IMPLEMENTADAS]);
    expect(item(itens, "Matematica")).toMatchObject({
      tipo: "biblioteca",
      documentação: obterBiblioteca("Matematica")!.descrição,
    });
  });

  test("inclua biblioteca ▮ não repete uma biblioteca já incluída", () => {
    const itens = completarEm("programa {\n  inclua biblioteca Matematica\n  inclua biblioteca Ma▮\n}");

    expect(rótulos(itens)).not.toContain("Matematica");
    expect(rótulos(itens)).toContain("Texto");
  });

  test("inclua ▮ sugere biblioteca", () => {
    expect(rótulos(completarEm("programa {\n  inclua ▮\n}"))).toEqual(["biblioteca"]);
  });

  test("depois do apelido e do ponto, as funções e constantes da biblioteca", () => {
    const itens = completarEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          mat.▮
        }
      }
    `;

    expect(item(itens, "potencia")).toMatchObject({
      tipo: "função",
      detalhe: "funcao real potencia(real base, real expoente)",
      detalheDoRótulo: "(real base, real expoente)",
      descrição: "real",
    });
    expect(item(itens, "potencia")?.documentação).toContain("Parâmetros:");
    expect(item(itens, "potencia")?.documentação).toContain("- `base` (real): o número que será elevado ao expoente");
    expect(item(itens, "PI")).toMatchObject({ tipo: "constante", descrição: "const real", detalhe: "const real PI" });
    // Só os membros: nada do programa nem palavras.
    expect(rótulos(itens)).not.toContain("inicio");
    expect(rótulos(itens)).not.toContain("se");
  });

  test("com uma parte do nome depois do ponto", () => {
    const itens = completarEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          real x = mat.po▮
        }
      }
    `;

    expect(rótulos(itens)).toContain("potencia");
    expect(itens[0].intervalo).toMatchObject({ início: 18, fim: 20 });
  });

  test("pelo nome da biblioteca, com ou sem apelido", () => {
    const semApelido = completarEm`
      programa {
        inclua biblioteca Texto

        funcao inicio() {
          Texto.▮
        }
      }
    `;
    const comApelido = completarEm`
      programa {
        inclua biblioteca Texto --> t

        funcao inicio() {
          Texto.▮
        }
      }
    `;

    expect(rótulos(semApelido)).toContain("numero_caracteres");
    expect(rótulos(comApelido)).toContain("numero_caracteres");
  });

  test("o apelido aparece na lista do corpo da função", () => {
    const itens = completarEm`
      programa {
        inclua biblioteca Matematica --> mat
        inclua biblioteca Texto

        funcao inicio() {
          ▮
        }
      }
    `;

    expect(item(itens, "mat")).toMatchObject({ tipo: "biblioteca", descrição: "Matematica" });
    expect(item(itens, "Texto")).toMatchObject({ tipo: "biblioteca" });
    expect(item(itens, "Matematica")).toBeUndefined();
  });

  test("nada depois do ponto de uma biblioteca que não foi incluída", () => {
    const itens = completarEm`
      programa {
        funcao inicio() {
          Matematica.▮
        }
      }
    `;

    expect(itens).toEqual([]);
  });

  test("nada de uma biblioteca incluída que o Webstudio não executa", () => {
    const itens = completarEm`
      programa {
        inclua biblioteca Arquivos --> a

        funcao inicio() {
          a.▮
        }
      }
    `;

    expect(itens).toEqual([]);
  });
});

describe("funções da linguagem", () => {
  test("são as mesmas que o analisador reserva", () => {
    expect(new Set(FUNÇÕES_DA_LINGUAGEM.keys())).toEqual(FUNÇÕES_RESERVADAS);
  });
});
