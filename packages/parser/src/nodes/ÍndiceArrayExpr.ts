import { IndiceArrayContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class ÍndiceArrayExpr extends Expressão {
  índice: Expressão;

  constructor(
    public ctx: IndiceArrayContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão) {
        invariant(!this.índice, child.ctx, "Índice já definido");
        this.índice = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.índice, ctx, "Índice não definido");
  }
}
