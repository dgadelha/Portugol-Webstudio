#!/usr/bin/env node
//
// Roda o nosso analisador sobre os 119 exemplos oficiais
// (packages/resources/assets/exemplos/**/*.por) e imprime um resumo mais uma linha por
// erro e por parseError.
//
// Uso, a partir da raiz do repositório (o pacote precisa estar compilado):
//
//   npm run build -w @portugol-webstudio/antlr
//   npm run build -w @portugol-webstudio/parser
//   node packages/parser/tools/corpus.mjs
//
//   --diferencial  compara com tests/fixtures/portugol-studio.golden.txt e reporta falso
//                  positivo (erro nosso numa linha em que o Portugol Studio não tem erro —
//                  o critério que não se negocia) e falso negativo.
//   --webstudio    lista os diagnósticos `ErroWebstudio.*`, divergências deliberadas que
//                  ficam fora do diferencial.
//
import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { lerGolden, linhasDeErro } from "./golden.mjs";

const raiz = path.resolve(import.meta.dirname, "../../..");
// O caminho é montado em tempo de execução (a ferramenta roda sobre o `lib/` compilado),
// então o import não carrega tipo nenhum; o `src` é a mesma API.
const { PortugolCodeChecker, éDoWebstudio } = /** @type {typeof import("../src/index.js")} */ (
  await import(path.join(raiz, "packages/parser/lib/index.js").replaceAll("\\", "/"))
);

const base = path.join(raiz, "packages/resources/assets/exemplos");
/**
 * Ordem por unidade de código UTF-16, a mesma do `LC_ALL=C sort` que gera o golden.
 *
 * @param {string} a
 * @param {string} b
 */
function porCódigo(a, b) {
  if (a < b) {
    return -1;
  }

  return a > b ? 1 : 0;
}

const arquivos = globSync("**/*.por", { cwd: base }).toSorted(porCódigo);

// `packages/resources/assets/` é gitignored: sem esta guarda, um corpus ausente daria
// `arquivos=0 falsosPositivos=0` e saída 0 — verde silencioso.
if (arquivos.length === 0) {
  console.error(`erro: nenhum exemplo .por em ${base}`);
  console.error("Gere o corpus com: npm run build -w @portugol-webstudio/resources");
  process.exit(1);
}
const diferencial = process.argv.includes("--diferencial");
const golden = diferencial ? lerGolden() : undefined;
const listarWebstudio = process.argv.includes("--webstudio");
let erros = 0;
let errosWebstudio = 0;
let avisos = 0;
let informacoes = 0;
let parseErrors = 0;
let falsosPositivos = 0;
let falsosNegativos = 0;

/**
 * @param {import("@portugol-webstudio/antlr").PortugolCodeDiagnostic} d
 */
const éWebstudio = d => éDoWebstudio(d.code);

for (const arquivo of arquivos) {
  const resultado = PortugolCodeChecker.checkCode(readFileSync(path.join(base, arquivo), "utf8"));
  const todosOsErros = resultado.diagnostics.filter(d => d.severity === 0);
  const nossosErros = todosOsErros.filter(d => !éWebstudio(d));

  erros += nossosErros.length;
  errosWebstudio += todosOsErros.length - nossosErros.length;
  avisos += resultado.diagnostics.filter(d => d.severity === 1).length;
  informacoes += resultado.diagnostics.filter(d => d.severity === 2).length;
  parseErrors += resultado.parseErrors.length;

  for (const d of resultado.parseErrors) {
    console.log(`${arquivo}|P|${d.startLine}|${d.code ?? ""}|${d.message}`);
  }

  for (const d of nossosErros) {
    console.log(`${arquivo}|E|${d.startLine}|${d.code ?? ""}|${d.message}`);
  }

  if (listarWebstudio) {
    for (const d of todosOsErros) {
      if (éWebstudio(d)) {
        console.log(`${arquivo}|W|${d.startLine}|${d.code}|${d.message}`);
      }
    }
  }

  if (!golden) {
    continue;
  }

  const linhasNossas = new Set(nossosErros.map(d => d.startLine));
  const linhasPs = linhasDeErro(golden.get(arquivo));

  for (const linha of linhasNossas) {
    if (!linhasPs.has(linha)) {
      falsosPositivos++;
      console.log(`FALSO-POSITIVO ${arquivo}:${linha}`);
    }
  }

  for (const linha of linhasPs) {
    if (!linhasNossas.has(linha)) {
      falsosNegativos++;
      console.log(`FALSO-NEGATIVO ${arquivo}:${linha}`);
    }
  }
}

console.log(
  `arquivos=${arquivos.length} erros=${erros} errosWebstudio=${errosWebstudio} ` +
    `avisos=${avisos} informacoes=${informacoes} parseErrors=${parseErrors}`,
);

if (golden) {
  console.log(`falsosPositivos=${falsosPositivos} falsosNegativos=${falsosNegativos}`);
}
