import { MenosUnarioContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class MenosUnárioExpr extends Expressão<MenosUnarioContext> {
  valor!: Expressão;

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
