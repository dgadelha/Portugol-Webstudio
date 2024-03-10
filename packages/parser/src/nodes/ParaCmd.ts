import { ParaContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant, getAllChildrenFromContext } from "../helpers/nodes.js";

export class ParaCmd extends Comando<ParaContext> {
  inicialização?: Expressão | Comando;
  condição?: Expressão;
  incremento?: Expressão;

  instruções: Array<Expressão | Comando> = [];

  #inicializaçãoCtx = getAllChildrenFromContext(this.ctx.inicializacaoPara());
  #condiçãoCtx = getAllChildrenFromContext(this.ctx.condicao());
  #incrementoCtx = getAllChildrenFromContext(this.ctx.incrementoPara());

  addChild(child: Node) {
    if ((child instanceof Expressão || child instanceof Comando) && this.#inicializaçãoCtx.includes(child.ctx)) {
      invariant(!this.inicialização, child.ctx, "Inicialização já definida");
      this.inicialização = child;
    } else if (child instanceof Expressão && this.#condiçãoCtx.includes(child.ctx)) {
      invariant(!this.condição, child.ctx, "Condição já definida");
      this.condição = child;
    } else if (child instanceof Expressão && this.#incrementoCtx.includes(child.ctx)) {
      invariant(!this.incremento, child.ctx, "Incremento já definido");
      this.incremento = child;
    } else if (child instanceof Comando || child instanceof Expressão) {
      this.instruções.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
