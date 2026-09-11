import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Tipos", () => {
  describe("Atribuição", () => {
    test("tipos incompatíveis na declaração", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = "x"
              cadeia c = 1
              logico b = 1
              caracter k = "ab"
              real r = verdadeiro
              escreva(i, c, b, k, r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:16/3:18 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "cadeia" à uma expressão do tipo "inteiro".,
          4:15/4:15 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "inteiro" à uma expressão do tipo "cadeia".,
          5:15/5:15 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "inteiro" à uma expressão do tipo "lógico".,
          6:17/6:20 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "cadeia" à uma expressão do tipo "caracter".,
          7:13/7:22 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "lógico" à uma expressão do tipo "real".,
        ]
      `);
    });

    test("tipos incompatíveis em atribuição posterior", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x
              x = "texto"
              escreva(x)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:8/4:14 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "cadeia" à uma expressão do tipo "inteiro".,
        ]
      `);
    });

    test("conversões implícitas entre inteiro e real não são erro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              real r = 0.0
              i = r
              r = i
              escreva(i, r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:8/5:8 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
          6:8/6:8 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será automaticamente convertido de "inteiro" para "real",
        ]
      `);
    });

    test("literal de vetor com tipo incompatível", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              cadeia v[2] = {1, 2}
              escreva(v[0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:18/3:23 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível atribuir uma expressão do tipo "inteiro" à uma expressão do tipo "cadeia".,
        ]
      `);
    });

    test("atribuir literal de vetor a variável", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[2] = {1, 2}
              inteiro x = 1
              escreva(x, v[0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Operadores", () => {
    test("cadeia absorve tudo na soma", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 1
              real r = 1.0
              cadeia c = "a"
              logico b = verdadeiro
              caracter k = 'x'
              escreva(c + i + k + b + r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("cada operador tem a sua mensagem", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 1
              real r = 1.0
              cadeia c = "a"
              logico b = verdadeiro
              escreva(i + b)
              escreva(c - i)
              escreva(c * i)
              escreva(c / i)
              escreva(r % 2)
              escreva(i e b)
              escreva(i ou b)
              escreva(c > i)
              escreva(c >= i)
              escreva(c < i)
              escreva(c <= i)
              escreva(c == i)
              escreva(c != i)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          7:12/7:16 E [ErroSemantico.ErroTiposIncompativeis.15]: Tipos incompatíveis! Não é possível somar uma expressão do tipo "lógico" à uma expressão do tipo "inteiro".,
          8:12/8:16 E [ErroSemantico.ErroTiposIncompativeis.16]: Tipos incompatíveis! Não é possível subtrair uma expressão do tipo "inteiro" de uma expressão do tipo "cadeia".,
          9:12/9:16 E [ErroSemantico.ErroTiposIncompativeis.13]: Tipos incompatíveis! Não é possível multiplicar uma expressão do tipo "cadeia" por uma expressão do tipo "inteiro".,
          10:12/10:16 E [ErroSemantico.ErroTiposIncompativeis.5]: Tipos incompatíveis! Não é possível dividir uma expressão do tipo "cadeia" por uma expressão do tipo "inteiro".,
          11:12/11:16 E [ErroSemantico.ErroTiposIncompativeis.12]: Tipos incompatíveis! Não é possível obter o módulo entre uma expressão do tipo "real" e uma expressão do tipo "inteiro".,
          12:12/12:16 E [ErroSemantico.ErroTiposIncompativeis.6]: Tipos incompatíveis! Não é possível executar a operação lógica E entre uma expressão do tipo "inteiro" e uma expressão do tipo "lógico".,
          13:12/13:17 E [ErroSemantico.ErroTiposIncompativeis.14]: Tipos incompatíveis! Não é possível executar a operação lógica OU entre uma expressão do tipo "inteiro" e uma expressão do tipo "lógico".,
          14:12/14:16 E [ErroSemantico.ErroTiposIncompativeis.8]: Tipos incompatíveis! Não é possível comparar uma expressão do tipo "cadeia" com uma expressão do tipo "inteiro".,
          15:12/15:17 E [ErroSemantico.ErroTiposIncompativeis.9]: Tipos incompatíveis! Não é possível comparar uma expressão do tipo "cadeia" com uma expressão do tipo "inteiro".,
          16:12/16:16 E [ErroSemantico.ErroTiposIncompativeis.10]: Tipos incompatíveis! Não é possível comparar uma expressão do tipo "cadeia" com uma expressão do tipo "inteiro".,
          17:12/17:17 E [ErroSemantico.ErroTiposIncompativeis.11]: Tipos incompatíveis! Não é possível comparar uma expressão do tipo "cadeia" com uma expressão do tipo "inteiro".,
          18:12/18:17 E [ErroSemantico.ErroTiposIncompativeis.7]: Tipos incompatíveis! Não é possível comparar a igualdade entre uma expressão do tipo "cadeia" e uma expressão do tipo "inteiro".,
          19:12/19:17 E [ErroSemantico.ErroTiposIncompativeis.4]: Tipos incompatíveis! Não é possível comparar a diferença entre uma expressão do tipo "cadeia" e uma expressão do tipo "inteiro".,
        ]
      `);
    });

    test("inteiro com real resulta em real", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 1
              real r = 1.0
              real soma = i + r
              inteiro truncado = i * r
              escreva(soma, truncado)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          6:23/6:27 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão á direita da atribuição será truncado,
        ]
      `);
    });

    test("deslocamento de bits com operando não inteiro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              real r = 1.0
              inteiro i = 1
              escreva(r << 1)
              escreva(i >> r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:12/5:12 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! Não é possível deslocar os bits de um valor não inteiro. Exemplo: variavel << 2,
          6:17/6:17 E [ErroSemantico.ErroTiposIncompativeis.1]: Tipos incompatíveis! É necessário um valor inteiro de bits a ser deslocado. Exemplo: i >> 2,
        ]
      `);
    });

    // O Portugol Studio não tem mensagem para estas variantes e emite um erro sem posição
    // nem texto; a nossa mensagem é uma divergência deliberada.
    test("operações bit a bit com operando não inteiro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              real r = 1.0
              escreva(r & 1)
              escreva(r | 1)
              escreva(r ^ 1)
              escreva(~r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:16 E [ErroSemantico.ErroTiposIncompativeis.26]: Tipos incompatíveis! Não é possível executar a operação bit a bit E entre uma expressão do tipo "real" e uma expressão do tipo "inteiro". Ambos os operandos precisam ser do tipo "inteiro".,
          5:12/5:16 E [ErroSemantico.ErroTiposIncompativeis.26]: Tipos incompatíveis! Não é possível executar a operação bit a bit OU entre uma expressão do tipo "real" e uma expressão do tipo "inteiro". Ambos os operandos precisam ser do tipo "inteiro".,
          6:12/6:16 E [ErroSemantico.ErroTiposIncompativeis.26]: Tipos incompatíveis! Não é possível executar a operação bit a bit XOR entre uma expressão do tipo "real" e uma expressão do tipo "inteiro". Ambos os operandos precisam ser do tipo "inteiro".,
          7:12/7:13 E [ErroSemantico.ErroTiposIncompativeis.27]: Tipos incompatíveis! A operação de negação bit a bit espera uma expressão do tipo "inteiro" mas foi passada uma expressão do tipo "real".,
        ]
      `);
    });
  });

  describe("Unários", () => {
    test("menos unário e negação com tipo errado", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 1
              cadeia c = "a"
              escreva(nao i)
              escreva(-c)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:12/5:16 E [ErroSemantico.ErroTiposIncompativeis.3]: Tipos incompatíveis! A operação de negação espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "inteiro".,
          6:13/6:13 E [ErroSemantico.ErroTiposIncompativeis.2]: Tipos incompatíveis! A operação "menos unário" espera uma expressão do tipo "inteiro" ou "real" mas foi passada uma expressão do tipo "cadeia".,
        ]
      `);
    });

    test("mais unário não é verificado, como no Portugol Studio", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              cadeia c = "a"
              escreva(+c)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("incremento e decremento seguem as tabelas de soma e subtração", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              cadeia c = "a"
              logico b = falso
              real r = 0.0
              i++
              c++
              b++
              r++
              i--
              c--
              escreva(i, c, b, r)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          9:4/9:6 E [ErroSemantico.ErroTiposIncompativeis.15]: Tipos incompatíveis! Não é possível somar uma expressão do tipo "inteiro" à uma expressão do tipo "lógico".,
          12:4/12:6 E [ErroSemantico.ErroTiposIncompativeis.16]: Tipos incompatíveis! Não é possível subtrair uma expressão do tipo "inteiro" de uma expressão do tipo "cadeia".,
        ]
      `);
    });

    test("atribuição composta segue a tabela do operador e depois a da atribuição", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              cadeia c = "a"
              logico b = falso
              i += 1
              c += 1
              b += 1
              escreva(i, c, b)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          8:4/8:9 E [ErroSemantico.ErroTiposIncompativeis.15]: Tipos incompatíveis! Não é possível somar uma expressão do tipo "inteiro" à uma expressão do tipo "lógico".,
        ]
      `);
    });

    test("incremento em posição de vetor e de matriz", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[2] = {1, 2}
              inteiro m[2][2] = {{1, 2}, {3, 4}}
              v[0]++
              m[0][1]--
              escreva(v[0], m[0][1])
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Índices", () => {
    test("índice de vetor e de matriz precisa ser inteiro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[3] = {1, 2, 3}
              inteiro m[2][2] = {{1, 2}, {3, 4}}
              escreva(v["x"])
              escreva(m[1.5][verdadeiro])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:12/5:17 E [ErroSemantico.ErroTiposIncompativeis.24]: Tipos incompatíveis! O índice do vetor deve ser uma expressão do tipo "inteiro" mas foi passada uma expressão do tipo "cadeia".,
          6:12/6:29 E [ErroSemantico.ErroTiposIncompativeis.23]: Tipos incompatíveis! A linha e coluna da matriz devem ser uma expressão do tipo "inteiro" e "inteiro" mas foi passada uma expressão do tipo "real" e "lógico".,
        ]
      `);
    });
  });
});
