import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Incremento e Decremento", () => {
  describe("Como comando", () => {
    test("Incrementa e decrementa a variável", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro x = 5
                x++
                escreva(x, "|")
                x++
                escreva(x, "|")
                x--
                escreva(x)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("6|7|6");
    });

    test("Serve de passo no para", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro i, s = 0
                para (i = 0; i < 5; i++) {
                  s = s + i
                }
                escreva(s, "|", i)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("10|5");
    });

    test("Decrementa no para", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro i
                para (i = 3; i > 0; i--) {
                  escreva(i)
                }
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("321");
    });

    test("Incrementa dentro do enquanto", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro i = 0
                enquanto (i < 4) {
                  escreva(i)
                  i++
                }
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("0123");
    });

    test("Incrementa elemento de vetor", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro v[3] = {10, 20, 30}
                inteiro i = 0
                v[i]++
                v[2]--
                escreva(v[0], "|", v[1], "|", v[2], "|", i)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("11|20|29|0");
    });

    test("Incrementa elemento de matriz", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro m[2][2] = {{1, 2}, {3, 4}}
                m[0][1]++
                m[1][0]--
                escreva(m[0][0], m[0][1], m[1][0], m[1][1])
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("1324");
    });
  });

  describe("Em expressão", () => {
    test("Devolve o valor já alterado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro a = 5
                inteiro r = a++
                escreva("r=", r, " a=", a)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=6 a=6");
    });

    test("O pré-fixado se comporta igual ao pós-fixado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro a = 5, b = 5
                escreva(a++, "|", ++b)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("6|6");
    });

    test("Decremento devolve o valor já alterado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro c = 5
                inteiro r = c--
                escreva("r=", r, " c=", c)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=4 c=4");
    });

    test("Funciona com reais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                real f = 1.5
                real r = f++
                escreva("r=", r, " f=", f)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=2.5 f=2.5");
    });

    test("Passa o valor alterado como argumento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro g = 5
                inteiro r = dobro(g++)
                escreva("r=", r, " g=", g)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=12 g=6");
    });

    test("Imprime o valor alterado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro d = 5
                escreva(d++, "|", d)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("6|6");
    });
  });

  describe("Absorção da expressão", () => {
    test("A soma seguinte entra na atribuição", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro a = 5
                inteiro r = a++ + 10
                escreva("r=", r, " a=", a)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=16 a=16");
    });

    test("A multiplicação seguinte liga ao 1, não ao incremento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro b = 5
                inteiro r = b++ * 2
                escreva("r=", r, " b=", b)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=7 b=7");
    });

    test("A divisão seguinte liga ao 1", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro q = 5
                inteiro r = q++ / 2
                escreva("r=", r, " q=", q)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=5 q=5");
    });

    test("A subtração seguinte entra na atribuição", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro c = 5
                inteiro r = c++ - 3
                escreva("r=", r, " c=", c)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=3 c=3");
    });

    test("O decremento subtrai o restante", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro n = 5
                inteiro r = n-- - 3
                escreva("r=", r, " n=", n)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=1 n=1");
    });

    test("Respeita a precedência do resto da expressão", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro k = 5
                inteiro r = k++ + 10 * 2
                escreva("r=", r, " k=", k)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=26 k=26");
    });

    test("O pré-fixado também absorve", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro m = 5
                inteiro r = ++m + 10
                escreva("r=", r, " m=", m)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=16 m=16");
    });

    test("Absorve dentro do escreva", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro p = 5
                escreva(p++ + 1, "|", p)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("7|7");
    });

    test("Lê a variável já alterada no resto da expressão", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro a = 5
                inteiro r = a++ + a
                escreva("r=", r, " a=", a)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=11 a=11");
    });

    test("Multiplica pela variável já alterada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro k = 2
                inteiro r = k++ * k
                escreva("r=", r, " k=", k)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("r=4 k=4");
    });

    test("Não atravessa a vírgula do escreva", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {

              funcao inicio() {
                inteiro a = 5
                escreva(a++, 10, "|", a)
              }

              funcao inteiro dobro(inteiro x) {
                retorne x * 2
              }
            }
          `,
        ),
      ).resolves.toBe("610|6");
    });
  });
});
