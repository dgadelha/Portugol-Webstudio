import { bibliotecas } from "@portugol-webstudio/resources/bibliotecas";
import { BIBLIOTECAS_IMPLEMENTADAS } from "@portugol-webstudio/parser";
import { TreeItem } from "./types";

type Biblioteca = (typeof bibliotecas)[number];
type Constante = Biblioteca["constantes"][number];
type Função = Biblioteca["funções"][number];
type Tipo = Função["retorno"]["tipo"];

/**
 * As páginas das bibliotecas são geradas dos metadados, em Markdown como os
 * outros tópicos da Ajuda. Cada uma tem um caminho de arquivo (que não existe
 * no servidor) para os links entre elas e os endereços `#ajuda=` funcionarem
 * como nos outros tópicos.
 */
const PASTA = "bibliotecas";

const DIMENSÕES = { vetor: "[]", matriz: "[][]" };

/**
 * `inteiro`, `real[]`… O tipo `*` dos metadados aceita qualquer tipo.
 */
function nomeDoTipo(tipo: Tipo) {
  const primitivo = tipo.primitivo === "*" ? "qualquer tipo" : tipo.primitivo;

  return tipo.dimensão ? `${primitivo}${DIMENSÕES[tipo.dimensão]}` : primitivo;
}

/**
 * Parâmetros vetores e matrizes são passados por referência no Portugol: `inteiro &vetor[]`.
 */
function parâmetroNaAssinatura({ tipo, nome }: Função["parâmetros"][number]) {
  return tipo.dimensão ? `${tipo.primitivo} &${nome}${DIMENSÕES[tipo.dimensão]}` : `${tipo.primitivo} ${nome}`;
}

function assinaturaDaFunção(função: Função) {
  const retorno = função.retorno.tipo;
  const tipo = retorno.dimensão ? `${retorno.primitivo}${DIMENSÕES[retorno.dimensão]}` : retorno.primitivo;

  return `funcao ${tipo} ${função.nome}(${função.parâmetros.map(p => parâmetroNaAssinatura(p)).join(", ")})`;
}

function valorNoCódigo(constante: Constante) {
  switch (constante.tipo.primitivo) {
    case "cadeia": {
      return `"${constante.valor}"`;
    }
    case "caracter": {
      return `'${constante.valor}'`;
    }
    case "logico": {
      return constante.valor ? "verdadeiro" : "falso";
    }
    default: {
      return String(constante.valor);
    }
  }
}

function blocoDeSintaxe(código: string) {
  return "```portugol sintaxe\n" + código + "\n```";
}

/**
 * As descrições dos metadados podem ter várias linhas; nas listas, cabem numa só.
 */
function emUmaLinha(texto: string) {
  return texto.replaceAll(/\s+/g, " ").trim();
}

function referência(url: string | undefined) {
  return url ? `[Saiba mais sobre o assunto](${url})` : "";
}

function juntar(...partes: string[]) {
  return partes.filter(Boolean).join("\n\n") + "\n";
}

function páginaDaBiblioteca(biblioteca: Biblioteca) {
  const { nome } = biblioteca;
  const exemplo = biblioteca.funções[0] ?? biblioteca.constantes[0];
  const uso = exemplo
    ? `Depois de incluída, os recursos da biblioteca são usados com o nome dela e um ponto, como \`${nome}.${exemplo.nome}\`.`
    : "";

  return juntar(
    `# Biblioteca ${nome}`,
    biblioteca.descrição,
    "## Como incluir",
    blocoDeSintaxe(`inclua biblioteca ${nome}`),
    uso,
    biblioteca.constantes.length > 0 ? "## Constantes" : "",
    biblioteca.constantes.map(c => `- [\`${c.nome}\`](${nome}/${c.nome}.md): ${emUmaLinha(c.descrição)}`).join("\n"),
    biblioteca.funções.length > 0 ? "## Funções" : "",
    biblioteca.funções.map(f => `- [\`${f.nome}\`](${nome}/${f.nome}.md): ${emUmaLinha(f.descrição)}`).join("\n"),
  );
}

function páginaDaConstante(biblioteca: Biblioteca, constante: Constante) {
  return juntar(
    `# ${constante.nome}`,
    `Constante da biblioteca [${biblioteca.nome}](../${biblioteca.nome}.md).`,
    blocoDeSintaxe(`const ${nomeDoTipo(constante.tipo)} ${constante.nome} = ${valorNoCódigo(constante)}`),
    constante.descrição.trim(),
    `Para usar: \`${biblioteca.nome}.${constante.nome}\``,
    referência(constante.referência),
  );
}

function páginaDaFunção(biblioteca: Biblioteca, função: Função) {
  const { retorno } = função;

  return juntar(
    `# ${função.nome}`,
    `Função da biblioteca [${biblioteca.nome}](../${biblioteca.nome}.md).`,
    blocoDeSintaxe(assinaturaDaFunção(função)),
    função.descrição.trim(),
    função.parâmetros.length > 0 ? "## Parâmetros" : "",
    função.parâmetros.map(p => `- \`${p.nome}\` (${nomeDoTipo(p.tipo)}): ${emUmaLinha(p.descrição)}`).join("\n"),
    retorno.tipo.primitivo === "vazio" ? "" : "## Retorno",
    retorno.tipo.primitivo === "vazio"
      ? ""
      : `${nomeDoTipo(retorno.tipo)}${retorno.descrição ? `: ${emUmaLinha(retorno.descrição)}` : ""}`,
    referência(função.referência),
  );
}

function páginaDoÍndice(implementadas: Biblioteca[]) {
  return juntar(
    "# Bibliotecas",
    "Conjuntos de funções e constantes prontas para usar nos programas. Veja como incluir uma biblioteca em [Bibliotecas, na Linguagem Portugol](../topicos/linguagem_portugol/bibliotecas/index.md).",
    implementadas.map(b => `- [${b.nome}](${b.nome}.md): ${emUmaLinha(b.descrição)}`).join("\n"),
  );
}

function item(arquivo: string, text: string, source: string, children?: TreeItem[]): TreeItem {
  return { id: arquivo, text, arquivo, source, children };
}

const implementadas = new Set<string>(BIBLIOTECAS_IMPLEMENTADAS);

/**
 * O grupo "Bibliotecas" da árvore da Ajuda: um índice e, para cada biblioteca
 * que o Webstudio executa, a página dela, das constantes e das funções.
 */
export function criarAjudaDasBibliotecas(): TreeItem {
  const lista = bibliotecas.filter(b => implementadas.has(b.nome));

  return item(
    `${PASTA}/index.md`,
    "Bibliotecas",
    páginaDoÍndice(lista),
    lista.map(b => {
      const constantes = b.constantes.map(c =>
        item(`${PASTA}/${b.nome}/${c.nome}.md`, c.nome, páginaDaConstante(b, c)),
      );
      const funções = b.funções.map(f => item(`${PASTA}/${b.nome}/${f.nome}.md`, f.nome, páginaDaFunção(b, f)));

      return item(`${PASTA}/${b.nome}.md`, b.nome, páginaDaBiblioteca(b), [...constantes, ...funções]);
    }),
  );
}
