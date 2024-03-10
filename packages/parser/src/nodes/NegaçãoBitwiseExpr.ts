import { NegacaoBitwiseContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class NegaçãoBitwiseExpr extends Expressão<NegacaoBitwiseContext> {
  expressão: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      invariant(!this.expressão, child.ctx, "Expressão já definida");
      this.expressão = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
