import { PortugolLexer } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { chamávelDoPrograma } from "./chamáveis.js";
import { comentárioDe } from "./comentários.js";
import type { Intervalo, Posição } from "./contexto.js";
import { bloco, textoComLinks } from "./markdown.js";
import { assinaturaEExplicação, páginaDaAjuda, resolverNome, type Significado, visível } from "./resolução.js";
import { type CódigoLido, declaraçãoNoCódigo, type SímboloDeclarado, símbolosVisíveis } from "./símbolos.js";

export interface InformaçãoDoNome {
  /**
   * O nome sob o cursor: a informação fica aberta enquanto o mouse anda por ele.
   */
  intervalo: Intervalo;
  /**
   * Em Markdown: a declaração num bloco de código e, depois, o texto. Sem negrito nem
   * títulos, como na documentação das sugestões.
   */
  conteúdo: string;
  /**
   * A página da Ajuda sobre o nome, como nos endereços `#ajuda=`: as bibliotecas e o que elas
   * têm, e as funções da linguagem que têm uma página só delas.
   */
  ajuda?: string;
  /**
   * Numa variável, constante ou parâmetro do programa, o que a depuração precisa para achar o
   * valor dela. O programa em execução só guarda os nomes de cada chamada: a variável de um
   * bloco continua lá depois do bloco, e duas `inteiro i` em dois laços da mesma função ocupam
   * o mesmo lugar.
   */
  variável?: VariávelDoNome;
}

export interface VariávelDoNome {
  nome: string;
  /**
   * A função em que ela foi declarada, ou `null` numa global.
   */
  função: string | null;
  /**
   * O `conteúdo` depois do bloco da declaração, para `comValorAtual`.
   */
  descrição: string;
  /**
   * Numa local, a única declaração com esse nome na função: numa chamada que não é a da pausa,
   * só assim o valor é com certeza o dela.
   */
  únicaNaFunção?: boolean;
  /**
   * Com a pausa dentro da função: o mesmo nome, no ponto da pausa, é esta declaração. Fora do
   * bloco dela, ou antes da declaração, não é.
   */
  vistaNaPausa?: boolean;
}

/**
 * Onde a depuração parou, como o depurador manda: a linha e a coluna do começo do comando, em
 * pontos de código a partir de 0, como no ANTLR.
 */
export interface PontoDaPausa {
  linha: number;
  coluna: number;
}

/**
 * O que o nome na posição é, como o VS Code mostra ao parar o mouse sobre ele.
 */
export function informaçãoDoNome(código: string, posição: Posição, pausa?: PontoDaPausa): InformaçãoDoNome | null {
  const resolvido = resolverNome(código, posição);

  if (!resolvido) {
    return null;
  }

  const { intervalo, significado, lido } = resolvido;

  if (significado.tipo === "símbolo" && significado.símbolo.classe !== "função") {
    const { símbolo } = significado;
    const valor = símbolo.valor === undefined ? "" : ` = ${símbolo.valor}`;
    const variável = variávelDe(símbolo, lido, pausa);

    return { intervalo, conteúdo: juntar(bloco(declaraçãoNoCódigo(símbolo) + valor), variável.descrição), variável };
  }

  const ajuda = páginaDaAjuda(significado);

  return { intervalo, conteúdo: conteúdo(significado, lido.tokens), ...(ajuda && { ajuda }) };
}

/**
 * A informação de uma variável com a declaração da depuração, que tem o valor de agora, no
 * lugar da do código: `inteiro x = 12`, `real notas[4] = {7.5, 8.0, 6.5, 9.0}`.
 */
export function comValorAtual(variável: VariávelDoNome, declaração: string) {
  return juntar(bloco(declaração), variável.descrição);
}

/**
 * Onde a depuração guarda o valor da variável: nas globais, numa das chamadas (pelo índice, da
 * mais recente para a mais antiga, como o depurador manda) ou em nenhuma, quando o valor não é
 * com certeza o dela. A chamada é a `escolhida` na aba Variáveis, se ela é da função da
 * variável, ou a mais recente dessa função. Na chamada da pausa, o nome no ponto da pausa
 * precisa ser esta declaração; numa outra, ela precisa ser a única com esse nome na função.
 */
export function chamadaDoValor(
  variável: VariávelDoNome,
  chamadas: readonly string[],
  escolhida: number,
): number | "globais" | undefined {
  if (variável.função === null) {
    return "globais";
  }

  const índice = chamadas[escolhida] === variável.função ? escolhida : chamadas.indexOf(variável.função);

  if (índice === -1) {
    return;
  }

  return (índice === 0 ? variável.vistaNaPausa : variável.únicaNaFunção) ? índice : undefined;
}

function variávelDe(símbolo: SímboloDeclarado, { símbolos, tokens }: CódigoLido, pausa?: PontoDaPausa): VariávelDoNome {
  const { nome, função } = símbolo;
  const descrição = juntar(oQueÉ(símbolo), comentário(símbolo, tokens));

  if (!função) {
    return { nome, função: null, descrição };
  }

  // Sem a pausa, só o que a informação mostra: o resto é para achar o valor na depuração.
  if (!pausa) {
    return { nome, função: função.nome, descrição };
  }

  // Os parâmetros e as locais de uma função têm o mesmo objeto `função`.
  const únicaNaFunção = símbolos.símbolos.filter(s => s.nome === nome && s.função === função).length === 1;
  const ponto = pontoDaPausa(pausa, tokens);

  if (ponto === undefined || ponto < função.início || ponto > função.fim) {
    return { nome, função: função.nome, descrição, únicaNaFunção };
  }

  const vistaNaPausa = símbolosVisíveis(símbolos, ponto).find(s => s.nome === nome) === símbolo;

  return { nome, função: função.nome, descrição, únicaNaFunção, vistaNaPausa };
}

/**
 * O deslocamento da pausa no código. O `para` para a cada teste da condição, com a variável do
 * laço já declarada: o ponto é o da condição.
 */
function pontoDaPausa({ linha, coluna }: PontoDaPausa, tokens: Token[]) {
  const índice = tokens.findIndex(token => token.line === linha && token.column === coluna);
  const token = tokens[índice] as Token | undefined;

  if (token?.type !== PortugolLexer.PARA) {
    return token?.start;
  }

  for (let i = índice + 1; i < tokens.length; i++) {
    if (tokens[i].type === PortugolLexer.PONTOVIRGULA && tokens[i].channel === Token.DEFAULT_CHANNEL) {
      return (visível(tokens, i, 1) ?? token).start;
    }
  }

  return token.start;
}

function conteúdo(significado: Significado, tokens: CódigoLido["tokens"]) {
  switch (significado.tipo) {
    // Só as funções do programa: as variáveis passam por `variávelDe`.
    case "símbolo": {
      const { símbolo } = significado;

      return juntar(bloco(chamávelDoPrograma(símbolo).assinatura), comentário(símbolo, tokens));
    }

    case "biblioteca": {
      const { incluída, biblioteca } = significado;
      const apelido = incluída.alias ? ` --> ${incluída.alias}` : "";

      return juntar(bloco(`inclua biblioteca ${biblioteca.nome}${apelido}`), biblioteca.descrição.trim());
    }

    case "função":
    case "constante": {
      const { assinatura, explicação } = assinaturaEExplicação(significado);

      return juntar(bloco(assinatura), explicação);
    }
  }
}

function juntar(...partes: Array<string | undefined>) {
  return partes.filter(Boolean).join("\n\n");
}

/**
 * Em palavras, o que o bloco de código não diz: `variável local`, `constante global`,
 * `parâmetro por referência`.
 */
function oQueÉ(símbolo: SímboloDeclarado) {
  if (símbolo.origem === "parâmetro") {
    const dimensão = símbolo.dimensão ? ` ${símbolo.dimensão}` : "";

    return `parâmetro${dimensão}${símbolo.referência ? " por referência" : ""}`;
  }

  const classe = símbolo.constante
    ? símbolo.dimensão
      ? `${símbolo.dimensão} constante`
      : "constante"
    : símbolo.classe;

  return `${classe} ${símbolo.origem}`;
}

/**
 * O comentário é texto, e não Markdown: `a * b` ou `v[i]` aparecem como foram escritos, e
 * cada linha fica na sua. Os endereços continuam links.
 */
function comentário(símbolo: SímboloDeclarado, tokens: CódigoLido["tokens"]) {
  const texto = comentárioDe(símbolo, tokens);

  return texto
    ?.split("\n\n")
    .map(parágrafo => {
      return parágrafo
        .split("\n")
        .map(linha => textoComLinks(linha))
        .join("\\\n");
    })
    .join("\n\n");
}
