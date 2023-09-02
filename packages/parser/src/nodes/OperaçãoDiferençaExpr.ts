import { OperacaoDiferencaContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class OperaçãoDiferençaExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoDiferencaContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
