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

  funcao real divideComoReal(inteiro a, inteiro b) {
    retorne a / b
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

  // A conversão de 'inteiro' para 'real' acontece depois da operação, então uma
  // divisão entre dois inteiros trunca mesmo quando o destino é real, como no
  // Java gerado pelo Portugol Studio (issue #443)
  describe("Divisão inteira antes da conversão", () => {
    test("Trunca na declaração e na atribuição", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r = 7 / 2
            real s
            s = 600 / 100
            real t = 1 / 2
            escreva(r, "|", s, "|", t)
          `),
        ),
      ).resolves.toBe("3.0|6.0|0.0");
    });

    test("Trunca no retorno e no parâmetro", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(divideComoReal(7, 2), "|", recebeReal(7 / 2), "|")
            imprimeReal(7 / 2)
          `),
        ),
      ).resolves.toBe("3.0|3.0|3.0");
    });

    test("Trunca em elementos de vetor e matriz", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real v[2]
            real m[2][2]
            v[0] = 7 / 2
            m[0][0] = 7 / 2
            escreva(v[0], "|", m[0][0])
          `),
        ),
      ).resolves.toBe("3.0|3.0");
    });

    test("Trunca antes de continuar a expressão", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro acertos = 7, total = 20
            real porcentagem = acertos / total * 100
            real media = (7 + 8 + 10) / 3
            escreva(porcentagem, "|", media, "|", 10 / 4 * 4.0)
          `),
        ),
      ).resolves.toBe("0.0|8.0|8.0");
    });

    test("Trunca na atribuição composta apenas entre inteiros", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro i = 10
            real r = 10
            inteiro j = 10
            i /= 3
            r /= 3
            j /= 3.0
            escreva(i, "|", r, "|", j)
          `),
        ),
      ).resolves.toBe("3|3.3333333333333335|3");
    });

    test("Não trunca quando um dos operandos é real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r = 7 / 2.0
            real s = 7.0 / 2
            escreva(r, "|", s, "|", 1 / 2.0)
          `),
        ),
      ).resolves.toBe("3.5|3.5|0.5");
    });

    test("O inteiro já convertido para real divide sem truncar", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real v = 7
            real w
            w = 7
            escreva(v / 2, "|", w / 2, "|", recebeReal(7) / 2)
          `),
        ),
      ).resolves.toBe("3.5|3.5|3.5");
    });

    test("O real que recebeu uma divisão truncada continua real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r = 7 / 2
            escreva(r, "|", r / 2, "|", r + 0.5)
          `),
        ),
      ).resolves.toBe("3.0|1.5|3.5");
    });
  });
});
