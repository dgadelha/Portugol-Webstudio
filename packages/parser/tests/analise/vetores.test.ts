import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * Todos os casos abaixo foram conferidos contra o analisador do Portugol Studio.
 */
describe("Vetores e matrizes", () => {
  describe("Tamanho declarado (#30, #31, #32)", () => {
    test("zero, negativo, real e variável não constante", () => {
      expect(
        analisar(portugol`
          programa {
            const inteiro N = 3
            funcao inicio() {
              inteiro a[0]
              inteiro b[-1]
              inteiro c[2.5]
              inteiro d[N]
              inteiro n = 4
              inteiro q[n]
              escreva(a[0], b[0], c[0], d[0], q[0])
            }
          }
        `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
      ).toMatchInlineSnapshot(`
        [
          "4: ErroSemantico.ErroTamanhoVetorMatriz.1",
          "5: ErroSemantico.ErroTamanhoVetorMatriz.1",
          "6: ErroSemantico.ErroTamanhoVetorMatriz.1",
          "9: ErroSemantico.ErroTamanhoVetorMatriz.1",
        ]
      `);
    });

    test("expressão constante, constante de biblioteca e parênteses valem", () => {
      expect(
        analisar(portugol`
          programa {
            inclua biblioteca Calendario --> cal
            const inteiro N = 3
            funcao inicio() {
              inteiro a[N * 2]
              inteiro b[(4)]
              inteiro c[+5]
              inteiro d[cal.DIA_SABADO]
              escreva(a[0], b[0], c[0], d[0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("chamada de função e posição de vetor não valem como tamanho", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro idx[2] = {1, 2}
              inteiro a[tam()]
              inteiro b[idx[0]]
              escreva(a[0], b[0])
            }
            funcao inteiro tam() { retorne 3 }
          }
        `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
      ).toMatchInlineSnapshot(`
        [
          "4: ErroSemantico.ErroTamanhoVetorMatriz.1",
          "5: ErroSemantico.ErroTamanhoVetorMatriz.1",
        ]
      `);
    });

    test("linhas e colunas da matriz têm mensagem própria", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro n = 2
              inteiro m[n][0]
              escreva(m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:14/4:14 E [ErroSemantico.ErroTamanhoVetorMatriz.2]: O número de linhas da matriz 'm' deve ser um valor ou uma constante do tipo inteiro e positivo 
         Ex: matriz[5][4],
          4:17/4:17 E [ErroSemantico.ErroTamanhoVetorMatriz.2]: O número de colunas da matriz 'm' deve ser um valor ou uma constante do tipo inteiro e positivo 
         Ex: matriz[5][4],
        ]
      `);
    });

    test("tamanho máximo de vetor e de matriz", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[20000000]
              inteiro m[5000][5000]
              escreva(v[0], m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:12 E [ErroSemantico.ErroTamanhoMaximoVetor]: O vetor 'v' está sendo declarado com 20000000 posições, porém o tamanho máximo de um vetor é 16777216. Informe um tamanho entre 1 e 16777216 para corrigir o problema,
          4:12/4:12 E [ErroSemantico.ErroTamanhoMaximoMatriz]: A matriz 'm' está sendo declarada com 25000000 posições (5000 x 5000), porém o número máximo de posições é 16777216. Informe tamanhos cujo produto seja menor ou igual a 16777216 para corrigir o problema,
        ]
      `);
    });

    test("tamanho omitido não é checado", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[] = {1, 2, 3}
              inteiro m[][] = {{1, 2}, {3, 4}}
              escreva(v[0], m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Inicialização (#33, #34, #35)", () => {
    test("quantidade de elementos e tipos misturados", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro f[2] = {1, 2, 3}
              inteiro g[2][2] = {{1, 2, 3}, {3, 4}}
              inteiro t[3] = {1, "x", 3}
              escreva(f[0], g[0][0], t[0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:19/3:27 E [ErroSemantico.ErroQuantidadeElementosInicializacaoVetor]: A inicialização do vetor "f" deve possuir 2 elementos. Remova 1 elemento para corrigir o problema,
          4:22/4:40 E [ErroSemantico.ErroQuantidadeElementosColunaInicializacaoMatriz]: A linha [0] na inicialização da matriz "g" deve possuir 2 elementos. Remova 1 elemento para corrigir o problema,
          5:19/5:29 E [ErroSemantico.ErroDefinirTipoDadoVetorLiteral]: A inicialização do vetor possui mais de um tipo de dado,
        ]
      `);
    });

    test("número de linhas da matriz", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro m[3][2] = {{1, 2}, {3, 4}}
              escreva(m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:22/3:37 E [ErroSemantico.ErroQuantidadeLinhasIncializacaoMatriz]: A inicialização da matriz "m" deve possuir 3 linhas. Insira mais 1 linha para corrigir o problema,
        ]
      `);
    });

    test("matriz com tipos misturados", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro m[2][2] = {{1, 2}, {3, "x"}}
              escreva(m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:22/3:39 E [ErroSemantico.ErroDefinirTipoDadoMatrizLiteral]: A inicialização da matriz possui mais de um tipo de dado,
        ]
      `);
    });
  });

  describe("Avisos de dimensão (#39)", () => {
    test("vetor de 1, matriz 1x1 e matriz 1xN", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro h[1]
              inteiro j[1][1]
              inteiro k[1][5]
              escreva(h[0], j[0][0], k[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:12 W [AvisoSemantico.AvisoVetorPodeSerVariavel]: O Vetor h tem tamanho [1] e pode ser substituido por uma variável,
          4:12/4:12 W [AvisoSemantico.AvisoMatrizPodeSerVariavel]: A matriz j tem tamanho [1][1] e pode ser substituida por uma variável,
          5:12/5:12 W [AvisoSemantico.AvisoMatrizPodeSerVetor]: A matriz k tem tamanho [1][5] e pode ser substituida por um vetor de tamanho [5],
        ]
      `);
    });
  });

  /**
   * `ErroAoInicializarVetor`, `ErroAoInicializarMatriz`, `ErroInicializacaoInvalida`,
   * `ErroAoAtribuirEmVetor` e `ErroAoAtribuirEmMatriz` são inalcançáveis na nossa gramática
   * e ficaram sem implementação: `inteiro x = {1,2}`, `inteiro v[2] = 5` e `v[0] = {1,2}`
   * são erros sintáticos (no Portugol Studio também) e `v = 5` cai em
   * `ErroReferenciaInvalida`. Confirmado com o oracle.
   */
  test("#37/#38 vetor e matriz recebendo um valor simples", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro v[2] = {1, 2}
            inteiro m[2][2] = {{1, 2}, {3, 4}}
            v = 5
            m = 5
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        5:4/5:4 E [ErroSemantico.ErroReferenciaInvalida.11]: O vetor 'v' está sendo utilizado como uma variável,
        6:4/6:4 E [ErroSemantico.ErroReferenciaInvalida.21]: A matriz 'm' está sendo utilizada como uma variável,
      ]
    `);
  });
});
