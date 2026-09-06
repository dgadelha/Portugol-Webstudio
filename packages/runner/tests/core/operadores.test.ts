import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Operadores", () => {
  describe("Precedência aritmética", () => {
    test("Multiplicação e divisão antes de soma e subtração", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2 + 3 * 4 - 6 / 3, "|", (2 + 3) * (4 - 6) / 3)
          `,
        ),
      ).resolves.toBe("12|-3");
    });

    test("Módulo tem a mesma precedência da multiplicação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2 * 3 % 4, "|", 2 % 3 * 4, "|", 10 + 7 % 3)
          `,
        ),
      ).resolves.toBe("2|8|11");
    });

    test("Operadores de mesma precedência associam à esquerda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 - 2 - 3, "|", 100 / 10 / 2, "|", 12 / 3 * 2)
          `,
        ),
      ).resolves.toBe("5|5|8");
    });

    test("Combina todas as precedências", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real r = 2.0 + 3.0 * 4.0 - 10.0 / 5.0 + 7 % 3
            escreva(r)
          `,
        ),
      ).resolves.toBe("13.0");
    });
  });

  describe("Precedência bitwise", () => {
    test("E bitwise antes do XOR, que vem antes do OU bitwise", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 | 2 ^ 3 & 4, "|", 6 & 3 ^ 2, "|", 1 ^ 2 | 4)
          `,
        ),
      ).resolves.toBe("3|0|7");
    });

    test("Agrupa operandos como o Java", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(12 & 10 | 3, "|", 1 | 2 & 3, "|", 3 ^ 1 & 1)
          `,
        ),
      ).resolves.toBe("11|3|2");
    });

    test("Soma antes do deslocamento", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 << 2 + 1, "|", 8 >> 1 + 1)
          `,
        ),
      ).resolves.toBe("8|2");
    });

    test("Deslocamento antes dos operadores bitwise", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(8 >> 1 | 1, "|", 1 | 4 >> 1, "|", 1 & 3 << 1)
          `,
        ),
      ).resolves.toBe("5|3|0");
    });
  });

  describe("Operadores bitwise", () => {
    test("Opera sobre os bits", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(6 & 3, "|", 6 | 3, "|", 6 ^ 3, "|", ~6, "|", 6 << 2, "|", 6 >> 1)
          `,
        ),
      ).resolves.toBe("2|7|5|-7|24|3");
    });

    test("Preserva o sinal no deslocamento à direita", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(-8 >> 1, "|", -1 & 255, "|", -1 ^ 0)
          `,
        ),
      ).resolves.toBe("-4|255|-1");
    });

    test("Desloca em 32 bits", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro max = 2147483647
            escreva(1 << 31, "|", 1 << 32, "|", max << 1)
          `,
        ),
      ).resolves.toBe("-2147483648|1|-2");
    });

    test("Extrai canais de uma cor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro cor = 16711935
            escreva(cor >> 16 & 255, "|", cor >> 8 & 255, "|", cor & 255)
          `,
        ),
      ).resolves.toBe("255|0|255");
    });

    test("Nega os bits", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(~0, "|", ~1, "|", ~(0 - 1), "|", ~255 & 255)
          `,
        ),
      ).resolves.toBe("-1|-2|0|0");
    });
  });

  describe("Comparação", () => {
    test("Compara números", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 < 2, "|", 2 <= 2, "|", 3 > 4, "|", 4 >= 4, "|", 5 == 5, "|", 5 != 5)
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso|verdadeiro|verdadeiro|falso");
    });

    test("Compara inteiros com reais", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 == 1.0, "|", 2 < 2.5, "|", 3.0 >= 3)
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro");
    });

    test("Compara cadeias", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("a" == "a", "|", "a" == "b", "|", "a" != "b")
          `,
        ),
      ).resolves.toBe("verdadeiro|falso|verdadeiro");
    });

    test("Compara caracteres pelo código", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('a' < 'b', "|", 'z' > 'a', "|", 'a' == 'a', "|", 'a' != 'b')
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro|verdadeiro");
    });

    test("Compara depois de avaliar a aritmética", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 + 2 < 4, "|", 2 + 3 == 5, "|", 2 * 3 != 7)
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro");
    });
  });

  describe("Operadores lógicos", () => {
    test("Aplica e, ou e não", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(verdadeiro e verdadeiro, "|", verdadeiro e falso, "|", verdadeiro ou falso, "|", falso ou falso, "|", nao verdadeiro)
          `,
        ),
      ).resolves.toBe("verdadeiro|falso|verdadeiro|falso|falso");
    });

    test("E tem precedência sobre ou", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(verdadeiro ou falso e falso, "|", (verdadeiro ou falso) e falso)
          `,
        ),
      ).resolves.toBe("verdadeiro|falso");
    });

    test("Combina comparações", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 < 2 e 3 < 4, "|", 1 + 1 >= 2 e 2 + 2 <= 4, "|", nao (1 > 2))
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro");
    });

    test("Curto-circuita o e antes de dividir por zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a = 0, b = 5
            se (a != 0 e b / a > 1) {
              escreva("sim")
            } senao {
              escreva("nao")
            }
          `,
        ),
      ).resolves.toBe("nao");
    });

    test("Curto-circuita o ou antes de dividir por zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a = 0, b = 5
            se (a == 0 ou b / a > 1) {
              escreva("sim")
            } senao {
              escreva("nao")
            }
          `,
        ),
      ).resolves.toBe("sim");
    });
  });

  describe("Unários", () => {
    test("Aplica o menos unário", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            escreva(-x, "|", -2 * 3, "|", -(2 * 3))
          `,
        ),
      ).resolves.toBe("-5|-6|-6");
    });

    test("Incrementa e decrementa antes da expressão", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            escreva(++x, "|", x)
          `,
        ),
      ).resolves.toBe("6|6");
    });

    test("Incrementa como comando", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            x++
            x++
            escreva(x)
            x--
            escreva("|", x)
          `,
        ),
      ).resolves.toBe("7|6");
    });
  });

  describe("Atribuição composta", () => {
    test("Aplica todas as variantes em inteiros", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 10
            x += 5
            escreva(x, "|")
            x -= 3
            escreva(x, "|")
            x *= 2
            escreva(x, "|")
            x /= 4
            escreva(x)
          `,
        ),
      ).resolves.toBe("15|12|24|6");
    });

    test("Divide reais sem truncar", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real x = 10.0
            x /= 4.0
            escreva(x)
          `,
        ),
      ).resolves.toBe("2.5");
    });
  });
});
