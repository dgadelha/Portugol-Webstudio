//
// Leitura do golden do oracle (`tools/oracle/run.sh --golden`), compartilhada pelo teste
// diferencial (`tests/corpus/diferencial.test.ts`) e pela ferramenta de corpus
// (`tools/corpus.mjs`) — o formato é um só, e duas cópias divergiriam em silêncio.
//
import { readFileSync } from "node:fs";
import path from "node:path";

const PARSER_DIR = path.resolve(import.meta.dirname, "..");

export const GOLDEN = path.join(PARSER_DIR, "tests", "fixtures", "portugol-studio.golden.txt");

/**
 * @typedef {{ tipo: string; linha: number }} EntradaGolden
 */

/**
 * O formato: um cabeçalho `### caminho/do/exemplo.por` e, abaixo dele, uma linha
 * `TIPO|linha|...` por diagnóstico do Portugol Studio.
 *
 * @param {string} [caminho]
 * @returns {Map<string, EntradaGolden[]>}
 */
export function lerGolden(caminho = GOLDEN) {
  /**
   * @type {Map<string, EntradaGolden[]>}
   */
  const porArquivo = new Map();
  /**
   * @type {EntradaGolden[] | undefined}
   */
  let atual;

  for (const linha of readFileSync(caminho, "utf8").split("\n")) {
    const cabeçalho = /^### (?<caminho>.+)$/u.exec(linha);

    if (cabeçalho?.groups) {
      atual = [];
      porArquivo.set(cabeçalho.groups.caminho, atual);
      continue;
    }

    if (!atual || !linha.trim()) {
      continue;
    }

    const [tipo, númeroLinha] = linha.split("|", 2);

    atual.push({ tipo, linha: Number(númeroLinha) });
  }

  return porArquivo;
}

/**
 * As linhas em que o Portugol Studio vê **erro** — os avisos dele não entram no diferencial.
 *
 * @param {readonly EntradaGolden[]} [entradas]
 */
export function linhasDeErro(entradas = []) {
  return new Set(entradas.filter(entrada => entrada.tipo === "ERRO").map(entrada => entrada.linha));
}
