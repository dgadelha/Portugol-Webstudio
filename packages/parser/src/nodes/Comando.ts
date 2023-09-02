import { ParserRuleContext } from "antlr4ts";

import { Node } from "./Node.js";

export class Comando extends Node {
  constructor(
    public ctx: ParserRuleContext,
    public children: Node[],
  ) {
    super();
  }
}
