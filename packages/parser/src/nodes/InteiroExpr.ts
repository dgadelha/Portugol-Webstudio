import { NumeroInteiroContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class InteiroExpr extends Expressão {
  valor: number;

  constructor(
    public ctx: NumeroInteiroContext,
    public children: Node[],
  ) {
    super(ctx, children);

    const [int, hex] = [ctx.INT(), ctx.HEXADECIMAL()];
    const valor = int?.text ?? hex?.text;

    invariant(valor, ctx);

    this.valor = parseInt(valor, hex ? 16 : 10);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
