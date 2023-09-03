import { SenaoContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class SenãoCmd extends Comando {
  instruções: Array<Expressão | Comando> = [];

  constructor(
    public ctx: SenaoContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Comando || child instanceof Expressão) {
        this.instruções.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
