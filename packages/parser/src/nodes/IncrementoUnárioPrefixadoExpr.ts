import { IncrementoUnarioPrefixadoContext } from "@portugol-webstudio/antlr";

import { ExpressãoUnária } from "./ExpressãoUnária.js";
import { Node } from "./Node.js";

export class IncrementoUnárioPrefixadoExpr extends ExpressãoUnária {
  constructor(
    public ctx: IncrementoUnarioPrefixadoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
