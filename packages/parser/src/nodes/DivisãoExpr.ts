import { DivisaoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { Node } from "./Node.js";

export class DivisãoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: DivisaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
