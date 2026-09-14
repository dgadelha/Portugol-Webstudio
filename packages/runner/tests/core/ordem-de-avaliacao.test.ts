import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

// Ler uma variável no Java copia o valor, então cada leitura fica com o valor
// que a variável tinha naquele instante — o que vier depois na mesma expressão
// não muda o que já foi lido
const AUXILIARES = portugol`
  funcao inteiro incrementa(inteiro &x) {
    x = x + 1
    retorne x
  }

  funcao cadeia concatena(cadeia &s) {
    s = s + "b"
    retorne s
  }

  funcao troca(inteiro &p, inteiro q) {
    p = q
  }
`;

function programa(corpo: string) {
  return `programa {\n  funcao inicio() {\n${corpo
    .split("\n")
    .map(linha => (linha ? `    ${linha}` : linha))
    .join("\n")}\n  }\n\n${AUXILIARES}\n}\n`;
}

describe("Ordem de Avaliação", () => {
  describe("Argumentos", () => {
    test("Imprime o valor anterior ao incremento pré-fixado", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r = 5.1
            escreva("++r = ++", r, " = ", ++r)
          `),
        ),
      ).resolves.toBe("++r = ++5.1 = 6.1");
    });

    test("Imprime o valor anterior ao incremento pós-fixado", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            real r = 5.1
            escreva("r++ = ", r, " = ", r++)
          `),
        ),
      ).resolves.toBe("r++ = 5.1 = 6.1");
    });

    test("Cada incremento imprime o seu próprio valor", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a = 5
            escreva(a++, "|", a++, "|", a)
          `),
        ),
      ).resolves.toBe("6|7|7");
    });

    test("Imprime o elemento do vetor anterior ao incremento", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro v[3] = {1, 2, 3}
            escreva(v[0], "|", v[0]++, "|", v[0])
          `),
        ),
      ).resolves.toBe("1|2|2");
    });

    test("Imprime o elemento da matriz anterior ao incremento", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro m[2][2] = {{1, 2}, {3, 4}}
            escreva(m[0][0], "|", m[0][0]++, "|", m[0][0])
          `),
        ),
      ).resolves.toBe("1|2|2");
    });

    test("Imprime o valor anterior à alteração por referência", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a = 5
            escreva(a, "|", incrementa(a), "|", a)
          `),
        ),
      ).resolves.toBe("5|6|6");
    });

    test("Imprime a cadeia anterior à alteração por referência", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            cadeia t = "a"
            escreva(t, "|", concatena(t), "|", t)
          `),
        ),
      ).resolves.toBe("a|ab|ab");
    });
  });

  describe("Operações", () => {
    test("A soma usa o valor lido antes da chamada", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a = 5
            inteiro s = a + incrementa(a)
            escreva("s=", s, " a=", a)
          `),
        ),
      ).resolves.toBe("s=11 a=6");
    });

    test("A atribuição composta usa o valor lido antes da chamada", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro b = 5
            b += incrementa(b)
            escreva(b)
          `),
        ),
      ).resolves.toBe("11");
    });

    test("A comparação usa o valor lido antes da chamada", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro c = 5
            escreva(c < incrementa(c), "|", c)
          `),
        ),
      ).resolves.toBe("verdadeiro|6");
    });

    test("A concatenação usa o valor lido antes da chamada", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            cadeia t = "a"
            escreva(t + concatena(t))
          `),
        ),
      ).resolves.toBe("aab");
    });
  });

  describe("Inicialização de vetores", () => {
    test("Copia o valor da variável em cada elemento", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a = 5
            inteiro v[2] = {a, a}
            v[0] = 9
            escreva("a=", a, " v0=", v[0], " v1=", v[1])
          `),
        ),
      ).resolves.toBe("a=5 v0=9 v1=5");
    });

    test("Copia o valor da variável em cada linha da matriz", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a = 5
            inteiro m[2][2] = {{a, a}, {a, a}}
            m[0][0] = 9
            escreva("a=", a, " m=", m[0][0], m[0][1], m[1][0], m[1][1])
          `),
        ),
      ).resolves.toBe("a=5 m=9555");
    });
  });

  describe("Passagem por referência", () => {
    test("Continua ligada à variável quando outro argumento altera o estado", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro b = 1, c = 10
            troca(b, incrementa(c))
            escreva("b=", b, " c=", c)
          `),
        ),
      ).resolves.toBe("b=11 c=11");
    });

    test("O leia continua escrevendo na variável", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro a
            leia(a)
            escreva(a + 1)
          `),
          ["41"],
        ),
      ).resolves.toBe("42");
    });

    test("O leia continua escrevendo no elemento do vetor", async () => {
      await expect(
        runPortugolCode(
          programa(portugol`
            inteiro v[2]
            leia(v[1])
            escreva(v[0], "|", v[1])
          `),
          ["7"],
        ),
      ).resolves.toBe("0|7");
    });
  });
});
