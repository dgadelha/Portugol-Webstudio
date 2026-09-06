import { describe, expect, test } from "vitest";
import { portugolInicio } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Controle de Fluxo", () => {
  describe("se", () => {
    test("Escolhe o ramo verdadeiro", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            se (x > 3) {
              escreva("maior")
            } senao {
              escreva("menor")
            }
          `,
        ),
      ).resolves.toBe("maior");
    });

    test("Aninha condições", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 5
            se (x > 3) {
              se (x > 10) {
                escreva("a")
              } senao {
                escreva("b")
              }
            }
          `,
        ),
      ).resolves.toBe("b");
    });
  });

  describe("enquanto", () => {
    test("Repete enquanto a condição vale", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i = 0
            enquanto (i < 5) {
              escreva(i)
              i++
            }
          `,
        ),
      ).resolves.toBe("01234");
    });

    test("Não executa quando a condição é falsa", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            enquanto (falso) {
              escreva("nunca")
            }
            escreva("fim")
          `,
        ),
      ).resolves.toBe("fim");
    });

    test("Combina condições", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i = 0, j = 10
            enquanto (i < 5 e j > 5) {
              i++
              j--
            }
            escreva(i, "|", j)
          `,
        ),
      ).resolves.toBe("5|5");
    });
  });

  describe("faca enquanto", () => {
    test("Executa ao menos uma vez", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i = 10
            faca {
              escreva(i)
              i++
            } enquanto (i < 5)
          `,
        ),
      ).resolves.toBe("10");
    });
  });

  describe("para", () => {
    test("Percorre de forma crescente e decrescente", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 5; i > 0; i--) {
              escreva(i)
            }
            escreva("|")
            para (i = 0; i < 3; i++) {
              escreva(i)
            }
          `,
        ),
      ).resolves.toBe("54321|012");
    });

    test("Não executa quando a condição já é falsa", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 5; i < 5; i++) {
              escreva("nunca")
            }
            escreva("fim", i)
          `,
        ),
      ).resolves.toBe("fim5");
    });

    test("Aceita passos diferentes de um", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 0; i <= 20; i += 5) {
              escreva(i, " ")
            }
            escreva("|")
            para (i = 1; i < 100; i *= 2) {
              escreva(i, " ")
            }
          `,
        ),
      ).resolves.toBe("0 5 10 15 20 |1 2 4 8 16 32 64 ");
    });

    test("Aninha laços", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, j
            para (i = 0; i < 3; i++) {
              para (j = 0; j < 2; j++) {
                escreva(i, j, " ")
              }
            }
          `,
        ),
      ).resolves.toBe("00 01 10 11 20 21 ");
    });
  });

  describe("pare", () => {
    test("Interrompe o para", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 0; i < 10; i++) {
              se (i == 3) {
                pare
              }

              escreva(i)
            }
          `,
        ),
      ).resolves.toBe("012");
    });

    test("Interrompe o enquanto", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i = 0
            enquanto (verdadeiro) {
              escreva(i)
              i++

              se (i > 3) {
                pare
              }
            }
          `,
        ),
      ).resolves.toBe("0123");
    });

    test("Interrompe apenas o laço mais interno", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, j
            para (i = 0; i < 3; i++) {
              para (j = 0; j < 3; j++) {
                se (j == 1) {
                  pare
                }

                escreva(i, j, " ")
              }
            }
          `,
        ),
      ).resolves.toBe("00 10 20 ");
    });
  });

  describe("escolha", () => {
    test("Executa o caso correspondente", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 2
            escolha (x) {
              caso 1:
                escreva("um")
              pare
              caso 2:
                escreva("dois")
              pare
              caso contrario:
                escreva("outro")
            }
          `,
        ),
      ).resolves.toBe("dois");
    });

    test("Continua nos casos seguintes sem pare", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 1
            escolha (x) {
              caso 1:
                escreva("um")
              caso 2:
                escreva("dois")
              caso 3:
                escreva("tres")
              pare
              caso contrario:
                escreva("outro")
            }
          `,
        ),
      ).resolves.toBe("umdoistres");
    });

    test("Cai no caso contrário", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 9
            escolha (x) {
              caso 1:
                escreva("um")
              pare
              caso contrario:
                escreva("outro")
            }
          `,
        ),
      ).resolves.toBe("outro");
    });

    test("Aceita caracteres", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            caracter c = 'c'
            escolha (c) {
              caso 'a':
                escreva(1)
              pare
              caso 'c':
                escreva(3)
              pare
              caso contrario:
                escreva(0)
            }
          `,
        ),
      ).resolves.toBe("3");
    });

    test("Aceita expressões", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro x = 4
            escolha (x % 3) {
              caso 0:
                escreva("zero")
              pare
              caso 1:
                escreva("um")
              pare
              caso 2:
                escreva("dois")
              pare
            }
          `,
        ),
      ).resolves.toBe("um");
    });

    test("Repete a escolha dentro de um laço", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i
            para (i = 0; i < 4; i++) {
              escolha (i) {
                caso 0:
                  escreva("a")
                pare
                caso 1:
                  escreva("b")
                pare
                caso 2:
                  escreva("c")
                pare
                caso contrario:
                  escreva("z")
              }
            }
          `,
        ),
      ).resolves.toBe("abcz");
    });
  });

  describe("Escopo", () => {
    test("Declara variáveis dentro de blocos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i, total = 0
            para (i = 0; i < 3; i++) {
              inteiro x = i * 2
              total = total + x
            }
            escreva(total)
          `,
        ),
      ).resolves.toBe("6");
    });

    test("Altera variáveis externas dentro de blocos", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            inteiro i = 0, s = 0
            enquanto (i < 3) {
              inteiro d = i + 1
              s = s + d
              i++
            }
            escreva(s)
          `,
        ),
      ).resolves.toBe("6");
    });
  });

  describe("Constantes", () => {
    test("Usa constantes de cada tipo", async () => {
      await expect(
        runPortugolCode(
          portugolInicio`
            const inteiro X = 10
            const real TAXA = 1.5
            const cadeia NOME = "portugol"
            escreva(X * 2, "|", TAXA * 2.0, "|", NOME)
          `,
        ),
      ).resolves.toBe("20|3.0|portugol");
    });
  });
});
