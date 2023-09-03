import { ReferenciaMatrizContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";
import { invariant } from "../helpers/nodes.js";

export class ReferênciaMatrizExpr extends Expressão {
  variável: ReferênciaVarExpr;
  linha: ÍndiceArrayExpr;
  coluna: ÍndiceArrayExpr;

  constructor(
    public ctx: ReferenciaMatrizContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.variável = new ReferênciaVarExpr(ctx, []);

    for (const child of children) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (child instanceof ÍndiceArrayExpr && !this.linha) {
        this.linha = child;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (child instanceof ÍndiceArrayExpr && !this.coluna) {
        this.coluna = child;
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.linha, ctx, "Linha não definida");
    invariant(this.coluna, ctx, "Coluna não definida");
  }
}
