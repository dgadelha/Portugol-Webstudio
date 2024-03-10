import { ParseTree } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CasoContrárioExpr extends Expressão {
  constructor(public ctx: ParseTree) {
    super(ctx);

    invariant(ctx.getText() === "contrario", ctx);
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
