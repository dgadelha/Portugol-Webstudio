import { describe, expect, test } from "vitest";
import { PortugolCodeChecker } from "../../src";
import { portugol } from "../helpers/code";

describe("Checker: Estrutura básica", () => {
  describe("Casos de sucesso", () => {
    test("Programa mínimo", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva("Olá, mundo!")
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Casos de erro", () => {
    test("Programa sem função início", () => {
      const code = portugol`
        programa {
          funcao outra() {
            escreva("Olá")
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          1:0/5:0 E: O programa deve conter uma função chamada 'inicio',
        ]
      `);
    });

    test("Função início com parâmetros", () => {
      const code = portugol`
        programa {
          funcao inicio(inteiro x) {
            escreva("Olá")
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          2:2/4:2 E: A função 'inicio' não deve receber parâmetros,
          2:16/2:24 W: A variável 'x' é atribuída, mas nunca é lida,
        ]
      `);
    });

    test("Função início com retorno", () => {
      const code = portugol`
        programa {
          funcao inteiro inicio() {
            escreva("Olá")
            retorne 0
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          2:2/5:2 E: A função 'inicio' não deve retornar valores,
        ]
      `);
    });

    test("Função com retorno sem comando retorne", () => {
      const code = portugol`
        programa {
          funcao inicio() {
            escreva(teste())
          }

          funcao inteiro teste() {
            inteiro x = 0
          }
        }
      `;

      const check = PortugolCodeChecker.checkCode(code);

      expect(check.diagnostics).toMatchInlineSnapshot(`
        [
          6:2/8:2 E: A função 'teste' deve retornar um valor,
          7:12/7:16 W: A variável 'x' é atribuída, mas nunca é lida,
        ]
      `);
    });
  });
});
