import { ParserRuleContext } from "antlr4ts";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class InicializaçãoMatrizExpr extends Expressão {
  linhas: Expressão[] = [];

  constructor(
    public ctx: ParserRuleContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão) {
        this.linhas.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
