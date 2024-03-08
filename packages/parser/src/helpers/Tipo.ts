import { TerminalNode } from "antlr4ng";

import { InteiroExpr, ReferênciaVarExpr } from "../nodes/index.js";

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

export function parseTipoPrimitivo(tipo: TerminalNode | null): TipoPrimitivo {
  if (!tipo) {
    return TipoPrimitivo.VAZIO;
  }

  switch (tipo.getText()) {
    case "inteiro":
    case "real":
    case "cadeia":
    case "logico":
    case "vazio":
    case "caracter":
      return tipo.getText() as TipoPrimitivo;

    default:
      throw new Error(`Tipo desconhecido: ${tipo.getText()}`);
  }
}
