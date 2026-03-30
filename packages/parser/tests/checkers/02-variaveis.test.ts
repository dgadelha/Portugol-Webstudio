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

    test("Atribuição através da função leia", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x
            leia(x)
            escreva(x)
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

  describe("Casos de alerta", () => {
    test("Variável declarada mas nunca utilizada", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:12/3:12 W: A variável 'x' é declarada, mas não é utilizada,
        ]
      `);
    });

    test("Variável atribuída mas nunca lida", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:12/3:16 W: A variável 'x' é atribuída, mas nunca é lida,
        ]
      `);
    });

    test("Variável lida sem ter sido atribuída", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:12/3:12 W: A variável 'x' é lida, mas nunca recebe um valor,
        ]
      `);
    });

    test("Parâmetro de função não utilizado", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            teste(10)
          }

          funcao teste(inteiro param) {
            escreva("teste")
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          6:15/6:23 W: A variável 'param' é atribuída, mas nunca é lida,
        ]
      `);
    });

    test("Variável global não utilizada", () => {
      const code = portugol`
        programa {
          inteiro global

          funcao inicio() {
            escreva("teste")
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          2:10/2:15 W: A variável 'global' é declarada, mas não é utilizada,
        ]
      `);
    });

    test("Variável em escopo aninhado não utilizada", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            se (verdadeiro) {
              inteiro x = 10
            }
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          4:14/4:18 W: A variável 'x' é atribuída, mas nunca é lida,
        ]
      `);
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

    test("Redeclaração de variável no mesmo escopo", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x = 10
            inteiro x = 20
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          4:12/4:16 E: Redeclaração de variável 'x' no mesmo escopo,
        ]
      `);
    });

    test("Atribuição de tipo incompatível", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            inteiro x
            x = "texto"
            escreva(x)
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          4:4/4:8 E: Não é possível atribuir um valor do tipo 'cadeia' a uma variável do tipo 'inteiro',
        ]
      `);
    });

    test("Função não declarada", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            teste()
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:4/3:10 E: Função não declarada: teste,
        ]
      `);
    });

    test("Redeclaração de função", () => {
      const code = portugol`
        programa {
          funcao inteiro teste() {
            retorne 1
          }

          funcao inteiro teste() {
            retorne 2
          }

          funcao inicio() {
            escreva(teste())
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          6:2/8:2 E: Redeclaração de função 'teste',
        ]
      `);
    });

    test("Chamada de função sem argumentos", () => {
      const code = portugol`
        programa {
          funcao inteiro soma(inteiro a, inteiro b) {
            retorne a + b
          }

          funcao inicio() {
            escreva(soma())
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          7:12/7:17 E: A função 'soma' deve receber argumentos,
          7:12/7:17 E: 1º argumento 'a' do tipo 'inteiro' ausente na chamada da função 'soma',
          7:12/7:17 E: 2º argumento 'b' do tipo 'inteiro' ausente na chamada da função 'soma',
        ]
      `);
    });

    test("Chamada de função com argumentos insuficientes", () => {
      const code = portugol`
        programa {
          funcao inteiro soma(inteiro a, inteiro b) {
            retorne a + b
          }

          funcao inicio() {
            escreva(soma(10))
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          7:12/7:19 E: A função 'soma' espera receber 2 argumentos, mas recebeu 1,
          7:12/7:19 E: 2º argumento 'b' do tipo 'inteiro' ausente na chamada da função 'soma',
        ]
      `);
    });

    test("Chamada de função com argumentos em excesso", () => {
      const code = portugol`
        programa {
          funcao inteiro soma(inteiro a, inteiro b) {
            retorne a + b
          }

          funcao inicio() {
            escreva(soma(10, 20, 30))
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          7:12/7:27 E: A função 'soma' espera receber 2 argumentos, mas recebeu 3,
        ]
      `);
    });

    test("Chamada de função com argumentos quando não esperados", () => {
      const code = portugol`
        programa {
          funcao inteiro teste() {
            retorne 2
          }

          funcao inicio() {
            escreva(teste(3))
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          7:12/7:19 E: A função 'teste' não deve receber argumentos,
        ]
      `);
    });

    test("Chamada de função com tipo de argumento incompatível", () => {
      const code = portugol`
        programa {
          funcao inteiro dobro(inteiro x) {
            retorne x * 2
          }

          funcao inicio() {
            escreva(dobro("texto"))
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          7:18/7:24 E: Não é possível passar um valor do tipo 'cadeia' para o parâmetro 'x' do tipo 'inteiro' na função 'dobro',
        ]
      `);
    });

    test("Retorno de tipo incompatível", () => {
      const code = portugol`
        programa {
          funcao inteiro teste() {
            retorne "texto"
          }

          funcao inicio() {
            escreva(teste())
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          3:4/3:12 E: Não é possível retornar um valor do tipo 'cadeia' em uma função que retorna 'inteiro',
        ]
      `);
    });

    test("Redeclaração de parâmetro em função", () => {
      const code = portugol`
        programa {
          funcao inteiro teste(inteiro x, inteiro x) {
            retorne x
          }

          funcao inicio() {
            escreva(teste(1, 2))
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          2:34/2:42 E: Redeclaração de parâmetro 'x' na função 'teste',
        ]
      `);
    });
  });
});
