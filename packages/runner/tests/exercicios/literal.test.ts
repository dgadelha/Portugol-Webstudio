import { describe, expect, test } from "vitest";
import { parsePortugolLiteral, portugolCall, portugolLiteral, portugolSignature, splitPortugolList } from "../../src";

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

describe("parsePortugolLiteral", () => {
  // A volta completa: o que o portugolLiteral escreve (como no código) é lido de volta igual
  test.each([
    ["inteiro", 42],
    ["inteiro", -2_147_483_648],
    ["real", 8],
    ["real", 2.5],
    ["real", 1e7],
    ["real", 0.0001],
    ["cadeia", "abc"],
    ["cadeia", ""],
    ["cadeia", 'diz "oi"'],
    ["cadeia", "a\\b"],
    ["cadeia", "linha 1\nlinha 2\t!\r\b\f"],
    ["cadeia", "it's, com vírgula"],
    ["cadeia", "\u{1}\u{1F}"],
    ["cadeia", "olá 😀"],
    ["caracter", "a"],
    ["caracter", "'"],
    ["caracter", "\\"],
    ["caracter", "\u{7}"],
    ["logico", true],
    ["logico", false],
    ["inteiro[]", [1, -2, 3]],
    ["real[]", [1, 2.5, 1e7]],
    ["cadeia[]", ["a, b", "{c}", 'd"']],
    ["caracter[]", [",", "}", "'"]],
    ["logico[]", [true, false]],
    ["inteiro[]", []],
  ])("%s %j", (tipo, valor) => {
    expect(parsePortugolLiteral(portugolLiteral(tipo, valor, { code: true }), tipo)).toEqual({ tipo, valor });
  });

  test.each([
    [String.raw`"\u0041\101\7"`, "AA\u{7}"],
    [String.raw`"\377"`, "ÿ"],
    [String.raw`"\400"`, " 0"],
    [String.raw`"\'"`, "'"],
  ])("Sequências de escape da gramática: %s", (text, valor) => {
    expect(parsePortugolLiteral(text, "cadeia")).toEqual({ tipo: "cadeia", valor });
  });

  test.each([
    ["inteiro", "2147483648"],
    ["inteiro", "1.0"],
    ["real", "1.0E7"],
    ["real", "abc"],
    ["logico", "Verdadeiro"],
    ["cadeia", "abc"],
    ["cadeia", '"a"b"'],
    ["cadeia", String.raw`"\x"`],
    ["cadeia", String.raw`"\u12"`],
    ["caracter", "'ab'"],
    ["caracter", "''"],
    ["inteiro[]", "1, 2"],
    ["inteiro[]", "{1, x}"],
    ["inteiro[][]", "{{1}}"],
    ["vazio", "1"],
  ])("Não é um valor do tipo %s: %s", (tipo, text) => {
    if (tipo === "inteiro[][]") {
      expect(() => parsePortugolLiteral(text, tipo)).toThrow("Tipo de argumento não suportado");
    } else {
      expect(parsePortugolLiteral(text, tipo)).toBeUndefined();
    }
  });

  test("Um inteiro vale onde se espera um real", () => {
    expect(parsePortugolLiteral(" 3 ", "real")).toEqual({ tipo: "real", valor: 3 });
  });
});

describe("splitPortugolList", () => {
  test.each([
    ["", []],
    ["  ", []],
    ["3, 5", ["3", " 5"]],
    ['"a, b", 2', ['"a, b"', " 2"]],
    [String.raw`"a\", b", 'c'`, [String.raw`"a\", b"`, " 'c'"]],
    ["{1, 2}, {3}", ["{1, 2}", " {3}"]],
    ["',', 1", ["','", " 1"]],
  ])("%j", (text, items) => {
    expect(splitPortugolList(text)).toEqual(items);
  });
});
