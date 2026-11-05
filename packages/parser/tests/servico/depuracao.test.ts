import { describe, expect, test } from "vitest";

import { chamadaDoValor, comValorAtual, informaçãoDoNome, type VariávelDoNome } from "../../src/servico/informação";
import { informaçãoEm, informaçãoNaPausa } from "../helpers/cursor";

/**
 * A variável na informação, sem a descrição (vista em "a declaração com o valor atual").
 */
function variávelNaPausa(código: string) {
  const { descrição: _, ...variável } = informaçãoNaPausa(código)?.variável ?? {};

  return variável;
}

describe("a variável na informação, para o valor na depuração", () => {
  test("a global, parada em qualquer função", () => {
    expect(
      variávelNaPausa(`programa {
  real total = 1.5

  funcao inicio() {
    ⏸escreva(to▮tal)
  }
}`),
    ).toEqual({ nome: "total", função: null });
  });

  test("a local da função parada, já declarada", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    inteiro idade = 3
    ⏸escreva(ida▮de)
  }
}`),
    ).toEqual({ nome: "idade", função: "inicio", únicaNaFunção: true, vistaNaPausa: true });
  });

  // O depurador para no `para` a cada teste da condição, quando o `i` já foi declarado.
  test.each([
    {
      caso: "o mouse na declaração vale o mesmo que no uso",
      vistaNaPausa: true,
      linhas: "    inteiro ida▮de = 3\n    ⏸escreva(idade)",
    },
    {
      caso: "parada no `para`, o `i` do laço",
      vistaNaPausa: true,
      linhas: "    ⏸para (inteiro i = 0; i < 3; i++) {\n      escreva(i▮)\n    }",
    },
    {
      caso: "parada no `para` sem declaração, o `i` de antes do laço",
      vistaNaPausa: true,
      linhas: "    inteiro i = 0\n    ⏸para (; i < 3; i++) {\n      escreva(i▮)\n    }",
    },
    {
      caso: "parada no `para`, o `i` do laço anterior",
      vistaNaPausa: false,
      linhas:
        "    para (inteiro i = 0; i < 2; i++) {\n      escreva(i▮)\n    }\n    ⏸para (inteiro i = 0; i < 3; i++) {\n    }",
    },
    {
      caso: "a variável declarada mais abaixo",
      vistaNaPausa: false,
      linhas: "    ⏸escreva(1)\n    inteiro de▮pois = 2",
    },
    {
      caso: "a variável declarada no comando da pausa, que ainda não executou",
      vistaNaPausa: false,
      linhas: "    ⏸inteiro de▮pois = 2",
    },
    {
      caso: "um emoji antes do comando da pausa, que declara a variável",
      vistaNaPausa: false,
      linhas: '    escreva("😀") ⏸inteiro x = 1\n    escreva(x▮)',
    },
    {
      caso: "um emoji antes do comando da pausa, depois da declaração",
      vistaNaPausa: true,
      linhas: '    inteiro x = 1\n    escreva("😀") ⏸escreva(x▮)',
    },
  ])("$caso: vista na pausa, $vistaNaPausa", ({ vistaNaPausa, linhas }) => {
    expect(variávelNaPausa(`programa {\n  funcao inicio() {\n${linhas}\n  }\n}`)).toMatchObject({ vistaNaPausa });
  });

  // Sem o comando no ponto da pausa, nada garante que o valor seja o desta declaração.
  test("a pausa fora de qualquer comando", () => {
    const código = "programa {\n  funcao inicio() {\n    inteiro x = 1\n    escreva(x)\n  }\n}";
    const variável = informaçãoDoNome(código, { linha: 4, coluna: 13 }, { linha: 99, coluna: 0 })?.variável;

    expect(variável).toMatchObject({ nome: "x", função: "inicio" });
    expect(variável).not.toHaveProperty("vistaNaPausa");
  });

  test("a variável de um bloco, depois do bloco", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    se (verdadeiro) {
      inteiro dentro = 1
      escreva(den▮tro)
    }
    ⏸escreva("fim")
  }
}`),
    ).toEqual({ nome: "dentro", função: "inicio", únicaNaFunção: true, vistaNaPausa: false });
  });

  describe("dois laços com o mesmo `i`", () => {
    const código = `programa {
  funcao inicio() {
    para (inteiro i = 0; i < 2; i++) {
      escreva(i)
    }
    para (inteiro i = 0; i < 3; i++) {
      ⏸escreva(i)
    }
  }
}`;

    test("o `i` do laço parado é o da pausa", () => {
      expect(variávelNaPausa(código.replace("⏸escreva(i)", "⏸escreva(i▮)"))).toEqual({
        nome: "i",
        função: "inicio",
        únicaNaFunção: false,
        vistaNaPausa: true,
      });
    });

    test("o `i` do outro laço não é", () => {
      expect(variávelNaPausa(código.replace("      escreva(i)", "      escreva(i▮)"))).toMatchObject({
        únicaNaFunção: false,
        vistaNaPausa: false,
      });
    });
  });

  test("o parâmetro, parada na função dele", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    dobro(2)
  }

  funcao inteiro dobro(inteiro x) {
    ⏸retorne x▮ * 2
  }
}`),
    ).toEqual({ nome: "x", função: "dobro", únicaNaFunção: true, vistaNaPausa: true });
  });

  test("a local de outra função: sem a pausa nela, só se o nome é único", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    inteiro n = 2
    escreva(dobro(n▮))
  }

  funcao inteiro dobro(inteiro x) {
    ⏸retorne x * 2
  }
}`),
    ).toEqual({ nome: "n", função: "inicio", únicaNaFunção: true });
  });

  test("a variável com o nome repetido em dois blocos", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    se (verdadeiro) {
      inteiro t▮ = 1
    } senao {
      inteiro t = 2
    }
    dobro(1)
  }

  funcao inteiro dobro(inteiro x) {
    ⏸retorne x * 2
  }
}`),
    ).toEqual({ nome: "t", função: "inicio", únicaNaFunção: false });
  });

  describe("a local com o nome de uma global", () => {
    const código = `programa {
  inteiro valor = 1

  funcao inicio() {
    inteiro valor = 2
    ⏸escreva(valor)
  }

  funcao mostrar() {
    escreva(valor)
  }
}`;

    test("na função dela, a local", () => {
      expect(variávelNaPausa(código.replace("escreva(valor)", "escreva(valor▮)"))).toEqual({
        nome: "valor",
        função: "inicio",
        únicaNaFunção: true,
        vistaNaPausa: true,
      });
    });

    test("na outra função, a global", () => {
      expect(variávelNaPausa(código.replace("    escreva(valor)\n  }\n}", "    escreva(valor▮)\n  }\n}"))).toEqual({
        nome: "valor",
        função: null,
      });
    });
  });

  test("a recursão: o parâmetro da função parada", () => {
    expect(
      variávelNaPausa(`programa {
  funcao inicio() {
    escreva(fatorial(3))
  }

  funcao inteiro fatorial(inteiro n) {
    ⏸se (n▮ <= 1) {
      retorne 1
    }
    retorne n * fatorial(n - 1)
  }
}`),
    ).toEqual({ nome: "n", função: "fatorial", únicaNaFunção: true, vistaNaPausa: true });
  });

  test.each([
    ["uma função do programa", "inicio▮()"],
    ["uma função de biblioteca", "mat.raiz▮(4.0, 2.0)"],
    ["uma constante de biblioteca", "escreva(mat.PI▮)"],
  ])("%s não é variável", (_, uso) => {
    const informação = informaçãoNaPausa(`programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    ⏸${uso}
  }
}`);

    expect(informação).not.toBeNull();
    expect(informação?.variável).toBeUndefined();
  });
});

describe("a declaração com o valor atual", () => {
  function soma() {
    return informaçãoEm`
      programa {
        // a soma das notas
        real soma = 0.0

        funcao inicio() {
          escreva(so▮ma)
        }
      }
    `!;
  }

  test("a descrição é o que vem depois da declaração do código", () => {
    const { conteúdo, variável } = soma();

    expect(variável!.descrição).toBe("variável global\n\na soma das notas");
    expect(conteúdo).toBe("```portugol\nreal soma\n```\n\nvariável global\n\na soma das notas");
  });

  test.each([
    ["no lugar da declaração do código", "real soma = 15.5", "```portugol\nreal soma = 15.5\n```"],
    ["as crases de uma cadeia aumentam a cerca", 'cadeia c = "a```b"', '````portugol\ncadeia c = "a```b"\n````'],
  ])("%s", (_, declaração, bloco) => {
    expect(comValorAtual(soma().variável!, declaração)).toBe(`${bloco}\n\nvariável global\n\na soma das notas`);
  });
});

describe("a chamada de onde vem o valor", () => {
  const local = { nome: "x", função: "f", descrição: "" } satisfies VariávelDoNome;

  // As chamadas vão da mais recente, a da pausa, para a mais antiga.
  test.each<[string, VariávelDoNome, string[], number, number | "globais" | undefined]>([
    ["a global", { nome: "g", função: null, descrição: "" }, ["f", "inicio"], 0, "globais"],
    ["a da pausa, vista nela", { ...local, vistaNaPausa: true }, ["f", "inicio"], 0, 0],
    [
      "a da pausa, fora do bloco dela",
      { ...local, únicaNaFunção: true, vistaNaPausa: false },
      ["f", "inicio"],
      0,
      undefined,
    ],
    ["a de quem chamou, com o nome único", { ...local, função: "inicio", únicaNaFunção: true }, ["f", "inicio"], 0, 1],
    [
      "a de quem chamou, com o nome repetido",
      { ...local, função: "inicio", únicaNaFunção: false },
      ["f", "inicio"],
      0,
      undefined,
    ],
    ["a da chamada escolhida, numa recursão", { ...local, únicaNaFunção: true }, ["f", "f", "f", "inicio"], 2, 2],
    [
      "a da chamada escolhida, com o nome repetido",
      { ...local, únicaNaFunção: false },
      ["f", "f", "inicio"],
      1,
      undefined,
    ],
    [
      "com a chamada escolhida de outra função, a da pausa",
      { ...local, únicaNaFunção: true, vistaNaPausa: true },
      ["f", "inicio"],
      1,
      0,
    ],
    [
      "a de uma função fora das chamadas",
      { ...local, função: "g", únicaNaFunção: true },
      ["f", "inicio"],
      0,
      undefined,
    ],
  ])("%s", (_, variável, chamadas, escolhida, esperada) => {
    expect(chamadaDoValor(variável, chamadas, escolhida)).toBe(esperada);
  });
});
