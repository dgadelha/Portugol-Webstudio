import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CasoContrárioExpr extends Expressão {
  constructor(
    public ctx: TerminalNode,
    public children: Node[],
  ) {
    super(ctx, children);

    invariant(ctx.text === "contrario", ctx);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
