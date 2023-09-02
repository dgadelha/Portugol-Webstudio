import { IncrementoUnarioPosfixadoContext } from "@portugol-webstudio/antlr";

import { ExpressãoUnária } from "./ExpressãoUnária.js";
import { Node } from "./Node.js";

export class IncrementoUnárioPósfixadoExpr extends ExpressãoUnária {
  constructor(
    public ctx: IncrementoUnarioPosfixadoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
