import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";

import { InteiroExpr } from "../nodes/InteiroExpr.js";
import { ReferênciaVarExpr } from "../nodes/ReferênciaVarExpr.js";

export enum TipoPrimitivo {
  INTEIRO = "inteiro",
  REAL = "real",
  CADEIA = "cadeia",
  LÓGICO = "logico",
  VAZIO = "vazio",
  CARACTER = "caracter",
}

export type Tipo = { primitivo: TipoPrimitivo } & (
  | {}
  | ({ dimensão: "vetor" | "matriz"; primitivo: TipoPrimitivo } & (
      | { dimensão: "vetor"; tamanho?: InteiroExpr | ReferênciaVarExpr }
      | { dimensão: "matriz"; linhas?: InteiroExpr | ReferênciaVarExpr; colunas?: InteiroExpr | ReferênciaVarExpr }
    ))
);

export function parseTipoPrimitivo(tipo: TerminalNode | undefined): TipoPrimitivo {
  if (!tipo) {
    return TipoPrimitivo.VAZIO;
  }

  switch (tipo.text) {
    case "inteiro":
    case "real":
    case "cadeia":
    case "logico":
    case "vazio":
    case "caracter":
      return tipo.text as TipoPrimitivo;

    default:
      throw new Error(`Tipo desconhecido: ${tipo.text}`);
  }
}
