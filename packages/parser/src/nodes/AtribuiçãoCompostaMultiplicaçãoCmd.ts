import type { AtribuicaoCompostaMultiplicacaoContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import type { Node } from "./Node.js";

export class AtribuiçãoCompostaMultiplicaçãoCmd extends AtribuiçãoCmd {
  constructor(
    public ctx: AtribuicaoCompostaMultiplicacaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
