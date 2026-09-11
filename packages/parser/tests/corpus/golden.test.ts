import { execFileSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { describe, expect, test } from "vitest";

import { temCorpus } from "../helpers/corpus.js";

/**
 * O golden é um cache da resposta do Java: `diferencial.test.ts` roda contra ele sem
 * precisar de JVM. Esta guarda confere que o cache continua batendo com o analisador de
 * verdade — sem ela, subir a versão em `packages/runner/tests/setup.sh` deixaria a fixture
 * velha em silêncio, e o diferencial passaria comparando com a resposta errada.
 */
const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const ASSETS = path.join(RAIZ, "packages/runner/tests/assets");
const GOLDEN = path.resolve(import.meta.dirname, "../fixtures/portugol-studio.golden.txt");
const RUN = path.resolve(import.meta.dirname, "../../tools/oracle/run.sh");

function temJava() {
  try {
    execFileSync("java", ["-version"], { stdio: "ignore" });

    return true;
  } catch {
    return false;
  }
}

const temAnalisador = globSync("portugol-analisador-*.jar", { cwd: ASSETS }).some(jar => !jar.endsWith("-sources.jar"));

const temOráculo = temCorpus && temAnalisador && temJava();

if (!temOráculo) {
  const aviso = `Oracle indisponível (precisa de java no PATH e de portugol-analisador-*.jar em ${ASSETS}). Execute tests/setup.sh do runner.`;

  // Como no runner: falta de oracle é degradação aceitável na máquina de quem desenvolve,
  // mas no CI significa que os JARs não chegaram — e aí a guarda não estaria guardando nada.
  if (process.env.CI) {
    throw new Error(aviso);
  }

  console.warn(`AVISO: ${aviso}`);
}

describe.skipIf(!temOráculo)("Fixture do Portugol Studio", () => {
  // Sobe uma JVM e analisa os 119 exemplos: passa do timeout padrão de 5s num runner de CI.
  test("o golden ainda é o que o analisador do Portugol Studio devolve", { timeout: 30_000 }, () => {
    const atual = execFileSync(RUN, ["--golden", "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

    expect(atual).toBe(readFileSync(GOLDEN, "utf8"));
  });
});
