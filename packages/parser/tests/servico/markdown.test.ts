import { describe, expect, test } from "vitest";

import { bloco, textoComLinks, textoLiteral } from "../../src/servico/markdown";

describe("bloco", () => {
  test.each([
    ["sem crases", "inteiro x", "```"],
    ["com três crases numa linha", 'cadeia X = "a\n```\nb"', "````"],
    ["com dez crases", "`".repeat(10), "`".repeat(11)],
  ])("%s: a cerca é maior que qualquer sequência de crases", (_, código, cerca) => {
    expect(bloco(código)).toBe(`${cerca}portugol\n${código}\n${cerca}`);
  });
});

describe("textoLiteral", () => {
  test.each([
    ["a * b em v[i]", String.raw`a \* b em v\[i\]`],
    ["~~riscado~~ & <b>", String.raw`\~\~riscado\~\~ \& \<b\>`],
    ["1. não vira lista", String.raw`1\. não vira lista`],
  ])("%s", (texto, esperado) => {
    expect(textoLiteral(texto)).toBe(esperado);
  });
});

describe("textoComLinks", () => {
  // O texto do link é o endereço escapado; o destino, entre < e >, é o endereço como foi escrito.
  function link(endereço: string) {
    return `[${textoLiteral(endereço)}](<${endereço}>)`;
  }

  test.each([
    [
      "o endereço continua o mesmo",
      "veja https://example.com/a-b?x=1&y=2",
      "veja " + link("https://example.com/a-b?x=1&y=2"),
    ],
    ["o ponto final da frase fica de fora", "veja https://example.com.", "veja " + link("https://example.com") + "\\."],
    [
      "o parêntese do endereço fica nele",
      "https://pt.wikipedia.org/wiki/Pi_(constante)",
      link("https://pt.wikipedia.org/wiki/Pi_(constante)"),
    ],
    ["o parêntese de fora fica fora", "(veja https://example.com)", "\\(veja " + link("https://example.com") + "\\)"],
    [
      "dois endereços e texto entre eles",
      "a https://a.com e_b https://b.com",
      "a " + link("https://a.com") + " e\\_b " + link("https://b.com"),
    ],
    ["sem endereço, é como o textoLiteral", "a * b", String.raw`a \* b`],
  ])("%s", (_, texto, esperado) => {
    expect(textoComLinks(texto)).toBe(esperado);
  });

  // Recontar os parênteses a cada `)` tirado levava segundos.
  test("milhares de parênteses no fim, sem demora", () => {
    const parênteses = ")".repeat(100_000);

    expect(textoComLinks(`http://a${parênteses}`)).toBe(link("http://a") + "\\)".repeat(100_000));
  });
});
