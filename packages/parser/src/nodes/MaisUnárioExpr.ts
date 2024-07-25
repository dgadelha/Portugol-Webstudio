import { MaisUnarioContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { RealExpr } from "./RealExpr.js";
import { ReferênciaArrayExpr } from "./ReferênciaArrayExpr.js";
import { ReferênciaMatrizExpr } from "./ReferênciaMatrizExpr.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";

export class MaisUnárioExpr extends Expressão<MaisUnarioContext> {
  valor!: InteiroExpr | RealExpr | ReferênciaVarExpr | ReferênciaArrayExpr | ReferênciaMatrizExpr;

  addChild(child: Node) {
    if (
      child instanceof ReferênciaVarExpr ||
      child instanceof ReferênciaArrayExpr ||
      child instanceof ReferênciaMatrizExpr ||
      child instanceof InteiroExpr ||
      child instanceof RealExpr
    ) {
      invariant(!this.valor, child.ctx, "Valor já definido");
      this.valor = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
