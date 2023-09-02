import { StringContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class CadeiaExpr extends Expressão {
  conteúdo: string;

  constructor(
    public ctx: StringContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.conteúdo = ctx.STRING().text.substring(1, ctx.STRING().text.length - 1);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
