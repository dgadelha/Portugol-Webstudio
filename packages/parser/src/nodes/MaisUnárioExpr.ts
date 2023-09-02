import { MaisUnarioContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { RealExpr } from "./RealExpr.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class MaisUnárioExpr extends Expressão {
  valor: InteiroExpr | RealExpr | ReferênciaVarExpr;

  constructor(
    public ctx: MaisUnarioContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof ReferênciaVarExpr || child instanceof InteiroExpr || child instanceof RealExpr) {
        invariant(!this.valor, child.ctx, "Valor já definido");
        this.valor = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.valor, ctx, "Valor não definido");
  }
}
