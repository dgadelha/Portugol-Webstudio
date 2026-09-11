import { ReferenciaMatrizContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export class ReferênciaMatrizExpr extends Expressão<ReferenciaMatrizContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;
  escopoBiblioteca?: string = this.ctx.escopoBiblioteca()?.ID()?.getText();

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
