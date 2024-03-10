import { DeclaracaoArrayContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { InicializaçãoVetorExpr } from "./InicializaçãoVetorExpr.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class DeclaraçãoVetorExpr extends Expressão<DeclaracaoArrayContext> {
  nome = this.ctx.ID().getText();
  tamanho?: InteiroExpr | ReferênciaVarExpr;
  inicialização?: Expressão;

  addChild(child: Node) {
    if (child instanceof InteiroExpr || child instanceof ReferênciaVarExpr) {
      invariant(!this.tamanho, child.ctx, "Tamanho já definido");
      this.tamanho = child;
    } else if (child instanceof InicializaçãoVetorExpr) {
      invariant(!this.inicialização, child.ctx, "Inicialização já definida");
      this.inicialização = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
