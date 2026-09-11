import { describe, expect, test } from "vitest";

import { analisar, analisarComAvisosDeUso } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * Estes avisos são só nossos: o Portugol Studio não emite nada disso. Por isso a severidade
 * é `Information` e a opção `avisosDeUso` desliga o grupo inteiro.
 */
describe("Avisos de uso (#15)", () => {
  test("declarada e não usada, só escrita, só lida", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          inteiro global

          funcao inicio() {
            inteiro naoUsada
            inteiro soEscrita = 10
            inteiro soLida
            escreva(soLida)
            teste(1)
          }

          funcao teste(inteiro param) {
            escreva("teste")
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        8:12/8:17 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "soLida" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro soLida = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(soLida),
        5:12/5:19 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'naoUsada' é declarada, mas não é utilizada,
        6:12/6:20 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'soEscrita' é atribuída, mas nunca é lida,
        7:12/7:17 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'soLida' é lida, mas nunca recebe um valor,
        12:23/12:27 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'param' é atribuída, mas nunca é lida,
        2:10/2:15 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'global' é declarada, mas não é utilizada,
      ]
    `);
  });

  test("escopo aninhado é conferido ao ser desempilhado", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            se (verdadeiro) {
              inteiro x = 10
            }
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:14/4:14 I [InfoWebstudio.SimboloNaoUtilizado]: A variável 'x' é atribuída, mas nunca é lida,
      ]
    `);
  });

  test("variável lida e escrita não gera aviso", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro x = 10
            escreva(x)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("parâmetro por referência conta como lido e escrito", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro x = 0
            troca(x)
            escreva(x)
          }
          funcao troca(inteiro &v) { v = 2 }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("índices de uma atribuição a vetor contam como leitura", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro v[2]
            inteiro i = 0
            v[i] = 1
            escreva(v[0])
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("leia conta como escrita", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro x
            leia(x)
            escreva(x)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("avisosDeUso: false desliga o grupo", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          inteiro naoUsada
        }
      }
    `;

    expect(analisarComAvisosDeUso(código)).toHaveLength(1);
    expect(analisar(código, { avisosDeUso: false })).toMatchInlineSnapshot(`[]`);
  });

  test("vetor e matriz passados a uma função contam como escritos", () => {
    // O Portugol passa vetor e matriz por referência mesmo sem `&`, então a função que os
    // recebe pode preenchê-los — não faz sentido dizer que "nunca recebem um valor".
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro v[3]
            preencher(v)
            escreva(v[0])
          }
          funcao preencher(inteiro alvo[]) { alvo[0] = 1 }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("o substantivo acompanha a classe do símbolo", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          const inteiro K = 1
          inteiro v[2]
          inteiro m[2][2]
          funcao inicio() { escreva("oi") }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:16/2:16 I [InfoWebstudio.SimboloNaoUtilizado]: A constante 'K' é declarada, mas não é utilizada,
        3:10/3:10 I [InfoWebstudio.SimboloNaoUtilizado]: O vetor 'v' é declarado, mas não é utilizado,
        4:10/4:10 I [InfoWebstudio.SimboloNaoUtilizado]: A matriz 'm' é declarada, mas não é utilizada,
      ]
    `);
  });

  test("símbolo recusado por redeclaração não rende aviso de uso", () => {
    expect(
      analisarComAvisosDeUso(portugol`
        programa {
          funcao inicio() {
            inteiro x = 1
            inteiro x = 2
            escreva(x)
          }
        }
      `).map(diagnóstico => diagnóstico.code),
    ).toMatchInlineSnapshot(`
      [
        "ErroSemantico.ErroSimboloRedeclarado.3",
      ]
    `);
  });
});
