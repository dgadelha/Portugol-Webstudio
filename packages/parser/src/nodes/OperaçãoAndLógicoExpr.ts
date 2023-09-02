import { OperacaoELogicoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class OperaçãoAndLógicoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoELogicoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
