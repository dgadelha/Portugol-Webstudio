import { TerminalNode } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CasoContrárioExpr extends Expressão {
  constructor(
    public ctx: TerminalNode,
    public children: Node[],
  ) {
    super(ctx, children);

    invariant(ctx.getText() === "contrario", ctx);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
