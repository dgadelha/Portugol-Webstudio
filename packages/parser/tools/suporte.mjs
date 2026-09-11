//
// Cruza o que a linguagem tem (`@portugol-recursos/bibliotecas`) com o que o runtime do
// Webstudio sabe executar (packages/runtime/src/libs), para o checker acusar o que
// quebraria só em execução. O CLI está em gerar-suporte.mjs; o teste
// tests/analise/suporte.test.ts usa `gerar()` como guarda de atualidade.
//
import { bibliotecas } from "@portugol-recursos/bibliotecas";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const PARSER_DIR = path.resolve(import.meta.dirname, "..");
export const RAIZ = path.resolve(PARSER_DIR, "..", "..");
export const DESTINO = path.join(PARSER_DIR, "src", "bibliotecas", "suporte.gerado.ts");
export const COMANDO_REGERAR = "node packages/parser/tools/gerar-suporte.mjs";
const LIBS_RUNTIME_DIR = path.join(RAIZ, "packages", "runtime", "src", "libs");

/**
 * Ordena por código, e não por localidade, para o resultado não depender do ambiente.
 *
 * @param {string} a
 * @param {string} b
 */
function porCódigo(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * As bibliotecas do runtime são *strings* de JavaScript. Em vez de analisá-las com
 * expressões regulares — onde método de objeto literal e constante
 * `NOME: new PortugolVar(...)` se confundem facilmente — avaliamos a string com um
 * `PortugolVar` de mentira e olhamos as chaves do objeto resultante.
 */
export async function inspecionarRuntime() {
  const indice = readFileSync(path.join(LIBS_RUNTIME_DIR, "index.ts"), "utf8");
  const injetadas = indice
    .matchAll(/^\s*([A-Za-z_$][\w$]*):\s*\$\{/gm)
    .map(([, nome]) => nome)
    .toArray();

  if (injetadas.length === 0) {
    throw new Error(`Nenhuma biblioteca encontrada em ${path.join(LIBS_RUNTIME_DIR, "index.ts")}`);
  }

  const arquivos = readdirSync(LIBS_RUNTIME_DIR)
    .filter(arquivo => arquivo.endsWith(".ts") && arquivo !== "index.ts")
    .map(arquivo => arquivo.replace(/\.ts$/, ""));

  const órfãs = arquivos.filter(nome => !injetadas.includes(nome));

  if (órfãs.length > 0) {
    throw new Error(`Bibliotecas do runtime que não são injetadas pelo index.ts: ${órfãs.join(", ")}`);
  }

  class PortugolVar {
    /**
     * @param {string} tipo
     * @param {unknown} valor
     * @param {boolean} constante
     */
    constructor(tipo, valor, constante) {
      this.type = tipo;
      this.value = valor;
      this.constant = constante;
    }
  }

  const resultado = new Map();

  for (const nome of injetadas.toSorted(porCódigo)) {
    const fonte = readFileSync(path.join(LIBS_RUNTIME_DIR, `${nome}.ts`), "utf8");

    // Os arquivos são ESM válido sem imports, então dá para carregá-los como data: URL
    // e obter a string já com as interpolações (`${PADRAO_REAL}` etc.) resolvidas.
    // eslint-disable-next-line unicorn/prefer-uint8array-base64 -- `toBase64()` só existe a partir do Node 26
    const url = `data:text/javascript;base64,${Buffer.from(fonte).toString("base64")}`;
    const código = (await import(url)).default;

    let objeto;

    try {
      objeto = new Function("PortugolVar", "self", `return (${código});`)(PortugolVar, { runtime: {} });
    } catch (error) {
      throw new Error(`Não foi possível avaliar a biblioteca ${nome} do runtime`, { cause: error });
    }

    resultado.set(nome, {
      funções: new Set(Object.keys(objeto).filter(chave => typeof objeto[chave] === "function")),
      constantes: new Set(Object.keys(objeto).filter(chave => typeof objeto[chave] !== "function")),
    });
  }

  return resultado;
}

/**
 * @param {readonly string[]} itens
 */
function lista(itens) {
  return itens.map(item => `  ${JSON.stringify(item)},`).join("\n");
}

/**
 * @param {ReadonlyMap<string, { funções: ReadonlySet<string>; constantes: ReadonlySet<string> }>} runtime
 */
export function gerar(runtime) {
  const nomes = bibliotecas.map(biblioteca => biblioteca.nome).toSorted(porCódigo);
  const implementadas = nomes.filter(nome => runtime.has(nome));

  const desconhecidas = runtime
    .keys()
    .filter(nome => !nomes.includes(nome))
    .toArray();

  if (desconhecidas.length > 0) {
    throw new Error(`O runtime implementa bibliotecas que a linguagem não tem: ${desconhecidas.join(", ")}`);
  }

  const símbolos = implementadas
    .map(nome => {
      // `nome` saiu de `bibliotecas`, então os dois lookups sempre acham.
      const biblioteca = bibliotecas.find(item => item.nome === nome);
      const implementado = runtime.get(nome);

      if (!biblioteca || !implementado) {
        throw new Error(`Biblioteca desapareceu entre a listagem e a busca: ${nome}`);
      }

      const funções = biblioteca.funções
        .map(função => função.nome)
        .filter(item => !implementado.funções.has(item))
        .toSorted(porCódigo);

      const constantes = biblioteca.constantes
        .map(constante => constante.nome)
        .filter(item => !implementado.constantes.has(item))
        .toSorted(porCódigo);

      return `  ${JSON.stringify(nome)}: { funções: [${funções.map(f => JSON.stringify(f)).join(", ")}], constantes: [${constantes.map(c => JSON.stringify(c)).join(", ")}] },`;
    })
    .join("\n");

  return `// ARQUIVO GERADO — não edite à mão.
//
// Cruza \`@portugol-recursos/bibliotecas\` (o que a linguagem tem) com
// packages/runtime/src/libs (o que o runtime do Webstudio executa).
// Regere com, a partir da raiz do repositório:
//
//   ${COMANDO_REGERAR}

import type { SímbolosNãoImplementados } from "./suporte.js";

export type NomeBiblioteca =
${nomes.map(nome => `  | ${JSON.stringify(nome)}`).join("\n")};

/**
 * Bibliotecas cujo código o runtime do Webstudio injeta (\`packages/runtime/src/libs\`).
 */
export const BIBLIOTECAS_IMPLEMENTADAS: readonly NomeBiblioteca[] = [
${lista(implementadas)}
];

/**
 * Símbolos que faltam *dentro* de cada biblioteca implementada. As listas vazias existem
 * para a diferença aparecer no diff assim que a linguagem ganhar um símbolo novo.
 */
export const SÍMBOLOS_NÃO_IMPLEMENTADOS: Readonly<Partial<Record<NomeBiblioteca, SímbolosNãoImplementados>>> = {
${símbolos}
};
`;
}
