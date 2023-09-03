import type { ModuloContext } from "@portugol-webstudio/antlr";

import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import type { Node } from "./Node.js";

export class MóduloExpr extends ExpressãoMatemática {
  constructor(
    public ctx: ModuloContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
