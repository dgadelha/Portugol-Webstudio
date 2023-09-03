import { ParserRuleContext } from "antlr4ts";

import { Node } from "./Node.js";

export class Bypass extends Node {
  constructor(
    public ctx: ParserRuleContext,
    public children: Node[] = [],
  ) {
    super();
  }
}
