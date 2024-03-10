import { SenaoContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class SenãoCmd extends Comando<SenaoContext> {
  instruções: Array<Expressão | Comando> = [];

  addChild(child: Node) {
    if (child instanceof Comando || child instanceof Expressão) {
      this.instruções.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
