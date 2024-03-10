import { ChamadaFuncaoContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ChamadaFunçãoExpr extends Expressão<ChamadaFuncaoContext> {
  nome = this.ctx.ID().getText();
  argumentos: Expressão[] = [];
  escopoBiblioteca?: string = this.ctx.escopoBiblioteca()?.ID()?.getText();

  addChild(child: Node) {
    if (child instanceof Expressão) {
      this.argumentos.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
