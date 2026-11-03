import { bibliotecas } from "@portugol-webstudio/resources/bibliotecas";
import {
  assinaturaDaConstante,
  assinaturaDaFunção,
  BIBLIOTECAS_IMPLEMENTADAS,
  descriçãoDoParâmetro,
  descriçãoDoRetorno,
  emUmaLinha,
  PASTA_DAS_BIBLIOTECAS,
  páginaNaAjuda,
} from "@portugol-webstudio/parser";
import { portugolLiteral } from "@portugol-webstudio/runner";
import { TreeItem } from "./types";

type Biblioteca = (typeof bibliotecas)[number];
type Constante = Biblioteca["constantes"][number];
type Função = Biblioteca["funções"][number];

// As páginas das bibliotecas são geradas dos metadados, em Markdown como os outros tópicos
// da Ajuda. Cada uma tem um caminho de arquivo (que não existe no servidor) para os links
// entre elas e os endereços `#ajuda=` funcionarem como nos outros tópicos. A pasta e os
// caminhos vêm do parser, que os usa no link "Ver na Ajuda" da informação do editor.

function blocoDeSintaxe(código: string) {
  return "```portugol sintaxe\n" + código + "\n```";
}

/**
 * A declaração da função ou constante: colorida como o código, sem botão de copiar.
 */
function blocoDeAssinatura(código: string) {
  return "```portugol assinatura\n" + código + "\n```";
}

function referência(url: string | undefined) {
  return url ? `[Saiba mais sobre o assunto](${url})` : "";
}

function juntar(...partes: string[]) {
  return partes.filter(Boolean).join("\n\n") + "\n";
}

/**
 * Os links das listas são relativos à pasta da biblioteca (`bibliotecas/<Nome>/`),
 * onde ficam as páginas das constantes e funções.
 */
function listaDeConstantes(biblioteca: Biblioteca, pasta: string) {
  return biblioteca.constantes
    .map(c => `- [\`${c.nome}\`](${pasta}${c.nome}.md): ${emUmaLinha(c.descrição)}`)
    .join("\n");
}

function listaDeFunções(biblioteca: Biblioteca, pasta: string) {
  return biblioteca.funções.map(f => `- [\`${f.nome}\`](${pasta}${f.nome}.md): ${emUmaLinha(f.descrição)}`).join("\n");
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
    listaDeConstantes(biblioteca, `${nome}/`),
    biblioteca.funções.length > 0 ? "## Funções" : "",
    listaDeFunções(biblioteca, `${nome}/`),
  );
}

/**
 * As pastas "Constantes" e "Funções" da árvore ficam ao lado das páginas
 * (`bibliotecas/<Nome>/constantes.md`), então as listas apontam para a mesma pasta.
 */
function páginaDoGrupo(biblioteca: Biblioteca, grupo: "Constantes" | "Funções") {
  return juntar(
    `# ${grupo} da biblioteca ${biblioteca.nome}`,
    `Voltar para a biblioteca [${biblioteca.nome}](../${biblioteca.nome}.md).`,
    grupo === "Constantes" ? listaDeConstantes(biblioteca, "") : listaDeFunções(biblioteca, ""),
  );
}

function páginaDaConstante(biblioteca: Biblioteca, constante: Constante) {
  return juntar(
    `# ${constante.nome}`,
    `Constante da biblioteca [${biblioteca.nome}](../${biblioteca.nome}.md).`,
    blocoDeAssinatura(
      `${assinaturaDaConstante(constante)} = ${portugolLiteral(constante.tipo.primitivo, constante.valor)}`,
    ),
    constante.descrição.trim(),
    "## Para usar",
    blocoDeSintaxe(`${biblioteca.nome}.${constante.nome}`),
    referência(constante.referência),
  );
}

function páginaDaFunção(biblioteca: Biblioteca, função: Função) {
  const { retorno } = função;

  return juntar(
    `# ${função.nome}`,
    `Função da biblioteca [${biblioteca.nome}](../${biblioteca.nome}.md).`,
    blocoDeAssinatura(assinaturaDaFunção(função)),
    função.descrição.trim(),
    função.parâmetros.length > 0 ? "## Parâmetros" : "",
    função.parâmetros.map(p => `- ${descriçãoDoParâmetro(p)}`).join("\n"),
    "## Para usar",
    blocoDeSintaxe(`${biblioteca.nome}.${função.nome}(${função.parâmetros.map(p => p.nome).join(", ")})`),
    retorno.tipo.primitivo === "vazio" ? "" : "## Retorno",
    descriçãoDoRetorno(função),
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
 * Os itens de uma biblioteca na árvore. Com constantes e funções, cada tipo
 * fica numa pasta: na Graficos, as 55 funções não vêm depois de 17 constantes,
 * e quem usa o teclado pula um grupo inteiro com uma seta.
 */
function itensDaBiblioteca(b: Biblioteca): TreeItem[] {
  const pasta = `${PASTA_DAS_BIBLIOTECAS}/${b.nome}`;
  // O mesmo caminho dos links "Ver na Ajuda" do editor.
  const constantes = b.constantes.map(c => item(páginaNaAjuda(b.nome, c.nome), c.nome, páginaDaConstante(b, c)));
  const funções = b.funções.map(f => item(páginaNaAjuda(b.nome, f.nome), f.nome, páginaDaFunção(b, f)));

  if (constantes.length === 0 || funções.length === 0) {
    return [...constantes, ...funções];
  }

  return [
    item(`${pasta}/constantes.md`, "Constantes", páginaDoGrupo(b, "Constantes"), constantes),
    item(`${pasta}/funcoes.md`, "Funções", páginaDoGrupo(b, "Funções"), funções),
  ];
}

/**
 * O grupo "Bibliotecas" da árvore da Ajuda: um índice e, para cada biblioteca
 * que o Webstudio executa, a página dela, das constantes e das funções.
 */
export function criarAjudaDasBibliotecas(): TreeItem {
  const lista = bibliotecas.filter(b => implementadas.has(b.nome));

  return item(
    `${PASTA_DAS_BIBLIOTECAS}/index.md`,
    "Bibliotecas",
    páginaDoÍndice(lista),
    lista.map(b => item(páginaNaAjuda(b.nome), b.nome, páginaDaBiblioteca(b), itensDaBiblioteca(b))),
  );
}
