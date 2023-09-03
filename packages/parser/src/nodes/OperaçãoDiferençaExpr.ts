import type { OperacaoDiferencaContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoDiferençaExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoDiferencaContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
