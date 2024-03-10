import { ParseTree } from "antlr4ng";

import { Node } from "./Node.js";

export class UnhandledNode extends Node {
  constructor(
    public ctx: ParseTree,
    public type: string,
  ) {
    super(ctx);
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
