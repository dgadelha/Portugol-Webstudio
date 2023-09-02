import { CaracterContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CaractereExpr extends Expressão {
  conteúdo: string;

  constructor(
    public ctx: CaracterContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.conteúdo = ctx.CARACTER().text.substring(1, ctx.CARACTER().text.length - 1);

    invariant(this.conteúdo.length === 1, ctx, "Caractere inválido");

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
