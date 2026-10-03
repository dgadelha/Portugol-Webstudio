import { globSync } from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Os exemplos são versionados em `packages/resources/exemplos`. A guarda abaixo só pega
 * um caminho errado: sem ela o teste diferencial estouraria com `ENOENT` na importação e
 * derrubaria a suíte inteira do pacote.
 */
export const EXEMPLOS = path.resolve(import.meta.dirname, "../../../resources/exemplos");

export const temCorpus = globSync("**/*.por", { cwd: EXEMPLOS }).length > 0;

if (!temCorpus) {
  const aviso = `Exemplos não encontrados em ${EXEMPLOS}`;

  // No CI, sem os exemplos o diferencial não estaria guardando nada.
  if (process.env.CI) {
    throw new Error(aviso);
  }

  console.warn(`AVISO: ${aviso}`);
}
