import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

// As funções auxiliares são as mesmas em todos os testes deste arquivo, então
// cada teste declara apenas o corpo do inicio()
const AUXILIARES = portugol`
  funcao real comoReal(inteiro n) {
    retorne n
  }

  funcao real somaComoReal(inteiro a, inteiro b) {
    retorne a + b
  }

  funcao real recebeReal(real n) {
    retorne n
  }

  funcao imprimeReal(real n) {
    escreva(n)
  }

  funcao real potencia(inteiro base, inteiro n) {
    se (n == 0) {
      retorne 1
    }

    retorne base * potencia(base, n - 1)
  }
`;

function programa(corpo: string) {
  return `programa {\n  funcao inicio() {\n${corpo
    .split("\n")
    .map(linha => (linha ? `    ${linha}` : linha))
    .join("\n")}\n  }\n\n${AUXILIARES}\n}\n`;
}

describe("Conversões Implícitas", () => {
  describe("Retorno de função", () => {
    test("Converte o retorno para o tipo declarado", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(comoReal(3))
          `),
        ),
      ).resolves.toBe("3.0");
    });

    test("Converte o resultado de uma expressão", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(somaComoReal(1, 2))
          `),
        ),
      ).resolves.toBe("3.0");
    });

    test("Converte em cada nível da recursão", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(potencia(2, 10))
          `),
        ),
      ).resolves.toBe("1024.0");
    });
  });

  describe("Parâmetros", () => {
    test("Aceita inteiro onde se espera real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(recebeReal(5), "|", recebeReal(5.5))
          `),
        ),
      ).resolves.toBe("5.0|5.5");
    });

    test("O parâmetro já vale como real dentro da função", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            imprimeReal(7)
          `),
        ),
      ).resolves.toBe("7.0");
    });
  });

  describe("Atribuição", () => {
    test("Converte na atribuição para real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r
            r = 5
            escreva(r, "|")
            r = 5 + 3
            escreva(r)
          `),
        ),
      ).resolves.toBe("5.0|8.0");
    });

    test("Converte em elementos de vetor e matriz", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real v[2]
            real m[2][2]
            v[0] = 1
            v[1] = 2 + 3
            m[0][0] = 7
            escreva(v[0], "|", v[1], "|", m[0][0])
          `),
        ),
      ).resolves.toBe("1.0|5.0|7.0");
    });

    test("Converte em constante e em atribuição composta", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            const real X = 5
            real r = 1
            r += 2
            escreva(X, "|", X * 2, "|", r)
          `),
        ),
      ).resolves.toBe("5.0|10.0|3.0");
    });

    test("Converte um inteiro lido para real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r
            leia(r)
            escreva(r)
          `),
          ["8"],
        ),
      ).resolves.toBe("8.0");
    });
  });
});
