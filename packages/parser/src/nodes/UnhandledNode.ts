import { ParseTree } from "antlr4ng";

import { Node } from "./Node.js";

export class UnhandledNode extends Node {
  constructor(
    public ctx: ParseTree,
    public type: string,
    public text: string,
    public children: Node[],
  ) {
    super();
  }
}
