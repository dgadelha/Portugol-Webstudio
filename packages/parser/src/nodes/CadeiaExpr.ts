import { StringContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class CadeiaExpr extends Expressão<StringContext> {
  conteúdo = this.ctx.STRING().getText().slice(1, -1);

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
