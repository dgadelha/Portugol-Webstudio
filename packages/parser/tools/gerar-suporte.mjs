#!/usr/bin/env node
//
// Escreve packages/parser/src/bibliotecas/suporte.gerado.ts.
//
// Uso, a partir da raiz do repositório:
//
//   node packages/parser/tools/gerar-suporte.mjs           escreve o arquivo
//   node packages/parser/tools/gerar-suporte.mjs --check    só confere se está atualizado
//
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { COMANDO_REGERAR, DESTINO, gerar, inspecionarRuntime, RAIZ } from "./suporte.mjs";

const conteúdo = gerar(await inspecionarRuntime());

if (process.argv.includes("--check")) {
  if (readFileSync(DESTINO, "utf8") === conteúdo) {
    console.log("ok       suporte.gerado.ts");
  } else {
    console.error(`DIVERGE  suporte.gerado.ts — regere com: ${COMANDO_REGERAR}`);
    process.exit(1);
  }
} else {
  writeFileSync(DESTINO, conteúdo);
  console.log(`escrito  ${path.relative(RAIZ, DESTINO)}`);
}
