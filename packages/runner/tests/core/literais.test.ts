import { describe, expect, test } from "vitest";
import { portugol, portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Literais", () => {
  describe("Inteiros", () => {
    test("Aceita notação hexadecimal", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(0xFF, "|", 0x10, "|", 0xff)
          `,
        ),
      ).resolves.toBe("255|16|255");
    });

    test("Ignora zeros à esquerda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(007, "|", 000, "|", 0)
          `,
        ),
      ).resolves.toBe("7|0|0");
    });

    test("Aceita os limites de 32 bits", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2147483647, "|", -2147483647)
          `,
        ),
      ).resolves.toBe("2147483647|-2147483647");
    });
  });

  describe("Reais", () => {
    test("Distingue zero positivo e negativo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(0.0, "|", -0.0, "|", 0.5)
          `,
        ),
      ).resolves.toBe("0.0|-0.0|0.5");
    });
  });

  describe("Cadeias", () => {
    test("Interpreta as sequências de escape", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("[a\\nb][a\\tb][a\\\\b][a\\"b]")
          `,
        ),
      ).resolves.toBe('[a\nb][a\tb][a\\b][a"b]');
    });

    test("Aceita acentuação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("acentuação çãõ ê")
          `,
        ),
      ).resolves.toBe("acentuação çãõ ê");
    });
  });

  describe("Caracteres", () => {
    test("Não interpreta sequências de escape", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("[", '\\n', "][", '\\t', "][", '\\\\', "][", 'x', "]")
          `,
        ),
      ).resolves.toBe("[\\][\\][\\][x]");
    });

    test("Toda sequência de escape vale uma barra invertida", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            caracter c = '\\n'
            escreva(c == '\\t', "|", c == '\\\\', "|", c == 'x')
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso");
    });

    test("Converte a barra invertida pela biblioteca Tipos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_para_cadeia('\\n'), "|", Tipos.caracter_e_inteiro('\\n'))
              }
            }
          `,
        ),
      ).resolves.toBe("\\|falso");
    });

    test("Aceita acentuação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('ç', "|", 'á')
          `,
        ),
      ).resolves.toBe("ç|á");
    });
  });
});
