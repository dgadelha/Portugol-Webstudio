import { ReferenciaArrayContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export class ReferênciaArrayExpr extends Expressão<ReferenciaArrayContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;
  escopoBiblioteca?: string = this.ctx.escopoBiblioteca()?.ID()?.getText();

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
