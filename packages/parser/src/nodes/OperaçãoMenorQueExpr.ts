import type { OperacaoMenorContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoMenorQueExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoMenorContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
