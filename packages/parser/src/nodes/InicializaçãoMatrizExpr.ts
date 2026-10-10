import { InicializacaoMatrizContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { InicializaçãoVetorExpr } from "./InicializaçãoVetorExpr.js";
import { Node } from "./Node.js";

export class InicializaçãoMatrizExpr extends Expressão<InicializacaoMatrizContext> {
  // Na gramática cada linha de `inicializacaoMatriz` é um `inicializacaoArray`.
  linhas: InicializaçãoVetorExpr[] = [];

  addChild(child: Node) {
    if (child instanceof InicializaçãoVetorExpr) {
      this.linhas.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
