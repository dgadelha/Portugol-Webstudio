import { EscolhaContext } from "@portugol-webstudio/antlr";

import { CasoCmd } from "./CasoCmd.js";
import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class EscolhaCmd extends Comando<EscolhaContext> {
  condição: Expressão;
  casos: CasoCmd[] = [];

  addChild(child: Node) {
    if (child instanceof Expressão && child.ctx === this.ctx.expressao()) {
      invariant(!this.condição, child.ctx, "Condição já definida");
      this.condição = child;
    } else if (child instanceof CasoCmd) {
      this.casos.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
