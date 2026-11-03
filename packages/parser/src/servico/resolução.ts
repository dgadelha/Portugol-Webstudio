import { PortugolLexer } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import {
  type Biblioteca,
  type ConstanteBiblioteca,
  obterBiblioteca,
  obterConstante,
} from "../bibliotecas/metadados.js";
import { constanteImplementada } from "../bibliotecas/suporte.js";
import { type Chamável, funçãoDaBiblioteca, FUNÇÕES_DA_LINGUAGEM } from "./chamáveis.js";
import type { Intervalo, Posição } from "./contexto.js";
import {
  type BibliotecaIncluída,
  bibliotecaIncluída,
  type CódigoLido,
  inclusãoDe,
  lerCódigo,
  type SímboloDeclarado,
  símbolosVisíveis,
} from "./símbolos.js";

/**
 * O que um nome do código é, como o analisador o entenderia naquele ponto.
 */
export type Significado =
  | { tipo: "símbolo"; símbolo: SímboloDeclarado }
  | { tipo: "biblioteca"; incluída: BibliotecaIncluída; biblioteca: Biblioteca }
  /**
   * Uma função de biblioteca ou da linguagem (sem `biblioteca`), que não tem declaração no
   * código.
   */
  | { tipo: "função"; função: Chamável; biblioteca?: string }
  | { tipo: "constante"; constante: ConstanteBiblioteca; biblioteca: string };

export interface NomeResolvido {
  nome: string;
  intervalo: Intervalo;
  significado: Significado;
  lido: CódigoLido;
  linhas: string[];
}

/**
 * O nome no cursor (no começo, no meio ou no fim dele) e o que ele é. Fora de um nome, num
 * texto, num comentário ou numa palavra reservada, nada.
 */
export function resolverNome(código: string, posição: Posição): NomeResolvido | null {
  const lido = lerCódigo(código);
  const linhas = código.split("\n");
  const linha = linhas[posição.linha - 1];

  if (linha === undefined) {
    return null;
  }

  const coluna = pontosDeCódigo(linha, posição.coluna - 1);
  const índice = nomeEm(lido.tokens, posição.linha, coluna);

  if (índice === undefined) {
    return null;
  }

  const token = lido.tokens[índice];
  const significado = resolver(lido, índice);

  return significado
    ? { nome: token.text ?? "", intervalo: intervaloDoToken(token, linhas), significado, lido, linhas }
    : null;
}

function resolver({ símbolos: programa, tokens }: CódigoLido, índice: number): Significado | undefined {
  const token = tokens[índice];
  const nome = token.text ?? "";
  const anterior = visível(tokens, índice, -1);

  // Depois de `X.`: um membro da biblioteca `X`, se ela foi incluída.
  if (anterior?.type === PortugolLexer.PONTO) {
    const escopo = visível(tokens, anterior.tokenIndex, -1);

    return escopo?.type === PortugolLexer.ID
      ? membro(bibliotecaIncluída(programa, escopo.text ?? ""), nome)
      : undefined;
  }

  const inclusão = programa.bibliotecas.find(b => b.índice === índice || b.índiceDoApelido === índice);

  if (inclusão) {
    return comoBiblioteca(inclusão);
  }

  const própria = programa.símbolos.find(s => s.índices.nome === índice);

  if (própria) {
    return { tipo: "símbolo", símbolo: própria };
  }

  if (visível(tokens, índice, 1)?.type === PortugolLexer.PONTO) {
    const incluída = inclusãoDe(programa, nome);

    if (incluída) {
      return comoBiblioteca(incluída);
    }
  }

  // O analisador não deixa declarar outro nome igual ao de uma função da linguagem.
  const daLinguagem = FUNÇÕES_DA_LINGUAGEM.get(nome);

  if (daLinguagem) {
    return { tipo: "função", função: daLinguagem };
  }

  const símbolo = símbolosVisíveis(programa, token.start).find(s => s.nome === nome);

  return símbolo && { tipo: "símbolo", símbolo };
}

function comoBiblioteca(incluída: BibliotecaIncluída): Significado | undefined {
  const biblioteca = obterBiblioteca(incluída.nome);

  return biblioteca && { tipo: "biblioteca", incluída, biblioteca };
}

/**
 * Só o que o Webstudio executa: o analisador recusa o resto.
 */
function membro(biblioteca: Biblioteca | undefined, nome: string): Significado | undefined {
  if (!biblioteca) {
    return undefined;
  }

  const função = funçãoDaBiblioteca(biblioteca.nome, nome);

  if (função) {
    return { tipo: "função", função, biblioteca: biblioteca.nome };
  }

  const constante = obterConstante(biblioteca.nome, nome);

  if (constante && constanteImplementada(biblioteca.nome, nome)) {
    return { tipo: "constante", constante, biblioteca: biblioteca.nome };
  }

  return undefined;
}

/**
 * O token visível antes (`passo` -1) ou depois (1) do índice, pulando espaços e comentários.
 */
function visível(tokens: Token[], índice: number, passo: 1 | -1) {
  for (let i = índice + passo; i >= 0 && i < tokens.length; i += passo) {
    if (tokens[i].channel === Token.DEFAULT_CHANNEL) {
      return tokens[i];
    }
  }

  return;
}

/**
 * O índice do nome em que a coluna (em pontos de código, a partir de 0) cai, contando as
 * duas pontas: em `a(`, o cursor entre os dois é o fim do `a`.
 */
function nomeEm(tokens: Token[], linha: number, coluna: number) {
  let baixo = 0;
  let alto = tokens.length - 1;
  let último = -1;

  // O último token que começa até o cursor.
  while (baixo <= alto) {
    const meio = (baixo + alto) >> 1;
    const token = tokens[meio];

    if (token.line < linha || (token.line === linha && token.column <= coluna)) {
      último = meio;
      baixo = meio + 1;
    } else {
      alto = meio - 1;
    }
  }

  for (const índice of [último, último - 1]) {
    const token = tokens[índice] as Token | undefined;

    if (
      token?.type === PortugolLexer.ID &&
      token.line === linha &&
      coluna <= token.column + (token.text?.length ?? 0)
    ) {
      return índice;
    }
  }

  return;
}

/**
 * Onde o nome está, com as colunas do editor: o ANTLR conta pontos de código, e um emoji antes
 * do nome, na mesma linha, ocupa duas colunas no editor.
 */
export function intervaloDoToken(token: Token, linhas: readonly string[]): Intervalo {
  const início = unidadesDeUtf16(linhas[token.line - 1] ?? "", token.column) + 1;

  return { linha: token.line, início, fim: início + (token.text?.length ?? 0) };
}

/**
 * Quantos pontos de código começam nas primeiras `unidades` unidades de UTF-16 do texto.
 */
function pontosDeCódigo(texto: string, unidades: number) {
  return Array.from(texto.slice(0, unidades)).length;
}

/**
 * Quantas unidades de UTF-16 ocupam os primeiros `pontos` pontos de código do texto.
 */
function unidadesDeUtf16(texto: string, pontos: number) {
  return Array.from(texto).slice(0, pontos).join("").length;
}
