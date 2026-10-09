import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * O Portugol define `i++` como comando (`i = i + 1`). Dentro de uma conta, o resultado é o do
 * código que o Portugol Studio gera, e não o do C ou do JavaScript: `i++ + i++` com `i = 1`
 * dá 4. Por isso o aviso, que só existe no Webstudio; o programa continua válido.
 */
describe("Incremento dentro de uma conta", () => {
  test("como comando, no para e como valor sozinho, não há aviso", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inteiro f(inteiro x) {
            retorne x
          }

          funcao inicio() {
            inteiro i = 1
            inteiro v[3]
            i++
            --i
            para (inteiro j = 0; j < 3; j++) {
              v[j] = j
            }
            escreva(i++, f(++i), v[i--])
            inteiro r = i++
            escreva(r)
          }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("como operando de uma conta, há aviso em cada incremento", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro i = 1
            inteiro r = i++ + i++
            r = -i++
            r = (i++) * 2
            r = ++i * 10
            r = r + i--
            escreva(r)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:16/4:18 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar 'i++' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva 'i++' numa linha separada, antes ou depois da conta,
        4:22/4:24 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar 'i++' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva 'i++' numa linha separada, antes ou depois da conta,
        5:9/5:11 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar 'i++' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva 'i++' numa linha separada, antes ou depois da conta,
        6:9/6:11 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar 'i++' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva 'i++' numa linha separada, antes ou depois da conta,
        7:8/7:10 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar '++i' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva '++i' numa linha separada, antes ou depois da conta,
        8:12/8:14 W [AvisoWebstudio.AvisoIncrementoEmConta]: Usar 'i--' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva 'i--' numa linha separada, antes ou depois da conta,
      ]
    `);
  });
});
