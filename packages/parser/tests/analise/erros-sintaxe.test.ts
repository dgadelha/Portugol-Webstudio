import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { portugol } from "../helpers/code";

/**
 * O erro de sintaxe vira um sublinhado vermelho no editor. Ele já pegou do início do arquivo
 * até a linha 9999 (o programa inteiro em vermelho) e a pessoa não achava onde estava o erro.
 */
function errosDeSintaxe(código: string) {
  const resultado = PortugolCodeChecker.checkCode(código);

  return resultado.parseErrors.map(({ code, endCol, endLine, message, startCol, startLine }) => {
    return {
      code,
      message,
      startLine,
      startCol,
      endLine,
      endCol,
    };
  });
}

describe("erros de sintaxe marcam só o token onde o código quebrou", () => {
  test("vírgula sobrando no fim de uma chamada (#468)", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          inteiro i = 1
          se (i == 1) {
            escreva("a"),
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)).toEqual([
      {
        code: "ErroSintatico.ErroExpressaoInesperada",
        message: "A expressão ',' não era esperada neste local, remova a expressão para corrigir o problema",
        startLine: 5,
        startCol: 18,
        endLine: 5,
        endCol: 18,
      },
    ]);
  });

  test("no fim do arquivo, marca o último token, e não uma linha vazia depois dele", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          se (verdadeiro) {
            escreva("a")
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([{ startLine: 6, startCol: 0, endLine: 6, endCol: 0 }]);
  });

  test("só o primeiro erro é reportado, e sem análise semântica", () => {
    const resultado = PortugolCodeChecker.checkCode(portugol`
      programa {
        funcao inicio() {
          escreva(x),
          inteiro y = (1
        }
      }
    `);

    expect(resultado.parseErrors.map(erro => erro.startLine)).toEqual([3]);
    expect(resultado.diagnostics).toEqual([]);
  });
});

/**
 * Posição e código conferidos com o Portugol Studio (`tools/oracle/run.sh`). As exceções
 * são as divergências documentadas no `AnalisadorSintático`: o Java marca 1:1 o código fora
 * do programa e a linha depois do fim do arquivo, e às vezes sai com o código vazio.
 */
describe("o erro escolhido é o mesmo do Portugol Studio", () => {
  test.each([
    [
      "vírgula na declaração",
      portugol`
        programa {
          funcao inicio() {
            real x = 2,5
          }
        }
      `,
      [3, 15, "ErroSintatico.ErroNomeSimboloEstaFaltando.3"],
    ],
    [
      "real com vírgula no retorne",
      portugol`
        programa {
          funcao real f() {
            retorne 2,5
          }
          funcao inicio() {
          }
        }
      `,
      [3, 13, "ErroSintatico.ErroExpressaoIncompleta"],
    ],
    [
      "parêntese que não foi fechado",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = (1 + 2
            escreva(x)
          }
        }
      `,
      [4, 4, "ErroSintatico.ErroParentesis.2"],
    ],
    [
      "parêntese que não foi aberto",
      portugol`
        programa {
          funcao inicio() {
            se 1 == 1) {
            }
          }
        }
      `,
      [3, 7, "ErroSintatico.ErroParentesis.1"],
    ],
    [
      "chave da função que não foi fechada",
      portugol`
        programa {
          funcao inicio() {
            escreva("a")

          funcao outra() {
          }
        }
      `,
      [5, 2, "ErroSintatico.ErroEscopo.2"],
    ],
    [
      "se sem condição",
      portugol`
        programa {
          funcao inicio() {
            se () {
            }
          }
        }
      `,
      [3, 8, "ErroSintatico.ErroExpressaoEsperada.4"],
    ],
    [
      "elemento faltando na matriz",
      portugol`
        programa {
          funcao inicio() {
            inteiro m[][] = {{1, }, {2, 3}}
          }
        }
      `,
      [3, 25, "ErroSintatico.ErroExpressaoEsperada.3"],
    ],
    [
      "argumento vazio",
      portugol`
        programa {
          funcao inicio() {
            escreva(1, )
          }
        }
      `,
      [3, 15, "ErroSintatico.ErroExpressaoEsperada.8"],
    ],
    [
      "variável sem nome",
      portugol`
        programa {
          funcao inicio() {
            inteiro = 5
          }
        }
      `,
      [3, 12, "ErroSintatico.ErroNomeSimboloEstaFaltando.3"],
    ],
    [
      "função sem nome",
      portugol`
        programa {
          funcao () {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 9, "ErroSintatico.ErroNomeSimboloEstaFaltando.2"],
    ],
    [
      "parâmetros sem tipo",
      portugol`
        programa {
          funcao f(a, b) {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 11, "ErroSintatico.ErroParametrosNaoTipados"],
    ],
    [
      "colchetes no tipo do vetor",
      portugol`
        programa {
          funcao inicio() {
            inteiro[] a = {1, 2}
          }
        }
      `,
      [3, 11, "ErroSintatico.ErroExpressaoIncompleta"],
    ],
    [
      "função que retorna vetor",
      portugol`
        programa {
          funcao inteiro[] f() {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 16, "ErroSintatico.ErroRetornoVetorMatriz"],
    ],
    [
      "para sem condição",
      portugol`
        programa {
          funcao inicio() {
            para (inteiro i = 0;; i++) {
            }
          }
        }
      `,
      [3, 24, "ErroSintatico.ErroParaEsperaCondicao"],
    ],
    [
      "para com um ponto e vírgula só",
      portugol`
        programa {
          funcao inicio() {
            para (inteiro i = 0; i < 3) {
            }
          }
        }
      `,
      [3, 30, "ErroSintatico.ErroTokenFaltando.3"],
    ],
    [
      "caso sem dois pontos",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1
            escolha (x) {
              caso 1
                escreva("a")
            }
          }
        }
      `,
      [6, 8, "ErroSintatico.ErroFaltaDoisPontos"],
    ],
    [
      "faca sem enquanto",
      portugol`
        programa {
          funcao inicio() {
            faca {
            } (verdadeiro)
          }
        }
      `,
      [4, 6, "ErroSintatico.ErroPalavraReservadaEstaFaltando"],
    ],
    [
      "constante sem tipo",
      portugol`
        programa {
          funcao inicio() {
            const x = 1
          }
        }
      `,
      [3, 10, "ErroSintatico.ErroTipoDeDadoEstaFaltando"],
    ],
    [
      "se sem comando",
      portugol`
        programa {
          funcao inicio() {
            se (verdadeiro)
          }
        }
      `,
      [4, 2, "ErroSintatico.ErroComandoEsperado"],
    ],
    [
      "caractere que não existe na linguagem",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1 @ 2
          }
        }
      `,
      [3, 18, "ErroSintatico.ErroExpressaoInesperada"],
    ],
    [
      "inteiro maior que 32 bits",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 99999999999
          }
        }
      `,
      [3, 16, "ErroSintatico.ErroInteiroForaDoIntervalo"],
    ],
    [
      "código antes do programa",
      portugol`
        inteiro x
        programa {
          funcao inicio() {
          }
        }
      `,
      [1, 0, "ErroSintatico.ErroExpressoesForaEscopoPrograma"],
    ],
    [
      "código depois do programa",
      portugol`
        programa {
          funcao inicio() {
          }
        }
        escreva("x")
      `,
      [5, 0, "ErroSintatico.ErroExpressoesForaEscopoPrograma"],
    ],
  ])("%s", (_nome, código, [linha, coluna, códigoErro]) => {
    expect(errosDeSintaxe(código)).toMatchObject([{ startLine: linha, startCol: coluna, code: códigoErro }]);
  });

  test("a cadeia sem fim é `ErroCadeiaIncompleta`, e não o resto do arquivo", () => {
    // Divergência: o Java mostra `A expressão ''"abc)\n  }\n}\n'' não era esperada`.
    const código = portugol`
      programa {
        funcao inicio() {
          escreva("abc)
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([
      { startLine: 3, startCol: 12, code: "ErroSintatico.ErroCadeiaIncompleta" },
    ]);
  });

  test("o token que falta aparece como símbolo", () => {
    // Divergência: o Java mostra o nome do token na gramática, `'pontovirgula'`.
    const código = portugol`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < 3) {
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)[0]?.message).toBe("A expressão está incompleta, está faltando o token ';'");
  });
});

/**
 * Casos em que a mensagem do Portugol Studio aponta o problema errado; aqui ela foi corrigida.
 */
describe("onde o Portugol Studio erra a mensagem", () => {
  test.each([
    [
      "expressão faltando depois do `=` (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            inteiro x =
          }
        }
      `,
      "ErroSintatico.ErroExpressaoEsperada.8",
      "Era esperada uma expressão",
    ],
    [
      "operador sem o operando da direita (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1 + * 2
          }
        }
      `,
      "ErroSintatico.ErroExpressaoIncompleta",
      "A expressão está incompleta. Verifique se ambos os operandos direito e esquerdo estão presentes.",
    ],
    [
      "escolha sem valor (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            escolha () {
            }
          }
        }
      `,
      "ErroSintatico.ErroExpressaoEsperada.7",
      'O comando "escolha" espera um valor ou uma expressão',
    ],
    [
      "senao solto (o Java diz que falta o nome da função)",
      portugol`
        programa {
          funcao inicio() {
            senao {
            }
          }
        }
      `,
      "ErroSintatico.ErroSenaoInesperado",
      "O token 'senao' não faz sentido neste local.",
    ],
    [
      "comando fora de função (o Java diz que o programa não foi fechado)",
      portugol`
        programa {
          escreva("a")
          funcao inicio() {
          }
        }
      `,
      "ErroSintatico.ErroExpressaoForaEscopoFuncao",
      "A expressão 'escreva' está fora de um escopo de função",
    ],
    [
      "palavra reservada como nome (o Java diz que o nome não foi informado)",
      portugol`
        programa {
          funcao inicio() {
            inteiro se = 1
          }
        }
      `,
      "ErroSintatico.ErroNomeSimboloEstaFaltando.3",
      "'se' é uma palavra reservada da linguagem e não pode ser usada como nome",
    ],
  ])("%s", (_nome, código, códigoErro, trecho) => {
    const [erro] = errosDeSintaxe(código);

    expect(erro?.code).toBe(códigoErro);
    expect(erro?.message).toContain(trecho);
  });

  test("o `(` que falta de verdade continua sendo apontado", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          se 1 == 1) {
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([{ code: "ErroSintatico.ErroParentesis.1" }]);
  });
});
