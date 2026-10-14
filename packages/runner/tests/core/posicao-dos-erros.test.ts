import { describe, expect, test } from "vitest";

import { portugol } from "../helpers/code";
import { runtimeError } from "../helpers/runner";

/**
 * Como no Portugol Studio, um erro de execução diz a linha e a coluna do começo do comando
 * em que aconteceu, contadas do 1.
 *
 * Nas condições dos laços e no incremento do `para`, de propósito, não: o Portugol Studio
 * aponta o último comando que executou antes (conferido na versão 2.7.5: um erro no
 * incremento de um `para` e na condição de um `faca-enquanto` apontam o último comando do
 * corpo). Aqui, o erro aponta o laço, como diz a página de diferenças da Ajuda.
 */
describe("Posição dos erros de execução", () => {
  test("Aponta o começo do comando, e não a expressão que falhou", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inicio() {
            inteiro v[3]
            inteiro i = 5
            escreva("antes")
            inteiro x = 2 + v[i]
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 6, column: 5 } });
  });

  test("Um erro dentro de uma função aponta a linha dentro dela", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inteiro dividir(inteiro a, inteiro b) {
            inteiro r = a / b
            retorne r
          }

          funcao inicio() {
            inteiro x = dividir(10, 0)
          }
        }
      `),
    ).resolves.toEqual({ message: "Foi efetuada uma divisão por zero.", position: { line: 3, column: 5 } });
  });

  test("Depois que uma função volta, a posição é a de quem chamou", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inteiro dobro(inteiro n) {
            retorne n * 2
          }

          funcao inicio() {
            inteiro zero = 0
            inteiro x = dobro(10) / zero
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 8, column: 5 } });
  });

  test("Na condição de um enquanto, aponta o enquanto", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inicio() {
            inteiro v[2] = {1, 2}
            inteiro i = 0
            enquanto (v[i] > 0) {
              i++
            }
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 5, column: 5 } });
  });

  test("Na condição de um para, depois de algumas voltas, aponta o para", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inicio() {
            inteiro v[2] = {1, 2}
            para (inteiro i = 0; v[i] > 0; i++) {
              escreva(i)
            }
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 4, column: 5 } });
  });

  test.each([
    ["na declaração", "inteiro zero = 0", "para (inteiro i = 1 / zero; i < 3; i++) {"],
    ["na inicialização", "inteiro zero = 0, i", "para (i = 1 / zero; i < 3; i++) {"],
    ["no incremento", "inteiro v[2], i", "para (i = 0; i < 2; v[i + 5] = 1) {"],
  ])("Um erro %s de um para aponta o para", async (_onde, declaração, para) => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inicio() {
            ${declaração}
            ${para}
              escreva(i)
            }
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 4, column: 5 } });
  });

  test("Na condição de um faca-enquanto, aponta a condição", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          funcao inicio() {
            inteiro v[2] = {1, 2}
            inteiro i = 0
            faca {
              i++
            } enquanto (v[i] > 0)
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 7, column: 17 } });
  });

  test("Numa declaração global, aponta a declaração", async () => {
    await expect(
      runtimeError(portugol`
        programa {
          inteiro zero = 0
          inteiro x = 10 / zero

          funcao inicio() {
            escreva(x)
          }
        }
      `),
    ).resolves.toMatchObject({ position: { line: 3, column: 3 } });
  });

  test("Durante a depuração, aponta o mesmo lugar", async () => {
    await expect(
      runtimeError(
        portugol`
          programa {
            funcao inicio() {
              inteiro v[3]
              v[3] = 1
            }
          }
        `,
        { debugSteps: true },
      ),
    ).resolves.toMatchObject({ position: { line: 4, column: 5 } });
  });
});
