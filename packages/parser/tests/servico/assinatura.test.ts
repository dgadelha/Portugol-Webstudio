import { describe, expect, test } from "vitest";

import { assinaturaEm, parâmetroAtivo } from "../helpers/cursor";

describe("ajuda de assinatura", () => {
  test("uma função de biblioteca, com o parâmetro em que o cursor está", () => {
    const ajuda = assinaturaEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          real x = mat.potencia(2, ▮
        }
      }
    `;

    expect(ajuda).toMatchObject({ rótulo: "funcao real potencia(real base, real expoente)", parâmetroAtivo: 1 });
    expect(parâmetroAtivo(ajuda)).toBe("real expoente");
    expect(ajuda?.parâmetros[0].documentação).toBe("`base` (real): o número que será elevado ao expoente");
    expect(ajuda?.documentação).toContain("Calcula a potência");
    expect(ajuda?.documentação).not.toContain("Parâmetros:");
  });

  test("a chamada mais interna", () => {
    const ajuda = assinaturaEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          real x = mat.potencia(mat.raiz(x, ▮
        }
      }
    `;

    expect(ajuda?.rótulo).toBe("funcao real raiz(real radicando, real indice)");
    expect(ajuda?.parâmetroAtivo).toBe(1);
  });

  test("depois de uma chamada fechada, volta para a de fora", () => {
    const ajuda = assinaturaEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          real x = mat.potencia(mat.raiz(4, 2), ▮
        }
      }
    `;

    expect(ajuda?.rótulo).toContain("potencia");
    expect(parâmetroAtivo(ajuda)).toBe("real expoente");
  });

  test("uma vírgula numa cadeia não conta", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          f("a, b", ▮
        }

        funcao f(cadeia a, inteiro b) {
        }
      }
    `;

    expect(parâmetroAtivo(ajuda)).toBe("inteiro b");
  });

  test("vetores e índices como argumentos", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          inteiro v[3], m[2][2]
          f(v, m[0][1], ▮
        }

        funcao f(inteiro a[], inteiro b, inteiro &c) {
        }
      }
    `;

    expect(ajuda?.rótulo).toBe("funcao vazio f(inteiro a[], inteiro b, inteiro &c)");
    expect(parâmetroAtivo(ajuda)).toBe("inteiro &c");
    expect(ajuda?.documentação).toBeUndefined();
  });

  test("dentro de um índice, o argumento é o mesmo", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          inteiro v[3]
          f(1, v[▮
        }

        funcao f(inteiro a, inteiro b) {
        }
      }
    `;

    expect(parâmetroAtivo(ajuda)).toBe("inteiro b");
  });

  test("passando do último parâmetro, nenhum fica destacado", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          f(1, 2, ▮
        }

        funcao f(inteiro a, inteiro b) {
        }
      }
    `;

    expect(ajuda?.parâmetroAtivo).toBe(2);
    expect(parâmetroAtivo(ajuda)).toBeUndefined();
  });

  test.each([
    ["escreva", "escreva(1, 2, ▮", "funcao vazio escreva(...)", "..."],
    ["sorteia", "inteiro x = sorteia(1, ▮", "funcao inteiro sorteia(inteiro minimo, inteiro maximo)", "inteiro maximo"],
    ["limpa", "limpa(▮", "funcao vazio limpa()", undefined],
  ])("a função da linguagem %s", (_, linha, rótulo, ativo) => {
    const ajuda = assinaturaEm(`programa {\n  funcao inicio() {\n    ${linha}\n  }\n}`);

    expect(ajuda?.rótulo).toBe(rótulo);
    expect(parâmetroAtivo(ajuda)).toBe(ativo);
  });

  test("parênteses de agrupamento ficam de fora", () => {
    const ajuda = assinaturaEm("programa {\n  funcao inicio() {\n    escreva((1 + ▮\n  }\n}");

    expect(ajuda?.rótulo).toBe("funcao vazio escreva(...)");
  });

  test.each([
    ["nos parênteses do se", "programa {\n  funcao inicio() {\n    se (▮\n  }\n}"],
    ["depois de uma chamada fechada", "programa {\n  funcao inicio() {\n    escreva(1)\n    ▮\n  }\n}"],
    ["na declaração dos parâmetros", "programa {\n  funcao f(inteiro a, ▮\n}"],
    ["num parêntese dentro de um texto", 'programa {\n  funcao inicio() {\n    escreva("(▮\n  }\n}'],
    ["numa função que não existe", "programa {\n  funcao inicio() {\n    desconhecida(▮\n  }\n}"],
  ])("nada %s", (_, código) => {
    expect(assinaturaEm(código)).toBeNull();
  });

  test("um emoji antes do cursor não desloca o parâmetro", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          f("😀", ▮
        }

        funcao f(cadeia a, cadeia b) {
        }
      }
    `;

    expect(parâmetroAtivo(ajuda)).toBe("cadeia b");
  });

  test("uma chamada aberta lá em cima não vale num comando depois de um bloco", () => {
    const ajuda = assinaturaEm`
      programa {
        funcao inicio() {
          escreva(
          se (verdadeiro) {
          }
          inteiro a, ▮
        }
      }
    `;

    expect(ajuda).toBeNull();
  });

  test("a função de biblioteca só pelo nome ou apelido incluído", () => {
    const ajuda = assinaturaEm("programa {\n  funcao inicio() {\n    Matematica.potencia(▮\n  }\n}");

    expect(ajuda).toBeNull();
  });
});

describe("documentação", () => {
  test("o retorno, sem marcação que o leitor de tela leria", () => {
    const ajuda = assinaturaEm`
      programa {
        inclua biblioteca Matematica --> mat

        funcao inicio() {
          mat.potencia(▮
        }
      }
    `;

    expect(ajuda?.documentação).toContain("Retorno (real): a `base` elevada ao `expoente`");
    expect(ajuda?.documentação).not.toContain("*");
  });
});
