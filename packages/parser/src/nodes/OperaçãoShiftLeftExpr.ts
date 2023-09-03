import type { OperacaoShiftLeftContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoShiftLeftExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoShiftLeftContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
