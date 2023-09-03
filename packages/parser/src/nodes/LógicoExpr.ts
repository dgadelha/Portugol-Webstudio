import { ValorLogicoContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class LógicoExpr extends Expressão {
  valor: boolean;

  constructor(
    public ctx: ValorLogicoContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.valor = ctx.text === "verdadeiro";

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
