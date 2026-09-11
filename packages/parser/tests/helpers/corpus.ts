import { globSync } from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * `packages/resources/assets` é gitignored e o `npm test` da raiz não constrói os recursos
 * antes, então num clone novo os exemplos podem não existir. Sem esta guarda o teste
 * diferencial estoura com `ENOENT` na importação e derruba a suíte inteira do pacote.
 */
export const EXEMPLOS = path.resolve(import.meta.dirname, "../../../resources/assets/exemplos");

export const temCorpus = globSync("**/*.por", { cwd: EXEMPLOS }).length > 0;

if (!temCorpus) {
  const aviso = `Exemplos não encontrados em ${EXEMPLOS}. Gere com: npm run build -w @portugol-webstudio/resources`;

  // Como no runner: ausência é degradação aceitável na máquina de quem desenvolve, mas no
  // CI significa que o build dos recursos não rodou — e aí o diferencial não está guardando nada.
  if (process.env.CI) {
    throw new Error(aviso);
  }

  console.warn(`AVISO: ${aviso}`);
}
