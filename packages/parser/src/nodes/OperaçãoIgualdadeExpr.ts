import type { OperacaoIgualdadeContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class OperaçãoIgualdadeExpr extends ExpressãoMatemática {
  constructor(
    public ctx: OperacaoIgualdadeContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
