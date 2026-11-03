import { describe, expect, test } from "vitest";

import { portugol } from "../helpers/code";
import { definiçãoEm } from "../helpers/cursor";

describe("ir para a definição", () => {
  test.each([
    ["no começo", "▮idade"],
    ["no meio", "ida▮de"],
    ["no fim", "idade▮"],
  ])("a variável local, com o cursor %s do nome", (_, nome) => {
    const definição = definiçãoEm(`programa {
  funcao inicio() {
    inteiro idade = 3
    escreva(${nome})
  }
}`);

    expect(definição).toEqual({ linha: 3, início: 13, fim: 18, texto: "idade" });
  });

  test("no fim de um nome colado no parêntese, o nome", () => {
    expect(
      definiçãoEm`
        programa {
          funcao inicio() {
            dobro▮(2)
          }

          funcao inteiro dobro(inteiro x) {
            retorne x * 2
          }
        }
      `,
    ).toMatchObject({ linha: 6, texto: "dobro" });
  });

  test.each([
    ["a constante", "total = MAX▮IMO", { linha: 2, texto: "MAXIMO" }],
    ["a variável global", "to▮tal = MAXIMO", { linha: 3, texto: "total" }],
  ])("%s", (_, uso, esperado) => {
    const código = portugol`
      programa {
        const inteiro MAXIMO = 10
        real total

        funcao inicio() {
          ${uso}
        }
      }
    `;

    expect(definiçãoEm(código)).toMatchObject(esperado);
  });

  test.each([
    ["o vetor", "n = v▮[0] + m[0][0]", { linha: 5, início: 23, texto: "v" }],
    ["a matriz", "n = v[0] + m▮[0][0]", { linha: 5, texto: "m" }],
    ["o parâmetro por referência", "▮n = v[0] + m[0][0]", { linha: 5, texto: "n" }],
  ])("o parâmetro: %s", (_, uso, esperado) => {
    const código = portugol`
      programa {
        funcao inicio() {
        }

        funcao soma(inteiro v[], inteiro m[][], inteiro &n) {
          ${uso}
        }
      }
    `;

    expect(definiçãoEm(código)).toMatchObject(esperado);
  });

  test("a função declarada depois do uso", () => {
    expect(
      definiçãoEm`
        programa {
          funcao inicio() {
            escreva(med▮ia(1.0, 2.0))
          }

          funcao real media(real a, real b) {
            retorne (a + b) / 2
          }
        }
      `,
    ).toMatchObject({ linha: 6, texto: "media" });
  });

  test("no próprio nome da declaração, a própria declaração", () => {
    expect(
      definiçãoEm`
        programa {
          funcao inicio() {
            inteiro ida▮de = 3
          }
        }
      `,
    ).toMatchObject({ linha: 3, texto: "idade" });
    expect(definiçãoEm("programa {\n  funcao ini▮cio() {\n  }\n}")).toMatchObject({ linha: 2, texto: "inicio" });
  });

  describe("ocultação", () => {
    test("a local esconde a global", () => {
      expect(
        definiçãoEm`
          programa {
            inteiro x = 1

            funcao inicio() {
              inteiro x = 2
              escreva(▮x)
            }
          }
        `,
      ).toMatchObject({ linha: 5 });
    });

    test("o parâmetro esconde a global", () => {
      expect(
        definiçãoEm`
          programa {
            inteiro x = 1

            funcao inicio() {
            }

            funcao f(inteiro x) {
              escreva(x▮)
            }
          }
        `,
      ).toMatchObject({ linha: 7, texto: "x" });
    });

    test.each([
      ["a do para, no laço", "i▮", "i", 5],
      ["a global, depois do laço", "i", "i▮", 2],
    ])("a variável do para: %s", (_, noLaço, depois, linha) => {
      const código = portugol`
        programa {
          inteiro i = 0

          funcao inicio() {
            para (inteiro i = 0; i < 10; i++) {
              escreva(${noLaço})
            }
            escreva(${depois})
          }
        }
      `;

      expect(definiçãoEm(código)).toMatchObject({ linha });
    });

    test("a local usada antes da declaração é a global, como no analisador", () => {
      expect(
        definiçãoEm`
          programa {
            inteiro x = 1

            funcao inicio() {
              escreva(x▮)
              inteiro x = 2
            }
          }
        `,
      ).toMatchObject({ linha: 2 });
    });

    test("e sem global, não é nada", () => {
      expect(
        definiçãoEm`
          programa {
            funcao inicio() {
              escreva(x▮)
              inteiro x = 2
            }
          }
        `,
      ).toBeNull();
    });

    test("a local de outra função não vale", () => {
      expect(
        definiçãoEm`
          programa {
            funcao inicio() {
              inteiro y = 2
            }

            funcao f() {
              escreva(y▮)
            }
          }
        `,
      ).toBeNull();
    });
  });

  describe("bibliotecas", () => {
    const código = portugol`
      programa {
        inclua biblioteca Matematica --> mat
        inclua biblioteca Texto

        funcao inicio() {
          escreva(▮mat.potencia(2.0, 3.0), Texto.numero_caracteres("a"))
        }
      }
    `;

    test("o apelido vai para o apelido no inclua", () => {
      expect(definiçãoEm(código)).toMatchObject({ linha: 2, texto: "mat" });
    });

    test("o nome da biblioteca vai para o nome no inclua", () => {
      expect(definiçãoEm(código.replace("▮mat", "mat").replace("Texto.", "Tex▮to."))).toMatchObject({
        linha: 3,
        texto: "Texto",
      });
    });

    test("no inclua, o próprio nome ou apelido", () => {
      expect(definiçãoEm(código.replace("--> mat", "--> ma▮t").replace("▮mat.", "mat."))).toMatchObject({
        linha: 2,
        texto: "mat",
      });
      expect(definiçãoEm(código.replace("Matematica -->", "Mate▮matica -->").replace("▮mat.", "mat."))).toMatchObject({
        linha: 2,
        texto: "Matematica",
      });
    });

    test.each([
      ["a função", "▮mat.potencia", "mat.pot▮encia"],
      ["a constante", "▮mat.potencia(2.0, 3.0)", "mat.PI▮"],
    ])("%s da biblioteca não tem declaração no código", (_, de, para) => {
      expect(definiçãoEm(código.replace(de, para))).toBeNull();
    });

    test("nem as funções da linguagem", () => {
      expect(definiçãoEm(código.replace("escreva(▮mat", "escr▮eva(mat"))).toBeNull();
    });
  });

  describe("com o código pela metade", () => {
    test("um parêntese aberto depois do nome", () => {
      expect(
        definiçãoEm`
          programa {
            funcao inicio() {
              inteiro idade = 3
              escreva(idade▮
            }
          }
        `,
      ).toMatchObject({ linha: 3, texto: "idade" });
    });

    test("uma chave aberta e sem a } do fim", () => {
      expect(
        definiçãoEm`
          programa {
            funcao inicio() {
              inteiro idade = 3
              se (idade▮ > 2) {
        `,
      ).toMatchObject({ linha: 3, texto: "idade" });
    });

    test("a função declarada depois, com a chamada pela metade", () => {
      expect(
        definiçãoEm`
          programa {
            funcao inicio() {
              dobro▮(
            }

            funcao inteiro dobro(inteiro x) {
              retorne x * 2
            }
          }
        `,
      ).toMatchObject({ linha: 6, texto: "dobro" });
    });
  });

  describe("colunas", () => {
    test("um emoji antes do nome usado conta duas colunas, como no editor", () => {
      const definição = definiçãoEm`
        programa {
          funcao inicio() {
            inteiro idade = 3
            escreva("😀", ida▮de)
          }
        }
      `;

      expect(definição).toMatchObject({ linha: 3, texto: "idade" });
    });

    test("um emoji antes do nome declarado, na mesma linha", () => {
      const definição = definiçãoEm`
        programa {
          funcao inicio() {
            cadeia rosto = "😀", nome = "Ana"
            escreva(no▮me)
          }
        }
      `;

      expect(definição).toMatchObject({ linha: 3, início: 26, fim: 30, texto: "nome" });
    });
  });
});
