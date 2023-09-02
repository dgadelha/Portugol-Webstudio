import { ParserRuleContext } from "antlr4ts";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class AtribuiçãoCmd extends Comando {
  variável: ReferênciaVarExpr;
  expressão: Expressão;

  constructor(
    public ctx: ParserRuleContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof ReferênciaVarExpr) {
        invariant(!this.variável, child.ctx, "Variável já definida");
        this.variável = child;
      } else if (child instanceof Expressão) {
        invariant(!this.expressão, child.ctx, "Expressão já definida");
        this.expressão = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.variável, ctx, "Variável não definida");
    invariant(this.expressão, ctx, "Expressão não definida");
  }
}
