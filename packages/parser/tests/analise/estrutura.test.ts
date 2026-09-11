import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Estrutura do programa", () => {
  test("programa mínimo não gera diagnóstico", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva("Olá, mundo!")
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  // No Java o trecho que usava `ErroFuncaoInicioNaoAceitaParametros` está comentado, e há
  // exemplo oficial que depende disso: `bibliotecas/graficos/varios.por`.
  test("`inicio` pode receber parâmetros", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio(cadeia params[]) {
            escreva("Olá")
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("programa sem função início", () => {
    expect(
      analisar(portugol`
        programa {
          funcao outra() {
            escreva("Olá")
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        1:0/5:0 E [ErroSemantico.ErroFuncaoInicioInexistente]: A função "inicio" não existe no seu código. Ela é necessária pois será a primeira a ser chamada na execução do código,
      ]
    `);
  });

  test("função redeclarada", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() { f() }
          funcao f() { }
          funcao f() { }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:9/4:9 E [ErroSemantico.ErroSimboloRedeclarado.4]: O símbolo "f" já foi declarado como uma função na linha: 3, coluna: 9.,
      ]
    `);
  });

  test("função com nome reservado pela linguagem", () => {
    expect(
      analisar(portugol`
        programa {
          funcao escreva() { }
          funcao inicio() { }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:9/2:15 E [ErroSemantico.ErroFuncaoReservada]: A função escreva é reservada para a linguagem,
      ]
    `);
  });

  test("variável global com o nome de uma função", () => {
    expect(
      analisar(portugol`
        programa {
          inteiro f = 1
          funcao inicio() { escreva(f) }
          funcao f() { }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:10/2:10 E [ErroSemantico.ErroSimboloRedeclarado.4]: O símbolo "f" já foi declarado como uma função na linha: 4, coluna: 9.,
        3:28/3:28 E [ErroSemantico.ErroReferenciaInvalida.41]: A função 'f' está sendo utilizada como uma variável,
      ]
    `);
  });

  describe("ErroBlocoInvalido", () => {
    test("expressão aritmética, referência e comparação soltas", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              x + 1
              x == 1
              x
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:4/4:8 E [ErroSemantico.ErroBlocoInvalido.2]: Esta expressão não faz sentido se estiver sozinha no código. Você pode atribuir a expressão a uma variável, vetor, matriz ou passá-la como parâmetro em uma chamada de função,
          5:4/5:9 E [ErroSemantico.ErroBlocoInvalido.11]: Esta expressão lógica não faz sentido se estiver sozinha no código. Você pode utilizar a expressão como condição em um dos seguintes comandos: 'se', 'enquanto', 'faca-enquanto'. Se você estiver tentando atribuir um valor ou expressão à variável "x", utilize o operador '=' ao invés do operador '==',
          6:4/6:4 E [ErroSemantico.ErroBlocoInvalido.2]: Esta expressão não faz sentido se estiver sozinha no código. Você pode atribuir a expressão a uma variável, vetor, matriz ou passá-la como parâmetro em uma chamada de função,
        ]
      `);
    });

    test("literal lógico solto", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              verdadeiro
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:4/3:13 E [ErroSemantico.ErroBlocoInvalido.1]: Esta expressão lógica não faz sentido se estiver sozinha no código. Você pode utilizar a expressão como condição em um dos seguintes comandos: 'se', 'enquanto', 'faca-enquanto',
        ]
      `);
    });

    test("comparação com vetor à esquerda cita o vetor", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[2] = {1, 2}
              v[0] == 1
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:4/4:12 E [ErroSemantico.ErroBlocoInvalido.12]: Esta expressão lógica não faz sentido se estiver sozinha no código. Você pode utilizar a expressão como condição em um dos seguintes comandos: 'se', 'enquanto', 'faca-enquanto'. Se você estiver tentando atribuir um valor ou expressão ao vetor "v", utilize o operador '=' ao invés do operador '==',
        ]
      `);
    });

    test("comandos válidos sozinhos não são bloco inválido", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              x++
              --x
              x += 1
              f()
              enquanto (falso) { pare }
            }
            funcao f() { }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });
});
