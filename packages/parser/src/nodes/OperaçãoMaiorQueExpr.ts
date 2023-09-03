import { OperacaoMenorContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class OperaçãoMaiorQueExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoMenorContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
