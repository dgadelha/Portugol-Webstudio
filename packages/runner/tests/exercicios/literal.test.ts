import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { describe, expect, test } from "vitest";
import { parsePortugolLiteral, portugolCall, portugolLiteral, portugolSignature, splitPortugolList } from "../../src";

/**
 * Os erros de compilação de uma chamada `f(literal)` a uma função com um parâmetro do tipo dado.
 */
function compileErrors(tipo: string, literal: string) {
  const parameter = tipo.endsWith("[]") ? `${tipo.slice(0, -2)} x[]` : `${tipo} x`;
  const code = `programa {\n  funcao f(${parameter}) {\n  }\n\n  funcao inicio() {\n    f(${literal})\n  }\n}\n`;
  const { parseErrors, diagnostics } = PortugolCodeChecker.checkCode(code);

  return [...parseErrors, ...diagnostics.filter(item => item.severity === PortugolDiagnosticSeverity.Error)].map(
    item => item.message,
  );
}

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
  const roundTrip: Array<[string, unknown]> = [
    ["inteiro", 42],
    ["inteiro", -2_147_483_647],
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
  ];

  test.each(roundTrip)("%s %j", (tipo, valor) => {
    expect(parsePortugolLiteral(portugolLiteral(tipo, valor, { code: true }), tipo)).toEqual({ tipo, valor });
  });

  // Um valor simples também compila como argumento. Um vetor entre chaves é a forma de escrever
  // a chamada no criador e na Correção: no código, o Portugol só aceita as chaves numa declaração
  test.each(roundTrip.filter(([tipo]) => !tipo.endsWith("[]")))("%s %j compila", (tipo, valor) => {
    expect(compileErrors(tipo, portugolLiteral(tipo, valor, { code: true }))).toEqual([]);
  });

  // Num caracter, valem também as sequências da gramática, que o analisador não confere
  test.each([
    [String.raw`'\u0041'`, "A"],
    [String.raw`'\101'`, "A"],
    [String.raw`'\7'`, "\u{7}"],
    [String.raw`'\377'`, "ÿ"],
    [String.raw`'\''`, "'"],
  ])("Sequências de escape num caracter: %s", (text, valor) => {
    expect(parsePortugolLiteral(text, "caracter")).toEqual({ tipo: "caracter", valor });
    expect(compileErrors("caracter", text)).toEqual([]);
  });

  // Numa cadeia, como no analisador e no Portugol Studio, só valem \t \n \b \r \f \" \\
  test.each([String.raw`"\u0041"`, String.raw`"\101"`, String.raw`"\'"`, '"a\nb"'])(
    "Uma cadeia não aceita o que o Portugol recusa: %j",
    text => {
      expect(parsePortugolLiteral(text, "cadeia")).toBeUndefined();
      expect(compileErrors("cadeia", text)).not.toEqual([]);
    },
  );

  test.each([
    ["inteiro", "2147483648"],
    ["inteiro", "-2147483648"],
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
    expect(parsePortugolLiteral(text, tipo)).toBeUndefined();
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
