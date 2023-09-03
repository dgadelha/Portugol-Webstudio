import {
  DecrementoUnarioPosfixadoContext,
  IncrementoUnarioPosfixadoContext,
  IncrementoUnarioPrefixadoContext,
} from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";

export class ExpressãoUnária extends Expressão {
  variável: ReferênciaVarExpr;

  constructor(
    public ctx: DecrementoUnarioPosfixadoContext | IncrementoUnarioPrefixadoContext | IncrementoUnarioPosfixadoContext,
    public children: Node[],
  ) {
    super(ctx, children);

    const newCtx = Object.assign(ctx, { escopoBiblioteca: () => undefined });

    this.variável = new ReferênciaVarExpr(newCtx, []);
  }
}
