import { SubtracaoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class SubtraçãoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: SubtracaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
