import { ParserRuleContext, TerminalNode } from "antlr4ng";

import { Node } from "./Node.js";

export class Expressão extends Node {
  constructor(
    public ctx: ParserRuleContext | TerminalNode,
    public children: Node[],
  ) {
    super();
  }
}
