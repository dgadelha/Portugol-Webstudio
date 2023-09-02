import { AtribuicaoCompostaSomaContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { Node } from "./Node.js";

export class AtribuiçãoCompostaSomaCmd extends AtribuiçãoCmd {
  constructor(
    public ctx: AtribuicaoCompostaSomaContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
