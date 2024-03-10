import { NumeroRealContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class RealExpr extends Expressão<NumeroRealContext> {
  valor: number;

  constructor(public ctx: NumeroRealContext) {
    super(ctx);
    const valor = ctx.REAL().getText();

    this.valor = parseFloat(valor);

    invariant(!isNaN(this.valor), ctx, "Valor inválido");
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
