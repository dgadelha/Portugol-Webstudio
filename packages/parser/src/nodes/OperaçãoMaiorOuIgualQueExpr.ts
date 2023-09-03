import type { OperacaoMaiorIgualContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoMaiorOuIgualQueExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoMaiorIgualContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
