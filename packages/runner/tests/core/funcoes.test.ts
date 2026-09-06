import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

// As funções auxiliares são as mesmas em todos os testes deste arquivo, então
// cada teste declara apenas o corpo do inicio()
const AUXILIARES = portugol`
  funcao inteiro dobro(inteiro x) {
    retorne x * 2
  }

  funcao real metade(inteiro x) {
    retorne x / 2.0
  }

  funcao logico ehPar(inteiro x) {
    retorne x % 2 == 0
  }

  funcao cadeia saudacao(cadeia nome) {
    retorne "Ola, " + nome
  }

  funcao inteiro fib(inteiro n) {
    se (n <= 1) {
      retorne n
    }

    retorne fib(n - 1) + fib(n - 2)
  }

  funcao inteiro somaAte(inteiro n) {
    se (n <= 0) {
      retorne 0
    }

    retorne n + somaAte(n - 1)
  }

  funcao inteiro sinal(inteiro x) {
    se (x < 0) {
      retorne 0 - 1
    }

    se (x > 0) {
      retorne 1
    }

    retorne 0
  }

  funcao naoAltera(inteiro x, real r, cadeia s) {
    x = 99
    r = 99.0
    s = "z"
  }

  funcao alteraPorReferencia(inteiro &x) {
    x = 99
  }

  funcao zera(inteiro v[]) {
    inteiro i

    para (i = 0; i < 3; i++) {
      v[i] = 0
    }
  }

  funcao chamaZera(inteiro v[]) {
    zera(v)
  }

  funcao inteiro soma(inteiro v[]) {
    retorne v[0] + v[1] + v[2]
  }

  funcao incrementaMatriz(inteiro m[][]) {
    inteiro i, j

    para (i = 0; i < 2; i++) {
      para (j = 0; j < 2; j++) {
        m[i][j] = m[i][j] + 1
      }
    }
  }

  funcao incrementaContador() {
    contador++
  }
`;

function programa(corpo: string) {
  return `programa {\n  inteiro contador = 0\n\n  funcao inicio() {\n${corpo
    .split("\n")
    .map(linha => (linha ? `    ${linha}` : linha))
    .join("\n")}\n  }\n\n${AUXILIARES}\n}\n`;
}

describe("Funções", () => {
  describe("Retorno", () => {
    test("Retorna inteiro", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(dobro(21))
          `),
        ),
      ).resolves.toBe("42");
    });

    test("Retorna real", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(metade(7), "|", metade(8))
          `),
        ),
      ).resolves.toBe("3.5|4.0");
    });

    test("Retorna lógico", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(ehPar(4), "|", ehPar(5))
          `),
        ),
      ).resolves.toBe("verdadeiro|falso");
    });

    test("Retorna cadeia", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(saudacao("Ana"))
          `),
        ),
      ).resolves.toBe("Ola, Ana");
    });

    test("Compõe chamadas", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(dobro(dobro(3)), "|", dobro(2) + dobro(3))
          `),
        ),
      ).resolves.toBe("12|10");
    });

    test("Sai na primeira condição satisfeita", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(sinal(0 - 5), "|", sinal(0), "|", sinal(5))
          `),
        ),
      ).resolves.toBe("-1|0|1");
    });
  });

  describe("Recursão", () => {
    test("Calcula Fibonacci", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(fib(20))
          `),
        ),
      ).resolves.toBe("6765");
    });

    test("Soma até n com recursão profunda", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            escreva(somaAte(1000))
          `),
        ),
      ).resolves.toBe("500500");
    });
  });

  describe("Passagem de parâmetros", () => {
    test("Passa escalares por valor", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro x = 1
            real r = 1.0
            cadeia s = "a"
            naoAltera(x, r, s)
            escreva(x, "|", r, "|", s)
          `),
        ),
      ).resolves.toBe("1|1.0|a");
    });

    test("Passa escalares por referência com &", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro x = 1
            alteraPorReferencia(x)
            escreva(x)
          `),
        ),
      ).resolves.toBe("99");
    });

    test("Passa vetores por referência", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro v[3] = {1, 2, 3}
            zera(v)
            escreva(v[0], v[1], v[2])
          `),
        ),
      ).resolves.toBe("000");
    });

    test("Mantém a referência em chamadas aninhadas", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro v[3] = {1, 2, 3}
            chamaZera(v)
            escreva(v[0], v[1], v[2])
          `),
        ),
      ).resolves.toBe("000");
    });

    test("Lê vetores sem alterá-los", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro v[3] = {4, 5, 6}
            escreva(soma(v), "|", v[0])
          `),
        ),
      ).resolves.toBe("15|4");
    });

    test("Passa matrizes por referência", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro m[2][2]
            incrementaMatriz(m)
            incrementaMatriz(m)
            escreva(m[0][0], "|", m[1][1])
          `),
        ),
      ).resolves.toBe("2|2");
    });
  });

  describe("Variáveis globais", () => {
    test("Compartilha o estado entre chamadas", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            incrementaContador()
            incrementaContador()
            incrementaContador()
            escreva(contador)
          `),
        ),
      ).resolves.toBe("3");
    });
  });
});
