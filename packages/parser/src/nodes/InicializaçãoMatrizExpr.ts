import { InicializacaoMatrizContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class InicializaçãoMatrizExpr extends Expressão<InicializacaoMatrizContext> {
  linhas: Expressão[] = [];

  addChild(child: Node) {
    if (child instanceof Expressão) {
      this.linhas.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
