import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Programas válidos", () => {
  // O teste antigo esperava zero diagnóstico aqui só porque olhava apenas `diagnostics`:
  // `{` não é expressão na nossa gramática e o programa nem chega a ser analisado. O
  // Portugol Studio também recusa, como `ErroSintatico.ErroExpressaoInesperada` — a
  // divergência é só de canal.
  test("atribuir literal de vetor fora da declaração é erro sintático", () => {
    const resultado = PortugolCodeChecker.checkCode(portugol`
      programa {
        funcao inicio() {
          inteiro vetor[5]
          vetor = { 1, 2, 3, 4, 5 }
          escreva(vetor[2])
        }
      }
    `);

    expect(resultado.parseErrors.length).toBeGreaterThan(0);
    expect(resultado.diagnostics).toMatchInlineSnapshot(`[]`);
  });

  test("atribuir literal de matriz fora da declaração é erro sintático", () => {
    const resultado = PortugolCodeChecker.checkCode(portugol`
      programa {
        funcao inicio() {
          inteiro matriz[2][2]
          matriz = { { 1, 2 }, { 3, 4 } }
          escreva(matriz[1][0])
        }
      }
    `);

    expect(resultado.parseErrors.length).toBeGreaterThan(0);
    expect(resultado.diagnostics).toMatchInlineSnapshot(`[]`);
  });

  test("atribuir em parâmetro de função", () => {
    expect(
      analisar(portugol`
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
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("preencher e ler um vetor num laço", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Util --> util

          funcao inicio() {
            inteiro vetor[10]

            para (inteiro posicao = 0; posicao < 10; posicao++) {
              vetor[posicao] = util.sorteia(1, 100)
            }

            para (inteiro posicao = 9; posicao >= 0; posicao--) {
              escreva(vetor[posicao], " ")
            }
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("preencher uma matriz com laços aninhados e constante como tamanho", () => {
    expect(
      analisar(portugol`
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
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("passar matriz por referência entre funções", () => {
    expect(
      analisar(portugol`
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
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("recursão", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(fat(5))
          }
          funcao inteiro fat(inteiro n) {
            se (n <= 1) { retorne 1 }
            retorne n * fat(n - 1)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("atribuição como argumento de função", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro x = 0
            escreva(x = 1, x += 2)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });
});
