import { describe, expect, test } from "vitest";
import { portugol, portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Vetores e Matrizes", () => {
  describe("Valores padrão", () => {
    test("Inteiro começa em zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[3]
            escreva(v[0], "|", v[1], "|", v[2])
          `,
        ),
      ).resolves.toBe("0|0|0");
    });

    test("Real começa em zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real v[2]
            escreva(v[0], "|", v[0] + v[1])
          `,
        ),
      ).resolves.toBe("0.0|0.0");
    });

    test("Lógico começa em falso", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            logico v[2]
            se (v[0]) {
              escreva("v")
            } senao {
              escreva("f")
            }
            escreva("|", v[1])
          `,
        ),
      ).resolves.toBe("f|falso");
    });

    test("Caracter começa com o caractere nulo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                caracter v[2]
                escreva(Texto.numero_caracteres("" + v[0]))
              }
            }
          `,
        ),
      ).resolves.toBe("1");
    });

    test("Cadeia começa nula e o escreva a imprime vazia", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia v[2]
            escreva("[", v[0], "]")
          `,
        ),
      ).resolves.toBe("[]");
    });

    test("Cadeia nula vira null ao concatenar", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia v[2]
            escreva("[" + v[0] + v[1] + "]")
          `,
        ),
      ).resolves.toBe("[nullnull]");
    });

    test("Comparação com cadeia nula é assimétrica", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia v[2]
            escreva(v[0] == "", "|", "" == v[0], "|", v[0] != "", "|", "" != v[0])
          `,
        ),
      ).resolves.toBe("verdadeiro|falso|falso|verdadeiro");
    });

    test("Matriz de cadeias também começa nula", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia m[2][2]
            escreva("[" + m[0][0] + "]", "|[", m[1][1], "]")
          `,
        ),
      ).resolves.toBe("[null]|[]");
    });

    test("Cadeia deixa de ser nula depois de atribuída", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            cadeia v[2]
            v[0] = "ok"
            escreva("[" + v[0] + "]", "|[" + v[1] + "]")
          `,
        ),
      ).resolves.toBe("[ok]|[null]");
    });

    test("Matriz de inteiros começa zerada", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro m[2][2]
            escreva(m[0][0], "|", m[1][1])
          `,
        ),
      ).resolves.toBe("0|0");
    });

    test("Soma elementos não inicializados", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[3], i, s = 0
            para (i = 0; i < 3; i++) {
              s = s + v[i]
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("0");
    });
  });

  describe("Declaração", () => {
    test("Atribui e lê por índice", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[3]
            v[0] = 10
            v[1] = 20
            v[2] = 30
            escreva(v[0], "|", v[1], "|", v[2])
          `,
        ),
      ).resolves.toBe("10|20|30");
    });

    test("Inicializa com valores", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[3] = {1, 2, 3}
            escreva(v[0], v[1], v[2])
          `,
        ),
      ).resolves.toBe("123");
    });

    test("Infere o tamanho pela inicialização", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[] = {5, 6, 7}
            escreva(v[0], v[1], v[2])
          `,
        ),
      ).resolves.toBe("567");
    });

    test("Inicializa vetores de cada tipo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real r[3] = {1.0, 2.5, 3.0}
            cadeia c[2] = {"a", "b"}
            logico l[2] = {verdadeiro, falso}
            caracter x[2] = {'a', 'b'}
            escreva(r[1], "|", c[0], c[1], "|", l[0], l[1], "|", x[0], x[1])
          `,
        ),
      ).resolves.toBe("2.5|ab|verdadeirofalso|ab");
    });

    test("Inicializa matriz por linhas", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro m[2][3] = {{1, 2, 3}, {4, 5, 6}}
            escreva(m[0][2], "|", m[1][0], "|", m[1][2])
          `,
        ),
      ).resolves.toBe("3|4|6");
    });

    test("Usa expressões como índice", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[5] = {10, 20, 30, 40, 50}
                inteiro i = 1
                escreva(v[i + 1], "|", v[i * 2], "|", v[Util.numero_elementos(v) - 1])
              }
            }
          `,
        ),
      ).resolves.toBe("30|30|50");
    });

    test("Informa o tamanho pela biblioteca Util", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[7]
                inteiro m[3][5]
                escreva(Util.numero_elementos(v), "|", Util.numero_linhas(m), "|", Util.numero_colunas(m))
              }
            }
          `,
        ),
      ).resolves.toBe("7|3|5");
    });
  });

  describe("Índices inválidos", () => {
    test("Interrompe o programa acima do último índice", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[2]
            escreva("antes ")
            escreva(v[5])
            escreva("depois")
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Interrompe o programa em índice negativo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[2]
            escreva("antes ")
            escreva(v[0 - 1])
            escreva("depois")
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Interrompe o programa fora da matriz", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro m[2][2]
            escreva("antes ")
            escreva(m[3][0])
            escreva("depois")
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Laços", () => {
    test("Preenche e percorre um vetor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[5], i
            para (i = 0; i < 5; i++) {
              v[i] = i * i
            }
            para (i = 0; i < 5; i++) {
              escreva(v[i], " ")
            }
          `,
        ),
      ).resolves.toBe("0 1 4 9 16 ");
    });

    test("Preenche e soma uma matriz", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro m[3][3], i, j, s = 0
            para (i = 0; i < 3; i++) {
              para (j = 0; j < 3; j++) {
                m[i][j] = (i + 1) * (j + 1)
              }
            }
            para (i = 0; i < 3; i++) {
              para (j = 0; j < 3; j++) {
                s = s + m[i][j]
              }
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("36");
    });

    test("Ordena um vetor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro v[5] = {5, 3, 1, 4, 2}, i, j, t
            para (i = 0; i < 5; i++) {
              para (j = 0; j < 4; j++) {
                se (v[j] > v[j + 1]) {
                  t = v[j]
                  v[j] = v[j + 1]
                  v[j + 1] = t
                }
              }
            }
            para (i = 0; i < 5; i++) {
              escreva(v[i])
            }
          `,
        ),
      ).resolves.toBe("12345");
    });

    test("Copia elementos entre vetores", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro a[3] = {1, 2, 3}, b[3], i
            para (i = 0; i < 3; i++) {
              b[i] = a[i]
            }
            b[0] = 99
            escreva(a[0], "|", b[0])
          `,
        ),
      ).resolves.toBe("1|99");
    });
  });
});
