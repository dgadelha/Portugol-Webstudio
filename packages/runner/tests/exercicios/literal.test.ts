import { describe, expect, test } from "vitest";
import { portugolCall, portugolLiteral, portugolSignature } from "../../src";

describe("portugolLiteral", () => {
  test.each([
    ["inteiro", 42, "42"],
    ["inteiro", -7, "-7"],
    ["real", 8, "8.0"],
    ["real", 2.5, "2.5"],
    ["real", 1e7, "1.0E7"],
    ["cadeia", "abc", '"abc"'],
    ["cadeia", "", '""'],
    ["cadeia", 'diz "oi"', String.raw`"diz \"oi\""`],
    ["cadeia", "a\\b", String.raw`"a\\b"`],
    ["cadeia", "linha 1\nlinha 2\t!", String.raw`"linha 1\nlinha 2\t!"`],
    ["cadeia", "it's", `"it's"`],
    ["cadeia", "\u{1}", String.raw`"\u0001"`],
    ["caracter", "a", "'a'"],
    ["caracter", "'", String.raw`'\''`],
    ["caracter", '"', `'"'`],
    ["logico", true, "verdadeiro"],
    ["logico", false, "falso"],
    ["inteiro[]", [1, 2, 3], "{1, 2, 3}"],
    ["real[]", [1, 2.5], "{1.0, 2.5}"],
    ["cadeia[]", ["a", "b"], '{"a", "b"}'],
    ["inteiro[]", [], "{}"],
  ])("%s %j → %s", (type, value, expected) => {
    expect(portugolLiteral(type, value)).toBe(expected);
  });

  test("Uma matriz não é tratada como vetor", () => {
    expect(() => portugolLiteral("inteiro[][]", [[1]])).toThrow("Tipo de argumento não suportado: inteiro[][]");
  });

  test("portugolCall", () => {
    expect(
      portugolCall("media", [
        { tipo: "real[]", valor: [7, 8.5] },
        { tipo: "inteiro", valor: 2 },
      ]),
    ).toBe("media({7.0, 8.5}, 2)");
    expect(portugolCall("vazia", [])).toBe("vazia()");
  });

  // O código não aceita expoente, como o escreva escreve
  test.each([
    [0.0001, "0.0001"],
    [1e7, "10000000.0"],
    [-12_345_678.5, "-12345678.5"],
    [2.5, "2.5"],
  ])("Um real na chamada é escrito como no código: %s → %s", (valor, expected) => {
    expect(portugolCall("f", [{ tipo: "real", valor }])).toBe(`f(${expected})`);
  });

  test("portugolSignature", () => {
    expect(portugolSignature("soma", { parameters: ["inteiro", "real[]"], returns: "inteiro" })).toBe(
      "funcao inteiro soma(inteiro, real[])",
    );
    expect(portugolSignature("mostra", { parameters: [], returns: "vazio" })).toBe("funcao mostra()");
  });
});
