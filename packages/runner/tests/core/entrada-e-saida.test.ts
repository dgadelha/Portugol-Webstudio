import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Entrada e Saída", () => {
  describe("escreva", () => {
    test("Imprime cadeia", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("Olá, mundo!")
          `,
        ),
      ).resolves.toBe("Olá, mundo!");
    });

    test("Imprime inteiro", async () => {
      await expect(
        runPortugolCode(portugolInicio`
          escreva(123)
        `),
      ).resolves.toBe("123");
    });

    test("Imprime real", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(3.14)
          `,
        ),
      ).resolves.toBe("3.14");
    });

    test("Imprime lógico", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(verdadeiro)
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("Imprime múltiplos valores", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("O resultado é:", 42, "e", falso)
          `,
        ),
      ).resolves.toBe("O resultado é:42efalso");
    });
  });

  describe("leia", () => {
    test("Lê inteiro", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x
            leia(x)
            escreva(x)
          `,
          ["42"],
        ),
      ).resolves.toBe("42");
    });

    test("Lê real", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real y
            leia(y)
            escreva(y)
          `,
          ["3.14"],
        ),
      ).resolves.toBe("3.14");
    });

    test("Lê cadeia", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia texto
            leia(texto)
            escreva(texto)
          `,
          ["Olá mundo"],
        ),
      ).resolves.toBe("Olá mundo");
    });

    test("Lê caracter", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            caracter letra
            leia(letra)
            escreva(letra)
          `,
          ["A"],
        ),
      ).resolves.toBe("A");
    });

    test("Lê valor lógico verdadeiro", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            logico booleano
            leia(booleano)
            escreva(booleano)
          `,
          ["verdadeiro"],
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("Lê múltiplos valores", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a
            inteiro b
            cadeia c
            leia(a)
            leia(b)
            leia(c)
            escreva(a, b, c)
          `,
          ["10", "20", "teste"],
        ),
      ).resolves.toBe("1020teste");
    });

    test("Lê em um vetor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro numeros[3]
            leia(numeros[0])
            leia(numeros[1])
            leia(numeros[2])
            escreva(numeros[0], numeros[1], numeros[2])
          `,
          ["5", "10", "15"],
        ),
      ).resolves.toBe("51015");
    });

    test("Lê em uma matriz", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro matriz[2][2]
            leia(matriz[0][0])
            leia(matriz[0][1])
            leia(matriz[1][0])
            leia(matriz[1][1])
            escreva(matriz[0][0], matriz[0][1], matriz[1][0], matriz[1][1])
          `,
          ["1", "2", "3", "4"],
        ),
      ).resolves.toBe("1234");
    });

    test("Lê inteiro e converte para real", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real num
            leia(num)
            escreva(num)
          `,
          ["7"],
        ),
      ).resolves.toBe("7");
    });
  });
});
