import type { OperacaoOrBitwiseContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoOrBitwiseExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoOrBitwiseContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
