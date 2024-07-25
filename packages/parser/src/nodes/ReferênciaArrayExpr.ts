import { ReferenciaArrayContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export class ReferênciaArrayExpr extends Expressão<ReferenciaArrayContext> {
  variável = new ReferênciaVarExpr(this.ctx);
  índice!: ÍndiceArrayExpr;

  addChild(child: Node) {
    if (child instanceof ÍndiceArrayExpr) {
      invariant(!this.índice, child.ctx, "Índice já definido");
      this.índice = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
