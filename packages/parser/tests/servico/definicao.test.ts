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

    test.each([
      ["o nome da biblioteca usado no código", "Texto.", "Tex▮to.", "bibliotecas/Texto.md"],
      ["o nome da biblioteca no inclua", "Matematica -->", "Mate▮matica -->", "bibliotecas/Matematica.md"],
      ["o apelido no próprio inclua", "--> mat", "--> ma▮t", "bibliotecas/Matematica.md"],
    ])("%s vai para a página da biblioteca na Ajuda", (_, de, para, ajuda) => {
      expect(definiçãoEm(código.replace("▮mat", "mat").replace(de, para))).toMatchObject({ ajuda });
    });

    // Sem declaração no código, a definição é a página na Ajuda, a mesma do link da informação.
    test.each([
      ["a função da biblioteca", "mat.potencia", "mat.pot▮encia", "bibliotecas/Matematica/potencia.md"],
      ["a constante da biblioteca", "mat.potencia(2.0, 3.0)", "mat.PI▮", "bibliotecas/Matematica/PI.md"],
      [
        "a função pelo nome da biblioteca",
        "Texto.numero_caracteres",
        "Texto.numero_carac▮teres",
        "bibliotecas/Texto/numero_caracteres.md",
      ],
      ["a função da linguagem", "escreva(mat", "escr▮eva(mat", "topicos/linguagem_portugol/entrada_saida/escreva.md"],
    ])("%s vai para a página dela na Ajuda", (_, de, para, ajuda) => {
      expect(definiçãoEm(código.replace("▮mat", "mat").replace(de, para))).toMatchObject({ ajuda });
    });

    describe("a declaração escrita como no código, para a prévia e o Peek", () => {
      /**
       * A declaração e o texto do nome no intervalo dela.
       */
      function declaração(de: string, para: string) {
        const definição = definiçãoEm(código.replace("▮mat", "mat").replace(de, para));

        if (!definição || !("ajuda" in definição)) {
          throw new Error("Sem página na Ajuda");
        }

        const { texto, intervalo } = definição.declaração;
        const linha = texto.split("\n")[intervalo.linha - 1];

        return { texto, nome: linha.slice(intervalo.início - 1, intervalo.fim - 1), última: intervalo.linha };
      }

      test("a função da biblioteca: a explicação em comentários e a assinatura", () => {
        const { texto, nome, última } = declaração("mat.potencia", "mat.pot▮encia");

        expect(texto).toBe(
          [
            "// Calcula a potência de um número, ou seja, a `base` elevada ao `expoente`",
            "//",
            "// Parâmetros:",
            "//",
            "// - `base` (real): o número que será elevado ao expoente",
            "// - `expoente` (real): o expoente, que pode ser negativo ou fracionário. Ex.: com expoente 2, a base é multiplicada por ela mesma.",
            "//",
            "// Retorno (real): a `base` elevada ao `expoente`",
            "funcao real potencia(real base, real expoente)",
          ].join("\n"),
        );
        expect({ nome, última }).toEqual({ nome: "potencia", última: 9 });
      });

      test("a biblioteca: a explicação e o inclua, sem apelido", () => {
        const { texto, nome } = declaração("Matematica -->", "Mate▮matica -->");

        expect(texto.split("\n").at(-1)).toBe("inclua biblioteca Matematica");
        expect(texto.startsWith("// ")).toBe(true);
        expect(nome).toBe("Matematica");
      });

      test("a constante", () => {
        const { texto, nome } = declaração("mat.potencia(2.0, 3.0)", "mat.PI▮");

        expect(texto).toBe(
          "// A constante matemática π (pi): a razão entre o perímetro de uma circunferência e o seu diâmetro\nconst real PI",
        );
        expect(nome).toBe("PI");
      });

      test("a função da linguagem", () => {
        const { texto, nome } = declaração("escreva(mat", "escr▮eva(mat");

        expect(texto).toBe(
          "// Escreve no console os valores entre parênteses, um depois do outro. Eles podem ser textos, variáveis ou operações, separados por vírgulas.\nfuncao vazio escreva(...)",
        );
        expect(nome).toBe("escreva");
      });
    });

    test("a função da linguagem sem página não tem definição", () => {
      expect(definiçãoEm(código.replace("escreva(▮mat", "sortei▮a(1, 6) + escreva(mat"))).toBeNull();
    });

    test("a biblioteca que o Webstudio não executa não tem definição", () => {
      expect(
        definiçãoEm`
          programa {
            inclua biblioteca Arquivos --> a

            funcao inicio() {
              a.abrir_arq▮uivo("x", a.MODO_LEITURA)
            }
          }
        `,
      ).toBeNull();
    });

    test("o nome de uma biblioteca que o Webstudio não executa fica no inclua", () => {
      expect(
        definiçãoEm`
          programa {
            inclua biblioteca Arqui▮vos --> a

            funcao inicio() {
            }
          }
        `,
      ).toMatchObject({ linha: 2, texto: "Arquivos" });
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
