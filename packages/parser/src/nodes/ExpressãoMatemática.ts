import { ParseTree } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ExpressãoMatemática<T extends ParseTree = ParseTree> extends Expressão<T> {
  esquerda!: Expressão;
  direita!: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      if (!this.esquerda) {
        this.esquerda = child;
      } else if (this.direita) {
        this.unexpectedChild(child);
      } else {
        this.direita = child;
      }
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
