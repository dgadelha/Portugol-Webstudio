import { DecrementoUnarioPosfixadoContext } from "@portugol-webstudio/antlr";

import { ExpressãoUnária } from "./ExpressãoUnária.js";
import { Node } from "./Node.js";

export class DecrementoUnárioPósfixadoExpr extends ExpressãoUnária {
  constructor(
    public ctx: DecrementoUnarioPosfixadoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
