import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Util", () => {
  describe("numero_elementos", () => {
    test("Conta os elementos do vetor", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[7]
                real r[3]
                cadeia c[1]
                escreva(Util.numero_elementos(v), "|", Util.numero_elementos(r), "|", Util.numero_elementos(c))
              }
            }
          `,
        ),
      ).resolves.toBe("7|3|1");
    });

    test("Conta os elementos de um vetor inicializado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[] = {1, 2, 3, 4}
                escreva(Util.numero_elementos(v))
              }
            }
          `,
        ),
      ).resolves.toBe("4");
    });

    test("Serve como limite de laço", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro v[] = {10, 20, 30}, i, s = 0
                para (i = 0; i < Util.numero_elementos(v); i++) {
                  s = s + v[i]
                }
                escreva(s)
              }
            }
          `,
        ),
      ).resolves.toBe("60");
    });
  });

  describe("numero_linhas e numero_colunas", () => {
    test("Informa as dimensões da matriz", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro m[3][5]
                escreva(Util.numero_linhas(m), "|", Util.numero_colunas(m))
              }
            }
          `,
        ),
      ).resolves.toBe("3|5");
    });

    test("Informa as dimensões de uma matriz inicializada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro m[2][3] = {{1, 2, 3}, {4, 5, 6}}
                escreva(Util.numero_linhas(m), "|", Util.numero_colunas(m))
              }
            }
          `,
        ),
      ).resolves.toBe("2|3");
    });

    test("Percorre a matriz pelas dimensões", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro m[2][3], i, j, s = 0
                para (i = 0; i < Util.numero_linhas(m); i++) {
                  para (j = 0; j < Util.numero_colunas(m); j++) {
                    m[i][j] = i + j
                    s = s + m[i][j]
                  }
                }
                escreva(s)
              }
            }
          `,
        ),
      ).resolves.toBe("9");
    });
  });

  describe("sorteia", () => {
    test("Sorteia dentro da faixa informada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro i, x, ok = 1
                para (i = 0; i < 200; i++) {
                  x = Util.sorteia(1, 6)

                  se (x < 1 ou x > 6) {
                    ok = 0
                  }
                }
                escreva(ok)
              }
            }
          `,
        ),
      ).resolves.toBe("1");
    });

    test("Sorteia faixas com negativos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro i, x, ok = 1
                para (i = 0; i < 200; i++) {
                  x = Util.sorteia(0 - 5, 5)

                  se (x < 0 - 5 ou x > 5) {
                    ok = 0
                  }
                }
                escreva(ok)
              }
            }
          `,
        ),
      ).resolves.toBe("1");
    });

    test("Alcança os dois extremos da faixa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro i, x, viuMin = 0, viuMax = 0
                para (i = 0; i < 500; i++) {
                  x = Util.sorteia(1, 2)

                  se (x == 1) {
                    viuMin = 1
                  }

                  se (x == 2) {
                    viuMax = 1
                  }
                }
                escreva(viuMin, viuMax)
              }
            }
          `,
        ),
      ).resolves.toBe("11");
    });

    test("Mínimo maior que o máximo interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                escreva("antes ")
                escreva(Util.sorteia(10, 1))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Mínimo igual ao máximo interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                escreva("antes ")
                escreva(Util.sorteia(5, 5))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("tempo_decorrido", () => {
    test("Começa em zero ou mais", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                escreva(Util.tempo_decorrido() >= 0)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("Avança depois de aguardar", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                Util.aguarde(50)
                escreva(Util.tempo_decorrido() >= 50)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });
  });

  describe("aguarde", () => {
    test("Pausa e continua o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                escreva("antes ")
                Util.aguarde(10)
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes depois");
    });

    test("Aceita pausa de zero milissegundo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                Util.aguarde(0)
                escreva("ok")
              }
            }
          `,
        ),
      ).resolves.toBe("ok");
    });

    test("Pausa dentro de um laço", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Util

              funcao inicio() {
                inteiro i
                para (i = 0; i < 3; i++) {
                  Util.aguarde(5)
                  escreva(i)
                }
              }
            }
          `,
        ),
      ).resolves.toBe("012");
    });
  });
});
