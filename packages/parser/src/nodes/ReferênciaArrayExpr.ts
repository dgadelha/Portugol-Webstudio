import { ReferenciaArrayContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";
import { invariant } from "../helpers/nodes.js";

export class ReferênciaArrayExpr extends Expressão {
  variável: ReferênciaVarExpr;
  índice: ÍndiceArrayExpr;

  constructor(
    public ctx: ReferenciaArrayContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.variável = new ReferênciaVarExpr(ctx, []);

    for (const child of children) {
      if (child instanceof ÍndiceArrayExpr) {
        invariant(!this.índice, child.ctx, "Índice já definido");
        this.índice = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.índice, ctx, "Índice não definido");
  }
}
