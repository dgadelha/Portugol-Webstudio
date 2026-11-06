//
// Confere o `src/monaco-pt-br.gerado.js` com o Monaco instalado. Depois de atualizar o Monaco,
// estes testes falham até o arquivo ser gerado de novo (`npm run monaco:pt-br -w
// @portugol-webstudio/ide`): as mensagens são achadas pela posição, e outra versão do Monaco tem
// outras posições.
//
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { describe, expect, test } from "vitest";

const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const MONACO = path.join(RAIZ, "node_modules/monaco-editor");
// `localize(1123, "Go to Definition")`: a posição e o texto (entre aspas duplas, simples ou crases).
const LOCALIZE = /\blocalize2?\((\d+),\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;

const GERADO = readFileSync(path.join(RAIZ, "packages/ide/src/monaco-pt-br.gerado.js"), "utf8");

const { vscodeRef } = JSON.parse(readFileSync(path.join(MONACO, "package.json"), "utf8"));
const português = mensagens(GERADO);
const doMonaco = mensagens(readFileSync(path.join(MONACO, "min/vs/nls/lang/pt-br.js"), "utf8"));
const inglês = textosEmInglês();

describe("Monaco em português", () => {
  test("foi gerado para o Monaco instalado", () => {
    expect(GERADO.match(/^\/\/ vscode: (\w+)/m)?.[1]).toBe(vscodeRef);
    expect(português._VSCODE_NLS_LANGUAGE).toBe("pt-br");
    expect(português._VSCODE_NLS_MESSAGES).toHaveLength(doMonaco._VSCODE_NLS_MESSAGES.length);
  });

  test("o Monaco ainda traz o português vazio (senão, apague o arquivo gerado e o gerador)", () => {
    expect(doMonaco._VSCODE_NLS_MESSAGES.filter(texto => texto !== null)).toEqual([]);
  });

  test.each([
    ["Go to Definition", "Ir para Definição"],
    ["Peek", "Visualizar"],
    ["Command Palette", "Paleta de Comandos"],
    ["Change All Occurrences", "Alterar Todas as Ocorrências"],
    ["View Problem", "Exibir o Problema"],
    ["Variable", "Variável"],
    ["Function", "Função"],
    ["No definition found for '{0}'", "Nenhuma definição encontrada para '{0}'"],
  ])("%s → %s", (original, traduzido) => {
    const posição = [...inglês].find(([, texto]) => texto === original)?.[0];
    expect(posição).toBeDefined();
    expect(português._VSCODE_NLS_MESSAGES[posição]).toBe(traduzido);
  });

  test("as traduções têm os mesmos {0}, {1}… do inglês", () => {
    const diferentes = [...inglês]
      .map(([posição, original]) => [original, português._VSCODE_NLS_MESSAGES[posição]])
      .filter(([original, traduzido]) => traduzido !== null && marcadores(traduzido) !== marcadores(original));
    expect(inglês.size).toBeGreaterThan(2000);
    expect(diferentes).toEqual([]);
  });

  test("no máximo 40 mensagens sem tradução", () => {
    expect(português._VSCODE_NLS_MESSAGES.filter(texto => texto === null).length).toBeLessThanOrEqual(40);
  });
});

// Roda um arquivo de mensagens e devolve o que ele põe no `globalThis`.
function mensagens(código) {
  const global = {};
  global.globalThis = global;
  vm.runInNewContext(código, global);
  return global;
}

// Os textos em inglês do Monaco instalado, pela posição de cada um: o build ESM mantém as chamadas
// `localize(posição, "texto em inglês")` (e `localize2`) do código do VS Code.
function textosEmInglês() {
  const pasta = path.join(MONACO, "esm/vs");
  const textos = new Map();
  const arquivos = readdirSync(pasta, { recursive: true });
  for (const arquivo of arquivos) {
    if (!arquivo.endsWith(".js")) {
      continue;
    }
    const código = readFileSync(path.join(pasta, arquivo), "utf8");
    const chamadas = código.matchAll(LOCALIZE);
    for (const [, posição, literal] of chamadas) {
      textos.set(Number(posição), vm.runInNewContext(literal));
    }
  }
  return textos;
}

// Os marcadores `{0}`, `{1}`… de um texto, em ordem, para comparar a tradução com o inglês.
function marcadores(texto) {
  return (texto.match(/\{\d+\}/g) ?? []).toSorted((a, b) => a.localeCompare(b)).join(",");
}
