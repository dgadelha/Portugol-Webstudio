import { InicializacaoArrayContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class InicializaçãoVetorExpr extends Expressão<InicializacaoArrayContext> {
  valores: Expressão[] = [];

  addChild(child: Node) {
    if (child instanceof Expressão) {
      this.valores.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
