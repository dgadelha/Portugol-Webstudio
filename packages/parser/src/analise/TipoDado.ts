import type { TerminalNode } from "antlr4ng";

import type { Expressão } from "../nodes/index.js";

/**
 * O valor de cada membro é a palavra-chave do Portugol e também o `getNome()` do `TipoDado`
 * do Portugol Studio, que é o que aparece nas mensagens.
 */
export enum TipoPrimitivo {
  INTEIRO = "inteiro",
  REAL = "real",
  CADEIA = "cadeia",
  LÓGICO = "logico",
  VAZIO = "vazio",
  CARACTER = "caracter",
}

export type Tipo = { primitivo: TipoPrimitivo } & (
  | { dimensão?: undefined }
  | { dimensão: "vetor"; tamanho?: Expressão }
  | { dimensão: "matriz"; linhas?: Expressão; colunas?: Expressão }
);

/**
 * O curinga `todos` só existe em assinaturas de biblioteca (ver `bibliotecas/`) e casa com
 * qualquer tipo; nenhum programa pode declará-lo.
 */
export const TIPO_TODOS = "todos";

export type TipoOperando = TipoPrimitivo | typeof TIPO_TODOS;

/**
 * As mensagens que interpolam o `TipoDado` direto usam o `toString()` do Java, que devolve
 * a *descrição*: só `logico` diverge do valor do enum.
 */
export function descreverTipo(tipo: TipoOperando): string {
  return tipo === TipoPrimitivo.LÓGICO ? "lógico" : tipo;
}

export function parseTipoPrimitivo(tipo: TerminalNode | null): TipoPrimitivo {
  if (!tipo) {
    return TipoPrimitivo.VAZIO;
  }

  const text = tipo.getText();

  switch (text) {
    case "inteiro":
    case "real":
    case "cadeia":
    case "logico":
    case "vazio":
    case "caracter": {
      return text as TipoPrimitivo;
    }

    default: {
      throw new Error(`Tipo desconhecido: ${text}`);
    }
  }
}
