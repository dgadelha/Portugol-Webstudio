import { ReferenciaParaVariavelContext } from "@portugol-webstudio/antlr";

import { EscopoBibliotecaExpr } from "./EscopoBibliotecaExpr.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class ReferênciaVarExpr extends Expressão<ReferenciaParaVariavelContext> {
  nome = this.ctx.ID().getText();
  escopoBiblioteca?: EscopoBibliotecaExpr;

  addChild(child: Node) {
    if (child instanceof EscopoBibliotecaExpr) {
      invariant(!this.escopoBiblioteca, child.ctx, "Escopo de biblioteca já definido");

      this.escopoBiblioteca = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
