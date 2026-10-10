import { describe, expect, test } from "vitest";
import { portugol, portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

// Como no Portugol Studio, os parênteses não mudam o que a expressão é: `(x)` continua sendo a
// variável, e pode receber valor ou ser passado por referência.
describe("Parênteses", () => {
  test("Atribui a uma variável e a uma posição de vetor entre parênteses", async () => {
    await expect(
      runPortugolCode(
        portugolInicio`
          inteiro x
          inteiro v[2]
          (x) = 1
          (v[0]) = 2
          ((x)) += 5
          escreva(x, "|", v[0])
        `,
      ),
    ).resolves.toBe("6|2");
  });

  test("Passa por referência um argumento entre parênteses", async () => {
    await expect(
      runPortugolCode(
        portugol`
          programa {
            funcao g(inteiro &a) {
              a = 7
            }

            funcao h(inteiro &v[]) {
              v[0] = 9
            }

            funcao inicio() {
              inteiro x = 0
              inteiro vv[2]
              g((x))
              h((vv))
              escreva(x, "|", vv[0])
            }
          }
        `,
      ),
    ).resolves.toBe("7|9");
  });

  test("Lê para uma variável entre parênteses", async () => {
    await expect(
      runPortugolCode(
        portugolInicio`
          inteiro x
          inteiro v[2]
          leia((x))
          leia((v[1]))
          escreva(x, "|", v[1])
        `,
        ["3", "4"],
      ),
    ).resolves.toBe("3|4");
  });

  test("Passa vetor e matriz entre parênteses", async () => {
    await expect(
      runPortugolCode(
        portugol`
          programa {
            inclua biblioteca Util --> u

            funcao inteiro s(inteiro v[]) {
              retorne v[0] + v[1]
            }

            funcao inicio() {
              inteiro vv[2] = {1, 2}
              inteiro mm[2][3]
              escreva(s((vv)), "|", u.numero_elementos((vv)), "|", u.numero_colunas((mm)))
            }
          }
        `,
      ),
    ).resolves.toBe("3|2|3");
  });

  test("Inicializa constantes com literais entre parênteses", async () => {
    await expect(
      runPortugolCode(
        portugol`
          programa {
            const inteiro A = (3)
            const inteiro B = -(3)
            const cadeia C = ("a")
            const inteiro D[2] = {(1), 2}
            const inteiro F = (-3)

            funcao inicio() {
              escreva(A, "|", B, "|", C, "|", D[0], "|", F)
            }
          }
        `,
      ),
    ).resolves.toBe("3|-3|a|1|-3");
  });
});
