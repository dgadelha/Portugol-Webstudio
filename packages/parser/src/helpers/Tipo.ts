import { TerminalNode } from "antlr4ng";

import { ExpressãoMatemática, InteiroExpr, ReferênciaVarExpr } from "../nodes/index.js";

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
      | { dimensão: "vetor"; tamanho?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática }
      | {
          dimensão: "matriz";
          linhas?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática;
          colunas?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática;
        }
    ))
);

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
