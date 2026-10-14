import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Controle de fluxo", () => {
  describe("Condições", () => {
    test("se, enquanto, faca-enquanto e para exigem lógico", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro n = 1
              se (n) { escreva(1) }
              enquanto (n) { pare }
              faca { pare } enquanto (n)
              para (n = 0; n; n++) { }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:8/4:8 E [ErroSemantico.ErroTiposIncompativeis.19]: Tipos incompatíveis! O comando "se" espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "inteiro".,
          5:14/5:14 E [ErroSemantico.ErroTiposIncompativeis.20]: Tipos incompatíveis! O comando "enquanto" espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "inteiro".,
          6:28/6:28 E [ErroSemantico.ErroTiposIncompativeis.21]: Tipos incompatíveis! A condição do comando "faca enquanto" espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "inteiro".,
          7:17/7:17 E [ErroSemantico.ErroTiposIncompativeis.22]: Tipos incompatíveis! A expressão utilizada na condição do comando "para" espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "inteiro".,
        ]
      `);
    });

    test("condição indeterminada não cascateia", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              se (naoexiste) { }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:8/3:16 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "naoexiste" não foi declarada neste escopo.,
        ]
      `);
    });
  });

  describe("escolha / caso", () => {
    test("dois `caso contrario` ou o mesmo literal em dois `caso` são erro, como ao executar no Portugol Studio", () => {
      // O `caso contrario` de fora caiu dentro do `escolha` de dentro, que não foi fechado.
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro a = 1
              caracter c = 'x'
              escolha (a) {
                caso 1:
                  escolha (c) {
                    caso 'x':
                      pare
                    caso contrario:
                      pare
                  caso contrario:
                    pare
                  }
              }
              escolha (a) {
                caso 1:
                  pare
                caso 0x1:
                  pare
                caso (1):
                  pare
              }
              escolha (c) {
                caso 'y':
                  pare
                caso 'y':
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          12:8/12:21 E [ErroWebstudio.ErroCasoContrarioRepetido]: Este 'escolha' já tem um 'caso contrario',
          19:11/19:13 E [ErroWebstudio.ErroCasoRepetido]: O valor 1 já aparece em outro 'caso' deste 'escolha',
          21:11/21:13 E [ErroWebstudio.ErroCasoRepetido]: O valor 1 já aparece em outro 'caso' deste 'escolha',
          27:11/27:13 E [ErroWebstudio.ErroCasoRepetido]: O valor 'y' já aparece em outro 'caso' deste 'escolha',
        ]
      `);
    });

    test("com constante, conta ou negativo o primeiro `caso` vale, como no Portugol Studio", () => {
      expect(
        analisar(portugol`
          programa {
            const inteiro A = 1
            funcao inicio() {
              inteiro a = 1
              escolha (a) {
                caso 1:
                  pare
                caso A:
                  pare
                caso 0 + 1:
                  pare
                caso -1:
                  pare
                caso -1:
                  pare
                caso contrario:
                  pare
              }
              escolha (a) {
                caso contrario:
                  pare
                caso 1:
                  escolha (a) {
                    caso 1:
                      pare
                    caso contrario:
                      pare
                  }
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("escolha exige inteiro ou caracter e o caso precisa casar", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              cadeia s = "a"
              escolha (s) {
                caso 1:
                  pare
              }
              inteiro n = 1
              escolha (n) {
                caso "x":
                  pare
                caso 'c':
                  pare
                caso contrario:
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:13/4:13 E [ErroSemantico.ErroTiposIncompativeis.17]: Tipos incompatíveis! O comando "escolha" espera uma expressão do tipo "inteiro" ou "caracter" mas foi passada uma expressão do tipo "cadeia".,
          10:11/10:13 E [ErroSemantico.ErroTiposIncompativeis.18]: Tipos incompatíveis! A expressão esperada para esse caso deveria ser do tipo "inteiro" mas foi passada uma expressão do tipo "cadeia".,
          12:11/12:13 E [ErroSemantico.ErroTiposIncompativeis.18]: Tipos incompatíveis! A expressão esperada para esse caso deveria ser do tipo "inteiro" mas foi passada uma expressão do tipo "caracter".,
        ]
      `);
    });

    test("escolha com caracter aceita caso caracter", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              caracter k = 'a'
              escolha (k) {
                caso 'a':
                  pare
                caso contrario:
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("escolha de cadeia ou real pede caso inteiro ou caracter", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              cadeia c = "a"
              escolha (c) {
                caso "a":
                  pare
              }
              real r = 1.0
              escolha (r) {
                caso 1:
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:13/4:13 E [ErroSemantico.ErroTiposIncompativeis.17]: Tipos incompatíveis! O comando "escolha" espera uma expressão do tipo "inteiro" ou "caracter" mas foi passada uma expressão do tipo "cadeia".,
          5:11/5:13 E [ErroSemantico.ErroTiposIncompativeis.18]: Tipos incompatíveis! A expressão esperada para esse caso deveria ser do tipo "inteiro" ou "caracter" mas foi passada uma expressão do tipo "cadeia".,
          9:13/9:13 E [ErroSemantico.ErroTiposIncompativeis.17]: Tipos incompatíveis! O comando "escolha" espera uma expressão do tipo "inteiro" ou "caracter" mas foi passada uma expressão do tipo "real".,
        ]
      `);
    });

    test("tipo indeterminado no escolha não gera erro nos casos", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escolha (naoexiste) {
                caso "x":
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:13/3:21 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "naoexiste" não foi declarada neste escopo.,
        ]
      `);
    });

    /**
     * O Portugol Studio aceita um `pare` depois das chaves do caso, mas o ignora: a execução
     * continua no caso seguinte. O aviso só existe no Webstudio, que executa do mesmo jeito.
     */
    test("pare depois das chaves do caso tem aviso; sem chaves ou dentro delas, não", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              escolha (x) {
                caso 1: {
                  escreva("um")
                } pare
                caso 2: {
                  escreva("dois")
                }
                pare
                caso 3: {
                  escreva("três")
                  pare
                }
                caso 4:
                  escreva("quatro")
                  pare
                caso contrario:
                  escreva("outro")
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          7:8/7:11 W [AvisoWebstudio.AvisoPareDepoisDoCaso]: O 'pare' depois das chaves do caso não sai do 'escolha': a execução continua no caso seguinte,
          11:6/11:9 W [AvisoWebstudio.AvisoPareDepoisDoCaso]: O 'pare' depois das chaves do caso não sai do 'escolha': a execução continua no caso seguinte,
        ]
      `);
    });
  });

  describe("para", () => {
    test("incremento que não é atribuição", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro n = 0
              para (n = 0; n < 3; n) { }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:24/4:24 E [ErroSemantico.ErroParaSemExpressaoAtribuicao]: O comando 'para' quando há uma atribuição utiliza uma das seguintes sintaxes: i=i+1 / i++ / i+=1,
        ]
      `);
    });

    test("atribuição composta como incremento é válida", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i
              para (i = 0; i < 3; i += 1) {
                escreva(i)
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("inicialização por atribuição, declaração ou identificador", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              para (i = 0; i < 3; i++) { escreva(i) }
              para (inteiro j = 0; j < 3; j++) { escreva(j) }
              para (i; i < 3; i++) { escreva(i) }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Atribuições inválidas", () => {
    test("atribuir a literal, a chamada de função e a expressão", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              1 = x
              f() = x
              x + 1 = 2
            }
            funcao inteiro f() { retorne 1 }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:4/4:8 E [ErroSemantico.ErroOperacaoComExpressaoConstante.1]: Não é possível realizar uma atribuição à um valor literal. Você só pode realizar atribuições à variáveis, vetores ou matrizes que não tenham sido declarados como constantes. Se você estiver tentando comparar a igualdade de duas expressões, utilize o operador '==' ao invés do operador '=',
          5:4/5:10 E [ErroSemantico.ErroAtribuirEmChamadaFuncao]: Não é possível atribuir uma expressão a uma chamada de função.,
          6:4/6:12 E [ErroSemantico.ErroOperacaoComExpressaoConstante.3]: Não é possível realizar uma atribuição à uma expressão. Você só pode realizar atribuições à variáveis, vetores ou matrizes que não tenham sido declarados como constantes. Se você estiver tentando comparar a igualdade de duas expressões, utilize o operador '==' ao invés do operador '=',
        ]
      `);
    });
  });

  describe("pare fora de laço", () => {
    // Divergência do Portugol Studio, que trata isto como erro sintático: a nossa
    // gramática aceita `pare` em qualquer lugar e o transpilador gera um `break` cru.
    test("pare solto no corpo da função", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              pare
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:4/3:7 E [ErroWebstudio.ErroPareForaDeLaco]: O comando 'pare' apenas pode ser utilizado dentro de laços (como para, enquanto e faca-enquanto) ou dentro de um escolha-caso,
        ]
      `);
    });

    test("pare dentro de se solto", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              se (verdadeiro) { pare }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:22/3:25 E [ErroWebstudio.ErroPareForaDeLaco]: O comando 'pare' apenas pode ser utilizado dentro de laços (como para, enquanto e faca-enquanto) ou dentro de um escolha-caso,
        ]
      `);
    });

    test("pare em laços e no escolha é válido", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro n = 1
              enquanto (verdadeiro) { se (verdadeiro) { pare } }
              faca { pare } enquanto (falso)
              para (inteiro i = 0; i < 3; i++) { pare }
              escolha (n) {
                caso 1:
                  pare
                caso contrario:
                  pare
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });
});
