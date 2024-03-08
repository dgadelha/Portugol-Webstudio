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

    const text = ctx.STRING().getText();

    this.conteúdo = text.substring(1, text.length - 1);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
