import { StringContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class CadeiaExpr extends Expressão<StringContext> {
  conteúdo: string;

  constructor(public ctx: StringContext) {
    super(ctx);

    const text = ctx.STRING().getText();

    this.conteúdo = text.substring(1, text.length - 1);
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
