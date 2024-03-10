import { ParseTree } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ExpressãoMatemática<T extends ParseTree = ParseTree> extends Expressão<T> {
  esquerda: Expressão;
  direita: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this.esquerda) {
        this.esquerda = child;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-negated-condition
      } else if (!this.direita) {
        this.direita = child;
      } else {
        this.unexpectedChild(child);
      }
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
