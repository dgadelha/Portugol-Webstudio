import { ReferenciaMatrizContext } from "packages/antlr/lib/PortugolParser.js";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export class ReferênciaMatrizExpr extends Expressão<ReferenciaMatrizContext> {
  variável = new ReferênciaVarExpr(this.ctx);
  linha!: ÍndiceArrayExpr;
  coluna!: ÍndiceArrayExpr;

  addChild(child: Node) {
    if (child instanceof ÍndiceArrayExpr && !this.linha) {
      this.linha = child;
    } else if (child instanceof ÍndiceArrayExpr && !this.coluna) {
      this.coluna = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
