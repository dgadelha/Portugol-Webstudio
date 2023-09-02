import { MultiplicacaoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class MultiplicaçãoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: MultiplicacaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
