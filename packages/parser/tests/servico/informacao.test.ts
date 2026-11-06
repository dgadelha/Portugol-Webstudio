import { describe, expect, test } from "vitest";

import { obterBiblioteca, obterConstante } from "../../src";
import { chamávelDaBiblioteca, FUNÇÕES_DA_LINGUAGEM } from "../../src/servico/chamáveis";
import { textoDoComentário } from "../../src/servico/comentários";
import { portugol } from "../helpers/code";
import { informaçãoEm } from "../helpers/cursor";

function bloco(código: string) {
  return "```portugol\n" + código + "\n```";
}

/**
 * Um programa com a declaração e o uso, para olhar a informação no uso.
 */
function noUso(declaração: string, uso: string) {
  return informaçãoEm(portugol`
    programa {
      ${declaração}

      funcao inicio() {
        ${uso}
      }
    }
  `)?.conteúdo;
}

describe("informação ao parar sobre um nome", () => {
  // Redeclaração: o analisador guarda a função, e a global com o nome dela fica de fora.
  test("a global com o nome de uma função: a função", () => {
    const informação = informaçãoEm(
      "programa {\n  inteiro f = 1\n\n  funcao inicio() {\n    f▮()\n  }\n\n  funcao f() {\n  }\n}",
    );

    expect(informação?.conteúdo).toBe(bloco("funcao vazio f()"));
  });

  test("a variável local: a declaração e o que ela é", () => {
    const informação = informaçãoEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          escreva(ida▮de)
        }
      }
    `;

    expect(informação).toEqual({
      intervalo: { linha: 4, início: 13, fim: 18 },
      conteúdo: bloco("inteiro idade") + "\n\nvariável local",
      variável: { nome: "idade", função: "inicio", descrição: "variável local" },
    });
  });

  test.each([
    ["a variável", "real total", "to▮tal = 1.0", "real total", "variável global"],
    ["o vetor", "cadeia nomes[3]", 'nomes▮[0] = ""', "cadeia nomes[]", "vetor global"],
    [
      "a matriz constante",
      "const inteiro M[2][2] = {{1, 2}, {3, 4}}",
      "escreva(▮M[0][0])",
      "const inteiro M[][]",
      "matriz constante global",
    ],
  ])("%s", (_, declaração, uso, código, oQueÉ) => {
    expect(noUso(declaração, uso)).toBe(bloco(código) + "\n\n" + oQueÉ);
  });

  test("a matriz local", () => {
    expect(
      informaçãoEm("programa {\n  funcao inicio() {\n    logico l[2][2]\n    l▮[0][0] = falso\n  }\n}")?.conteúdo,
    ).toBe(bloco("logico l[][]") + "\n\nmatriz local");
  });

  test.each([
    ["inteiro", "const inteiro MAXIMO = 10"],
    ["real negativo", "const real TAXA = -1.5"],
    ["cadeia", 'const cadeia NOME = "Ana Maria"'],
    ["caracter", "const caracter C = 'a'"],
    ["logico", "const logico SIM = verdadeiro"],
  ])("a constante com um literal mostra o valor: %s", (_, declaração) => {
    const nome = declaração.split(" ", 3)[2];

    expect(noUso(declaração, `escreva(${nome}▮)`)).toBe(bloco(declaração) + "\n\nconstante global");
  });

  // Uma cadeia pode ter várias linhas: uma linha só com três crases não pode fechar o bloco e
  // deixar o resto (um link, uma imagem de fora) virar Markdown.
  test("uma cadeia de várias linhas não fecha o bloco de código antes da hora", () => {
    const valor = '"a\n```\n![x](https://exemplo.com/x.png)\nb"';
    const conteúdo = informaçãoEm(
      `programa {\n  const cadeia X = ${valor}\n\n  funcao inicio() {\n    escreva(X▮)\n  }\n}`,
    )?.conteúdo;

    expect(conteúdo).toBe("````portugol\nconst cadeia X = " + valor + "\n````\n\nconstante global");
  });

  test("a constante com uma conta não mostra o valor", () => {
    expect(noUso("const inteiro A = 2, B = A * 3", "escreva(B▮)")).toBe(
      bloco("const inteiro B") + "\n\nconstante global",
    );
  });

  test.each([
    ["o vetor", "real x", "total = v▮[0]", "inteiro v[]", "parâmetro vetor"],
    ["por referência", "real x", "tot▮al = v[0]", "inteiro &total", "parâmetro por referência"],
    ["na declaração", "real x▮", "total = v[0]", "real x", "parâmetro"],
  ])("o parâmetro: %s", (_, último, corpo, código, oQueÉ) => {
    const programa = portugol`
      programa {
        funcao inicio() {
        }

        funcao soma(inteiro v[], inteiro &total, ${último}) {
          ${corpo}
        }
      }
    `;

    expect(informaçãoEm(programa)?.conteúdo).toBe(bloco(código) + "\n\n" + oQueÉ);
  });

  test("a função do programa, declarada depois do uso", () => {
    const informação = informaçãoEm`
      programa {
        funcao inicio() {
          escreva(▮media(1.0, 2.0))
        }

        funcao real media(real a, real b) {
          retorne (a + b) / 2
        }
      }
    `;

    expect(informação?.conteúdo).toBe(bloco("funcao real media(real a, real b)"));
    expect(informação?.intervalo).toEqual({ linha: 3, início: 13, fim: 18 });
  });

  test.each([
    [
      "da variável",
      "programa {\n  funcao inicio() {\n    inteiro ida▮de = 3\n  }\n}",
      bloco("inteiro idade") + "\n\nvariável local",
    ],
    ["da função", "programa {\n  funcao ini▮cio() {\n  }\n}", bloco("funcao vazio inicio()")],
  ])("na própria declaração %s", (_, código, esperado) => {
    expect(informaçãoEm(código)?.conteúdo).toBe(esperado);
  });

  test("a local esconde a global", () => {
    expect(
      informaçãoEm`
        programa {
          real x = 1.0

          funcao inicio() {
            inteiro x = 2
            escreva(x▮)
          }
        }
      `?.conteúdo,
    ).toBe(bloco("inteiro x") + "\n\nvariável local");
  });

  describe("bibliotecas", () => {
    const código = portugol`
      programa {
        inclua biblioteca Matematica --> mat
        inclua biblioteca Texto

        funcao inicio() {
          escreva(mat.pot▮encia(2.0, 3.0), Texto.numero_caracteres("a"))
        }
      }
    `;
    const matemática = obterBiblioteca("Matematica")!;
    const potência = chamávelDaBiblioteca(matemática.funções.find(f => f.nome === "potencia")!);

    test("a função, com a mesma assinatura e documentação das sugestões", () => {
      expect(informaçãoEm(código)?.conteúdo).toBe(`${bloco(potência.assinatura)}\n\n${potência.documentação}`);
    });

    test("pelo nome da biblioteca, sem apelido", () => {
      expect(
        informaçãoEm(código.replace("pot▮encia", "potencia").replace("numero_caracteres", "numero_carac▮teres"))
          ?.conteúdo,
      ).toContain("funcao inteiro numero_caracteres(cadeia cadeia)");
    });

    test("a constante", () => {
      const pi = obterConstante("Matematica", "PI")!;

      expect(informaçãoEm(código.replace("mat.pot▮encia(2.0, 3.0)", "mat.P▮I"))?.conteúdo).toBe(
        bloco("const real PI") + "\n\n" + pi.descrição.trim(),
      );
    });

    test.each([
      ["o apelido no uso", (c: string) => c.replace("mat.pot▮encia", "m▮at.potencia")],
      ["o apelido no inclua", (c: string) => c.replace("pot▮encia", "potencia").replace("--> mat", "--> mat▮")],
      ["o nome no inclua", (c: string) => c.replace("pot▮encia", "potencia").replace("Matematica", "▮Matematica")],
    ])("%s mostra a biblioteca", (_, mover) => {
      expect(informaçãoEm(mover(código))?.conteúdo).toBe(
        bloco("inclua biblioteca Matematica --> mat") + "\n\n" + matemática.descrição.trim(),
      );
    });

    test("a biblioteca pelo nome, sem apelido, no uso", () => {
      expect(informaçãoEm(código.replace("pot▮encia", "potencia").replace("Texto.", "Texto▮."))?.conteúdo).toMatch(
        /^```portugol\ninclua biblioteca Texto\n```/,
      );
    });

    test("a função de uma biblioteca que não foi incluída não é nada", () => {
      const semInclua = portugol`
        programa {
          funcao inicio() {
            escreva(Matematica.potencia(2.0, 3.0))
          }
        }
      `;

      expect(informaçãoEm(semInclua.replace("potencia", "pot▮encia"))).toBeNull();
    });

    test("o nome de uma biblioteca que não foi incluída não é nada", () => {
      expect(
        informaçãoEm("programa {\n  funcao inicio() {\n    escreva(Mate▮matica.potencia(2.0, 3.0))\n  }\n}"),
      ).toBeNull();
    });

    test("um membro que a biblioteca não tem não é nada", () => {
      expect(informaçãoEm(código.replace("mat.pot▮encia", "mat.potenciaa▮"))).toBeNull();
    });
  });

  test.each(["escreva", "leia", "limpa", "sorteia"])("a função da linguagem %s", nome => {
    const função = FUNÇÕES_DA_LINGUAGEM.get(nome)!;

    expect(noUso("", `${nome}▮()`)).toBe(`${bloco(função.assinatura)}\n\n${função.documentação}`);
  });

  describe("nada", () => {
    test.each([
      ["num texto", 'escreva("ida▮de")'],
      ["num comentário", "// ida▮de"],
      ["num comentário de bloco", "/* ida▮de */"],
      ["numa palavra reservada", "s▮e (idade > 2) { }"],
      ["num tipo", "intei▮ro outra = idade"],
      ["num número", "idade = 12▮3"],
      ["num nome que não foi declarado", "escreva(outr▮a)"],
      ["fora de um nome", "escreva(idade, ▮ 1)"],
    ])("%s", (_, uso) => {
      expect(noUso("inteiro idade = 1", uso)).toBeUndefined();
    });
  });

  describe("comentários da declaração", () => {
    test("o /** */ acima, sem as marcas", () => {
      const conteúdo = noUso(
        `/**
       * A idade da pessoa,
       * em anos.
       */
      inteiro idade = 1`,
        "escreva(idade▮)",
      );

      expect(conteúdo).toBe(bloco("inteiro idade") + "\n\nvariável global\n\nA idade da pessoa,\\\nem anos\\.");
    });

    test("dois /* */ em linhas seguidas", () => {
      expect(noUso("/* primeira */\n      /* segunda */\n      inteiro x = 0", "escreva(x▮)")).toContain(
        "\n\nprimeira\\\nsegunda",
      );
    });

    test("o /* */ colado na declaração", () => {
      expect(noUso("/* quantos pontos */inteiro pontos = 0", "escreva(pontos▮)")).toContain("\n\nquantos pontos");
    });

    test("o /* */ acima", () => {
      expect(noUso("/* quantos pontos */\n      inteiro pontos = 0", "escreva(pontos▮)")).toContain(
        "\n\nquantos pontos",
      );
    });

    test("vários // seguidos", () => {
      expect(noUso("// primeira linha\n      // segunda linha\n      inteiro x = 0", "escreva(x▮)")).toContain(
        "\n\nprimeira linha\\\nsegunda linha",
      );
    });

    test("o /* */ no fim da linha da declaração", () => {
      expect(noUso("inteiro x = 0 /* em cm */", "escreva(x▮)")).toBe(
        bloco("inteiro x") + "\n\nvariável global\n\nem cm",
      );
    });

    test("o // no fim da linha da declaração", () => {
      expect(noUso("inteiro x = 0 // contador", "escreva(x▮)")).toBe(
        bloco("inteiro x") + "\n\nvariável global\n\ncontador",
      );
    });

    test("com uma linha em branco no meio, o comentário não é da declaração", () => {
      expect(noUso("// solto\n\n      inteiro x = 0", "escreva(x▮)")).toBe(bloco("inteiro x") + "\n\nvariável global");
    });

    test("o comentário no fim da linha de cima é da linha de cima", () => {
      expect(noUso("inteiro a = 0 // de a\n      inteiro b = 0", "escreva(b▮)")).toBe(
        bloco("inteiro b") + "\n\nvariável global",
      );
    });

    test("numa lista, o comentário de cima vale para todos, e o de cada linha para o nome dela", () => {
      const declaração = "// contadores\n      inteiro a = 0, // o primeiro\n        b = 0";

      expect(noUso(declaração, "escreva(a▮)")).toContain("\n\ncontadores\n\no primeiro");
      expect(noUso(declaração, "escreva(b▮)")).toBe(bloco("inteiro b") + "\n\nvariável global\n\ncontadores");
    });

    test("um comentário acima de outro nome da lista é desse nome", () => {
      const declaração = "inteiro a = 0,\n        // só de b\n        b = 0";

      expect(noUso(declaração, "escreva(a▮)")).toBe(bloco("inteiro a") + "\n\nvariável global");
      expect(noUso(declaração, "escreva(b▮)")).toContain("\n\nsó de b");
    });

    test("o comentário acima da função", () => {
      const informação = informaçãoEm`
        programa {
          funcao inicio() {
            escreva(dobro▮(2))
          }

          // Devolve o dobro do número.
          funcao inteiro dobro(inteiro x) {
            retorne x * 2
          }
        }
      `;

      expect(informação?.conteúdo).toBe(bloco("funcao inteiro dobro(inteiro x)") + "\n\nDevolve o dobro do número\\.");
    });

    test("o comentário de um parâmetro: o de cima e o do fim da linha, depois da vírgula", () => {
      const código = portugol`
        programa {
          funcao inicio() {
          }

          funcao real area(
            // o lado
            inteiro lado, // em cm
            real x
          ) {
            retorne lado▮ * x
          }
        }
      `;

      expect(informaçãoEm(código)?.conteúdo).toBe(bloco("inteiro lado") + "\n\nparâmetro\n\no lado\n\nem cm");
      expect(informaçãoEm(código.replace("lado▮ * x", "lado * x▮"))?.conteúdo).toBe(bloco("real x") + "\n\nparâmetro");
    });

    // Os arquivos .por do Portugol Studio no Windows têm \r\n.
    test("com quebras de linha do Windows", () => {
      const informação = informaçãoEm(
        "programa {\r\n  // contador de voltas\r\n  inteiro x = 0 // em segundos\r\n\r\n  funcao inicio() {\r\n    escreva(x▮)\r\n  }\r\n}",
      );

      expect(informação).toEqual({
        intervalo: { linha: 6, início: 13, fim: 14 },
        conteúdo: bloco("inteiro x") + "\n\nvariável global\n\ncontador de voltas\n\nem segundos",
        variável: { nome: "x", função: null, descrição: "variável global\n\ncontador de voltas\n\nem segundos" },
      });
    });

    test("o comentário é texto: o Markdown não muda o que foi escrito", () => {
      expect(noUso("// guarda a * b em v[i]\n      inteiro x = 0", "escreva(x▮)")).toContain(
        String.raw`guarda a \* b em v\[i\]`,
      );
    });

    test.each([
      ["/*****************\n * Placar\n *****************/", "Placar"],
      ["// ---------------", ""],
      ["// - - - - - - - -", ""],
      ["// ═══════════════", ""],
      ["// ───────────────", ""],
      ["// ━━━━━━━━━━━━━━━", ""],
      ["// ———————————————", ""],
      ["//    com espaços   \n", "com espaços"],
    ])("as linhas de enfeite ficam de fora: %j", (comentário, texto) => {
      expect(textoDoComentário(comentário)).toBe(texto);
    });

    // Cada comentário numa linha nova: procurar de novo o começo da linha levava segundos.
    test("milhares de comentários de bloco de várias linhas, sem demora", () => {
      const comentários = "/*\n*/ ".repeat(20_000);

      expect(noUso(`${comentários}\n      inteiro x = 0`, "escreva(x▮)")).toContain("variável global");
    });

    test("o comentário no fim da linha de cima é dela, e não entra", () => {
      const informação = informaçãoEm(
        "programa {\n  inteiro a = 1 // de a\n  // de b\n  inteiro b = 2\n\n  funcao inicio() {\n    escreva(b▮)\n  }\n}",
      );

      expect(informação?.conteúdo).toBe(bloco("inteiro b") + "\n\nvariável global\n\nde b");
    });

    // Conferir de novo o começo da linha a cada comentário levava 9 s com 10 mil deles.
    test("milhares de comentários de bloco numa linha, sem demora", () => {
      const comentários = "/**/ ".repeat(10_000);

      expect(noUso(`${comentários}\n      inteiro x = 0`, "escreva(x▮)")).toContain("variável global");
    });

    // A expressão regular que tirava o `*\/` testava cada asterisco: 200 mil levavam 18 s.
    test("milhares de asteriscos no meio do comentário, sem demora", () => {
      const asteriscos = "*".repeat(200_000);

      expect(textoDoComentário(`/* a${asteriscos}b */`)).toBe(`a${asteriscos}b`);
    });

    test("os asteriscos colados nas pontas ficam de fora", () => {
      expect(textoDoComentário("/** com asteriscos nas pontas **/")).toBe("com asteriscos nas pontas");
    });
  });

  describe("com o código pela metade", () => {
    test("um parêntese aberto depois do nome", () => {
      expect(
        informaçãoEm`
          programa {
            funcao inicio() {
              inteiro idade = 3
              escreva(idade▮
            }
          }
        `?.conteúdo,
      ).toBe(bloco("inteiro idade") + "\n\nvariável local");
    });

    test("uma chave aberta e sem a } do fim", () => {
      expect(
        informaçãoEm`
          programa {
            inteiro total = 0

            funcao inicio() {
              se (total▮ > 2) {
        `?.conteúdo,
      ).toBe(bloco("inteiro total") + "\n\nvariável global");
    });
  });

  test("um emoji antes do nome, na mesma linha: as colunas do editor", () => {
    const informação = informaçãoEm`
      programa {
        funcao inicio() {
          inteiro idade = 3
          escreva("😀", ida▮de)
        }
      }
    `;

    // `    escreva("😀", ` tem 18 unidades de UTF-16: o emoji conta duas.
    expect(informação?.intervalo).toEqual({ linha: 4, início: 19, fim: 24 });
  });
});
