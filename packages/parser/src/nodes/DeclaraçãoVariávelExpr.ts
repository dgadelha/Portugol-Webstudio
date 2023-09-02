import { DeclaracaoVariavelContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class DeclaraçãoVariávelExpr extends Expressão {
  nome: string;
  valor?: Expressão;

  constructor(
    public ctx: DeclaracaoVariavelContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.nome = ctx.ID().text;

    for (const child of children) {
      if (child instanceof Expressão) {
        invariant(!this.valor, child.ctx, "Valor já definido");
        this.valor = child;
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
