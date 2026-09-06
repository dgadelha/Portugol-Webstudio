import { describe, expect, test } from "vitest";
import { portugol, portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Números Reais", () => {
  describe("Formatação", () => {
    test("Sempre imprime uma casa decimal", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1.0, "|", 2.5, "|", 100.0)
          `,
        ),
      ).resolves.toBe("1.0|2.5|100.0");
    });

    test("Usa notação decimal abaixo de 10^7", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1000.0, "|", 1234567.0, "|", 9999999.0)
          `,
        ),
      ).resolves.toBe("1000.0|1234567.0|9999999.0");
    });

    test("Usa notação científica a partir de 10^7", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(12345678.0, "|", 10000000.0, "|", 100000000000000000000.0)
          `,
        ),
      ).resolves.toBe("1.2345678E7|1.0E7|1.0E20");
    });

    test("Usa notação científica abaixo de 10^-3", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(0.001, "|", 0.0001, "|", 0.000001)
          `,
        ),
      ).resolves.toBe("0.001|1.0E-4|1.0E-6");
    });

    test("Imprime negativos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(-1.0, "|", -0.001, "|", -12345678.0, "|", -0.5)
          `,
        ),
      ).resolves.toBe("-1.0|-0.001|-1.2345678E7|-0.5");
    });

    test("Imprime dízimas com os dígitos que identificam o valor", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1.0 / 3.0, "|", 0.1 + 0.2, "|", 2.0 / 3.0)
          `,
        ),
      ).resolves.toBe("0.3333333333333333|0.30000000000000004|0.6666666666666666");
    });

    test("Imprime infinito e indeterminação", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real z = 0.0
            escreva(2.0 / z, "|", -2.0 / z, "|", z / z)
          `,
        ),
      ).resolves.toBe("Infinity|-Infinity|NaN");
    });
  });

  describe("Aritmética", () => {
    test("Divide reais sem truncar", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(7.0 / 2.0, "|", 10.0 / 4.0, "|", 2.0 / 4.0)
          `,
        ),
      ).resolves.toBe("3.5|2.5|0.5");
    });

    test("Promove a expressão para real quando há um operando real", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(7 / 2.0, "|", 7.0 / 2, "|", 3 * 1.5, "|", 1 + 0.5)
          `,
        ),
      ).resolves.toBe("3.5|3.5|4.5|1.5");
    });

    test("Promove expressões mistas com várias operações", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(1 + 2 * 3.0 - 4 / 2, "|", 10 / 2.0 / 4)
          `,
        ),
      ).resolves.toBe("5.0|1.25");
    });

    test("Acumula erro de ponto flutuante como o Java", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real s = 0.0
            inteiro i
            para (i = 0; i < 10; i++) {
              s = s + 0.1
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("0.9999999999999999");
    });

    test("Multiplica reais grandes sem transbordar", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real x = 1000000.0
            escreva(x * x, "|", x * 10.0, "|", 1.0 / x)
          `,
        ),
      ).resolves.toBe("1.0E12|1.0E7|1.0E-6");
    });

    test("Compara reais pelo valor exato", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(0.1 + 0.2 == 0.3, "|", 1.0 == 1.0, "|", 1 == 1.0)
          `,
        ),
      ).resolves.toBe("falso|verdadeiro|verdadeiro");
    });
  });

  describe("Zero negativo", () => {
    test("Imprime o sinal do zero", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            escreva(-0.0, "|", 0.0, "|", 0.0 - 0.0)
          `,
        ),
      ).resolves.toBe("-0.0|0.0|0.0");
    });

    test("Preserva o sinal na multiplicação e na divisão", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            real z = 0.0
            escreva(z * (0.0 - 1.0), "|", z / (0.0 - 5.0), "|", (0.0 - 0.0) * 5.0)
          `,
        ),
      ).resolves.toBe("-0.0|-0.0|0.0");
    });

    test("Converte para inteiro e de volta sem sinal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_real(Tipos.real_para_inteiro(0.0 - 0.4)), "|", Tipos.real_para_cadeia(-0.0))
              }
            }
          `,
        ),
      ).resolves.toBe("0.0|-0.0");
    });

    test("Arredonda para zero sem sinal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(0.0 - 0.4, 0), "|", Matematica.valor_absoluto(0.0 - 0.0))
              }
            }
          `,
        ),
      ).resolves.toBe("0.0|0.0");
    });
  });
});
