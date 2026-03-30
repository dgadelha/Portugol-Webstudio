import { describe, expect, test } from "vitest";
import { PortugolCodeChecker } from "../../src";
import { portugol } from "../helpers/code";

describe("Checker: Variáveis", () => {
  describe("Casos de sucesso", () => {
    test("Atribuição na declaração", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição na declaração: vetor", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro vetor[5] = { 1, 2, 3, 4, 5 }
            escreva(vetor[2])
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição na declaração: matriz", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro matriz[2][2] = { { 1, 2 }, { 3, 4 } }
            escreva(matriz[1][0])
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição após declaração", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x
            x = 10
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição após declaração: vetor", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro vetor[5]
            vetor = { 1, 2, 3, 4, 5 }
            escreva(vetor[2])
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição após declaração: matriz", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro matriz[2][2]
            matriz = { { 1, 2 }, { 3, 4 } }
            escreva(matriz[1][0])
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável global", () => {
      const code = portugol`
        programa {
          inteiro x = 10

          funcao inicio() {
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável global declarada após uso", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva(x)
          }

          inteiro x = 10
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Parâmetro de função", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva(teste(10))
          }

          funcao inteiro teste(inteiro x) {
            retorne x
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição de valor em parâmetro de função", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10
            escreva(teste(x))
          }

          funcao inteiro teste(inteiro x) {
            x = x + 1
            retorne x
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição e leitura em vetores", () => {
      const code = portugol`
        programa {
          inclua biblioteca Util --> util

          funcao inicio() {
            inteiro vetor[10]

            para (inteiro posicao = 0; posicao < 10; posicao++) {
              vetor[posicao] = util.sorteia(1, 100)
            }

            escreva("Vetor na ordem original:\n")

            para(inteiro posicao = 0; posicao < 10; posicao++) {
              escreva (vetor[posicao], " ")
            }

            escreva("\n\nVetor na ordem inversa:\n")

            para(inteiro posicao = 9; posicao >=0; posicao--) {
              escreva(vetor[posicao], " ")
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Atribuição e leitura em matrizes", () => {
      const code = portugol`
        programa {
          inclua biblioteca Util --> u

          funcao inicio() {
            const inteiro TAMANHO = 5

            inteiro matriz[TAMANHO][TAMANHO]

            para (inteiro linha = 0; linha < TAMANHO; linha++) {
              para (inteiro coluna = 0; coluna < TAMANHO; coluna++) {
                matriz[linha][coluna] = u.sorteia(1, 9)

                escreva("[", matriz[linha][coluna], "]")
              }

              escreva("\n")
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável em escopo aninhado: se", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10

            se (x > 5) {
              escreva(x)
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável em escopo aninhado: para", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10

            para (inteiro i = 0; i < x; i++) {
              escreva(i, " ")
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável global em escopo aninhado: para", () => {
      const code = portugol`
        programa {
          inteiro x = 10

          funcao inicio() {
            para (inteiro i = 0; i < x; i++) {
              escreva(i, " ")
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Uso de variável global em escopo aninhado: se", () => {
      const code = portugol`
        programa {
          inteiro x = 10

          funcao inicio() {
            se (x > 5) {
              escreva(x)
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });

    test("Preenchimento de matriz em variável por referência", () => {
      const code = portugol`
        programa {
          inclua biblioteca Util --> u

          funcao inicio() {
            const inteiro TAMANHO = 5

            caracter matriz[TAMANHO][TAMANHO]

            preenche(matriz)
            exibe(matriz)
          }

          funcao preenche(caracter &matriz[][]) {
            para (inteiro linha = 0; linha < u.numero_linhas(matriz); linha++) {
              para (inteiro coluna = 0; coluna < u.numero_colunas(matriz); coluna++) {
                se (linha == coluna) {
                  matriz[linha][coluna] = '*'
                } senao {
                  matriz[linha][coluna] = ' '
                }
              }
            }
          }

          funcao exibe(caracter matriz[][]) {
            para (inteiro linha = 0; linha < u.numero_linhas(matriz); linha++) {
              para (inteiro coluna = 0; coluna < u.numero_colunas(matriz); coluna++) {
                escreva("[", matriz[linha][coluna], "]")
              }

              escreva("\n")
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Casos de erro", () => {
    test("Variável não declarada", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:12/3:12 E: Variável não declarada: x,
        ]
      `);
    });

    test("Variável declarada após uso", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva(x)
            inteiro x
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:12/3:12 E: Variável não declarada: x,
          4:12/4:12 W: A variável 'x' é declarada, mas não é utilizada,
        ]
      `);
    });
  });
});
