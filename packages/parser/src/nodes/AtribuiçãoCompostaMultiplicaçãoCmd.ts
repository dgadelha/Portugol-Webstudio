import { AtribuicaoCompostaMultiplicacaoContext } from "@portugol-webstudio/antlr";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { Node } from "./Node.js";

export class AtribuiçãoCompostaMultiplicaçãoCmd extends AtribuiçãoCmd {
  constructor(
    public ctx: AtribuicaoCompostaMultiplicacaoContext,
    public children: Node[],
  ) {
    super(ctx, children);
  }
}
