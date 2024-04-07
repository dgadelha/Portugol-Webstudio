import { ParseTree } from "antlr4ng";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ReferênciaArrayExpr } from "./ReferênciaArrayExpr.js";
import { ReferênciaMatrizExpr } from "./ReferênciaMatrizExpr.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class AtribuiçãoCmd<T extends ParseTree = ParseTree> extends Comando<T> {
  variável: ReferênciaVarExpr | ReferênciaArrayExpr | ReferênciaMatrizExpr;
  expressão: Expressão;

  addChild(child: Node) {
    super.addChild(child);

    if (
      (child instanceof ReferênciaVarExpr ||
        child instanceof ReferênciaArrayExpr ||
        child instanceof ReferênciaMatrizExpr) &&
      !this.variável
    ) {
      this.variável = child;
    } else if (child instanceof Expressão) {
      invariant(!this.expressão, child.ctx, "Expressão já definida");
      this.expressão = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
