import type { AtribuicaoCompostaDivisaoContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import type { Node } from "./Node.js";

export class AtribuiçãoCompostaDivisãoCmd extends AtribuiçãoCmd {
  constructor(
    public ctx: AtribuicaoCompostaDivisaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
