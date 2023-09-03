import type { ParserRuleContext } from "antlr4ts";
import type { TerminalNode } from "antlr4ts/tree/TerminalNode.js";

import { Node } from "./Node.js";

export class Expressão extends Node {
  constructor(
    public ctx: ParserRuleContext | TerminalNode,
    public children: Node[],
  ) {
    super();
  }
}
