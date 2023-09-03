import type { DivisaoContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class DivisãoExpr extends ExpressãoMatemática {
  constructor(
    public ctx: DivisaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
