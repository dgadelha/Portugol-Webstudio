import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * A árvore do Portugol Studio não tem nó de parênteses: toda checagem enxerga através deles.
 * Na nossa, `ExpressãoEntreParênteses` é um nó, e cada checagem que olha a forma de uma
 * expressão precisa desembrulhá-lo. Os programas abaixo passam no Portugol Studio.
 */
describe("Parênteses não mudam o que a expressão é", () => {
  test("alvo de atribuição entre parênteses", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro x
            inteiro v[2]
            (x) = 1
            escreva(x)
            (v[0]) = 2
            ((x)) += 1
            escreva(v[0])
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("constante entre parênteses continua sendo constante", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            const inteiro K = 1
            (K) = 2
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:5/4:5 E [ErroSemantico.ErroAtribuirEmConstante.3]: "K" é uma constante, e portanto, não pode ter seu valor alterado após a inicialização,
      ]
    `);
  });

  test("argumento entre parênteses para parâmetro por referência e para leia", () => {
    expect(
      analisar(portugol`
        programa {
          funcao g(inteiro &a) {
            a = 1
          }

          funcao h(inteiro &v[]) {
            v[0] = 1
          }

          funcao inicio() {
            inteiro x = 0
            inteiro vv[2]
            g((x))
            g(((x)))
            h((vv))
            leia((x))
            leia((vv[0]))
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("vetor e matriz entre parênteses como argumento", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Util --> u

          funcao inteiro s(inteiro v[]) {
            retorne v[0]
          }

          funcao inicio() {
            inteiro vv[2] = {1, 2}
            inteiro mm[2][2]
            escreva(s((vv)), u.numero_elementos((vv)), u.numero_linhas((mm)))
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("literal entre parênteses inicializa uma constante", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro A = (3)
          const inteiro B = -(3)
          const cadeia C = ("a")
          const inteiro D[2] = {(1), 2}
          const inteiro F = (-3)
          const inteiro M[1][2] = {{(1), 2}}

          funcao inicio() {
            escreva(A, B, C, D[0], F, M[0][0])
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        7:16/7:16 W [AvisoSemantico.AvisoMatrizPodeSerVetor]: A matriz M tem tamanho [1][2] e pode ser substituida por um vetor de tamanho [2],
      ]
    `);
  });

  test("expressão entre parênteses continua não sendo um valor", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro A = (1 + 2)

          funcao inicio() {
            inteiro x = 1
            (x + 1) = 2
            escreva(A)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:20/2:26 E [ErroSemantico.ErroInicializacaoConstante.1]: A constante "A" deve ser inicializada com um valor ao invés de uma expressão,
        6:4/6:14 E [ErroSemantico.ErroOperacaoComExpressaoConstante.3]: Não é possível realizar uma atribuição à uma expressão. Você só pode realizar atribuições à variáveis, vetores ou matrizes que não tenham sido declarados como constantes. Se você estiver tentando comparar a igualdade de duas expressões, utilize o operador '==' ao invés do operador '=',
      ]
    `);
  });
});
