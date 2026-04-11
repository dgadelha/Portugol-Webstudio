import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Operações Aritméticas", () => {
  describe("Operações simples", () => {
    test("Soma de inteiros", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2 + 3)
          `,
        ),
      ).resolves.toBe("5");
    });

    test("Subtração de inteiros", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 - 4)
          `,
        ),
      ).resolves.toBe("6");
    });

    test("Multiplicação de inteiros", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(3 * 7)
          `,
        ),
      ).resolves.toBe("21");
    });

    test("Divisão de inteiros", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a = 10, b = 3
            inteiro resultado = a / b
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("3");
    });

    test("Soma de reais", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2.5 + 3.5)
          `,
        ),
      ).resolves.toBe("6");
    });

    test("Subtração de reais", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10.5 - 4.2)
          `,
        ),
      ).resolves.toBe("6.3");
    });

    test("Multiplicação de reais", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(2.5 * 4.0)
          `,
        ),
      ).resolves.toBe("10");
    });

    test("Divisão de reais", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10.0 / 4.0)
          `,
        ),
      ).resolves.toBe("2.5");
    });

    test("Operações com variáveis", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real a = 5.0, b = 3.0
            real soma = a + b
            real sub = a - b
            real mult = a * b
            real div = a / b
            escreva(soma, " ", sub, " ", mult, " ", div)
          `,
        ),
      ).resolves.toBe("8 2 15 1.6666666666666667");
    });

    test("Operações com leitura de valores", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real a, b
            leia(a)
            leia(b)
            escreva(a + b, " ", a - b, " ", a * b, " ", a / b)
          `,
          ["10", "4"],
        ),
      ).resolves.toBe("14 6 40 2.5");
    });
  });

  describe("Divisão inteira e módulo", () => {
    test("Divisão inteira por 2", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro valor = 7, divisor = 2
            inteiro resultado = valor / divisor
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("3");
    });

    test("Resto da divisão (mod)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro valor = 10
            escreva(valor % 3)
          `,
        ),
      ).resolves.toBe("1");
    });

    test("Divisão inteira e resto com leitura", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro valor
            leia(valor)
            inteiro metade_inteira = valor / 2
            inteiro resto = valor % 3
            escreva(metade_inteira, " ", resto)
          `,
          ["17"],
        ),
      ).resolves.toBe("8 2");
    });

    test("Módulo de números negativos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(-7 % 3)
          `,
        ),
      ).resolves.toBe("-1");
    });
  });

  describe("Prioridade de operações", () => {
    test("Multiplicação antes da soma", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = 5.0 + 4.0 * 2.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("13");
    });

    test("Parênteses alteram prioridade", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = (5.0 + 4.0) * 2.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("18");
    });

    test("Divisão antes da soma", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = 1.0 + 2.0 / 3.0 * 4.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("3.6666666666666665");
    });

    test("Parênteses aninhados", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = (1.0 + 2.0) / (3.0 * 4.0)
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("0.25");
    });

    test("Divisão antes da subtração", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = 10.0 - 6.0 / 3.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("8");
    });

    test("Módulo antes da soma", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 + 7 % 3)
          `,
        ),
      ).resolves.toBe("11");
    });

    test("Módulo antes da subtração", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 - 7 % 3)
          `,
        ),
      ).resolves.toBe("9");
    });

    test("Multiplicação e divisão têm mesma prioridade (esquerda para direita)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = 12.0 / 3.0 * 2.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("8");
    });

    test("Soma e subtração têm mesma prioridade (esquerda para direita)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(10 - 3 + 2)
          `,
        ),
      ).resolves.toBe("9");
    });

    test("Todas as prioridades combinadas", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = 2.0 + 3.0 * 4.0 - 10.0 / 5.0 + 7.0 % 3.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("13");
    });

    test("Parênteses forçam soma antes de multiplicação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva((2 + 3) * 4)
          `,
        ),
      ).resolves.toBe("20");
    });

    test("Parênteses forçam subtração antes de divisão", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = (10.0 - 4.0) / 2.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("3");
    });

    test("Parênteses múltiplos níveis", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = ((2.0 + 3.0) * (4.0 - 1.0)) / 5.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("3");
    });
  });

  describe("Incremento e decremento", () => {
    test("Incremento", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            x++
            escreva(x)
          `,
        ),
      ).resolves.toBe("6");
    });

    test("Decremento", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            x--
            escreva(x)
          `,
        ),
      ).resolves.toBe("4");
    });
  });

  describe("Atribuição composta", () => {
    test("Soma e atribui (+=)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 10
            x += 5
            escreva(x)
          `,
        ),
      ).resolves.toBe("15");
    });

    test("Subtrai e atribui (-=)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 10
            x -= 3
            escreva(x)
          `,
        ),
      ).resolves.toBe("7");
    });

    test("Multiplica e atribui (*=)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 4
            x *= 3
            escreva(x)
          `,
        ),
      ).resolves.toBe("12");
    });

    test("Divide e atribui (/=)", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real x = 20.0
            x /= 4.0
            escreva(x)
          `,
        ),
      ).resolves.toBe("5");
    });
  });

  describe("Expressões complexas", () => {
    test("Expressão com múltiplas operações", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real resultado = (10.0 + 5.0) * 2.0 - 8.0 / 4.0
            escreva(resultado)
          `,
        ),
      ).resolves.toBe("28");
    });

    test("Negação unária", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            escreva(-x)
          `,
        ),
      ).resolves.toBe("-5");
    });

    test("Operação com zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(0 + 0, " ", 5 * 0, " ", 0 - 3)
          `,
        ),
      ).resolves.toBe("0 0 -3");
    });
  });
});
