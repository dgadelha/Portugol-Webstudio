import { ParseTree } from "antlr4ng";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class AtribuiçãoCmd<T extends ParseTree = ParseTree> extends Comando<T> {
  esquerda!: Expressão;
  direita!: Expressão;

  addChild(child: Node) {
    if (child instanceof Expressão) {
      if (this.esquerda) {
        if (this.direita) {
          this.unexpectedChild(child);
        }

        this.direita = child;
      } else {
        this.esquerda = child;
      }
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
