import { InicializacaoArrayContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class InicializaçãoVetorExpr extends Expressão<InicializacaoArrayContext> {
  valores: Array<AtribuiçãoCmd | Expressão> = [];

  addChild(child: Node) {
    if (child instanceof Expressão || child instanceof AtribuiçãoCmd) {
      this.valores.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
