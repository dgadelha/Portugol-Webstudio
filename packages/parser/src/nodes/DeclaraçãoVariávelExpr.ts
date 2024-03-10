import { DeclaracaoVariavelContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class DeclaraçãoVariávelExpr extends Expressão<DeclaracaoVariavelContext> {
  nome = this.ctx.ID().getText();
  valor?: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      invariant(!this.valor, child.ctx, "Valor já definido");
      this.valor = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
