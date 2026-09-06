import { describe, expect, test } from "vitest";
import { portugol, portugolInicio } from "../helpers/code";
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
      ).resolves.toBe("7.0");
    });
  });

  describe("escreva (casos limite)", () => {
    test("Imprime cadeia vazia", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("")
            escreva("|")
          `,
        ),
      ).resolves.toBe("|");
    });

    test("Imprime em chamadas separadas", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1)
            escreva(2)
            escreva(3)
          `,
        ),
      ).resolves.toBe("123");
    });

    test("Imprime caracteres de escape", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("a\\tb|", "asp\\"as|", "barra\\\\|", "a\\nb")
          `,
        ),
      ).resolves.toBe('a\tb|asp"as|barra\\|a\nb');
    });

    test("Imprime acentuação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("acentuação çãõ ê")
          `,
        ),
      ).resolves.toBe("acentuação çãõ ê");
    });

    test("Imprime muitos valores em laço", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 0; i < 20; i++) {
              escreva(i, ",")
            }
          `,
        ),
      ).resolves.toBe("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,");
    });

    test("Imprime elementos de vetores e matrizes", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[3] = {1, 2, 3}
            inteiro m[2][2] = {{1, 2}, {3, 4}}
            escreva(v[0], v[2], "|", m[0][1], m[1][0])
          `,
        ),
      ).resolves.toBe("13|23");
    });
  });

  describe("leia (casos limite)", () => {
    test("Lê inteiro zero e negativo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a, b
            leia(a)
            leia(b)
            escreva(a, "|", b)
          `,
          ["0", "-42"],
        ),
      ).resolves.toBe("0|-42");
    });

    test("Lê real negativo e com zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real a, b
            leia(a)
            leia(b)
            escreva(a, "|", b)
          `,
          ["-2.5", "0.5"],
        ),
      ).resolves.toBe("-2.5|0.5");
    });

    test("Lê valor lógico falso", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            logico l
            leia(l)
            escreva(l)
          `,
          ["falso"],
        ),
      ).resolves.toBe("falso");
    });

    test("Lê cadeia com espaços", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia s
            leia(s)
            escreva("[", s, "]")
          `,
          ["  com espacos  "],
        ),
      ).resolves.toBe("[  com espacos  ]");
    });

    test("Lê cadeia formada por dígitos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia s
            leia(s)
            escreva("[", s, "]")
          `,
          ["123"],
        ),
      ).resolves.toBe("[123]");
    });

    test("Lê tipos diferentes intercalados", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a
            cadeia s
            real r
            leia(a)
            leia(s)
            leia(r)
            escreva(a, "|", s, "|", r)
          `,
          ["1", "dois", "3.5"],
        ),
      ).resolves.toBe("1|dois|3.5");
    });

    test("Acumula valores lidos em laço", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro n, i, s = 0
            para (i = 0; i < 3; i++) {
              leia(n)
              s = s + n
            }
            escreva(s)
          `,
          ["1", "2", "3"],
        ),
      ).resolves.toBe("6");
    });

    test("Lê para dentro de um vetor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[2], i
            para (i = 0; i < 2; i++) {
              leia(v[i])
            }
            escreva(v[0] + v[1])
          `,
          ["3", "4"],
        ),
      ).resolves.toBe("7");
    });
  });

  describe("leia (zero negativo)", () => {
    test("Lê -0 como zero positivo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                inteiro z
                leia(z)
                escreva(z, "|", Tipos.inteiro_para_real(z))
              }
            }
          `,
          ["-0"],
        ),
      ).resolves.toBe("0|0.0");
    });
  });
});
