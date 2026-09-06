import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Programas Completos", () => {
  describe("Algoritmos numéricos", () => {
    test("Lista os números primos até 30", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro n, j, ehPrimo
                para (n = 2; n <= 30; n++) {
                  ehPrimo = 1

                  para (j = 2; j < n; j++) {
                    se (n % j == 0) {
                      ehPrimo = 0
                      pare
                    }
                  }

                  se (ehPrimo == 1) {
                    escreva(n, " ")
                  }
                }
              }
            }
          `,
        ),
      ).resolves.toBe("2 3 5 7 11 13 17 19 23 29 ");
    });

    test("Calcula o fatorial dentro da faixa de 32 bits", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro i, f = 1
                para (i = 1; i <= 12; i++) {
                  f = f * i
                }
                escreva(f)
              }
            }
          `,
        ),
      ).resolves.toBe("479001600");
    });

    test("Calcula a sequência de Fibonacci", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro i, a = 0, b = 1, t
                para (i = 0; i < 15; i++) {
                  escreva(a, " ")
                  t = a + b
                  a = b
                  b = t
                }
              }
            }
          `,
        ),
      ).resolves.toBe("0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 ");
    });

    test("Calcula o máximo divisor comum", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro a = 1071, b = 462, t
                enquanto (b != 0) {
                  t = b
                  b = a % b
                  a = t
                }
                escreva(a)
              }
            }
          `,
        ),
      ).resolves.toBe("21");
    });

    test("Converte um número para binário", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro n = 42
                cadeia r = ""
                enquanto (n > 0) {
                  r = "" + n % 2 + r
                  n = n / 2
                }
                escreva(r, "|", Tipos.inteiro_para_cadeia(42, 2))
              }
            }
          `,
        ),
      ).resolves.toBe("101010|00000000000000000000000000101010");
    });

    test("Soma os dígitos de um número", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro n = 98765, s = 0
                enquanto (n > 0) {
                  s = s + n % 10
                  n = n / 10
                }
                escreva(s)
              }
            }
          `,
        ),
      ).resolves.toBe("35");
    });
  });

  describe("Vetores e matrizes", () => {
    test("Calcula média, maior e menor de um vetor", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                real notas[5] = {7.5, 8.0, 6.25, 9.0, 5.5}, s = 0.0, maior, menor
                inteiro i
                maior = notas[0]
                menor = notas[0]
                para (i = 0; i < 5; i++) {
                  s = s + notas[i]
                  maior = Matematica.maior_numero(maior, notas[i])
                  menor = Matematica.menor_numero(menor, notas[i])
                }
                escreva("media=", s / 5.0, " maior=", maior, " menor=", menor)
              }
            }
          `,
        ),
      ).resolves.toBe("media=7.25 maior=9.0 menor=5.5");
    });

    test("Ordena um vetor por seleção", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[6] = {64, 25, 12, 22, 11, 90}, i, j, menor, t
                para (i = 0; i < 5; i++) {
                  menor = i

                  para (j = i + 1; j < 6; j++) {
                    se (v[j] < v[menor]) {
                      menor = j
                    }
                  }

                  t = v[i]
                  v[i] = v[menor]
                  v[menor] = t
                }
                para (i = 0; i < 6; i++) {
                  escreva(v[i], " ")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("11 12 22 25 64 90 ");
    });

    test("Busca um valor no vetor", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[5] = {10, 20, 30, 40, 50}, i, achou = 0 - 1
                para (i = 0; i < 5; i++) {
                  se (v[i] == 30) {
                    achou = i
                    pare
                  }
                }
                escreva(achou)
              }
            }
          `,
        ),
      ).resolves.toBe("2");
    });

    test("Multiplica duas matrizes", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro a[2][2] = {{1, 2}, {3, 4}}, b[2][2] = {{5, 6}, {7, 8}}, c[2][2]
                inteiro i, j, k
                para (i = 0; i < 2; i++) {
                  para (j = 0; j < 2; j++) {
                    c[i][j] = 0

                    para (k = 0; k < 2; k++) {
                      c[i][j] = c[i][j] + a[i][k] * b[k][j]
                    }
                  }
                }
                escreva(c[0][0], " ", c[0][1], " ", c[1][0], " ", c[1][1])
              }
            }
          `,
        ),
      ).resolves.toBe("19 22 43 50");
    });

    test("Transpõe uma matriz", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro m[2][3] = {{1, 2, 3}, {4, 5, 6}}, t[3][2], i, j
                para (i = 0; i < 2; i++) {
                  para (j = 0; j < 3; j++) {
                    t[j][i] = m[i][j]
                  }
                }
                para (i = 0; i < 3; i++) {
                  para (j = 0; j < 2; j++) {
                    escreva(t[i][j], " ")
                  }
                }
              }
            }
          `,
        ),
      ).resolves.toBe("1 4 2 5 3 6 ");
    });
  });

  describe("Texto", () => {
    test("Verifica se uma palavra é palíndromo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                cadeia s = "arara"
                inteiro i, n = Texto.numero_caracteres(s), ehPalindromo = 1
                para (i = 0; i < n / 2; i++) {
                  se (Texto.obter_caracter(s, i) != Texto.obter_caracter(s, n - 1 - i)) {
                    ehPalindromo = 0
                    pare
                  }
                }
                escreva(ehPalindromo)
              }
            }
          `,
        ),
      ).resolves.toBe("1");
    });

    test("Conta vogais de uma frase", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                cadeia s = "portugol webstudio"
                inteiro i, c = 0
                caracter atual
                para (i = 0; i < Texto.numero_caracteres(s); i++) {
                  atual = Texto.obter_caracter(s, i)

                  se (atual == 'a' ou atual == 'e' ou atual == 'i' ou atual == 'o' ou atual == 'u') {
                    c++
                  }
                }
                escreva(c)
              }
            }
          `,
        ),
      ).resolves.toBe("7");
    });

    test("Monta uma tabela com preenchimento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro i
                para (i = 1; i <= 5; i++) {
                  escreva(Texto.preencher_a_esquerda(' ', 4, "" + i * i), "|")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("   1|   4|   9|  16|  25|");
    });
  });

  describe("Interação com o usuário", () => {
    test("Calcula a média de notas digitadas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                real nota, s = 0.0
                inteiro i
                para (i = 0; i < 3; i++) {
                  leia(nota)
                  s = s + nota
                }
                escreva("Media: ", Matematica.arredondar(s / 3.0, 2))
              }
            }
          `,
          ["7.5", "8.0", "9.25"],
        ),
      ).resolves.toBe("Media: 8.25");
    });

    test("Classifica um número digitado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro n
                leia(n)
                se (n % 2 == 0) {
                  escreva(n, " e par")
                } senao {
                  escreva(n, " e impar")
                }
              }
            }
          `,
          ["7"],
        ),
      ).resolves.toBe("7 e impar");
    });

    test("Faz uma tabuada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica
              inclua biblioteca Texto
              inclua biblioteca Tipos
              inclua biblioteca Util

              funcao inicio() {
                inteiro n, i
                leia(n)
                para (i = 1; i <= 10; i++) {
                  escreva(n, " x ", i, " = ", n * i, "\\n")
                }
              }
            }
          `,
          ["7"],
        ),
      ).resolves.toBe(
        "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70\n",
      );
    });
  });
});
