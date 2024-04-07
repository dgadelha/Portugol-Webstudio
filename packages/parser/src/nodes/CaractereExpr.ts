import { CaracterContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CaractereExpr extends Expressão<CaracterContext> {
  conteúdo: string;

  constructor(public ctx: CaracterContext) {
    super(ctx);

    this.conteúdo = ctx.CARACTER().getText().slice(1, -1);

    invariant(this.conteúdo.length === 1, ctx, "Caractere inválido");
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
