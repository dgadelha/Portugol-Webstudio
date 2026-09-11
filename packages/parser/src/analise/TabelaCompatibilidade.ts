import { TIPO_TODOS, TipoOperando, TipoPrimitivo } from "./TipoDado.js";

/**
 * Porta de `analise/semantica/TabelaCompatibilidadeTiposPortugol.java`: cada célula guarda
 * o tipo resultante da operação, como no Java — não um enum "compatível/incompatível".
 * `"incompativel"` é o `TIPOS_INCOMPATIVEIS` do Java; `"conversao"`, o `OCORRE_CONVERSAO`.
 */
export type Célula = TipoOperando | "conversao" | "incompativel";

/**
 * Os nomes seguem os métodos `criarTabelaCompatibilidade*` do Java; operações que lá
 * compartilham tabela compartilham o mesmo membro aqui.
 */
export type Operação =
  | "atribuicao"
  | "bitwise"
  | "chamadaFuncao"
  | "diferencaIgualdade"
  | "divisaoMultiplicacaoSubtracao"
  | "eOu"
  | "maiorMenor"
  | "modulo"
  | "retornoFuncao"
  | "soma";

export type ResultadoCompatibilidade =
  | { situação: "conversão"; de: TipoOperando; resultado: TipoOperando }
  | { situação: "incompatível" }
  | { situação: "ok"; resultado: TipoOperando };

// Ordem alfabética (não a do `ordinal()` do Java) para facilitar a conferência; a tabela
// é indexada por nome, então isto não tem efeito no resultado.
const ORDEM: readonly TipoOperando[] = [
  TipoPrimitivo.CADEIA,
  TipoPrimitivo.CARACTER,
  TipoPrimitivo.INTEIRO,
  TipoPrimitivo.LÓGICO,
  TipoPrimitivo.REAL,
  TipoPrimitivo.VAZIO,
  TIPO_TODOS,
];

// Abreviações usadas só nas grades abaixo, para cada tabela caber em 7x7 e poder ser
// conferida de bate-pronto contra o Java.
const _ = "incompativel" as const;
const O = "conversao" as const;
const S = TipoPrimitivo.CADEIA;
const K = TipoPrimitivo.CARACTER;
const I = TipoPrimitivo.INTEIRO;
const L = TipoPrimitivo.LÓGICO;
const R = TipoPrimitivo.REAL;

type Grade = readonly [
  readonly Célula[],
  readonly Célula[],
  readonly Célula[],
  readonly Célula[],
  readonly Célula[],
  readonly Célula[],
  readonly Célula[],
];

type Tabela = Readonly<Record<TipoOperando, Readonly<Record<TipoOperando, Célula>>>>;

function tabela(grade: Grade): Tabela {
  const resultado = {} as Record<TipoOperando, Record<TipoOperando, Célula>>;

  for (const [linha, esquerdo] of ORDEM.entries()) {
    const células = {} as Record<TipoOperando, Célula>;

    for (const [coluna, direito] of ORDEM.entries()) {
      células[direito] = grade[linha][coluna];
    }

    resultado[esquerdo] = células;
  }

  return resultado;
}

//        S  K  I  L  R  V  T   (direito)
const CHAMADA_FUNCAO = tabela([
  /* S */ [S, _, _, _, _, _, _],
  /* K */ [_, K, _, _, _, _, _],
  /* I */ [_, _, I, _, O, _, _],
  /* L */ [_, _, _, L, _, _, _],
  /* R */ [_, _, O, _, R, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [S, K, I, L, R, _, _],
]);

// No Java `criarTabelaCompatibilidadeRetornoFuncao` é cópia célula-a-célula da tabela de
// chamada, inclusive `[VAZIO][VAZIO] = incompatível`: `retorne` sem expressão em função
// `vazio` passa por um ramo separado do visitante, não pela tabela.
const RETORNO_FUNCAO = CHAMADA_FUNCAO;

const ATRIBUICAO = tabela([
  /* S */ [S, _, _, _, _, _, _],
  /* K */ [_, K, _, _, _, _, _],
  /* I */ [_, _, I, _, O, _, _],
  /* L */ [_, _, _, L, _, _, _],
  /* R */ [_, _, O, _, R, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const DIVISAO_MULTIPLICACAO_SUBTRACAO = tabela([
  /* S */ [_, _, _, _, _, _, _],
  /* K */ [_, _, _, _, _, _, _],
  /* I */ [_, _, I, _, R, _, _],
  /* L */ [_, _, _, _, _, _, _],
  /* R */ [_, _, R, _, R, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const DIFERENCA_IGUALDADE = tabela([
  /* S */ [L, _, _, _, _, _, _],
  /* K */ [_, L, _, _, _, _, _],
  /* I */ [_, _, L, _, L, _, _],
  /* L */ [_, _, _, L, _, _, _],
  /* R */ [_, _, L, _, L, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const E_OU = tabela([
  /* S */ [_, _, _, _, _, _, _],
  /* K */ [_, _, _, _, _, _, _],
  /* I */ [_, _, _, _, _, _, _],
  /* L */ [_, _, _, L, _, _, _],
  /* R */ [_, _, _, _, _, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const MAIOR_MENOR = tabela([
  /* S */ [L, _, _, _, _, _, _],
  /* K */ [_, L, _, _, _, _, _],
  /* I */ [_, _, L, _, L, _, _],
  /* L */ [_, _, _, _, _, _, _],
  /* R */ [_, _, L, _, L, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const MODULO = tabela([
  /* S */ [_, _, _, _, _, _, _],
  /* K */ [_, _, _, _, _, _, _],
  /* I */ [_, _, I, _, _, _, _],
  /* L */ [_, _, _, _, _, _, _],
  /* R */ [_, _, _, _, _, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const BITWISE = tabela([
  /* S */ [_, _, _, _, _, _, _],
  /* K */ [_, _, _, _, _, _, _],
  /* I */ [_, _, I, _, _, _, _],
  /* L */ [_, _, _, _, _, _, _],
  /* R */ [_, _, _, _, _, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const SOMA = tabela([
  /* S */ [S, S, S, S, S, _, _],
  /* K */ [S, S, _, _, _, _, _],
  /* I */ [S, _, I, _, R, _, _],
  /* L */ [S, _, _, L, _, _, _],
  /* R */ [S, _, R, _, R, _, _],
  /* V */ [_, _, _, _, _, _, _],
  /* T */ [_, _, _, _, _, _, _],
]);

const TABELAS: Readonly<Record<Operação, Tabela>> = {
  atribuicao: ATRIBUICAO,
  bitwise: BITWISE,
  chamadaFuncao: CHAMADA_FUNCAO,
  diferencaIgualdade: DIFERENCA_IGUALDADE,
  divisaoMultiplicacaoSubtracao: DIVISAO_MULTIPLICACAO_SUBTRACAO,
  eOu: E_OU,
  maiorMenor: MAIOR_MENOR,
  modulo: MODULO,
  retornoFuncao: RETORNO_FUNCAO,
  soma: SOMA,
};

/**
 * Porta de `obterTipoDado`: as duas exceções do Java viram variantes do resultado.
 */
export function consultarCompatibilidade(
  operação: Operação,
  esquerdo: TipoOperando,
  direito: TipoOperando,
): ResultadoCompatibilidade {
  const célula = TABELAS[operação][esquerdo][direito];

  if (célula === "incompativel") {
    return { situação: "incompatível" };
  }

  if (célula === "conversao") {
    // `ExcecaoValorSeraConvertido(tipoDadoB, tipoDadoA)` no Java: converte-se o direito
    // para o tipo do esquerdo, e o resultado é o tipo do esquerdo.
    return { situação: "conversão", de: direito, resultado: esquerdo };
  }

  return { situação: "ok", resultado: célula };
}

/**
 * Exposto para os testes que conferem a tabela contra o dump do Java.
 */
export function célulaDaTabela(operação: Operação, esquerdo: TipoOperando, direito: TipoOperando): Célula {
  return TABELAS[operação][esquerdo][direito];
}

export { ORDEM as TIPOS_DA_TABELA };
