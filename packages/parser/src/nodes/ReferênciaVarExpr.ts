import { ReferenciaParaVariavelContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ReferênciaVarExpr extends Expressão<ReferenciaParaVariavelContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;
  escopoBiblioteca?: string = this.ctx.escopoBiblioteca()?.ID()?.getText();

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
