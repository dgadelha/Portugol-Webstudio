import { TipoPrimitivo } from "./Tipo.js";

/**
 * Baseado em: https://github.com/UNIVALI-LITE/Portugol-Studio/blob/master/core/src/main/java/br/univali/portugol/nucleo/analise/semantica/TabelaCompatibilidadeTiposPortugol.java
 */

export enum ResultadoCompatibilidade {
  /**
   * Os tipos são compatíveis
   */
  COMPATÍVEL,

  /**
   * Os tipos são incompatíveis
   */
  INCOMPATÍVEL,

  /**
   * Os tipos são compatíveis, mas houve uma conversão implícita
   */
  COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,

  /**
   * Os tipos são compatíveis, o tipo de retorno é diferente
   */
  COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO,
}

export type ResultadoCompatibilidadeTipos =
  | ResultadoCompatibilidade.COMPATÍVEL
  | ResultadoCompatibilidade.INCOMPATÍVEL
  | ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA
  | [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo];

export const TabelaCompatibilidadeChamadaFunção: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeRetornoFunção: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeAtribuição: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_IMPLÍCITA,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeDivisãoMultiplicaçãoSubtração: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.REAL],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeDiferençaIgualdade: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeEOu: Record<TipoPrimitivo, Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeMaiorMaiorIgualMenorMenorIgual: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.LÓGICO],
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeModulo: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeBitwise: Record<
  TipoPrimitivo,
  Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>
> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};

export const TabelaCompatibilidadeSoma: Record<TipoPrimitivo, Record<TipoPrimitivo, ResultadoCompatibilidadeTipos>> = {
  [TipoPrimitivo.CADEIA]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.CADEIA],
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.CADEIA],
    [TipoPrimitivo.LÓGICO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.CADEIA],
    [TipoPrimitivo.REAL]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.CADEIA],
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.CARACTER]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.CADEIA],
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.INTEIRO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.LÓGICO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.REAL]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: [ResultadoCompatibilidade.COMPATÍVEL_COM_CONVERSÃO_DE_OPERAÇÃO, TipoPrimitivo.REAL],
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.COMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },

  [TipoPrimitivo.VAZIO]: {
    [TipoPrimitivo.CADEIA]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.CARACTER]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.INTEIRO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.LÓGICO]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.REAL]: ResultadoCompatibilidade.INCOMPATÍVEL,
    [TipoPrimitivo.VAZIO]: ResultadoCompatibilidade.INCOMPATÍVEL,
  },
};
