import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Constantes", () => {
  test("constante sem inicialização", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro A
          funcao inicio() { escreva(A) }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:16/2:16 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "A" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro A = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(A),
        3:28/3:28 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "A" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro A = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(A),
      ]
    `);
  });

  test("atribuir em constante", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro B = 1
          funcao inicio() {
            B = 2
            escreva(B)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:4/4:4 E [ErroSemantico.ErroAtribuirEmConstante.3]: "B" é uma constante, e portanto, não pode ter seu valor alterado após a inicialização,
      ]
    `);
  });

  test("incrementar constante", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro A = 1
          funcao inicio() { A++ }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:20/3:20 E [ErroSemantico.ErroAtribuirEmConstante.3]: "A" é uma constante, e portanto, não pode ter seu valor alterado após a inicialização,
      ]
    `);
  });

  test("constante inicializada com expressão", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro B = 1
          const inteiro C = B + 1
          funcao inicio() { escreva(C) }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:20/3:24 E [ErroSemantico.ErroInicializacaoConstante.1]: A constante "C" deve ser inicializada com um valor ao invés de uma expressão,
      ]
    `);
  });

  test("constante inicializada com literal negativo é válida", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro D = -1
          funcao inicio() { escreva(D) }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("vetor constante com elemento que não é literal", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro B = 1
          const inteiro W[2] = {B, 2}
          funcao inicio() { escreva(W[0]) }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:24/3:24 E [ErroSemantico.ErroInicializacaoConstante.2]: O elemento no índice [0] do vetor constante "W" deve ser inicializado com um valor ao invés de uma expressão,
      ]
    `);
  });

  // Sem tamanho declarado o Portugol Studio nem chega a checar os elementos — replicamos
  // para não recusar programa que ele aceita.
  test("vetor constante sem tamanho declarado não é checado", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro B = 1
          const inteiro W[] = {B, 2}
          funcao inicio() { escreva(W[0]) }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("matriz constante com elemento que não é literal", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro B = 1
          const inteiro M[1][2] = {{B, 2}}
          funcao inicio() { escreva(M[0][0]) }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:16/3:16 W [AvisoSemantico.AvisoMatrizPodeSerVetor]: A matriz M tem tamanho [1][2] e pode ser substituida por um vetor de tamanho [2],
        3:28/3:28 E [ErroSemantico.ErroInicializacaoConstante.3]: O elemento na posição [0][0] da matriz constante "M" deve ser inicializado com um valor ao invés de uma expressão,
      ]
    `);
  });

  test("atribuir em posição de vetor constante", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro W[2] = {1, 2}
          funcao inicio() { W[0] = 3 }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:20/3:20 E [ErroSemantico.ErroAtribuirEmConstante.1]: O vetor "W" é constante e, portanto, não pode ter seus valores alterados após a inicialização,
      ]
    `);
  });

  test("vetor e matriz constantes sem inicialização", () => {
    // O exemplo do Portugol Studio usa valores sorteados; o nosso, zeros.
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            const inteiro v[3]
            const real m[2][2]
            escreva(v[0], m[0][0])
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:18/3:18 E [ErroSemantico.ErroSimboloNaoInicializado.1]: O vetor "v" não foi inicializado. Você deve inicializar o vetor antes de poder utilizá-lo no programa. Você pode inicializar o vetor atribuindo valores do tipo "inteiro". Exemplo: inteiro v[4] = {0, 0, 0, 0}. Você também pode usar a função "leia" para ler valores digitados pelo usuário. Exemplo: leia(v[0]),
        4:15/4:15 E [ErroSemantico.ErroSimboloNaoInicializado.2]: A matriz "m" não foi inicializada. Você deve inicializar a matriz antes de poder utilizá-la no programa. Você pode inicializar a matriz atribuindo valores do tipo "real". Exemplo: real m[3][3] = {{0.0, 0.0, 0.0}, {0.0, 0.0, 0.0}, {0.0, 0.0, 0.0}}. Você também pode usar a função "leia" para ler valores digitados pelo usuário. Exemplo: leia(m[0][0]),
      ]
    `);
  });

  test("constante inicializada com variável inexistente e com constante real de biblioteca", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Matematica --> mat
          funcao inicio() {
            const inteiro A = B
            const inteiro C = 2 + mat.PI
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:22/4:22 E [ErroSemantico.ErroInicializacaoConstante.1]: A constante "A" deve ser inicializada com um valor ao invés de uma expressão,
        4:22/4:22 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "B" não foi declarada neste escopo.,
        5:22/5:31 E [ErroSemantico.ErroInicializacaoConstante.1]: A constante "C" deve ser inicializada com um valor ao invés de uma expressão,
        5:22/5:31 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
      ]
    `);
  });

  test("constante inteira inicializada com comparação", () => {
    // O valor da constante ainda é calculado, e a comparação não é conta: nada além dos dois erros.
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            const inteiro A = 1 < 2
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:22/3:26 E [ErroSemantico.ErroInicializacaoConstante.1]: A constante "A" deve ser inicializada com um valor ao invés de uma expressão,
        3:22/3:26 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "lógico" à uma expressão do tipo "inteiro".,
      ]
    `);
  });
});
