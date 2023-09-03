import type { OperacaoXorContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoXorExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoXorContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
