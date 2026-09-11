import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * As verificações #47, #48 e #49 são só nossas: acusam o que o Portugol Studio aceita mas o
 * runtime do Webstudio não sabe executar.
 */
describe("Bibliotecas", () => {
  test("#40 inclusão inexistente, repetida e com alias já usado", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Matematica
          inclua biblioteca Matematica
          inclua biblioteca NaoExiste
          inclua biblioteca Texto --> Matematica
          funcao inicio() {
            escreva(Matematica.PI)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:20/3:29 E [ErroSemantico.ErroInclusaoBiblioteca]: A biblioteca "Matematica" já foi incluída,
        4:20/4:28 E [ErroSemantico.ErroInclusaoBiblioteca]: Erro ao carregar a biblioteca "NaoExiste": a biblioteca não foi encontrada,
        5:30/5:39 E [ErroSemantico.ErroInclusaoBiblioteca]: O alias "Matematica" já está sendo utilizado pela biblioteca "Matematica",
      ]
    `);
  });

  test("#41/#43/#44/#45 uso de biblioteca não incluída, símbolo inexistente e atribuição", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Matematica --> mat
          funcao inicio() {
            escreva(Texto.numero_caracteres("a"))
            escreva(mat.nao_existe(1))
            escreva(mat.NAO_EXISTE)
            mat.PI = 1.0
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:18/4:34 E [ErroSemantico.ErroInclusaoBiblioteca]: A biblioteca 'Texto' não foi incluída no programa,
        5:16/5:25 E [ErroSemantico.ErroSimboloNaoDeclarado]: A função "nao_existe" não existe na biblioteca "mat",
        6:16/6:25 E [ErroSemantico.ErroConstanteNaoEncontradaNaBiblioteca]: A constante "NAO_EXISTE" não existe na biblioteca "Matematica",
        7:8/7:9 E [ErroSemantico.ErroAtribuirConstanteBiblioteca]: "PI" é uma constante da biblioteca "Matematica", e portanto, não pode ter seu valor alterado,
      ]
    `);
  });

  test("#41 constante de biblioteca não incluída", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(Matematica.PI)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:23/3:24 E [ErroSemantico.ErroBibliotecaNaoInserida]: A biblioteca "Matematica" não foi incluída no programa,
      ]
    `);
  });

  test("#42/#45 atribuição a escopo desconhecido e ao nome de uma função de biblioteca", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Matematica --> mat
          funcao inicio() {
            xyz.ALGO = 1
            mat.raiz = 1.0
          }
        }
      `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
    ).toMatchInlineSnapshot(`
      [
        "4: ErroSemantico.ErroAliasInexistente",
        "4: ErroSemantico.ErroBibliotecaNaoInserida",
        "5: ErroSemantico.ErroAtribuirFuncaoBiblioteca",
        "5: ErroSemantico.ErroConstanteNaoEncontradaNaBiblioteca",
      ]
    `);
  });

  test("#46 os parâmetros de função de biblioteca passam pelas mesmas checagens", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Matematica --> m
          funcao inicio() {
            inteiro i = 2
            escreva(m.raiz(i, 2))
            escreva(m.raiz("x", 2))
            escreva(m.raiz(1.0))
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        5:19/5:19 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão passada para o parâmetro "radicando" da função "raiz" será automaticamente convertido de "inteiro" para "real",
        5:22/5:22 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão passada para o parâmetro "indice" da função "raiz" será automaticamente convertido de "inteiro" para "real",
        6:19/6:21 E [ErroSemantico.ErroTipoParametroIncompativel]: Tipos incompatíveis! O parâmetro "radicando" da função "raiz" espera uma expressão do tipo "real", mas foi passada uma expressão do tipo "cadeia",
        6:24/6:24 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão passada para o parâmetro "indice" da função "raiz" será automaticamente convertido de "inteiro" para "real",
        7:14/7:17 E [ErroSemantico.ErroNumeroParametrosFuncao]: A função "raiz" espera 2 parâmetros, mas foi passado apenas 1 parâmetro.,
      ]
    `);
  });

  test("#46 parâmetro por referência de biblioteca aceita vetor e matriz", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Util
          funcao inicio() {
            inteiro v[3] = {1, 2, 3}
            inteiro m[2][2] = {{1, 2}, {3, 4}}
            escreva(Util.numero_elementos(v), Util.numero_linhas(m))
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("#47 biblioteca que o runtime do Webstudio não implementa", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Teclado --> t
          funcao inicio() {
            se (t.tecla_pressionada(t.TECLA_A)) {
              escreva("a")
            }
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        2:20/2:26 E [ErroWebstudio.ErroBibliotecaNaoSuportada]: A biblioteca "Teclado" ainda não é suportada pelo Portugol Webstudio e o programa não pode ser executado. Bibliotecas suportadas: Calendario, Graficos, Matematica, Objetos, Texto, Tipos e Util,
      ]
    `);
  });

  test("#47 um erro por inclusão, não por uso", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Sons --> s
          funcao inicio() {
            inteiro som = s.carregar_som("a.wav")
            s.reproduzir_som(som, falso)
            s.reproduzir_som(som, falso)
          }
        }
      `).length,
    ).toBe(1);
  });

  test("#49 sorteia global, que o runtime do Webstudio não define", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(sorteia(1, 6))
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:12/3:18 E [ErroWebstudio.ErroFuncaoReservadaNaoSuportada]: A função "sorteia" ainda não é suportada pelo Portugol Webstudio e o programa não pode ser executado. Inclua a biblioteca Util e use "Util.sorteia" no lugar,
      ]
    `);
  });

  test("Util.sorteia é a forma suportada", () => {
    expect(
      analisar(portugol`
        programa {
          inclua biblioteca Util
          funcao inicio() {
            escreva(Util.sorteia(1, 6))
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  /**
   * As bibliotecas que o runtime implementa estão completas hoje, então nenhum programa
   * exercita este caso — o teste guarda a lista vazia de `suporte.gerado.ts`.
   */
  test("#48 nenhuma biblioteca suportada tem símbolo faltando", async () => {
    const { BIBLIOTECAS_IMPLEMENTADAS, símbolosNãoImplementados } = await import("../../src");

    expect(
      BIBLIOTECAS_IMPLEMENTADAS.flatMap(biblioteca => {
        return [
          ...(símbolosNãoImplementados(biblioteca)?.funções ?? []),
          ...(símbolosNãoImplementados(biblioteca)?.constantes ?? []),
        ];
      }),
    ).toEqual([]);
  });
});
