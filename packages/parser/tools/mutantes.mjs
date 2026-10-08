//
// Os exemplos oficiais quebrados das formas que um estudante quebraria: um token apagado,
// duplicado, trocado de lugar ou sobrando, um caractere apagado, o arquivo cortado. A semente
// é fixa, então os mutantes saem iguais a cada execução.
//
// Compartilhado pelo teste (`tests/corpus/mutantes.test.ts`) e pelo oracle, que grava o que o
// Portugol Studio diz de cada mutante em `tests/fixtures/portugol-studio-sintaxe.golden.txt`
// (`tools/oracle/run.sh --golden-sintaxe`). Mudou um exemplo, o golden precisa ser regerado.
//
//   node tools/mutantes.mjs gravar <diretório>   grava um arquivo .por por mutante
//   node tools/mutantes.mjs resumir              lê do stdin a saída do oracle sobre esses
//                                                arquivos e imprime o golden
//
import { globSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { PortugolLexer } from "@portugol-webstudio/antlr";
import { CharStream, Token } from "antlr4ng";

const EXEMPLOS = path.resolve(import.meta.dirname, "../../resources/exemplos");

export const GOLDEN_SINTAXE = path.resolve(import.meta.dirname, "../tests/fixtures/portugol-studio-sintaxe.golden.txt");

const MUTANTES_POR_EXEMPLO = 3;

const SOLTOS = ["(", ")", "{", "}", ",", ";", "=", "+", "senao", "se", "funcao", '"', "'", "@", "/*", "2,5", "ç"];

/**
 * @typedef {{ nome: string; código: string }} Mutante
 */

/**
 * @returns {Mutante[]}
 */
export function gerarMutantes() {
  let semente = 468;

  const aleatório = () => {
    semente = (semente * 1_103_515_245 + 12_345) % 2 ** 31;

    return semente / 2 ** 31;
  };

  /**
   * @template T
   * @param {readonly T[]} itens
   * @returns {T}
   */
  const escolher = itens => /** @type {T} */ (itens[Math.floor(aleatório() * itens.length)]);

  /**
   * @param {string} código
   */
  const mutar = código => {
    const lexer = new PortugolLexer(CharStream.fromString(código));

    lexer.removeErrorListeners();

    const tokens = lexer.getAllTokens().filter(token => token.channel === Token.DEFAULT_CHANNEL);
    // As posições do ANTLR contam pontos de código, e não unidades de UTF-16.
    const pontos = Array.from(código);
    /**
     * @param {number} a
     * @param {number} [b]
     */
    const texto = (a, b) => pontos.slice(a, b).join("");
    const token = escolher(tokens);
    const próximo = tokens[tokens.indexOf(token) + 1] ?? token;
    const [início, fim] = [token.start, token.stop + 1];
    const i = Math.floor(aleatório() * pontos.length);

    switch (Math.floor(aleatório() * 6)) {
      case 0: {
        return texto(0, início) + texto(fim);
      }

      case 1: {
        return `${texto(0, fim)} ${texto(início, fim)}${texto(fim)}`;
      }

      case 2: {
        return `${texto(0, início)}${escolher(SOLTOS)} ${texto(início)}`;
      }

      case 3: {
        const [a, b] = [próximo.start, próximo.stop + 1];

        return texto(0, início) + texto(a, b) + texto(fim, a) + texto(início, fim) + texto(b);
      }

      case 4: {
        return texto(0, i) + texto(i + 1);
      }

      default: {
        return texto(0, i);
      }
    }
  };

  return globSync("**/*.por", { cwd: EXEMPLOS })
    .toSorted((a, b) => a.localeCompare(b))
    .flatMap(arquivo => {
      const código = readFileSync(path.join(EXEMPLOS, arquivo), "utf8");

      return Array.from({ length: MUTANTES_POR_EXEMPLO }, (_, i) => {
        return {
          nome: `${arquivo.replaceAll("/", "__").replace(/\.por$/u, "")}.${i + 1}.por`,
          código: mutar(código),
        };
      });
    });
}

/**
 * O primeiro erro de sintaxe do Portugol Studio, ou `undefined` se ele analisou o programa.
 *
 * @typedef {{ linha: number; coluna: number; código: string }} ErroGolden
 */

/**
 * O formato: `### nome.por` e, abaixo, `SINTAXE|linha|coluna|código` quando o Portugol Studio
 * vê erro de sintaxe no mutante.
 *
 * @param {string} [caminho]
 * @returns {Map<string, ErroGolden | undefined>}
 */
export function lerGoldenSintaxe(caminho = GOLDEN_SINTAXE) {
  /**
   * @type {Map<string, ErroGolden | undefined>}
   */
  const porMutante = new Map();
  let atual = "";

  for (const linha of readFileSync(caminho, "utf8").split("\n")) {
    if (linha.startsWith("### ")) {
      atual = linha.slice(4);
      porMutante.set(atual, undefined);
    } else if (linha.startsWith("SINTAXE|")) {
      const [, número, coluna, código] = linha.split("|", 4);

      porMutante.set(atual, { linha: Number(número), coluna: Number(coluna), código: código ?? "" });
    }
  }

  return porMutante;
}

/**
 * Os erros do `AnalisadorSintatico` do Java que saem sem código na saída do oracle (o código
 * só é montado junto da mensagem). Os de cadeia (barra invertida, quebra de linha) ficam de
 * fora: aqui eles são da análise semântica, que não roda com erro de sintaxe.
 */
const MENSAGENS_SINTAXE =
  /^(A expressão '|O escopo|Era esperada|O comando "|O elemento|A expressão está incompleta|A expressão foi formada|O formato de Vetor|O nome d|Uma vírgula|A expressão não foi|Você esqueceu|O caracter ':'|O algoritmo está incompleto|Não são permitidas|A expressão do tipo 'cadeia'|O número .* 32 bits|O token 'senao'|Os parametros|Não é possível retornar|Expressão |missing|mismatched|no viable|extraneous|O comando 'pare')/u;

/**
 * @param {string} saída a saída do oracle, com um `### arquivo` antes de cada mutante
 */
function resumir(saída) {
  /**
   * @type {string[]}
   */
  const linhas = [];
  let esperandoErro = false;

  for (const linha of saída.split("\n")) {
    if (linha.startsWith("### ")) {
      linhas.push(`### ${path.basename(linha.slice(4))}`);
      esperandoErro = true;
      continue;
    }

    const [tipo, número, coluna, código = "", mensagem = ""] = linha.split("|", 5);
    const éSintaxe =
      tipo === "ERRO" &&
      !/EscapeUnico|LinhaPulada/u.test(código) &&
      (código.startsWith("ErroSintatico") || (código === "" && MENSAGENS_SINTAXE.test(mensagem)));

    if (esperandoErro && éSintaxe) {
      linhas.push(`SINTAXE|${número}|${coluna}|${código}`);
      esperandoErro = false;
    }
  }

  return `${linhas.join("\n")}\n`;
}

if (import.meta.main) {
  const [comando, destino] = process.argv.slice(2);

  if (comando === "gravar" && destino) {
    mkdirSync(destino, { recursive: true });

    for (const { nome, código } of gerarMutantes()) {
      writeFileSync(path.join(destino, nome), código);
    }
  } else if (comando === "resumir") {
    // `readFileSync(0)` falha com EAGAIN quando o stdin é um pipe que ainda não terminou.
    let saída = "";

    for await (const pedaço of process.stdin) {
      saída += String(pedaço);
    }

    process.stdout.write(resumir(saída));
  } else {
    console.error("Uso: node tools/mutantes.mjs gravar <diretório> | resumir < saída-do-oracle");
    process.exitCode = 1;
  }
}
