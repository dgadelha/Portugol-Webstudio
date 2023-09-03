import type { ParserRuleContext } from "antlr4ts";

import { Expressão } from "./Expressão.js";
import type { Node } from "./Node.js";

export class VazioExpr extends Expressão {
  constructor(
    public ctx: ParserRuleContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
