import { ParaContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant, getAllChildrenFromContext } from "../helpers/nodes.js";

export class ParaCmd extends Comando {
  inicialização?: Expressão | Comando;
  condição?: Expressão;
  incremento?: Expressão;

  instruções: Array<Expressão | Comando> = [];

  constructor(
    public ctx: ParaContext,
    public children: Node[],
  ) {
    super(ctx, children);

    const inicializaçãoCtx = getAllChildrenFromContext(ctx.inicializacaoPara());
    const condiçãoCtx = getAllChildrenFromContext(ctx.condicao());
    const incrementoCtx = getAllChildrenFromContext(ctx.incrementoPara());

    for (const child of children) {
      if ((child instanceof Expressão || child instanceof Comando) && inicializaçãoCtx.includes(child.ctx)) {
        invariant(!this.inicialização, child.ctx, "Inicialização já definida");
        this.inicialização = child;
      } else if (child instanceof Expressão && condiçãoCtx.includes(child.ctx)) {
        invariant(!this.condição, child.ctx, "Condição já definida");
        this.condição = child;
      } else if (child instanceof Expressão && incrementoCtx.includes(child.ctx)) {
        invariant(!this.incremento, child.ctx, "Incremento já definido");
        this.incremento = child;
      } else if (child instanceof Comando || child instanceof Expressão) {
        this.instruções.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
