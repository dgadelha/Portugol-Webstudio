import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * Só três tabelas têm célula de conversão — atribuição, passagem de parâmetro e retorno — e
 * cada contexto tem o seu texto; "truncado" vale quando o valor é `real` e o destino
 * `inteiro`.
 */
describe("Conversão implícita (#17)", () => {
  test("os três contextos", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro i = 0
            real r = 0.0
            i = r
            r = i
            escreva(f(2.5), g(2))
          }
          funcao inteiro f(inteiro n) { retorne n }
          funcao real g(real n) { retorne n }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        5:8/5:8 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
        6:8/6:8 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será automaticamente convertido de "inteiro" para "real",
        7:14/7:16 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão passada para o parâmetro "n" da função "f" será truncado,
        7:22/7:22 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão passada para o parâmetro "n" da função "g" será automaticamente convertido de "inteiro" para "real",
      ]
    `);
  });

  test("na inicialização da declaração", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro i = 1.5
            real r = 1
            escreva(i, r)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:16/3:18 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
        4:13/4:13 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será automaticamente convertido de "inteiro" para "real",
      ]
    `);
  });

  test("literal de vetor e de matriz têm texto próprio", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            real v[2] = {1, 2}
            real m[1][2] = {{1, 2}}
            escreva(v[0], m[0][0])
          }
        }
      `).filter(diagnóstico => diagnóstico.code === "AvisoSemantico.AvisoValorExpressaoSeraConvertido"),
    ).toMatchInlineSnapshot(`
      [
        3:16/3:21 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valores do vetor à direita da atribuição serão automaticamente convertidos de "inteiro" para "real",
        4:19/4:26 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valores da matriz à direita da atribuição serão automaticamente convertidos de "inteiro" para "real",
      ]
    `);
  });

  test("parâmetro por referência não converte: é erro", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro i = 1
            troca(i)
            escreva(i)
          }
          funcao troca(real &v) { v = 2.0 }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:10/4:10 E [ErroSemantico.ErroTipoParametroIncompativel]: Tipos incompatíveis! O parâmetro "v" da função "troca" espera uma expressão do tipo "real", mas foi passada uma expressão do tipo "inteiro",
      ]
    `);
  });

  test("operações binárias não avisam: nenhuma tabela delas tem conversão", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            real r = 1.0 + 1
            escreva(r, 1 * 2.0, 1 - 2.0, 1 / 2.0)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  /**
   * Divergência intencional: em `i += 1.5` o Portugol Studio avisa em `linha -1, coluna -1`
   * (o nó da soma é sintético e não tem posição); nós reportamos numa posição válida.
   */
  test("atribuição composta avisa numa posição válida", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro i = 0
            i += 1.5
            escreva(i)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:9/4:11 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
      ]
    `);
  });
});
