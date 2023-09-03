import type { OperacaoMenorIgualContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoMenorOuIgualQueExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoMenorIgualContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
