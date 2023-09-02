import { DecrementoUnarioPrefixadoContext } from "@portugol-webstudio/antlr";

import { ExpressãoUnária } from "./ExpressãoUnária.js";
import { Node } from "./Node.js";

export class DecrementoUnárioPrefixadoExpr extends ExpressãoUnária {
  constructor(
    public ctx: DecrementoUnarioPrefixadoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
