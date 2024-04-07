import { NumeroInteiroContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class InteiroExpr extends Expressão<NumeroInteiroContext> {
  valor: number;

  constructor(public ctx: NumeroInteiroContext) {
    super(ctx);

    const [int, hex] = [ctx.INT(), ctx.HEXADECIMAL()];
    const valor = int?.getText() ?? hex?.getText();

    invariant(valor, ctx);

    this.valor = Number.parseInt(valor, hex ? 16 : 10);
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
