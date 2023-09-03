import { NumeroRealContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class RealExpr extends Expressão {
  valor: number;

  constructor(
    public ctx: NumeroRealContext,
    public children: Node[],
  ) {
    super(ctx, children);
    const valor = ctx.REAL().text;

    this.valor = parseFloat(valor);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
