import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Concatenação", () => {
  describe("Operador +", () => {
    test("Concatena cadeias", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("a" + "b" + "c")
          `,
        ),
      ).resolves.toBe("abc");
    });

    test("Concatena cadeia com inteiro", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("n=" + 5, "|", 5 + "x")
          `,
        ),
      ).resolves.toBe("n=5|5x");
    });

    test("Concatena cadeia com real", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("r=" + 1.0, "|", 1.5 + "x", "|", 1000000.0 + "|" + 12345678.0)
          `,
        ),
      ).resolves.toBe("r=1.0|1.5x|1000000.0|1.2345678E7");
    });

    test("Concatena cadeia com caracter", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('c' + "x", "|", "x" + 'c')
          `,
        ),
      ).resolves.toBe("cx|xc");
    });

    test("Concatena valores lógicos como true e false", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("l=" + verdadeiro, "|", falso + "x", "|", "" + verdadeiro + falso)
          `,
        ),
      ).resolves.toBe("l=true|falsex|truefalse");
    });

    test("Avalia da esquerda para a direita", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("a" + 1 + 2, "|", 1 + 2 + "a", "|", "x" + (1 + 2))
          `,
        ),
      ).resolves.toBe("a12|3a|x3");
    });

    test("Concatena variáveis de todos os tipos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia s = "v"
            logico l = falso
            real r = 2.0
            inteiro i = 3
            caracter c = 'z'
            escreva(s + l + r + i + c)
          `,
        ),
      ).resolves.toBe("vfalse2.03z");
    });

    test("Acumula em laço", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia s = ""
            inteiro i
            para (i = 0; i < 5; i++) {
              s = s + i + ","
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("0,1,2,3,4,");
    });

    test("Concatena elementos de vetor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[2] = {1, 2}
            escreva("v=" + v[0] + v[1])
          `,
        ),
      ).resolves.toBe("v=12");
    });
  });

  describe("Soma de caracteres", () => {
    test("Soma os códigos de dois caracteres", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('a' + 'b')
          `,
        ),
      ).resolves.toBe("195");
    });

    test("Soma os códigos de três caracteres", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('a' + 'b' + 'c')
          `,
        ),
      ).resolves.toBe("294");
    });

    test("Concatena quando há uma cadeia na expressão", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva("" + 'a' + 'b')
          `,
        ),
      ).resolves.toBe("ab");
    });

    test("Soma códigos de letras maiúsculas e dígitos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva('A' + 'B', "|", '0' + '0')
          `,
        ),
      ).resolves.toBe("131|96");
    });
  });
});
