import { InicializacaoArrayContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class InicializaçãoVetorExpr extends Expressão {
  valores: Expressão[] = [];

  constructor(
    public ctx: InicializacaoArrayContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão) {
        this.valores.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
