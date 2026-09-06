import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Tipos", () => {
  describe("cadeia_e_inteiro", () => {
    test("Reconhece inteiros decimais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_inteiro("123", 10), "|", Tipos.cadeia_e_inteiro("-123", 10), "|", Tipos.cadeia_e_inteiro("0", 10))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro");
    });

    test("Rejeita textos que não são inteiros decimais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_inteiro("12a", 10), "|", Tipos.cadeia_e_inteiro("+5", 10), "|", Tipos.cadeia_e_inteiro("1.5", 10), "|", Tipos.cadeia_e_inteiro("", 10))
              }
            }
          `,
        ),
      ).resolves.toBe("falso|falso|falso|falso");
    });

    test("Reconhece a notação binária", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_inteiro("1010", 2), "|", Tipos.cadeia_e_inteiro("0b1010", 2), "|", Tipos.cadeia_e_inteiro("2", 2))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso");
    });

    test("Reconhece a notação hexadecimal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_inteiro("FF", 16), "|", Tipos.cadeia_e_inteiro("0xFF", 16), "|", Tipos.cadeia_e_inteiro("ff", 16), "|", Tipos.cadeia_e_inteiro("g", 16))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|verdadeiro|falso");
    });

    test("Base inválida interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_e_inteiro("1", 8))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("cadeia_e_real", () => {
    test("Exige dígitos dos dois lados do ponto", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_real("1.5"), "|", Tipos.cadeia_e_real("-1.5"), "|", Tipos.cadeia_e_real("1"), "|", Tipos.cadeia_e_real("1."), "|", Tipos.cadeia_e_real(".5"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso|falso|falso");
    });

    test("Rejeita sobras e o sinal positivo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_real("1.5x"), "|", Tipos.cadeia_e_real("x1.5"), "|", Tipos.cadeia_e_real("+1.5"))
              }
            }
          `,
        ),
      ).resolves.toBe("falso|falso|falso");
    });
  });

  describe("cadeia_e_logico", () => {
    test("Reconhece verdadeiro e falso", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_logico("verdadeiro"), "|", Tipos.cadeia_e_logico("falso"), "|", Tipos.cadeia_e_logico("talvez"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso");
    });

    test("Diferencia maiúsculas de minúsculas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_logico("VERDADEIRO"), "|", Tipos.cadeia_e_logico("Falso"))
              }
            }
          `,
        ),
      ).resolves.toBe("falso|falso");
    });

    test("Aceita prefixo de verdadeiro e sufixo de falso", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_logico("verdadeiroX"), "|", Tipos.cadeia_e_logico("Xfalso"), "|", Tipos.cadeia_e_logico("Xverdadeiro"), "|", Tipos.cadeia_e_logico("falsoX"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso|falso");
    });
  });

  describe("cadeia_e_caracter", () => {
    test("Aceita apenas cadeias de um caractere", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_e_caracter("a"), "|", Tipos.cadeia_e_caracter("ab"), "|", Tipos.cadeia_e_caracter(""), "|", Tipos.cadeia_e_caracter("ç"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|falso|falso|verdadeiro");
    });
  });

  describe("cadeia_para_caracter", () => {
    test("Converte cadeias de um caractere", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_caracter("x"), "|", Tipos.cadeia_para_caracter("ç"))
              }
            }
          `,
        ),
      ).resolves.toBe("x|ç");
    });

    test("Cadeia com mais de um caractere interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_caracter("ab"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("cadeia_para_inteiro", () => {
    test("Converte decimais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_inteiro("123", 10), "|", Tipos.cadeia_para_inteiro("-42", 10), "|", Tipos.cadeia_para_inteiro("+5", 10), "|", Tipos.cadeia_para_inteiro("007", 10))
              }
            }
          `,
        ),
      ).resolves.toBe("123|-42|5|7");
    });

    test("Converte binários com e sem prefixo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_inteiro("1010", 2), "|", Tipos.cadeia_para_inteiro("0b1010", 2), "|", Tipos.cadeia_para_inteiro("0B11", 2))
              }
            }
          `,
        ),
      ).resolves.toBe("10|10|3");
    });

    test("Converte hexadecimais com e sem prefixo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_inteiro("FF", 16), "|", Tipos.cadeia_para_inteiro("0xff", 16), "|", Tipos.cadeia_para_inteiro("0XFF", 16))
              }
            }
          `,
        ),
      ).resolves.toBe("255|255|255");
    });

    test("Converte para 32 bits com sinal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_inteiro("7FFFFFFF", 16), "|", Tipos.cadeia_para_inteiro("80000000", 16), "|", Tipos.cadeia_para_inteiro("FFFFFFFF", 16))
              }
            }
          `,
        ),
      ).resolves.toBe("2147483647|-2147483648|-1");
    });

    test("Texto com sobras interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_inteiro("12abc", 10))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Texto com espaços interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_inteiro("  12  ", 10))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Texto vazio interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_inteiro("", 10))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Não altera a cadeia recebida", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                cadeia s = "0xFF"
                inteiro n = Tipos.cadeia_para_inteiro(s, 16)
                escreva(n, "|", s)
              }
            }
          `,
        ),
      ).resolves.toBe("255|0xFF");
    });
  });

  describe("cadeia_para_real", () => {
    test("Converte as notações aceitas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_real("1.5"), "|", Tipos.cadeia_para_real("-1.5"), "|", Tipos.cadeia_para_real("10"), "|", Tipos.cadeia_para_real(".5"), "|", Tipos.cadeia_para_real("5."))
              }
            }
          `,
        ),
      ).resolves.toBe("1.5|-1.5|10.0|0.5|5.0");
    });

    test("Converte notação científica", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_real("1e3"), "|", Tipos.cadeia_para_real("1E-3"), "|", Tipos.cadeia_para_real("-0.0"), "|", Tipos.cadeia_para_real("0"))
              }
            }
          `,
        ),
      ).resolves.toBe("1000.0|0.001|-0.0|0.0");
    });

    test("Descarta espaços nas pontas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_real("  2.5  "))
              }
            }
          `,
        ),
      ).resolves.toBe("2.5");
    });

    test("Texto com sobras interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_real("1.5abc"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Texto sem número interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_real("abc"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("cadeia_para_real (sufixo de tipo)", () => {
    test("Aceita o sufixo apenas em literais numéricos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_real("1.5f"), "|", Tipos.cadeia_para_real("2.5D"))
              }
            }
          `,
        ),
      ).resolves.toBe("1.5|2.5");
    });

    test("Sufixo em NaN interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_real("NaNf"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("cadeia_para_logico", () => {
    test("Converte verdadeiro e falso", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_logico("verdadeiro"), "|", Tipos.cadeia_para_logico("falso"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|falso");
    });

    test("Outro texto interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.cadeia_para_logico("VERDADEIRO"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("inteiro_e_caracter", () => {
    test("Aceita apenas dígitos de 0 a 9", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_e_caracter(0), "|", Tipos.inteiro_e_caracter(9), "|", Tipos.inteiro_e_caracter(10), "|", Tipos.inteiro_e_caracter(0 - 1))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso|falso");
    });
  });

  describe("inteiro_para_cadeia", () => {
    test("Converte na base decimal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_cadeia(255, 10), "|", Tipos.inteiro_para_cadeia(0, 10), "|", Tipos.inteiro_para_cadeia(0 - 1, 10))
              }
            }
          `,
        ),
      ).resolves.toBe("255|0|-1");
    });

    test("Converte na base binária com 32 dígitos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_cadeia(255, 2), "|", Tipos.inteiro_para_cadeia(0, 2))
              }
            }
          `,
        ),
      ).resolves.toBe("00000000000000000000000011111111|00000000000000000000000000000000");
    });

    test("Converte negativos em binário", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_cadeia(0 - 1, 2))
              }
            }
          `,
        ),
      ).resolves.toBe("11111111111111111111111111111111");
    });

    test("Converte na base hexadecimal com 8 dígitos e sem prefixo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_cadeia(255, 16), "|", Tipos.inteiro_para_cadeia(0, 16), "|", Tipos.inteiro_para_cadeia(2147483647, 16), "|", Tipos.inteiro_para_cadeia(0 - 1, 16))
              }
            }
          `,
        ),
      ).resolves.toBe("000000FF|00000000|7FFFFFFF|FFFFFFFF");
    });

    test("Base inválida interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.inteiro_para_cadeia(1, 8))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("inteiro_para_caracter", () => {
    test("Converte dígitos de 0 a 9", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_caracter(0), Tipos.inteiro_para_caracter(7), Tipos.inteiro_para_caracter(9))
              }
            }
          `,
        ),
      ).resolves.toBe("079");
    });

    test("Valor acima de 9 interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.inteiro_para_caracter(10))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("inteiro_para_logico e inteiro_para_real", () => {
    test("Trata positivos como verdadeiro", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_logico(0), "|", Tipos.inteiro_para_logico(1), "|", Tipos.inteiro_para_logico(0 - 5), "|", Tipos.inteiro_para_logico(100))
              }
            }
          `,
        ),
      ).resolves.toBe("falso|verdadeiro|falso|verdadeiro");
    });

    test("Converte inteiro para real", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_real(42), "|", Tipos.inteiro_para_real(0), "|", Tipos.inteiro_para_real(0 - 7))
              }
            }
          `,
        ),
      ).resolves.toBe("42.0|0.0|-7.0");
    });
  });

  describe("caracter_e_inteiro", () => {
    test("Aceita apenas dígitos decimais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_e_inteiro('0'), "|", Tipos.caracter_e_inteiro('9'), "|", Tipos.caracter_e_inteiro('A'), "|", Tipos.caracter_e_inteiro('f'), "|", Tipos.caracter_e_inteiro(' '))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro|falso|falso|falso");
    });
  });

  describe("caracter_e_logico", () => {
    test("Aceita S, s, N e n", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_e_logico('S'), Tipos.caracter_e_logico('s'), Tipos.caracter_e_logico('N'), Tipos.caracter_e_logico('n'), "|", Tipos.caracter_e_logico('x'))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiroverdadeiroverdadeiroverdadeiro|falso");
    });
  });

  describe("caracter_para_cadeia e caracter_para_inteiro", () => {
    test("Converte caracter em cadeia", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_para_cadeia('z'), "|", Tipos.caracter_para_cadeia('ç'))
              }
            }
          `,
        ),
      ).resolves.toBe("z|ç");
    });

    test("Converte dígitos em inteiro", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_para_inteiro('7'), "|", Tipos.caracter_para_inteiro('0'))
              }
            }
          `,
        ),
      ).resolves.toBe("7|0");
    });

    test("Caracter que não é dígito interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.caracter_para_inteiro('a'))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("caracter_para_logico", () => {
    test("Converte S e N", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.caracter_para_logico('S'), Tipos.caracter_para_logico('s'), "|", Tipos.caracter_para_logico('N'), Tipos.caracter_para_logico('n'))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiroverdadeiro|falsofalso");
    });

    test("Outro caracter interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva("antes ")
                escreva(Tipos.caracter_para_logico('x'))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("logico_para_*", () => {
    test("Converte lógico para os demais tipos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(
                  Tipos.logico_para_cadeia(verdadeiro), "|", Tipos.logico_para_cadeia(falso), "|",
                  Tipos.logico_para_inteiro(verdadeiro), Tipos.logico_para_inteiro(falso), "|",
                  Tipos.logico_para_caracter(verdadeiro), Tipos.logico_para_caracter(falso)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|falso|10|SN");
    });
  });

  describe("real_para_cadeia", () => {
    test("Usa o mesmo formato do escreva", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_cadeia(1.0), "|", Tipos.real_para_cadeia(2.5), "|", Tipos.real_para_cadeia(1000.0))
              }
            }
          `,
        ),
      ).resolves.toBe("1.0|2.5|1000.0");
    });

    test("Usa notação científica nos extremos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_cadeia(12345678.0), "|", Tipos.real_para_cadeia(0.0001), "|", Tipos.real_para_cadeia(0.001))
              }
            }
          `,
        ),
      ).resolves.toBe("1.2345678E7|1.0E-4|0.001");
    });

    test("Converte negativos e dízimas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_cadeia(-1.5), "|", Tipos.real_para_cadeia(1.0 / 4.0), "|", Tipos.real_para_cadeia(1.0 / 3.0))
              }
            }
          `,
        ),
      ).resolves.toBe("-1.5|0.25|0.3333333333333333");
    });
  });

  describe("real_para_inteiro", () => {
    test("Trunca em direção ao zero", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_inteiro(3.99), "|", Tipos.real_para_inteiro(-3.99), "|", Tipos.real_para_inteiro(0.5), "|", Tipos.real_para_inteiro(-0.5))
              }
            }
          `,
        ),
      ).resolves.toBe("3|-3|0|0");
    });

    test("Converte valores exatos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_inteiro(0.0), "|", Tipos.real_para_inteiro(42.0), "|", Tipos.real_para_inteiro(-42.0))
              }
            }
          `,
        ),
      ).resolves.toBe("0|42|-42");
    });
  });

  describe("real_para_inteiro (zero negativo)", () => {
    test("Trunca para zero positivo entre -1 e 0", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.inteiro_para_real(Tipos.real_para_inteiro(0.0 - 0.5)))
              }
            }
          `,
        ),
      ).resolves.toBe("0.0");
    });
  });

  describe("Conversões de ida e volta", () => {
    test("Converte cadeia para real e de volta", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.real_para_cadeia(Tipos.cadeia_para_real("3.14")))
              }
            }
          `,
        ),
      ).resolves.toBe("3.14");
    });

    test("Converte inteiro para cadeia e de volta em todas as bases", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(
                  Tipos.cadeia_para_inteiro(Tipos.inteiro_para_cadeia(42, 10), 10), "|",
                  Tipos.cadeia_para_inteiro(Tipos.inteiro_para_cadeia(42, 2), 2), "|",
                  Tipos.cadeia_para_inteiro(Tipos.inteiro_para_cadeia(42, 16), 16)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("42|42|42");
    });

    test("Converte lógico para cadeia e de volta", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                escreva(Tipos.cadeia_para_logico(Tipos.logico_para_cadeia(verdadeiro)), "|", Tipos.cadeia_para_logico(Tipos.logico_para_cadeia(falso)))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|falso");
    });

    test("Lê um número digitado pelo usuário", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Tipos

              funcao inicio() {
                cadeia s
                leia(s)
                escreva(Tipos.cadeia_para_inteiro(s, 10) + 1)
              }
            }
          `,
          ["41"],
        ),
      ).resolves.toBe("42");
    });
  });
});
