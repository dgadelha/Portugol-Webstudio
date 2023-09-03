import { MaisUnarioContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { RealExpr } from "./RealExpr.js";
import { ReferênciaArrayExpr } from "./ReferênciaArrayExpr.js";
import { ReferênciaMatrizExpr } from "./ReferênciaMatrizExpr.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class MaisUnárioExpr extends Expressão {
  valor: InteiroExpr | RealExpr | ReferênciaVarExpr | ReferênciaArrayExpr | ReferênciaMatrizExpr;

  constructor(
    public ctx: MaisUnarioContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (
        child instanceof ReferênciaVarExpr ||
        child instanceof ReferênciaArrayExpr ||
        child instanceof ReferênciaMatrizExpr ||
        child instanceof InteiroExpr ||
        child instanceof RealExpr
      ) {
        invariant(!this.valor, child.ctx, "Valor já definido");
        this.valor = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.valor, ctx, "Valor não definido");
  }
}
