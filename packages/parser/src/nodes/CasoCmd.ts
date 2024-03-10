import { CasoContext } from "@portugol-webstudio/antlr";

import { CasoContrárioExpr } from "./CasoContrárioExpr.js";
import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class CasoCmd extends Comando<CasoContext> {
  condição: Expressão;
  instruções: Array<Expressão | Comando> = [];

  constructor(public ctx: CasoContext) {
    super(ctx);

    const contrárioCtx = ctx.CONTRARIO();

    if (contrárioCtx) {
      this.condição = new CasoContrárioExpr(contrárioCtx);
    }
  }

  addChild(child: Node) {
    if (child instanceof Expressão && child.ctx === this.ctx.expressao()) {
      invariant(!this.condição, child.ctx, "Condição já definida");
      this.condição = child;
    } else if (child instanceof Comando || child instanceof Expressão) {
      this.instruções.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
