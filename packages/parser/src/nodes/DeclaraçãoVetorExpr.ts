import { DeclaracaoArrayContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { InicializaçãoVetorExpr } from "./InicializaçãoVetorExpr.js";
import { Node } from "./Node.js";

export class DeclaraçãoVetorExpr extends Expressão<DeclaracaoArrayContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;

  tamanho?: Expressão;
  valor?: InicializaçãoVetorExpr;

  addChild(child: Node) {
    if (child instanceof InicializaçãoVetorExpr) {
      invariant(!this.valor, child.ctx, "Inicialização já definida");
      this.valor = child;
    } else if (child instanceof Expressão) {
      invariant(!this.tamanho, child.ctx, "Tamanho já definido");
      this.tamanho = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
