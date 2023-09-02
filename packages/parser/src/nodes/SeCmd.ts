import { SeContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { SenãoCmd } from "./SenãoCmd.js";
import { invariant } from "../helpers/nodes.js";

export class SeCmd extends Comando {
  condição: Expressão;
  instruções: Array<Expressão | Comando> = [];
  senão?: SenãoCmd;

  constructor(
    public ctx: SeContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão && child.ctx === ctx.expressao()) {
        invariant(!this.condição, child.ctx, "Condição já definida");
        this.condição = child;
      } else if (child instanceof SenãoCmd) {
        invariant(!this.senão, child.ctx, "Senão já definido");
        this.senão = child;
      } else if (child instanceof Comando || child instanceof Expressão) {
        this.instruções.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.condição, ctx, "Condição não definida");
  }
}
