import { OperacaoAndBitwiseContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class OperaçãoAndBitwiseExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoAndBitwiseContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
