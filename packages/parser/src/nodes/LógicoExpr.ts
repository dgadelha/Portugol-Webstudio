import { ValorLogicoContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class LógicoExpr extends Expressão<ValorLogicoContext> {
  valor = this.ctx.getText() === "verdadeiro";

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
