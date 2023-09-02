import { AtribuicaoCompostaSubtracaoContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { Node } from "./Node.js";

export class AtribuiçãoCompostaSubtraçãoCmd extends AtribuiçãoCmd {
  constructor(
    public ctx: AtribuicaoCompostaSubtracaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
