import { EnquantoContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class EnquantoCmd extends Comando<EnquantoContext> {
  condição!: Expressão;
  instruções: Array<Expressão | Comando> = [];

  addChild(child: Node) {
    if (child instanceof Expressão && child.ctx === this.ctx.expressao()) {
      invariant(!this.condição, child.ctx, "Condição já definida");
      this.condição = child;
    } else if (child instanceof Comando || child instanceof Expressão) {
      this.instruções.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
