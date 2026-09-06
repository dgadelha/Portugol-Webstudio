import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Inteiros de 32 bits", () => {
  describe("Transbordo", () => {
    test("Soma transborda para negativo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro max = 2147483647
            escreva(max + 1, "|", max + 2)
          `,
        ),
      ).resolves.toBe("-2147483648|-2147483647");
    });

    test("Subtração transborda para positivo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro min = -2147483647
            escreva(min - 2, "|", min - 1)
          `,
        ),
      ).resolves.toBe("2147483647|-2147483648");
    });

    test("Multiplicação transborda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro max = 2147483647
            escreva(max * 2, "|", 100000 * 100000, "|", 65536 * 65536)
          `,
        ),
      ).resolves.toBe("-2|1410065408|0");
    });

    test("Multiplicação mantém a precisão de 32 bits", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro max = 2147483647
            escreva(max * max, "|", 46341 * 46341)
          `,
        ),
      ).resolves.toBe("1|-2147479015");
    });

    test("Menos unário transborda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro max = 2147483647
            escreva(-max, "|", -(0 - max))
          `,
        ),
      ).resolves.toBe("-2147483647|2147483647");
    });

    test("Incremento e decremento transbordam", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 2147483647
            x++
            inteiro y = -2147483647
            y--
            y--
            escreva(x, "|", y)
          `,
        ),
      ).resolves.toBe("-2147483648|2147483647");
    });

    test("Atribuição composta transborda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro y = 2147483647
            y += 5
            inteiro z = 100000
            z *= 100000
            escreva(y, "|", z)
          `,
        ),
      ).resolves.toBe("-2147483644|1410065408");
    });

    test("Fatorial transborda a partir de 13!", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, f = 1
            para (i = 1; i <= 20; i++) {
              f = f * i
            }
            escreva(f)
          `,
        ),
      ).resolves.toBe("-2102132736");
    });

    test("Fibonacci transborda depois do 46º termo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, a = 1, b = 1, t
            para (i = 1; i <= 60; i++) {
              t = a + b
              a = b
              b = t
            }
            escreva(a, "|", b)
          `,
        ),
      ).resolves.toBe("764848393|-1709589543");
    });

    test("Dobrar repetidamente zera o valor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, x = 1
            para (i = 1; i <= 40; i++) {
              x = x + x
            }
            escreva(x)
          `,
        ),
      ).resolves.toBe("0");
    });

    test("Somatório de quadrados transborda", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, s = 0
            para (i = 1; i <= 100000; i++) {
              s = s + i * i
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("1626540144");
    });

    test("Reais não são afetados pelo transbordo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(3.0 * 1000000000.0, "|", 2147483647.0 + 1.0)
          `,
        ),
      ).resolves.toBe("3.0E9|2.147483648E9");
    });
  });

  describe("Divisão inteira", () => {
    test("Descarta a parte fracionária", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(7 / 2, "|", 10 / 4, "|", 1 / 2)
          `,
        ),
      ).resolves.toBe("3|2|0");
    });

    test("Trunca em direção ao zero com negativos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(-7 / 2, "|", 7 / -2, "|", -7 / -2)
          `,
        ),
      ).resolves.toBe("-3|-3|3");
    });

    test("Divide exatamente", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 / 5, "|", 9 / 3, "|", 100 / 10)
          `,
        ),
      ).resolves.toBe("2|3|10");
    });

    test("Resto segue o sinal do dividendo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(7 % 3, "|", 7 % -3, "|", -7 % 3, "|", -7 % -3)
          `,
        ),
      ).resolves.toBe("1|1|-1|-1");
    });

    test("Interrompe o programa ao dividir por zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a = 5, b = 0
            escreva("antes ")
            escreva(a / b)
            escreva("depois")
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Interrompe o programa no módulo por zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a = 5, b = 0
            escreva("antes ")
            escreva(a % b)
            escreva("depois")
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });
});
