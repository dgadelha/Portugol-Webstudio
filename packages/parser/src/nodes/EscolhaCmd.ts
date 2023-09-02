import { EscolhaContext } from "@portugol-webstudio/antlr";

import { CasoCmd } from "./CasoCmd.js";
import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class EscolhaCmd extends Comando {
  condição: Expressão;
  casos: CasoCmd[] = [];

  constructor(
    public ctx: EscolhaContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão && child.ctx === ctx.expressao()) {
        invariant(!this.condição, child.ctx, "Condição já definida");
        this.condição = child;
      } else if (child instanceof CasoCmd) {
        this.casos.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.condição, ctx, "Condição não definida");
  }
}
