import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * Todos os casos abaixo foram conferidos contra o analisador do Portugol Studio
 * (`packages/parser/tools/oracle/run.sh`).
 */
describe("Retorno de função", () => {
  describe("Retorno obrigatório (#5)", () => {
    test("se sem senao não garante retorno; se/senao garante", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(f(1), g(1)) }
            funcao inteiro f(inteiro n) {
              se (n > 0) { retorne 1 }
            }
            funcao inteiro g(inteiro n) {
              se (n > 0) { retorne 1 } senao { retorne 2 }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:17/3:17 E [ErroSemantico.ErroFuncaoSemRetorne]: A função "f" possui situações que não retornam nenhum valor. Verifique se todos os desvios condicionais, laços de repetição e casos do comando "escolha" possuem o comando "retorne". Você também pode incluir o comando "retorne" no final da função,
        ]
      `);
    });

    test("corpo sem nenhum retorne", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escreva(teste())
            }

            funcao inteiro teste() {
              inteiro x = 0
              escreva(x)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          6:17/6:21 E [ErroSemantico.ErroFuncaoSemRetorne]: A função "teste" possui situações que não retornam nenhum valor. Verifique se todos os desvios condicionais, laços de repetição e casos do comando "escolha" possuem o comando "retorne". Você também pode incluir o comando "retorne" no final da função,
        ]
      `);
    });

    test("laço nunca garante retorno, nem enquanto (verdadeiro)", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(fc(1), fg(1)) }
            funcao inteiro fc(inteiro n) { enquanto (verdadeiro) { retorne 1 } }
            funcao inteiro fg(inteiro n) { para (inteiro i = 0; i < n; i++) { retorne i } }
          }
        `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
      ).toMatchInlineSnapshot(`
        [
          "3: ErroSemantico.ErroFuncaoSemRetorne",
          "4: ErroSemantico.ErroFuncaoSemRetorne",
        ]
      `);
    });

    test("escolha garante retorno só com caso contrario no fim", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(fd(1), fe(1)) }
            funcao inteiro fd(inteiro n) {
              escolha (n) {
                caso 1: retorne 1 pare
                caso contrario: retorne 2
              }
            }
            funcao inteiro fe(inteiro n) {
              escolha (n) {
                caso 1: retorne 1 pare
              }
            }
          }
        `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
      ).toMatchInlineSnapshot(`
        [
          "9: ErroSemantico.ErroFuncaoSemRetorne",
        ]
      `);
    });

    test("senao se não garante retorno (o senao interno não tem senao)", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(fb(1)) }
            funcao inteiro fb(inteiro n) { se (n > 0) { retorne 1 } senao se (n < 0) { retorne 2 } }
          }
        `).map(diagnóstico => `${diagnóstico.startLine}: ${diagnóstico.code}`),
      ).toMatchInlineSnapshot(`
        [
          "3: ErroSemantico.ErroFuncaoSemRetorne",
        ]
      `);
    });

    test("função vazio não precisa de retorne", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { nada() }
            funcao nada() { escreva("oi") }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Tipo do retorne (#20)", () => {
    test("retorne com valor em função vazio e tipo incompatível", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              retorne 1
            }
            funcao cadeia h() { retorne 1 }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:4/3:12 E [ErroSemantico.ErroTiposIncompativeis.25]: Tipos incompatíveis! O retorno da função "inicio" é do tipo "vazio" mas foi retornada uma expressão do tipo "inteiro".,
          5:22/5:30 E [ErroSemantico.ErroTiposIncompativeis.25]: Tipos incompatíveis! O retorno da função "h" é do tipo "cadeia" mas foi retornada uma expressão do tipo "inteiro".,
        ]
      `);
    });

    test("retorne sem valor em função tipada", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(f()) }
            funcao inteiro f() { retorne }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:23/3:29 E [ErroSemantico.ErroTiposIncompativeis.25]: Tipos incompatíveis! O retorno da função "f" é do tipo "inteiro" mas foi retornada uma expressão do tipo "vazio".,
        ]
      `);
    });

    test("retorne sem valor em função vazio é válido", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { retorne }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("conversão no retorno é aviso, não erro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(f(), g()) }
            funcao inteiro f() { retorne 1.5 }
            funcao real g() { retorne 1 }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:23/3:33 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão retornada na função "f" será truncado,
          4:20/4:28 W [AvisoSemantico.AvisoValorExpressaoSeraConvertido]: O valor da expressão retornada na função "g" será automaticamente convertido de "inteiro" para "real",
        ]
      `);
    });
  });
});
