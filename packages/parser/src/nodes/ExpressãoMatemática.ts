import { ParserRuleContext } from "antlr4ts";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class ExpressãoMatemática extends Expressão {
  esquerda: Expressão;
  direita: Expressão;

  constructor(
    public ctx: ParserRuleContext,
    public children: Node[],
  ) {
    super(ctx, children);

    for (const child of children) {
      if (child instanceof Expressão) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.esquerda) {
          this.esquerda = child;
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-negated-condition
        } else if (!this.direita) {
          this.direita = child;
        } else {
          this.unexpectedChild(child);
        }
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.esquerda, ctx, "Lado esquerdo da expressão matemática não definido");
    invariant(this.direita, ctx, "Lado direito da expressão matemática não definido");
  }
}
