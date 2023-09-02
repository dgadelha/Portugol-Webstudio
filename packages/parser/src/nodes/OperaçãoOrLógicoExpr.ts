import { OperacaoOuLogicoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class OperaçãoOrLógicoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoOuLogicoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
