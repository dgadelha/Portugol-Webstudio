import { IndiceArrayContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ÍndiceArrayExpr extends Expressão<IndiceArrayContext> {
  índice!: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      invariant(!this.índice, child.ctx, "Índice já definido");
      this.índice = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
